import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/useIsMobile'
import {
  MONTHS_RU,
  WEEKDAY_RU,
  getDaysInMonth,
  formatDateForInput,
  parseDisplayToIso,
} from './date-picker-constants'

export interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  id?: string
  required?: boolean
  placeholder?: string
  className?: string
}

/** Переиспользуемый выбор даты: иконка календаря в поле; на десктопе — popover, на мобильном — шторка снизу. */
export function DatePicker({
  value,
  onChange,
  id,
  required,
  placeholder = 'ДД/ММ/ГГГГ',
  className,
}: DatePickerProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(() => {
    if (value) {
      const [y] = value.split('-').map(Number)
      return y || new Date().getFullYear()
    }
    return new Date().getFullYear()
  })
  const [viewMonth, setViewMonth] = useState(() => {
    if (value) {
      const [, m] = value.split('-').map(Number)
      return m ? m - 1 : new Date().getMonth()
    }
    return new Date().getMonth()
  })
  const [inputText, setInputText] = useState(() =>
    value ? formatDateForInput(value) : ''
  )

  useEffect(() => {
    setInputText(value ? formatDateForInput(value) : '')
  }, [value])

  useEffect(() => {
    if (value) {
      const [y, m] = value.split('-').map(Number)
      if (y) setViewYear(y)
      if (m) setViewMonth(m - 1)
    }
  }, [value])

  const days = getDaysInMonth(viewYear, viewMonth)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const handleDayClick = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    onChange(`${y}-${m}-${day}`)
    setOpen(false)
  }

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setInputText(v)
    const iso = parseDisplayToIso(v)
    if (iso) onChange(iso)
  }

  const triggerButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="absolute right-0 top-0 h-full px-3 text-foreground hover:bg-transparent hover:text-foreground"
      aria-label="Открыть календарь"
    >
      <CalendarIcon className="h-4 w-4 text-foreground" />
    </Button>
  )

  const calendarContent = (
    <div className="p-3">
      <div className="flex items-center justify-between gap-2 pb-2">
        <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={prevMonth}>
          ‹
        </Button>
        <span className="text-sm font-medium">
          {MONTHS_RU[viewMonth]} {viewYear}
        </span>
        <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={nextMonth}>
          ›
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {WEEKDAY_RU.map((w) => (
          <div key={w} className="flex h-8 w-8 items-center justify-center">
            {w}
          </div>
        ))}
        {(() => {
          const [vy, vm, vd] = value.split('-').map(Number)
          return days.map((d) => {
            const isCurrentMonth = d.getMonth() === viewMonth
            const isSelected =
              Boolean(value && vy && vm && vd) &&
              d.getFullYear() === vy &&
              d.getMonth() === vm - 1 &&
              d.getDate() === vd
            const isToday =
              d.getFullYear() === today.getFullYear() &&
              d.getMonth() === today.getMonth() &&
              d.getDate() === today.getDate()
            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => handleDayClick(d)}
                className={cn(
                  'h-8 w-8 rounded-md text-sm transition-colors',
                  !isCurrentMonth && 'text-muted-foreground/50',
                  isSelected && 'bg-primary text-primary-foreground',
                  !isSelected && isCurrentMonth && 'hover:bg-accent',
                  isToday && !isSelected && 'ring-1 ring-primary'
                )}
              >
                {d.getDate()}
              </button>
            )
          })
        })()}
      </div>
    </div>
  )

  return (
    <div className={cn('relative', className)}>
      <Input
        id={id}
        type="text"
        value={inputText}
        onChange={handleInputChange}
        placeholder={placeholder}
        required={required}
        className="pr-10"
        autoComplete="off"
      />
      {isMobile ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>{triggerButton}</SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-xl">
            <SheetHeader>
              <SheetTitle>Выберите дату</SheetTitle>
            </SheetHeader>
            <div className="pb-6 pt-2">{calendarContent}</div>
          </SheetContent>
        </Sheet>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            {calendarContent}
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
