import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown, Loader2, UserPlus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { getGuests } from '@/api/guests'
import type { Guest } from '@/types'

interface GuestAutocompleteProps {
  id?: string
  value: { phone: string; name: string; email: string }
  selectedGuest: Guest | null
  onSelect: (guest: Guest | null) => void
  onNewGuestChange: (data: { phone: string; name: string; email: string }) => void
  disabled?: boolean
  error?: string
  placeholder?: string
}

const DEBOUNCE_MS = 300

/** Поиск гостя по телефону с автозаполнением. При отсутствии — ввод данных нового гостя. */
export function GuestAutocomplete({
  id = 'guest-autocomplete',
  value,
  selectedGuest,
  onSelect,
  onNewGuestChange,
  disabled,
  error,
  placeholder = 'Поиск по номеру телефона',
}: GuestAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Guest[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSuggestions([])
      return
    }
    setLoading(true)
    try {
      const res = await getGuests({ search: q.trim(), limit: 10 })
      setSuggestions(res.items)
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (!query.trim()) {
      setSuggestions([])
      setOpen(false)
      return
    }
    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(query)
      setOpen(true)
    }, DEBOUNCE_MS)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [query, fetchSuggestions])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (g: Guest) => {
    onSelect(g)
    setQuery(g.phone)
    setOpen(false)
    setSuggestions([])
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setQuery(v)
    onSelect(null)
    onNewGuestChange({ ...value, phone: v, name: value.name, email: value.email })
  }

  const handleClear = () => {
    setQuery('')
    onSelect(null)
    onNewGuestChange({ phone: '', name: '', email: '' })
    setOpen(false)
    setSuggestions([])
  }

  const displayValue = selectedGuest ? selectedGuest.phone : query

  return (
    <div ref={containerRef} className="relative">
      <Label htmlFor={id}>Телефон *</Label>
      <div className="relative mt-1.5">
        <Input
          id={id}
          type="tel"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => query && setOpen(true)}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          className={cn(error && 'border-destructive')}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {selectedGuest && (
            <button
              type="button"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground"
              title="Очистить"
              aria-label="Очистить выбор"
            >
              ×
            </button>
          )}
          {!loading && !selectedGuest && query && (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {open && (suggestions.length > 0 || loading) && (
        <ul
          className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-popover py-1 text-popover-foreground shadow-md"
          role="listbox"
        >
          {loading && suggestions.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Поиск...
            </li>
          ) : (
            suggestions.map((g) => (
              <li
                key={g.id}
                role="option"
                tabIndex={0}
                className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:outline-none"
                onClick={() => handleSelect(g)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSelect(g)
                }}
              >
                <span className="font-medium">{g.phone}</span>
                {g.name && (
                  <span className="ml-2 text-muted-foreground">— {g.name}</span>
                )}
              </li>
            ))
          )}
        </ul>
      )}

      {selectedGuest && (
        <div className="mt-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
          <p className="font-medium text-foreground">
            {selectedGuest.name || 'Без имени'}
          </p>
          {selectedGuest.email && (
            <p className="text-xs text-muted-foreground">{selectedGuest.email}</p>
          )}
          <p className="text-xs text-muted-foreground">Гость из базы</p>
        </div>
      )}

      {!selectedGuest && value.phone.trim() && (
        <div className="mt-2 space-y-2">
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <UserPlus className="h-4 w-4" />
            Новый гость — введите ФИО
          </p>
          <div className="space-y-2">
            <Label htmlFor="new-guest-name">Имя</Label>
            <Input
              id="new-guest-name"
              value={value.name}
              onChange={(e) =>
                onNewGuestChange({ ...value, name: e.target.value })
              }
              placeholder="ФИО гостя"
              disabled={disabled}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
