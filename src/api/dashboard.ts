import { apiClient, USE_MOCKS } from './client'
import * as mocks from './mocks'
import type { DashboardStats } from '@/types'

/** Получить статистику дашборда. */
export async function getDashboardStats(): Promise<DashboardStats> {
  if (USE_MOCKS) {
    return mocks.mockDashboard.getStats()
  }
  const response = await apiClient.get<DashboardStats>('/dashboard/stats')
  return response.data
}
