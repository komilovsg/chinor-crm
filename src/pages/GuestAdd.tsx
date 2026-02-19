import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChinorLogo } from '@/components/icons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import axios from 'axios'
import { getApiErrorMessage } from '@/api/client'
import { toast } from '@/lib/toast'
import { createGuestGuestForm } from '@/api/guests'

/** Сообщение для пользователя, когда гость с таким телефоном уже есть в базе. */
const GUEST_EXISTS_MESSAGE =
  'Гость с таким номером телефона уже есть в списке. Если это вы — оформите бронь по ссылке «Забронировать стол» или войдите в приложение.'

/** Страница «Добавить гостя» (QR): форма без авторизации, мобильный первый. */
export function GuestAdd() {
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
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
    setSubmitting(true)
    try {
      await createGuestGuestForm({
        phone: phoneTrim,
        name: nameTrim || undefined,
        email: email.trim() || undefined,
      })
      setSubmitted(true)
      toast.success('Вы добавлены в список гостей')
    } catch (err) {
      const isConflict =
        axios.isAxiosError(err) &&
        err.response?.status === 409 &&
        typeof err.response?.data?.detail === 'string' &&
        err.response.data.detail.toLowerCase().includes('already exists')
      const msg = isConflict ? GUEST_EXISTS_MESSAGE : getApiErrorMessage(err, 'Не удалось добавить')
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
            <p>Вы добавлены в список гостей. Ждём вас!</p>
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
            <CardTitle className="text-xl">Добавить себя в гости</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Укажите контактные данные — мы внесём вас в список гостей.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guest-add-phone">Телефон</Label>
              <Input
                id="guest-add-phone"
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
              <Label htmlFor="guest-add-name">Имя</Label>
              <Input
                id="guest-add-name"
                type="text"
                autoComplete="name"
                placeholder="Ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                className="min-h-[48px] text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guest-add-email">Email (необязательно)</Label>
              <Input
                id="guest-add-email"
                type="email"
                autoComplete="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
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
              {submitting ? 'Отправка…' : 'Добавить'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
