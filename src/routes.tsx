import { Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from '@/components/layout'
import { useAuth } from '@/hooks/useAuth'
import { Login } from '@/pages/Login'
import { GuestBook } from '@/pages/GuestBook'
import { Dashboard } from '@/pages/Dashboard'
import { Bookings } from '@/pages/Bookings'
import { Guests } from '@/pages/Guests'
import { Broadcasts } from '@/pages/Broadcasts'
import { Settings } from '@/pages/Settings'
import { UsersPage } from '@/pages/UsersPage'
import { Graphs } from '@/pages/Graphs'

/** Защищённый маршрут: при отсутствии JWT редирект на /login; иначе MainLayout с Outlet. */
function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <MainLayout />
}

/** Маршрут только для admin: при отсутствии роли admin — редирект на /. */
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

/** Заглушки страниц (контент добавится в F10–F12). */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/book" element={<GuestBook />} />
      <Route path="/" element={<ProtectedRoute />}>
        <Route index element={<Dashboard />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="guests" element={<Guests />} />
        <Route path="broadcasts" element={<Broadcasts />} />
        <Route path="settings" element={<Settings />} />
        <Route
          path="users"
          element={
            <AdminRoute>
              <UsersPage />
            </AdminRoute>
          }
        />
        <Route
          path="graphs"
          element={
            <AdminRoute>
              <Graphs />
            </AdminRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
