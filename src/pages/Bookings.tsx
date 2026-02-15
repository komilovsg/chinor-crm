import { useCallback, useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Calendar, MoreVertical, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { getApiErrorMessage } from '@/api/client'
import { toast } from '@/lib/toast'
import {
  createBooking,
  getBookings,
  updateBookingStatus,
  type GetBookingsParams,
} from '@/api/bookings'
import { DatePicker, GuestAutocomplete, TimePicker } from '@/components/pickers'
import { ResponsiveModal } from '@/components/ResponsiveModal'
import { BookingsSkeleton } from '@/components/skeletons'
import type { Booking, BookingStatus, Guest } from '@/types'

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Ожидает',
  confirmed: 'Подтверждено',
  no_show: 'Не пришел',
  canceled: 'Отменено',
}

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'text-amber-500',
  confirmed: 'text-emerald-500',
  no_show: 'text-zinc-400',
  canceled: 'text-red-500',
}

type SortColumn = 'id' | 'guest' | 'booking_time' | 'guests_count' | 'status'
type SortDir = 'asc' | 'desc'

function formatBookingDateTime(iso: string): { date: string; time: string } {
  try {
    const d = new Date(iso)
    const date = d.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    const time = d.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    return { date, time }
  } catch {
    return { date: iso, time: '' }
  }
}

function sortBookings(items: Booking[], column: SortColumn, dir: SortDir): Booking[] {
  const sorted = [...items]
  const mult = dir === 'asc' ? 1 : -1
  sorted.sort((a, b) => {
    switch (column) {
      case 'id':
        return (a.id - b.id) * mult
      case 'booking_time':
        return (new Date(a.booking_time).getTime() - new Date(b.booking_time).getTime()) * mult
      case 'guest': {
        const na = (a.guest?.name ?? '').toLowerCase()
        const nb = (b.guest?.name ?? '').toLowerCase()
        return na.localeCompare(nb) * mult
      }
      case 'guests_count':
        return (a.guests_count - b.guests_count) * mult
      case 'status': {
        const order: BookingStatus[] = ['pending', 'confirmed', 'no_show', 'canceled']
        return (order.indexOf(a.status) - order.indexOf(b.status)) * mult
      }
      default:
        return 0
    }
  })
  return sorted
}

