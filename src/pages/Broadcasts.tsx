import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, Send, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BroadcastsSkeleton } from '@/components/skeletons'
import {
  createBroadcast,
  getBroadcastStats,
  getBroadcastHistory,
} from '@/api/broadcasts'
import type { BroadcastHistoryItem, BroadcastStats } from '@/types'

const SEGMENT_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Все гости' },
  { value: 'VIP', label: 'VIP' },
  { value: 'Постоянные', label: 'Постоянные' },
  { value: 'Новички', label: 'Новички' },
]

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ru-RU', {
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

/** Страница рассылок: карточки статистики, форма новой рассылки, история. */
export function Broadcasts() {
  const [stats, setStats] = useState<BroadcastStats | null>(null)
  const [history, setHistory] = useState<BroadcastHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [segment, setSegment] = useState<string>('all')
  const [messageText, setMessageText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [statsRes, historyRes] = await Promise.all([
        getBroadcastStats(),
        getBroadcastHistory(),
      ])
      setStats(statsRes)
      setHistory(historyRes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim()) {
      setFormError('Введите текст сообщения')
      return
    }
    setFormError(null)
    setSubmitSuccess(false)
    setSubmitting(true)
    try {
      await createBroadcast({ segment, messageText: messageText.trim() })
      setSubmitSuccess(true)
      setMessageText('')
      loadData()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Ошибка отправки')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && !stats) {
    return <BroadcastsSkeleton />
  }

  return (
    <div className="w-full p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Рассылки</h1>
        <p className="text-muted-foreground">
          Рассылка сообщений гостям по сегментам.
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="grid w-full gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Доступно для рассылки
            </CardTitle>
            <Send className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.available ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Доставлено
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {stats?.delivered != null ? stats.delivered : 'Статистика недоступна'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ошибки
            </CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {stats?.errors != null ? stats.errors : 'Статистика недоступна'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex w-full flex-col gap-4 lg:flex-row">
        <Card className="min-w-0 min-h-[320px] flex-1">
          <CardHeader>
            <CardTitle>Новая рассылка</CardTitle>
          <CardDescription>
            Выберите целевую аудиторию и введите текст. Поддерживаются переменные: {'{name}'} — имя гостя, {'{last_visit}'} — дата последнего визита.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="broadcast-segment">Целевая аудитория</Label>
              <Select value={segment} onValueChange={setSegment}>
                <SelectTrigger id="broadcast-segment">
                  <SelectValue placeholder="Выберите сегмент" />
                </SelectTrigger>
                <SelectContent>
                  {SEGMENT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="broadcast-message">Текст сообщения</Label>
              <textarea
                id="broadcast-message"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Здравствуйте, {name}! Напоминаем о вашем визите..."
                rows={5}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y min-h-[120px]"
              />
            </div>
            {formError && (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            )}
            {submitSuccess && (
              <p className="text-sm text-emerald-500" role="status">
                Рассылка создана и добавлена в очередь.
              </p>
            )}
            <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
              <Send className="h-4 w-4 shrink-0" />
              {submitting ? 'Отправка...' : 'Отправить'}
            </Button>
          </form>
          </CardContent>
        </Card>

        <Card className="min-w-0 min-h-[320px] flex-1">
          <CardHeader>
            <CardTitle>История рассылок</CardTitle>
          <CardDescription>
            Список созданных рассылок и результат доставки.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <AlertCircle className="h-10 w-10 mb-2 opacity-50" />
              <p>Пока нет рассылок</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {history.map((item) => (
                <li
                  key={item.campaign.id}
                  className="flex flex-col gap-1 rounded-md border border-border p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{item.campaign.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item.campaign.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.campaign.message_text}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Доставлено: {item.sent_count}, ошибок: {item.failed_count}
                  </div>
                </li>
              ))}
            </ul>
          )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
