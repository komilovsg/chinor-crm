import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getVisitsByDate } from '@/api/dashboard'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

/** Мини-календарь: посещения по дням (только для админа). */
export function VisitsCalendar() {
  const [byDate, setByDate] = useState<Record<string, number>>({})
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [month, setMonth] = useState(() => new Date().getMonth())

  useEffect(() => {
    const start = new Date(year, month, 1)
    const end = new Date(year, month + 1, 0)
    const from = start.toISOString().slice(0, 10)
    const to = end.toISOString().slice(0, 10)
    getVisitsByDate({ from_date: from, to_date: to })
      .then((list) => {
        const map: Record<string, number> = {}
        list.forEach(({ date, count }) => {
          map[date] = count
        })
        setByDate(map)
      })
      .catch(() => setByDate({}))
  }, [year, month])

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = (firstDay.getDay() + 6) % 7
  const daysInMonth = lastDay.getDate()
  const totalCells = startPad + daysInMonth
  const rows = Math.ceil(totalCells / 7)

  const monthLabel = firstDay.toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  })

  const goPrev = () => {
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else {
      setMonth((m) => m - 1)
    }
  }
  const goNext = () => {
    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else {
      setMonth((m) => m + 1)
    }
  }
  return (
    <div className="border-t border-border pt-3 mt-2">
      <p className="text-xs font-medium text-muted-foreground mb-2">
        Посещения по дням
      </p>
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={goPrev}
          aria-label="Предыдущий месяц"
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>
        <p className="text-xs text-muted-foreground capitalize flex-1 text-center">
          {monthLabel}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={goNext}
          aria-label="Следующий месяц"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-[10px] text-muted-foreground py-0.5">
            {d}
          </div>
        ))}
        {Array.from({ length: rows * 7 }, (_, i) => {
          const dayIndex = i - startPad + 1
          if (dayIndex < 1 || dayIndex > daysInMonth) {
            return <div key={i} className="min-h-[22px]" />
          }
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayIndex).padStart(2, '0')}`
          const count = byDate[dateStr] ?? 0
          const today = new Date()
          const isToday =
            today.getDate() === dayIndex &&
            today.getMonth() === month &&
            today.getFullYear() === year
          return (
            <div
              key={i}
              className={cn(
                'min-h-[22px] flex flex-col items-center justify-center rounded text-[11px]',
                isToday && 'ring-1 ring-primary'
              )}
            >
              <span className="text-foreground">{dayIndex}</span>
              {count > 0 && (
                <span className="text-[10px] text-primary font-medium" title={`${count} визит(ов)`}>
                  {count}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
