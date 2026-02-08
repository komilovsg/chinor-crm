import { apiClient, USE_MOCKS } from './client'
import * as mocks from './mocks'
import type { Settings } from '@/types'

export interface UpdateSettingsRequest {
  pushNotifications?: boolean
  webhookUrl?: string
  autoBackup?: boolean
  segment_regular_threshold?: number
  segment_vip_threshold?: number
  broadcastWebhookUrl?: string
  bookingWebhookUrl?: string
  restaurant_place?: string
  default_table_message?: string
}

/** Пересчитать сегменты всех гостей по текущим порогам. Доступ: только admin. */
export async function recalcSegments(): Promise<{ total: number; updated: number }> {
  if (USE_MOCKS) {
    return { total: 0, updated: 0 }
  }
  const response = await apiClient.post<{ total: number; updated: number }>(
    '/settings/recalc-segments'
  )
  return response.data
}

/** Получить настройки. */
export async function getSettings(): Promise<Settings> {
  if (USE_MOCKS) {
    return mocks.mockSettings.get()
  }
  const response = await apiClient.get<Settings>('/settings')
  return response.data
}

/** Обновить настройки. */
export async function updateSettings(
  data: UpdateSettingsRequest
): Promise<Settings> {
  if (USE_MOCKS) {
    return mocks.mockSettings.update(data)
  }
  const response = await apiClient.patch<Settings>('/settings', data)
  return response.data
}
