import { apiClient, USE_MOCKS } from './client'
import * as mocks from './mocks'
import type { Settings } from '@/types'

export interface UpdateSettingsRequest {
  pushNotifications?: boolean
  webhookUrl?: string
  autoBackup?: boolean
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
