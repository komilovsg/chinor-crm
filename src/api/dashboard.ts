import { apiClient, USE_MOCKS } from './client'
import * as mocks from './mocks'
import type {
  DashboardStats,
  RecentActivityItem,
  UserActivityStats,
  VisitsByDateItem,
} from '@/types'

/** Получить статистику дашборда. */
export async function getDashboardStats(): Promise<DashboardStats> {
  if (USE_MOCKS) {
    return mocks.mockDashboard.getStats()
  }
  const response = await apiClient.get<DashboardStats>('/dashboard/stats')
  return response.data
}

/** Последние действия (только админ). */
export async function getRecentActivity(
  limit: number = 50
): Promise<RecentActivityItem[]> {
  if (USE_MOCKS) return []
  const response = await apiClient.get<RecentActivityItem[]>(
    '/dashboard/recent-activity',
    { params: { limit } }
  )
  return response.data
}

/** Сводка по пользователям (только админ). */
export async function getUserActivityStats(): Promise<UserActivityStats[]> {
  if (USE_MOCKS) return []
  const response = await apiClient.get<UserActivityStats[]>(
    '/dashboard/user-stats'
  )
  return response.data
}

/** Визиты по дням для календаря (только админ). */
export async function getVisitsByDate(params?: {
  from_date?: string
  to_date?: string
}): Promise<VisitsByDateItem[]> {
  if (USE_MOCKS) return []
  const response = await apiClient.get<VisitsByDateItem[]>(
    '/dashboard/visits-by-date',
    { params }
  )
  return response.data
}

/** Скачать отчёт по активности (CSV). Только админ. */
export async function exportActivityReport(limit: number = 5000): Promise<Blob> {
  const response = await apiClient.get('/dashboard/activity-export', {
    params: { limit },
    responseType: 'blob',
  })
  return response.data
}
