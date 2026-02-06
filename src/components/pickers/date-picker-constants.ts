export const MONTHS_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]

export const WEEKDAY_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export function getDaysInMonth(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const start = new Date(first)
  const dayOfWeek = first.getDay()
  const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  start.setDate(first.getDate() - offset)
  const days: Date[] = []
  const d = new Date(start)
  while (d <= last || days.length % 7 !== 0 || days.length < 42) {
    days.push(new Date(d))
    d.setDate(d.getDate() + 1)
    if (days.length >= 42) break
  }
  return days
}

export function formatDateForInput(isoDate: string): string {
  if (!isoDate) return ''
  const [y, m, day] = isoDate.split('-').map(Number)
  if (!y || !m || !day) return isoDate
  const month = String(m).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${d}/${month}/${y}`
}

export function parseDisplayToIso(display: string): string {
  const match = display.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!match) return ''
  const [, d, m, y] = match
  const month = m!.padStart(2, '0')
  const day = d!.padStart(2, '0')
  return `${y}-${month}-${day}`
}
