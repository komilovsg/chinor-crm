import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  CalendarRange,
  Download,
  MessageCircle,
  Users,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getApiErrorMessage } from '@/api/client'
import { getDashboardStats } from '@/api/dashboard'
import { DashboardSkeleton } from '@/components/skeletons'
import type { DashboardStats } from '@/types'

/** Дашборд: четыре карточки метрик, блоки «Динамика бронирований» и «Сегменты гостей» (заглушки). */
export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getDashboardStats()
      .then((data) => {
        if (!cancelled) setStats(data)
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Ошибка загрузки'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Привет, Админ! 👋</h1>
          <p className="text-muted-foreground">
            Обзор активности в CHINOR сегодня.
          </p>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <Button variant="outline" size="sm" className="flex-1 min-w-0 sm:flex-initial">
            <CalendarRange className="h-4 w-4 shrink-0" />
            Этот месяц
          </Button>
          <Button size="sm" className="flex-1 min-w-0 sm:flex-initial">
            <Download className="h-4 w-4 shrink-0" />
            Скачать отчёт
          </Button>
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
            <CardDescription>График по периодам</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mb-2 opacity-50" />
            <p>Нет данных за этот период</p>
          </CardContent>
        </Card>
        <Card className="min-h-[280px]">
          <CardHeader>
            <CardTitle>Сегменты гостей</CardTitle>
            <CardDescription>Распределение по сегментам</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mb-2 opacity-50" />
            <p>Нет данных по сегментам</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