/** Страница бронирований: таблица, поиск, фильтр по дате, действия в dropdown. */
export function Bookings() {
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [data, setData] = useState<{ items: Booking[]; total: number }>({
    items: [],
    total: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newBookingOpen, setNewBookingOpen] = useState(false)
  const [formSelectedGuest, setFormSelectedGuest] = useState<Guest | null>(null)
  const [formNewGuest, setFormNewGuest] = useState({ phone: '', name: '', email: '' })
  const [formDate, setFormDate] = useState('')
  const [formTime, setFormTime] = useState('')
  const [formPersons, setFormPersons] = useState<number>(2)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [sort, setSort] = useState<{ column: SortColumn; dir: SortDir } | null>(null)
  /** Блокировка повторного клика: только одна бронь обновляется за раз, без путаницы между строками. */
  const [pendingStatusId, setPendingStatusId] = useState<number | null>(null)

  const handleSort = useCallback((column: SortColumn) => {
    setSort((prev) => {
      if (prev?.column !== column) return { column, dir: 'desc' as SortDir }
      if (prev.dir === 'desc') return { column, dir: 'asc' as SortDir }
      return null
    })
  }, [])

  const displayedItems = sort
    ? sortBookings(data.items, sort.column, sort.dir)
    : data.items

  const loadBookings = useCallback(async (params?: GetBookingsParams) => {
    setLoading(true)
    setError(null)
    try {
      const res = await getBookings(params)
      setData({ items: res.items, total: res.total })
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Ошибка загрузки')
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const params: GetBookingsParams = { limit: 100 }
    if (search.trim()) params.search = search.trim()
    if (dateFilter) params.date = dateFilter
    loadBookings(params)
  }, [search, dateFilter, loadBookings])


  const resetNewBookingForm = useCallback(() => {
    setFormSelectedGuest(null)
    setFormNewGuest({ phone: '', name: '', email: '' })
    setFormDate('')
    setFormTime('')
    setFormPersons(2)
    setFormError(null)
  }, [])

  const handleNewBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formDate.trim() || !formTime.trim() || formPersons < 1) {
      setFormError('Заполните дату, время и количество персон')
      return
    }
    const hasGuest = formSelectedGuest || formNewGuest.phone.trim()
    if (!hasGuest) {
      setFormError('Введите номер телефона для поиска гостя или создания нового')
      return
    }
    if (!formSelectedGuest && !formNewGuest.name.trim()) {
      setFormError('Введите имя гостя для нового бронирования')
      return
    }
    setFormSubmitting(true)
    setFormError(null)
    try {
      await createBooking({
        ...(formSelectedGuest
          ? { guestId: formSelectedGuest.id }
          : {
              guest: {
                phone: formNewGuest.phone.trim(),
                name: formNewGuest.name.trim() || undefined,
                email: formNewGuest.email.trim() || undefined,
              },
            }),
        date: formDate.trim(),
        time: formTime.trim(),
        persons: formPersons,
      })
      setNewBookingOpen(false)
      resetNewBookingForm()
      loadBookings({ search: search.trim() || undefined, date: dateFilter || undefined })
      toast.success('Бронирование создано')
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Ошибка создания брони')
      setFormError(msg)
      toast.error(msg)
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleStatusChange = async (id: number, status: BookingStatus) => {
    if (pendingStatusId !== null) return
    setPendingStatusId(id)
    try {
      await updateBookingStatus(id, { status })
      setData((prev) => ({
        ...prev,
        items: prev.items.map((b) =>
          b.id === id ? { ...b, status } : b
        ),
      }))
      toast.success(`Статус обновлён: ${STATUS_LABELS[status]}`)
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Не удалось обновить статус')
      setError(msg)
      toast.error(msg)
    } finally {
      setPendingStatusId(null)
    }
  }

  const isInitialLoad = loading && data.items.length === 0
  if (isInitialLoad) {
    return <BookingsSkeleton />
  }

  return (
    <div className="w-full p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">
      <div className="sticky top-0 z-10 -mx-4 -mt-4 flex flex-col gap-4 bg-background px-4 pt-4 pb-4 sm:-mx-6 sm:px-6 sm:pt-6 sm:pb-4 border-b border-border">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Бронирования</h1>
            <p className="text-muted-foreground">
              Управление резервами столов.
            </p>
          </div>
          <Button onClick={() => setNewBookingOpen(true)}>
            <Calendar className="h-4 w-4 shrink-0" />
            Новая бронь
          </Button>
        </div>
      </div>

      <ResponsiveModal
        open={newBookingOpen}
        onOpenChange={(open) => {
          setNewBookingOpen(open)
          if (!open) resetNewBookingForm()
        }}
        title="Новая бронь"
        description="Введите номер телефона для поиска гостя или создайте нового. Укажите дату, время и количество персон."
      >
        <form onSubmit={handleNewBookingSubmit} className="space-y-4">
          <GuestAutocomplete
            id="new-booking-guest"
            value={formNewGuest}
            selectedGuest={formSelectedGuest}
            onSelect={setFormSelectedGuest}
            onNewGuestChange={setFormNewGuest}
            placeholder="+998 90 123 45 67"
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-booking-date">Дата</Label>
              <DatePicker
                id="new-booking-date"
                value={formDate}
                onChange={setFormDate}
                required
                placeholder="ДД/ММ/ГГГГ"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-booking-time">Время</Label>
              <TimePicker
                id="new-booking-time"
                value={formTime}
                onChange={setFormTime}
                required
                placeholder="--:--"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-booking-persons">Количество персон</Label>
            <Input
              id="new-booking-persons"
              type="number"
              min={1}
              max={20}
              value={formPersons}
              onChange={(e) => setFormPersons(Number(e.target.value) || 1)}
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
              onClick={() => setNewBookingOpen(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={formSubmitting}>
              {formSubmitting ? 'Создание...' : 'Создать бронь'}
            </Button>
          </div>
        </form>
      </ResponsiveModal>

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
        <DatePicker
          value={dateFilter}
          onChange={setDateFilter}
          placeholder="Дата"
          className="w-full sm:w-48"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {!loading && (
        <p className="text-sm text-muted-foreground">
          Показано {data.items.length} из {data.total}
        </p>
      )}

      <div className="w-full overflow-x-auto rounded-xl border border-border shadow-sm transition-shadow duration-200 hover:shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  type="button"
                  onClick={() => handleSort('id')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  ID
                  {sort?.column === 'id' ? (
                    sort.dir === 'desc' ? <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                  )}
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => handleSort('guest')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  ГОСТЬ
                  {sort?.column === 'guest' ? (
                    sort.dir === 'desc' ? <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                  )}
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => handleSort('booking_time')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  ДАТА И ВРЕМЯ
                  {sort?.column === 'booking_time' ? (
                    sort.dir === 'desc' ? <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                  )}
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => handleSort('guests_count')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  ПЕРСОН
                  {sort?.column === 'guests_count' ? (
                    sort.dir === 'desc' ? <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                  )}
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  СТАТУС
                  {sort?.column === 'status' ? (
                    sort.dir === 'desc' ? <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                  )}
                </button>
              </TableHead>
              <TableHead className="w-[70px]">ДЕЙСТВИЯ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Нет бронирований
                </TableCell>
              </TableRow>
            ) : (
              displayedItems.map((booking) => {
                const { date, time } = formatBookingDateTime(booking.booking_time)
                const guestName = booking.guest?.name ?? 'Гость'
                const guestPhone = booking.guest?.phone ?? null
                return (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono">#{booking.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{guestName}</p>
                          <p className="text-xs text-muted-foreground">
                            {guestPhone ?? 'Нет телефона'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5 text-muted-foreground">
                        <span className="text-foreground">{date}</span>
                        <span className="text-xs">{time}</span>
                      </div>
                    </TableCell>
                    <TableCell>{booking.guests_count} чел.</TableCell>
                    <TableCell>
                      <span className={STATUS_COLORS[booking.status]}>
                        {STATUS_LABELS[booking.status]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu key={`status-menu-${booking.id}`}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={`Действия по брони #${booking.id}`}
                            disabled={pendingStatusId !== null}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuLabel>Бронь #{booking.id}</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            disabled={booking.status === 'confirmed' || pendingStatusId !== null}
                          >
                            Подтвердить
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            disabled={booking.status === 'confirmed' || pendingStatusId !== null}
                          >
                            Отметить прибытие
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(booking.id, 'no_show')}
                            disabled={booking.status === 'no_show' || pendingStatusId !== null}
                            className="text-muted-foreground"
                          >
                            Не пришел (No-Show)
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(booking.id, 'canceled')}
                            disabled={booking.status === 'canceled' || pendingStatusId !== null}
                            className="text-destructive focus:text-destructive"
                          >
                            Отменить бронь
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
