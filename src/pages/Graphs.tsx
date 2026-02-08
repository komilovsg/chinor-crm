import { useCallback, useEffect, useState } from 'react'
import { BarChart3, Download } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/api/client'
import { toast } from '@/lib/toast'
import {
  getRecentActivity,
  getUserActivityStats,
  exportActivityReport,
} from '@/api/dashboard'
import type { RecentActivityItem, UserActivityStats } from '@/types'

function formatActivityDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

/** Страница «Графики»: активность по сотрудникам (бары), таблица изменений, выгрузка отчёта. Только админ. */
export function Graphs() {
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([])
  const [userStats, setUserStats] = useState<UserActivityStats[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [activity, stats] = await Promise.all([
        getRecentActivity(100),
        getUserActivityStats(),
      ])
      setRecentActivity(activity)
      setUserStats(stats)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Ошибка загрузки'))
      setRecentActivity([])
      setUserStats([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await exportActivityReport(5000)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Отчёт выгружен')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Ошибка выгрузки'))
    } finally {
      setExporting(false)
    }
  }

  const maxBookings = Math.max(1, ...userStats.map((u) => u.bookings_created))
  const maxGuests = Math.max(1, ...userStats.map((u) => u.guests_created))
  const maxStatus = Math.max(1, ...userStats.map((u) => u.status_changes))

  return (
    <div className="w-full p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">
      <div className="sticky top-0 z-10 -mx-4 -mt-4 flex flex-col gap-4 bg-background px-4 pt-4 pb-4 sm:-mx-6 sm:px-6 sm:pt-6 sm:pb-4 border-b border-border">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Графики</h1>
            <p className="text-muted-foreground">
              Активность сотрудников и журнал изменений.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exporting}
          >
            <Download className="h-4 w-4 shrink-0" />
            {exporting ? 'Выгрузка...' : 'Скачать отчёт'}
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Загрузка...</p>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Активность по сотрудникам
              </CardTitle>
              <CardDescription>
                Сравнение: брони созданы, гости добавлены, смены статусов.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {userStats.length === 0 ? (
                <p className="text-sm text-muted-foreground">Нет данных</p>
              ) : (
                userStats.map((u) => (
                  <div key={u.user_id} className="space-y-2">
                    <p className="text-sm font-medium">
                      {u.display_name}
                      <span className="ml-1 text-muted-foreground">({u.role})</span>
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="text-muted-foreground mb-1">Броней создано</p>
                        <div className="h-6 rounded bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded transition-all"
                            style={{
                              width: `${(u.bookings_created / maxBookings) * 100}%`,
                              minWidth: u.bookings_created > 0 ? '4px' : '0',
                            }}
                          />
                        </div>
                        <span className="font-medium">{u.bookings_created}</span>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Гостей добавлено</p>
                        <div className="h-6 rounded bg-muted overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded transition-all"
                            style={{
                              width: `${(u.guests_created / maxGuests) * 100}%`,
                              minWidth: u.guests_created > 0 ? '4px' : '0',
                            }}
                          />
                        </div>
                        <span className="font-medium">{u.guests_created}</span>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Смен статусов</p>
                        <div className="h-6 rounded bg-muted overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded transition-all"
                            style={{
                              width: `${(u.status_changes / maxStatus) * 100}%`,
                              minWidth: u.status_changes > 0 ? '4px' : '0',
                            }}
                          />
                        </div>
                        <span className="font-medium">{u.status_changes}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Журнал изменений</CardTitle>
              <CardDescription>
                Последние 100 записей: брони, гости, смены статусов.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">Пока нет записей</p>
              ) : (
                <div className="overflow-x-auto rounded-md border border-border max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Дата</TableHead>
                        <TableHead>Действие</TableHead>
                        <TableHead>Пользователь</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentActivity.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="whitespace-nowrap text-muted-foreground">
                            {formatActivityDate(item.created_at)}
                          </TableCell>
                          <TableCell>{item.summary}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.user_display_name}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
