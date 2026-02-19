import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChinorLogo } from '@/components/icons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getApiErrorMessage } from '@/api/client'
import { toast } from '@/lib/toast'
import { createBookingGuestForm } from '@/api/bookings'

/** Страница гостевой брони (QR): форма без авторизации, мобильный первый, тема из ThemeProvider. */
export function GuestBook() {
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [persons, setPersons] = useState<number>(2)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    const phoneTrim = phone.trim()
    const nameTrim = name.trim()
    if (!phoneTrim) {
      setFormError('Введите номер телефона')
      return
    }
    if (!nameTrim) {
      setFormError('Введите имя')
      return
    }
    if (!date.trim()) {
      setFormError('Укажите дату визита')
      return
    }
    if (!time.trim()) {
      setFormError('Укажите время')
      return
    }
    const timeNorm = time.length === 5 ? time : time.slice(0, 5)
    const personsNum = Math.max(1, Math.min(20, persons))
    setSubmitting(true)
    try {
      await createBookingGuestForm({
        guest: { phone: phoneTrim, name: nameTrim },
        date: date.trim().slice(0, 10),
        time: timeNorm,
        persons: personsNum,
      })
      setSubmitted(true)
      toast.success('Заявка принята')
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Не удалось отправить заявку')
      setFormError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="w-full max-w-[400px]">
          <CardHeader>
            <div className="flex items-center gap-3 justify-center">
              <ChinorLogo size={32} />
              <CardTitle className="text-xl">Спасибо!</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <p>Бронь принята и уже в нашем календаре. Ожидайте, пожалуйста.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <Card className="w-full max-w-[400px]">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3">
            <ChinorLogo size={32} />
            <CardTitle className="text-xl">Забронировать стол</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Укажите контактные данные и желаемые дату и время — заявка сразу попадёт в систему, мы вас ждём.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 min-w-0 overflow-hidden">
            <div className="space-y-2">
              <Label htmlFor="guest-book-phone">Телефон</Label>
              <Input
                id="guest-book-phone"
                type="tel"
                autoComplete="tel"
                placeholder="+992 90 123 45 67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={submitting}
                required
                className="min-h-[48px] text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guest-book-name">Имя</Label>
              <Input
                id="guest-book-name"
                type="text"
                autoComplete="name"
                placeholder="Ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                required
                className="min-h-[48px] text-base"
              />
            </div>
            <div className="space-y-2 min-w-0">
              <Label htmlFor="guest-book-date">Дата визита</Label>
              <Input
                id="guest-book-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={submitting}
                required
                className="min-h-[48px] text-base w-full max-w-full min-w-0 box-border"
              />
            </div>
            <div className="space-y-2 min-w-0">
              <Label htmlFor="guest-book-time">Время</Label>
              <Input
                id="guest-book-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                disabled={submitting}
                required
                className="min-h-[48px] text-base w-full max-w-full min-w-0 box-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guest-book-persons">Количество гостей</Label>
              <Input
                id="guest-book-persons"
                type="number"
                min={1}
                max={20}
                value={persons}
                onChange={(e) => setPersons(Number(e.target.value) || 1)}
                disabled={submitting}
                required
                className="min-h-[48px] text-base"
              />
            </div>
            {formError && (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            )}
            <Button
              type="submit"
              className="w-full min-h-[48px] text-base"
              disabled={submitting}
            >
              {submitting ? 'Отправка…' : 'Забронировать'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
