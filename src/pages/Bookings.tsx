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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  createBooking,
  getBookings,
  updateBookingStatus,
  type GetBookingsParams,
} from '@/api/bookings'
import { getGuests } from '@/api/guests'
import { DatePicker, TimePicker } from '@/components/pickers'
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
  const [guests, setGuests] = useState<Guest[]>([])
  const [guestsLoading, setGuestsLoading] = useState(false)
  const [formGuestId, setFormGuestId] = useState<string>('')
  const [formDate, setFormDate] = useState('')
  const [formTime, setFormTime] = useState('')
  const [formPersons, setFormPersons] = useState<number>(2)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [sort, setSort] = useState<{ column: SortColumn; dir: SortDir } | null>(null)

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
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const params: GetBookingsParams = {}
    if (search.trim()) params.search = search.trim()
    if (dateFilter) params.date = dateFilter
    loadBookings(params)
  }, [search, dateFilter, loadBookings])

  useEffect(() => {
    if (!newBookingOpen) return
    setGuestsLoading(true)
    setFormError(null)
    getGuests({ limit: 200 })
      .then((res) => setGuests(res.items))
      .catch(() => setFormError('Не удалось загрузить список гостей'))
      .finally(() => setGuestsLoading(false))
  }, [newBookingOpen])

  const resetNewBookingForm = useCallback(() => {
    setFormGuestId('')
    setFormDate('')
    setFormTime('')
    setFormPersons(2)
    setFormError(null)
  }, [])

  const handleNewBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const guestId = formGuestId ? Number(formGuestId) : 0
    if (!guestId || !formDate.trim() || !formTime.trim() || formPersons < 1) {
      setFormError('Заполните гостя, дату, время и количество персон')
      return
    }
    setFormSubmitting(true)
    setFormError(null)
    try {
      await createBooking({
        guestId,
        date: formDate.trim(),
        time: formTime.trim(),
        persons: formPersons,
      })
      setNewBookingOpen(false)
      resetNewBookingForm()
      loadBookings({ search: search.trim() || undefined, date: dateFilter || undefined })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Ошибка создания брони')
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleStatusChange = async (id: number, status: BookingStatus) => {
    try {
      await updateBookingStatus(id, { status })
      setData((prev) => ({
        ...prev,
        items: prev.items.map((b) =>
          b.id === id ? { ...b, status } : b
        ),
      }))
    } catch {
      setError('Не удалось обновить статус')
    }
  }

  const isInitialLoad = loading && data.items.length === 0
  if (isInitialLoad) {
    return <BookingsSkeleton />
  }

  return (
    <div className="w-full p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">
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

      <ResponsiveModal
        open={newBookingOpen}
        onOpenChange={(open) => {
          setNewBookingOpen(open)
          if (!open) resetNewBookingForm()
        }}
        title="Новая бронь"
        description="Выберите гостя, дату, время и количество персон."
      >
        <form onSubmit={handleNewBookingSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-booking-guest">Гость</Label>
            <Select
              value={formGuestId}
              onValueChange={setFormGuestId}
              disabled={guestsLoading}
            >
              <SelectTrigger id="new-booking-guest">
                <SelectValue placeholder={guestsLoading ? 'Загрузка...' : 'Выберите гостя'} />
              </SelectTrigger>
              <SelectContent>
                {guests.map((g) => (
                  <SelectItem key={g.id} value={String(g.id)}>
                    {g.name ?? 'Без имени'} — {g.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label="Действия"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Действия</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            disabled={booking.status === 'confirmed'}
                          >
                            Подтвердить
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            disabled={booking.status === 'confirmed'}
                          >
                            Отметить прибытие
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(booking.id, 'no_show')}
                            disabled={booking.status === 'no_show'}
                            className="text-muted-foreground"
                          >
                            Не пришел (No-Show)
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(booking.id, 'canceled')}
                            disabled={booking.status === 'canceled'}
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
