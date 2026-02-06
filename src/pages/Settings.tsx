import { useCallback, useEffect, useState } from 'react'
import { Bell, Database, Save, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useTheme, type ThemeValue } from '@/contexts/ThemeContext'
import { SettingsSkeleton } from '@/components/skeletons'
import { getSettings, updateSettings } from '@/api/settings'
import { cn } from '@/lib/utils'
import type { Settings } from '@/types'

const THEME_OPTIONS: { value: ThemeValue; label: string }[] = [
  { value: 'light', label: 'День' },
  { value: 'dark', label: 'Ночь' },
  { value: 'system', label: 'Как в системе' },
]

/** Страница настроек: тема, тостер-уведомления, система. Кнопка «Сохранить» в шапке. */
export function Settings() {
  const { theme, setTheme } = useTheme()
  const [data, setData] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [autoBackup, setAutoBackup] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const loadSettings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getSettings()
      setData(res)
      setPushNotifications(res.pushNotifications)
      setAutoBackup(res.autoBackup)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, [])

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
      })
      setData(updated)
      setSaveSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
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
