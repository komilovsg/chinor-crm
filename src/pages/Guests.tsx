import { useCallback, useEffect, useState } from 'react'
import { CalendarPlus, Crown, Download, Pencil, Plus, Search, UserCheck, UserPlus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { getApiErrorMessage } from '@/api/client'
import { toast } from '@/lib/toast'
import { useAuth } from '@/hooks/useAuth'
import {
  addGuestVisit,
  createGuest,
  exportGuests,
  getGuests,
  getGuestStats,
  updateGuest,
} from '@/api/guests'
import type { GuestStats } from '@/api/guests'
import { ResponsiveModal } from '@/components/ResponsiveModal'
import { GuestsSkeleton } from '@/components/skeletons'
import type { Guest } from '@/types'


/** Страница гостей: карточки метрик, поиск, таблица, экспорт CSV (admin), галочка «исключить из рассылок». */
export function Guests() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState<GuestStats | null>(null)
  const [data, setData] = useState<{ items: Guest[]; total: number }>({
    items: [],
    total: 0,
  })
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editGuest, setEditGuest] = useState<Guest | null>(null)
  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [addingVisit, setAddingVisit] = useState<number | null>(null)
  const [excludeToggling, setExcludeToggling] = useState<number | null>(null)

  const toggleExcludeFromBroadcasts = useCallback(
    async (guest: Guest) => {
      const next = !(guest.exclude_from_broadcasts ?? false)
      setExcludeToggling(guest.id)
      try {
        const updated = await updateGuest(guest.id, { exclude_from_broadcasts: next })
        setData((prev) => ({
          ...prev,
          items: prev.items.map((g) => (g.id === updated.id ? { ...g, exclude_from_broadcasts: updated.exclude_from_broadcasts } : g)),
        }))
        toast.success(next ? 'Гость исключён из рассылок' : 'Гость снова получает рассылки')
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Не удалось обновить'))
      } finally {
        setExcludeToggling(null)
      }
    },
    []
  )

  const toggleExcludeAllVisible = useCallback(async () => {
    const excluded = data.items.filter((g) => g.exclude_from_broadcasts).length
    const allExcluded = data.items.length > 0 && excluded === data.items.length
    const next = !allExcluded
    setExcludeToggling(-1)
    try {
      await Promise.all(
        data.items.map((g) => updateGuest(g.id, { exclude_from_broadcasts: next }))
      )
      setData((prev) => ({
        ...prev,
        items: prev.items.map((g) => ({ ...g, exclude_from_broadcasts: next })),
      }))
      toast.success(next ? 'Все отмечены как исключённые из рассылок' : 'Снято исключение у всех')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Не удалось обновить'))
    } finally {
      setExcludeToggling(null)
    }
  }, [data.items])

  const excludeAllChecked =
    data.items.length > 0 && data.items.every((g) => g.exclude_from_broadcasts)
  const excludeAllIndeterminate =
    data.items.length > 0 && !excludeAllChecked && data.items.some((g) => g.exclude_from_broadcasts)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [statsRes, listRes] = await Promise.all([
        getGuestStats(),
        getGuests({ search: search.trim() || undefined, limit: 500 }),
      ])
      setStats(statsRes)
      setData({ items: listRes.items, total: listRes.total })
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Ошибка загрузки')
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await exportGuests({ search: search.trim() || undefined })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `guests-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Экспорт в CSV завершён')
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Не удалось экспортировать')
      setError(msg)
      toast.error(msg)
    } finally {
      setExporting(false)
    }
  }

  const resetAddForm = useCallback(() => {
    setFormName('')
    setFormPhone('')
    setFormError(null)
  }, [])

  const resetEditForm = useCallback(() => {
    setEditGuest(null)
    setFormName('')
    setFormPhone('')
    setFormError(null)
  }, [])

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formPhone.trim()) {
      setFormError('Телефон обязателен')
      return
    }
    setFormSubmitting(true)
    setFormError(null)
    try {
      await createGuest({
        name: formName.trim() || undefined,
        phone: formPhone.trim(),
      })
      setAddModalOpen(false)
      resetAddForm()
      loadData()
      toast.success('Гость добавлен в базу')
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Не удалось добавить гостя')
      setFormError(msg)
      toast.error(msg)
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleAddVisit = async (guestId: number) => {
    setAddingVisit(guestId)
    try {
      await addGuestVisit(guestId)
      loadData()
      toast.success('Визит добавлен')
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Не удалось добавить визит')
      setError(msg)
      toast.error(msg)
    } finally {
      setAddingVisit(null)
    }
  }

  const handleEditClick = useCallback((guest: Guest) => {
    setEditGuest(guest)
    setFormName(guest.name ?? '')
    setFormPhone(guest.phone)
    setFormError(null)
    setEditModalOpen(true)
  }, [])

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editGuest) return
    if (!formPhone.trim()) {
      setFormError('Телефон обязателен')
      return
    }
    setFormSubmitting(true)
    setFormError(null)
    try {
      await updateGuest(editGuest.id, {
        name: formName.trim() || undefined,
        phone: formPhone.trim(),
      })
      setEditModalOpen(false)
      resetEditForm()
      loadData()
      toast.success('Данные гостя сохранены')
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Не удалось обновить гостя')
      setFormError(msg)
      toast.error(msg)
    } finally {
      setFormSubmitting(false)
    }
  }

  const isInitialLoad = loading && data.items.length === 0 && !stats
  if (isInitialLoad) {
    return <GuestsSkeleton />
  }

  return (
    <div className="w-full p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">
      <div className="sticky top-0 z-10 -mx-4 -mt-4 flex flex-col gap-4 bg-background px-4 pt-4 pb-4 sm:-mx-6 sm:px-6 sm:pt-6 sm:pb-4 border-b border-border">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Гости</h1>
            <p className="text-muted-foreground">
              База гостей и сегменты.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              className="min-w-[160px]"
              onClick={() => { setAddModalOpen(true); resetAddForm(); }}
            >
              <Plus className="h-4 w-4 shrink-0" />
              Добавить гостя
            </Button>
            {isAdmin && (
              <Button
                variant="outline"
                className="min-w-[160px]"
                onClick={handleExport}
                disabled={exporting}
              >
                <Download className="h-4 w-4 shrink-0" />
                {exporting ? 'Экспорт...' : 'Экспорт CSV'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <ResponsiveModal
        open={addModalOpen}
        onOpenChange={(open) => {
          setAddModalOpen(open)
          if (!open) resetAddForm()
        }}
        title="Добавить гостя"
        description="Введите данные нового гостя. Телефон обязателен."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="add-guest-name">Имя</Label>
            <Input
              id="add-guest-name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Имя гостя"
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-guest-phone">Телефон *</Label>
            <Input
              id="add-guest-phone"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              placeholder="+992901234567"
              required
              autoComplete="tel"
            />
          </div>
          {formError && (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAddModalOpen(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={formSubmitting}>
              {formSubmitting ? 'Добавление...' : 'Добавить'}
            </Button>
          </div>
        </form>
      </ResponsiveModal>

      <ResponsiveModal
        open={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open)
          if (!open) resetEditForm()
        }}
        title="Редактировать гостя"
        description="Измените данные гостя."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-guest-name">Имя</Label>
            <Input
              id="edit-guest-name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Имя гостя"
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-guest-phone">Телефон *</Label>
            <Input
              id="edit-guest-phone"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              placeholder="+992901234567"
              required
              autoComplete="tel"
            />
          </div>
          {editGuest && (
            <p className="text-sm text-muted-foreground">
              Сегмент: <span className="font-medium text-foreground">{editGuest.segment}</span> (рассчитывается автоматически)
            </p>
          )}
          {formError && (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditModalOpen(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={formSubmitting}>
              {formSubmitting ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </form>
      </ResponsiveModal>

      <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Всего гостей
            </CardTitle>
            <Users className="h-10 w-10 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              VIP
            </CardTitle>
            <Crown className="h-10 w-10 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.vip ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Постоянные
            </CardTitle>
            <UserCheck className="h-10 w-10 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.regular ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Новички
            </CardTitle>
            <UserPlus className="h-10 w-10 text-sky-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.new ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени или телефону"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="w-full overflow-x-auto rounded-xl border border-border shadow-sm transition-shadow duration-200 hover:shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 px-4" title="Галочка — не отправлять рассылку этому гостю при выборе сегмента">
                <Checkbox
                  checked={excludeAllIndeterminate ? 'indeterminate' : excludeAllChecked}
                  onCheckedChange={toggleExcludeAllVisible}
                  disabled={data.items.length === 0 || excludeToggling === -1}
                  aria-label="Исключить всех из рассылок"
                />
              </TableHead>
              <TableHead>ИМЯ ГОСТЯ</TableHead>
              <TableHead>ТЕЛЕФОН</TableHead>
              <TableHead>СЕГМЕНТ</TableHead>
              <TableHead>ВИЗИТЫ</TableHead>
              <TableHead>ПОДТВЕРЖДЁННЫЕ БРОНИ</TableHead>
              <TableHead className="w-12 text-right">ДЕЙСТВИЯ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && data.items.length > 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Обновление...
                </TableCell>
              </TableRow>
            ) : data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Нет гостей
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((guest) => (
                <TableRow
                  key={guest.id}
                  className={guest.exclude_from_broadcasts ? 'bg-muted/50' : undefined}
                >
                  <TableCell className="w-12 px-4">
                    <Checkbox
                      checked={guest.exclude_from_broadcasts ?? false}
                      onCheckedChange={() => toggleExcludeFromBroadcasts(guest)}
                      disabled={excludeToggling !== null}
                      aria-label={guest.exclude_from_broadcasts ? `Включить в рассылки: ${guest.name ?? guest.phone}` : `Исключить из рассылок: ${guest.name ?? guest.phone}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {guest.name ?? '—'}
                  </TableCell>
                  <TableCell>{guest.phone}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {guest.segment}
                  </TableCell>
                  <TableCell>{guest.visits_count}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {guest.confirmed_bookings_count ?? 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleAddVisit(guest.id)}
                        disabled={addingVisit === guest.id}
                        title="Добавить визит"
                      >
                        <CalendarPlus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEditClick(guest)}
                        title="Редактировать"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
