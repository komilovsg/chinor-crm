import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Send, CheckCircle2, XCircle } from 'lucide-react'
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
import { getApiErrorMessage } from '@/api/client'
import { toast } from '@/lib/toast'
import {
  createBroadcast,
  getBroadcastStats,
  uploadBroadcastImage,
} from '@/api/broadcasts'
import type { BroadcastStats } from '@/types'

const BROADCAST_DRAFT_IMAGE_KEY = 'broadcast_draft_image_url'
const BROADCAST_DRAFT_IMAGE_FILENAME_KEY = 'broadcast_draft_image_filename'

const SEGMENT_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Все гости' },
  { value: 'VIP', label: 'VIP' },
  { value: 'Постоянные', label: 'Постоянные' },
  { value: 'Новички', label: 'Новички' },
]

/** Страница рассылок: карточки статистики, форма новой рассылки. Гости с галочкой «исключить из рассылок» в разделе Гости не получают рассылку. */
export function Broadcasts() {
  const [stats, setStats] = useState<BroadcastStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [segment, setSegment] = useState<string>('all')
  const [messageText, setMessageText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFileName, setImageFileName] = useState('')
  const [imageUploading, setImageUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const statsRes = await getBroadcastStats()
      setStats(statsRes)
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Ошибка загрузки')
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    try {
      const savedUrl = localStorage.getItem(BROADCAST_DRAFT_IMAGE_KEY)
      const savedName = localStorage.getItem(BROADCAST_DRAFT_IMAGE_FILENAME_KEY)
      if (savedUrl && savedUrl.startsWith('http')) {
        setImageUrl(savedUrl)
        if (savedName) setImageFileName(savedName)
      }
    } catch {
      // ignore
    }
  }, [])

  const saveImageDraftToStorage = useCallback((url: string, filename?: string) => {
    try {
      if (url) {
        localStorage.setItem(BROADCAST_DRAFT_IMAGE_KEY, url)
        if (filename) localStorage.setItem(BROADCAST_DRAFT_IMAGE_FILENAME_KEY, filename)
      } else {
        localStorage.removeItem(BROADCAST_DRAFT_IMAGE_KEY)
        localStorage.removeItem(BROADCAST_DRAFT_IMAGE_FILENAME_KEY)
      }
    } catch {
      // ignore
    }
  }, [])

  const handleResetImage = useCallback(() => {
    setImageUrl('')
    setImageFileName('')
    saveImageDraftToStorage('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [saveImageDraftToStorage])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = file.name.toLowerCase().split('.').pop()
    if (!['jpg', 'jpeg', 'png'].includes(ext || '')) {
      toast.error('Только JPEG и PNG')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Файл не более 5 MB')
      return
    }
    setImageUploading(true)
    setFormError(null)
    try {
      const { url } = await uploadBroadcastImage(file)
      setImageUrl(url)
      setImageFileName(file.name)
      saveImageDraftToStorage(url, file.name)
      toast.success('Изображение загружено')
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Ошибка загрузки изображения')
      toast.error(msg)
    } finally {
      setImageUploading(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim()) {
      setFormError('Введите текст сообщения')
      return
    }
    const urlTrimmed = imageUrl.trim()
    setFormError(null)
    setSubmitSuccess(false)
    setSubmitting(true)
    try {
      await createBroadcast({
        segment,
        messageText: messageText.trim(),
        ...(urlTrimmed ? { imageUrl: urlTrimmed } : {}),
      })
      setSubmitSuccess(true)
      setMessageText('')
      setImageUrl('')
      setImageFileName('')
      saveImageDraftToStorage('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      loadData()
      toast.success('Рассылка создана и добавлена в очередь')
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Ошибка отправки')
      setFormError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && !stats) {
    return <BroadcastsSkeleton />
  }

  return (
    <div className="w-full p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">
      <div className="sticky top-0 z-10 -mx-4 -mt-4 flex flex-col gap-4 bg-background px-4 pt-4 pb-4 sm:-mx-6 sm:px-6 sm:pt-6 sm:pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Рассылки</h1>
          <p className="text-muted-foreground">
            Рассылка сообщений гостям по сегментам.
          </p>
        </div>
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
              <p className="text-xs text-muted-foreground">
                Гости с галочкой «исключить из рассылок» в разделе Гости не получат сообщение.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="broadcast-image">Изображение (опционально)</Label>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  id="broadcast-image"
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleImageChange}
                  disabled={imageUploading}
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden
                />
                <div className="relative flex w-full items-center rounded-md border border-input bg-background px-3 py-2 pr-9 text-sm text-muted-foreground">
                  <span className="min-w-0 flex-1 truncate">
                    {imageUrl ? (imageFileName || 'Изображение загружено') : 'Файл не выбран'}
                  </span>
                  {imageUrl && (
                    <Check className="absolute right-3 h-4 w-4 shrink-0 text-emerald-500" />
                  )}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageUploading}
                    className="w-full sm:w-auto"
                  >
                    {imageUploading ? 'Загрузка...' : 'Загрузить файл'}
                  </Button>
                  {imageUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResetImage}
                      className="w-full sm:w-auto"
                    >
                      Сбросить
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  JPEG или PNG, до 5 MB. Сохраняется до отправки (при перезагрузке страницы не теряется).
                </p>
              </div>
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

      </div>
    </div>
  )
}
