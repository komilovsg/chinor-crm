import { NavLink, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Calendar,
  Users,
  UserCog,
  Send,
  Settings,
  LogOut,
} from 'lucide-react'
import { ChinorLogo } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Дашборд', icon: LayoutDashboard },
  { to: '/bookings', label: 'Бронирования', icon: Calendar },
  { to: '/guests', label: 'Гости', icon: Users },
  { to: '/broadcasts', label: 'Рассылки', icon: Send },
  { to: '/settings', label: 'Настройки', icon: Settings },
] as const

const adminNavItems = [
  { to: '/graphs', label: 'Графики', icon: BarChart3 },
  { to: '/users', label: 'Пользователи', icon: UserCog },
] as const

function getInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return displayName.slice(0, 2).toUpperCase() || 'АД'
}

interface AppSidebarProps {
  className?: string
  onNavClick?: () => void
  /** Свёрнутый сайдбар: только иконки. */
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

/** Боковое меню: логотип, навигация и внизу блок пользователя. Сворачивается до иконок. */
export function AppSidebar({
  className,
  onNavClick,
  isCollapsed = false,
  onToggleCollapse,
}: AppSidebarProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const displayName = user?.display_name ?? 'Администратор'
  const email = user?.email ?? 'admin@chinor.com'
  const initials = getInitials(displayName)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside
      className={cn(
        'flex h-full flex-col justify-between border-r border-border bg-background transition-[width] duration-200 ease-in-out overflow-hidden',
        isCollapsed ? 'w-16' : 'w-56',
        className
      )}
    >
      {/* Первая группа: логотип и навигация */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          className={cn(
            'flex h-16 shrink-0 items-center border-b border-border transition-[padding] duration-200',
            isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'
          )}
        >
          <ChinorLogo size={isCollapsed ? 32 : 36} />
          {!isCollapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-foreground">CHINOR</span>
              <span className="text-xs text-muted-foreground">CRM SYSTEM</span>
            </div>
          )}
        </div>
        <nav
          className={cn(
            'flex-1 overflow-auto transition-[padding] duration-200',
            isCollapsed ? 'p-2' : 'p-3'
          )}
        >
          <div className="flex flex-col gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={onNavClick}
                title={isCollapsed ? label : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-[44px] items-center rounded-md py-2 text-sm font-medium transition-colors',
                    isCollapsed
                      ? 'justify-center px-0'
                      : 'gap-3 px-3',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{label}</span>}
              </NavLink>
            ))}
            {user?.role === 'admin' &&
              adminNavItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onNavClick}
                  title={isCollapsed ? label : undefined}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-[44px] items-center rounded-md py-2 text-sm font-medium transition-colors',
                      isCollapsed
                        ? 'justify-center px-0'
                        : 'gap-3 px-3',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{label}</span>}
                </NavLink>
              ))}
          </div>
        </nav>
        {onToggleCollapse && (
          <div className="shrink-0 border-t border-border p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? 'Развернуть меню' : 'Свернуть меню'}
              title={isCollapsed ? 'Развернуть меню' : 'Свернуть меню'}
              className={cn('w-full', isCollapsed && 'mx-0')}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>
      {/* Вторая группа: Администратор и иконка выхода — прикреплены к низу */}
      <div
        className={cn(
          'shrink-0 border-t border-border transition-[padding] duration-200',
          isCollapsed ? 'p-2' : 'p-3'
        )}
      >
        <div
          className={cn(
            'flex items-center gap-2',
            isCollapsed && 'flex-col justify-center gap-1'
          )}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground"
            aria-hidden
          >
            {initials}
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {displayName}
              </p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            aria-label="Выйти"
            title="Выйти"
            className="shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
