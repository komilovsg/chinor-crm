import { useCallback, useEffect, useState } from 'react'
import { Crown, Download, Search, UserCheck, UserPlus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getApiErrorMessage } from '@/api/client'
import { getGuests, getGuestStats, exportGuests } from '@/api/guests'
import type { GuestStats } from '@/api/guests'
import { GuestsSkeleton } from '@/components/skeletons'
import type { Guest } from '@/types'

function formatLastVisit(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

/** Страница гостей: карточки метрик, поиск, таблица, экспорт CSV. */
export function Guests() {
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState<GuestStats | null>(null)
  const [data, setData] = useState<{ items: Guest[]; total: number }>({
    items: [],
    total: 0,
  })
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      setError(getApiErrorMessage(err, 'Ошибка загрузки'))
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
    } catch (err) {
      setError(getApiErrorMessage(err, 'Не удалось экспортировать'))
    } finally {
      setExporting(false)
    }
  }

  const isInitialLoad = loading && data.items.length === 0 && !stats
  if (isInitialLoad) {
    return <GuestsSkeleton />
  }

  return (
    <div className="w-full p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Гости</h1>
          <p className="text-muted-foreground">
            База гостей и сегменты.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={exporting}
        >
          <Download className="h-4 w-4 shrink-0" />
          {exporting ? 'Экспорт...' : 'Экспорт CSV'}
        </Button>
      </div>

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
              <TableHead>ИМЯ ГОСТЯ</TableHead>
              <TableHead>ТЕЛЕФОН</TableHead>
              <TableHead>СЕГМЕНТ</TableHead>
              <TableHead>ВИЗИТЫ</TableHead>
              <TableHead>ПОСЛЕДНИЙ ВИЗИТ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && data.items.length > 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Обновление...
                </TableCell>
              </TableRow>
            ) : data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Нет гостей
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell className="font-medium">
                    {guest.name ?? '—'}
                  </TableCell>
                  <TableCell>{guest.phone}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {guest.segment}
                  </TableCell>
                  <TableCell>{guest.visits_count}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatLastVisit(guest.last_visit_at)}
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
