import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

const HOURS_24 = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, '0')
)
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) =>
  String(m).padStart(2, '0')
)

export interface TimePickerProps {
  value: string
  onChange: (value: string) => void
  id?: string
  required?: boolean
  placeholder?: string
  className?: string
}

/** Переиспользуемый выбор времени (электронный: часы + минуты). На мобильном — шторка снизу. */
export function TimePicker({
  value,
  onChange,
  id,
  required,
  placeholder = '--:--',
  className,
}: TimePickerProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const [hour, setHour] = useState('12')
  const [minute, setMinute] = useState('00')

  useEffect(() => {
    if (!open) return
    if (value) {
      const [h, m] = value.split(':').map((x) => x.padStart(2, '0'))
      if (h != null && h !== '') setHour(h)
      if (m != null && m !== '') {
        const mNum = parseInt(m, 10)
        const closest = MINUTES.reduce((prev, curr) =>
          Math.abs(parseInt(curr, 10) - mNum) < Math.abs(parseInt(prev, 10) - mNum)
            ? curr
            : prev
        )
        setMinute(closest)
      }
    }
  }, [open, value])

  const applyTime = () => {
    const hh = hour.padStart(2, '0')
    const mm = minute.padStart(2, '0')
    onChange(`${hh}:${mm}`)
    setOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    if (/^\d{1,2}:\d{2}$/.test(v) || /^\d{1,2}:\d{2}:\d{2}$/.test(v)) {
      const [hh, mm] = v.split(':').map((x) => parseInt(x, 10))
      if (hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59) {
        onChange(
          `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
        )
      }
    }
  }

  const triggerButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="absolute right-0 top-0 h-full px-3 text-foreground hover:bg-transparent hover:text-foreground"
      aria-label="Открыть выбор времени"
    >
      <Clock className="h-4 w-4 text-foreground" />
    </Button>
  )

  const pickerContent = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">Часы</span>
          <Select value={hour} onValueChange={setHour}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HOURS_24.map((h) => (
                <SelectItem key={h} value={h}>
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">Минуты</span>
          <Select value={minute} onValueChange={setMinute}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MINUTES.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="button" onClick={applyTime}>
          Готово
        </Button>
      </div>
    </div>
  )

  return (
    <div className={cn('relative', className)}>
      <Input
        id={id}
        type="time"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        required={required}
        className="pr-10"
      />
      {isMobile ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>{triggerButton}</SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-xl">
            <SheetHeader>
              <SheetTitle>Выберите время</SheetTitle>
            </SheetHeader>
            <div className="pb-6 pt-2">{pickerContent}</div>
          </SheetContent>
        </Sheet>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
          <PopoverContent className="w-auto" align="start">
            <div className="p-2">{pickerContent}</div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
