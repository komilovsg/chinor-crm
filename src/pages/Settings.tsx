import { useCallback, useEffect, useState } from 'react'
import { Bell, ChevronDown, ChevronUp, Database, MessageCircle, Save, Sun, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useTheme, type ThemeValue } from '@/contexts/ThemeContext'
import { SettingsSkeleton } from '@/components/skeletons'
import { getApiErrorMessage } from '@/api/client'
import { toast } from '@/lib/toast'
import { getSettings, recalcSegments, updateSettings } from '@/api/settings'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import type { Settings } from '@/types'

const THEME_OPTIONS: { value: ThemeValue; label: string }[] = [
  { value: 'light', label: 'День' },
  { value: 'dark', label: 'Ночь' },
  { value: 'system', label: 'Как в системе' },
]

/** Страница настроек: тема, тостер-уведомления, сегментация, система. Доступ: только admin. */
export function Settings() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const isAdmin = user?.role === 'admin'
  const [data, setData] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [autoBackup, setAutoBackup] = useState(true)
  const [segmentRegular, setSegmentRegular] = useState(5)
  const [segmentVip, setSegmentVip] = useState(10)
  const [broadcastWebhookUrl, setBroadcastWebhookUrl] = useState('')
  const [bookingWebhookUrl, setBookingWebhookUrl] = useState('')
  const [restaurantPlace, setRestaurantPlace] = useState('CHINOR')
  const [defaultTableMessage, setDefaultTableMessage] = useState('будет назначен')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [recalcLoading, setRecalcLoading] = useState(false)
  const [whatsappExpanded, setWhatsappExpanded] = useState(false)

  const loadSettings = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await getSettings()
      setData(res)
      setPushNotifications(res.pushNotifications)
      setAutoBackup(res.autoBackup)
      setSegmentRegular(res.segment_regular_threshold ?? 5)
      setSegmentVip(res.segment_vip_threshold ?? 10)
      setBroadcastWebhookUrl(res.broadcastWebhookUrl ?? '')
      setBookingWebhookUrl(res.bookingWebhookUrl ?? '')
      setRestaurantPlace(res.restaurant_place ?? 'CHINOR')
      setDefaultTableMessage(res.default_table_message ?? 'будет назначен')
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Ошибка загрузки')
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaveSuccess(false)
    try {
      const updated = await updateSettings({
        pushNotifications,
        autoBackup,
        segment_regular_threshold: segmentRegular,
        segment_vip_threshold: segmentVip,
        broadcastWebhookUrl,
        bookingWebhookUrl,
        restaurant_place: restaurantPlace,
        default_table_message: defaultTableMessage,
      })
      setData(updated)
      setSaveSuccess(true)
      toast.success('Настройки сохранены')
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Ошибка сохранения')
      setError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="w-full p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Настройки</h1>
          <p className="text-muted-foreground">Тема и системные параметры.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-primary" />
              Тема приложения
            </CardTitle>
            <CardDescription>День, ночь или как в системе.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Label id="settings-theme-label" className="cursor-default">
                Тема
              </Label>
              <div
                role="group"
                aria-labelledby="settings-theme-label"
                className="inline-flex rounded-lg border border-input bg-muted/50 p-1 transition-colors duration-200"
              >
                {THEME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTheme(opt.value)}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
                      theme === opt.value
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/80'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <p className="text-sm text-muted-foreground">
          Остальные настройки доступны только администратору.
        </p>
      </div>
    )
  }

  if (loading && !data) {
    return <SettingsSkeleton />
  }

  return (
    <div className="w-full p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Настройки</h1>
          <p className="text-muted-foreground">
            Тема, уведомления и системные параметры.
          </p>
        </div>
        <Button type="submit" form="settings-form" disabled={saving}>
          <Save className="h-4 w-4 shrink-0" />
          {saving ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {saveSuccess && (
        <p className="text-sm text-emerald-500" role="status">
          Настройки сохранены.
        </p>
      )}

      <form id="settings-form" onSubmit={handleSave} className="w-full space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-primary" />
              Тема приложения
            </CardTitle>
            <CardDescription>
              День, ночь или как в системе.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Label id="settings-theme-label" className="cursor-default">
                Тема
              </Label>
              <div
                role="group"
                aria-labelledby="settings-theme-label"
                className="inline-flex rounded-lg border border-input bg-muted/50 p-1 transition-colors duration-200"
              >
                {THEME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTheme(opt.value)}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
                      theme === opt.value
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/80'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Уведомления
            </CardTitle>
            <CardDescription>
              Включение и отключение тостер-уведомлений в приложении.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="settings-push" className="cursor-pointer">
                Тостер-уведомления
              </Label>
              <Switch
                id="settings-push"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            className={cn(
              'cursor-pointer select-none rounded-t-lg transition-colors hover:bg-muted/50',
              whatsappExpanded && 'border-b border-border/50'
            )}
            onClick={() => setWhatsappExpanded((v) => !v)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Интеграции WhatsApp
                </CardTitle>
                <CardDescription>
                  URL webhook n8n для рассылок и уведомлений о бронях. Место и стол по умолчанию — для сообщений гостям.
                </CardDescription>
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground">
                {whatsappExpanded ? (
                  <ChevronUp className="h-5 w-5" aria-hidden />
                ) : (
                  <ChevronDown className="h-5 w-5" aria-hidden />
                )}
              </div>
            </div>
          </CardHeader>
          {whatsappExpanded && (
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="settings-broadcast-webhook">Webhook рассылок</Label>
                  <Input
                    id="settings-broadcast-webhook"
                    type="url"
                    placeholder="https://n8n.example.com/webhook/broadcast"
                    value={broadcastWebhookUrl}
                    onChange={(e) => setBroadcastWebhookUrl(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="settings-booking-webhook">Webhook уведомлений о брони</Label>
                  <Input
                    id="settings-booking-webhook"
                    type="url"
                    placeholder="https://n8n.example.com/webhook/booking-created"
                    value={bookingWebhookUrl}
                    onChange={(e) => setBookingWebhookUrl(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="settings-restaurant-place">Место ресторана</Label>
                  <Input
                    id="settings-restaurant-place"
                    type="text"
                    placeholder="CHINOR Restaurant"
                    value={restaurantPlace}
                    onChange={(e) => setRestaurantPlace(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="settings-default-table">Стол по умолчанию</Label>
                  <Input
                    id="settings-default-table"
                    type="text"
                    placeholder="будет назначен"
                    value={defaultTableMessage}
                    onChange={(e) => setDefaultTableMessage(e.target.value)}
                  />
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                После изменений нажмите «Сохранить» вверху страницы — данные сохраняются в базу и не пропадут при обновлении.
              </p>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Правила сегментации
            </CardTitle>
            <CardDescription>
              Пороги визитов для статусов «Постоянный» и «VIP». Новичок — 0 визитов.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <Label htmlFor="settings-segment-regular" className="min-w-[180px]">
                  Порог Regular (Постоянный)
                </Label>
                <Input
                  id="settings-segment-regular"
                  type="number"
                  min={0}
                  value={segmentRegular}
                  onChange={(e) => setSegmentRegular(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="h-9 w-24"
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <Label htmlFor="settings-segment-vip" className="min-w-[180px]">
                  Порог VIP
                </Label>
                <Input
                  id="settings-segment-vip"
                  type="number"
                  min={0}
                  value={segmentVip}
                  onChange={(e) => setSegmentVip(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="h-9 w-24"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={recalcLoading}
                onClick={async () => {
                  setRecalcLoading(true)
                  try {
                    await recalcSegments()
                    setSaveSuccess(true)
                    setTimeout(() => setSaveSuccess(false), 2000)
                    toast.success('Сегменты пересчитаны')
                  } catch (err) {
                    const msg = getApiErrorMessage(err, 'Ошибка пересчёта')
                    setError(msg)
                    toast.error(msg)
                  } finally {
                    setRecalcLoading(false)
                  }
                }}
              >
                {recalcLoading ? 'Пересчёт...' : 'Пересчитать сегменты всех гостей'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Система
            </CardTitle>
            <CardDescription>
              Резервное копирование и служебные функции.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="settings-backup" className="cursor-pointer">
                Автоматический бэкап
              </Label>
              <Switch
                id="settings-backup"
                checked={autoBackup}
                onCheckedChange={setAutoBackup}
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
