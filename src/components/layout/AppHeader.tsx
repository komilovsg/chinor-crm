import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AppHeaderProps {
  onMenuClick?: () => void
  className?: string
}

/** Шапка: только кнопка меню на мобильном (текст и блок пользователя перенесены в сайдбар). */
export function AppHeader({ onMenuClick, className }: AppHeaderProps) {
  return (
    <header
      className={cn(
        'flex h-14 shrink-0 items-center bg-background px-4 md:h-0 md:min-h-0 md:overflow-hidden md:p-0',
        className
      )}
    >
      {onMenuClick && (
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden min-h-[44px] min-w-[44px] [&_svg]:h-9 [&_svg]:w-9"
          onClick={onMenuClick}
          aria-label="Открыть меню"
        >
          <Menu />
        </Button>
      )}
    </header>
  )
}
