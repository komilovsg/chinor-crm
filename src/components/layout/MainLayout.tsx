import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'
import { MobileSheet } from './MobileSheet'

/** Обёртка: сайдбар + контент-зона с шапкой и Outlet. На мобильном — бургер и Sheet. */
export function MainLayout() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-full min-h-0 bg-background overflow-hidden">
      <AppSidebar
        className="hidden md:flex shrink-0"
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
      />
      <MobileSheet open={sheetOpen} onOpenChange={setSheetOpen} />
      <div className="flex flex-1 flex-col min-w-0 min-h-0 w-full overflow-hidden">
        <AppHeader onMenuClick={() => setSheetOpen(true)} />
        <main className="min-w-0 w-full flex-1 overflow-y-auto overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
