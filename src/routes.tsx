import { Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from '@/components/layout'
import { useAuth } from '@/hooks/useAuth'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { Bookings } from '@/pages/Bookings'
import { Guests } from '@/pages/Guests'
import { Broadcasts } from '@/pages/Broadcasts'
import { Settings } from '@/pages/Settings'

/** Защищённый маршрут: при отсутствии JWT редирект на /login; иначе MainLayout с Outlet. */
function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <MainLayout />
}

/** Заглушки страниц (контент добавится в F10–F12). */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute />}>
        <Route index element={<Dashboard />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="guests" element={<Guests />} />
        <Route path="broadcasts" element={<Broadcasts />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
