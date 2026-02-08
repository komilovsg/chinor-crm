import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Calendar,
  MessageCircle,
  Users,
  TrendingUp,
} from 'lucide-react'
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
  getBookingDynamics,
  getDashboardSegments,
  getDashboardStats,
  getRecentActivity,
  getUserActivityStats,
} from '@/api/dashboard'
import { useAuth } from '@/hooks/useAuth'
import { DashboardSkeleton } from '@/components/skeletons'
import type {
  BookingDynamicsItem,
  DashboardStats,
  RecentActivityItem,
  SegmentCount,
  UserActivityStats,
} from '@/types'

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

/** Дашборд: карточки метрик, заглушки графиков, таблица последних изменений и активность сотрудников (админ). */
export function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([])
  const [userStats, setUserStats] = useState<UserActivityStats[]>([])
  const [activityLoading, setActivityLoading] = useState(false)
  const [segments, setSegments] = useState<SegmentCount[]>([])
  const [bookingDynamics, setBookingDynamics] = useState<BookingDynamicsItem[]>([])

  useEffect(() => {
    let cancelled = false
    Promise.all([
      getDashboardStats(),
      getDashboardSegments(),
      getBookingDynamics(14),
    ])
      .then(([statsData, segmentsData, dynamicsData]) => {
        if (!cancelled) {
          setStats(statsData)
          setSegments(segmentsData)
          setBookingDynamics(dynamicsData)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = getApiErrorMessage(err, 'Ошибка загрузки')
          setError(msg)
          toast.error(msg)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!isAdmin) return
    setActivityLoading(true)
    Promise.all([getRecentActivity(50), getUserActivityStats()])
      .then(([activity, statsList]) => {
        setRecentActivity(activity)
        setUserStats(statsList)
      })
      .catch(() => {
        setRecentActivity([])
        setUserStats([])
      })
      .finally(() => setActivityLoading(false))
  }, [isAdmin])

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="w-full p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">
      <div className="sticky top-0 z-10 -mx-4 -mt-4 flex flex-col gap-4 bg-background px-4 pt-4 pb-4 sm:-mx-6 sm:px-6 sm:pt-6 sm:pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Привет, Админ! 👋</h1>
          <p className="text-muted-foreground">
            Обзор активности в CHINOR сегодня.
          </p>
        </div>
      </div>

      <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/bookings" className="block transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-xl">
          <Card className="cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Всего броней
              </CardTitle>
              <Calendar className="h-10 w-10 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalBookings ?? 0}</div>
              <p className="text-xs text-muted-foreground">за все время</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/bookings" className="block transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-xl">
          <Card className="cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Сегодня ожидаем
              </CardTitle>
              <MessageCircle className="h-10 w-10 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.todayArrivals ?? 0}</div>
              <p className="text-xs text-muted-foreground">гостей к прибытию</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/guests" className="block transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-xl">
          <Card className="cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                База гостей
              </CardTitle>
              <Users className="h-10 w-10 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.guestCount ?? 0}</div>
              <p className="text-xs text-muted-foreground">всего контактов</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/bookings" className="block transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-xl">
          <Card className="cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                No-Show Rate
              </CardTitle>
              <TrendingUp className="h-10 w-10 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats != null ? `${stats.noShowRate}%` : '0%'}
              </div>
              <p className="text-xs text-muted-foreground">процент неявки</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid w-full gap-4 lg:grid-cols-2">
        <Card className="min-h-[280px]">
          <CardHeader>
            <CardTitle>Динамика бронирований</CardTitle>
            <CardDescription>Последние 14 дней</CardDescription>
          </CardHeader>
          <CardContent>
            {bookingDynamics.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mb-2 opacity-50" />
                <p>Нет бронирований за этот период</p>
              </div>
            ) : (
              <div className="flex gap-1 h-[200px] pt-2">
                {bookingDynamics.map(({ date, count }) => {
                  const maxCount = Math.max(1, ...bookingDynamics.map((d) => d.count))
                  const barHeightPx = maxCount > 0 ? Math.round((count / maxCount) * 160) : 0
                  const dayLabel = new Date(date + 'Z').toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                  })
                  return (
                    <div
                      key={date}
                      className="flex-1 min-w-0 flex flex-col items-center justify-end gap-1 h-full"
                      title={`${dayLabel}: ${count} брон.`}
                    >
                      <div
                        className="w-full rounded-t bg-primary/80 transition-all shrink-0"
                        style={{
                          height: count > 0 ? `${Math.max(barHeightPx, 4)}px` : '0',
                        }}
                      />
                      <span className="text-[10px] text-muted-foreground truncate w-full text-center shrink-0">
                        {dayLabel}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="min-h-[280px]">
          <CardHeader>
            <CardTitle>Сегменты гостей</CardTitle>
            <CardDescription>Распределение по сегментам</CardDescription>
          </CardHeader>
          <CardContent>
            {segments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mb-2 opacity-50" />
                <p>Нет гостей в базе</p>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                {segments.map(({ segment, count }) => {
                  const total = segments.reduce((s, x) => s + x.count, 0)
                  const pct = total > 0 ? (count / total) * 100 : 0
                  return (
                    <div key={segment} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{segment}</span>
                        <span className="text-muted-foreground">
                          {count} {pct > 0 ? `(${pct.toFixed(0)}%)` : ''}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${pct}%`, minWidth: count > 0 ? '4px' : '0' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isAdmin && (
        <>
          <Card>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Последние изменения</CardTitle>
                <CardDescription>
                  Брони, новые гости и смены статусов.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/graphs')}>
                <BarChart3 className="h-4 w-4 shrink-0" />
                График
              </Button>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <p className="py-4 text-sm text-muted-foreground">Загрузка...</p>
              ) : recentActivity.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">Пока нет записей</p>
              ) : (
                <div className="overflow-x-auto rounded-md border border-border">
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

          <Card>
            <CardHeader>
              <CardTitle>Активность сотрудников</CardTitle>
              <CardDescription>
                Кто сколько броней создал, гостей добавил и сменил статусов.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <p className="py-4 text-sm text-muted-foreground">Загрузка...</p>
              ) : userStats.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">Нет данных</p>
              ) : (
                <div className="overflow-x-auto rounded-md border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Пользователь</TableHead>
                        <TableHead>Роль</TableHead>
                        <TableHead className="text-right">Броней создано</TableHead>
                        <TableHead className="text-right">Гостей добавлено</TableHead>
                        <TableHead className="text-right">Смен статусов</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userStats.map((u) => (
                        <TableRow key={u.user_id}>
                          <TableCell className="font-medium">
                            {u.display_name}
                            <span className="ml-1 text-xs text-muted-foreground">
                              ({u.email})
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{u.role}</TableCell>
                          <TableCell className="text-right">{u.bookings_created}</TableCell>
                          <TableCell className="text-right">{u.guests_created}</TableCell>
                          <TableCell className="text-right">{u.status_changes}</TableCell>
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
