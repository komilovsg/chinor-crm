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
    <div className="flex min-h-screen bg-background items-stretch">
      <AppSidebar
        className="hidden md:flex"
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
      />
      <MobileSheet open={sheetOpen} onOpenChange={setSheetOpen} />
      <div className="flex flex-1 flex-col min-w-0 min-h-screen w-full">
        <AppHeader onMenuClick={() => setSheetOpen(true)} />
        <main className="min-w-0 w-full flex-1 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
