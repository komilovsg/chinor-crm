import { apiClient, USE_MOCKS } from './client'
import * as mocks from './mocks'
import type { BroadcastStats, BroadcastHistoryItem, Campaign } from '@/types'

export interface CreateBroadcastRequest {
  segment: string
  messageText: string
  imageUrl?: string
  guestIds?: number[]
}

/** Получить статистику рассылок. */
export async function getBroadcastStats(): Promise<BroadcastStats> {
  if (USE_MOCKS) {
    return mocks.mockBroadcasts.getStats()
  }
  const response = await apiClient.get<BroadcastStats>('/broadcasts/stats')
  return response.data
}

/** Получить историю рассылок. */
export async function getBroadcastHistory(): Promise<BroadcastHistoryItem[]> {
  if (USE_MOCKS) {
    return mocks.mockBroadcasts.getHistory()
  }
  const response = await apiClient.get<BroadcastHistoryItem[]>(
    '/broadcasts/history'
  )
  return response.data
}

/** Загрузить изображение для рассылки. JPEG/PNG, до 5 MB. Возвращает публичный URL. */
export async function uploadBroadcastImage(file: File): Promise<{ url: string }> {
  if (USE_MOCKS) {
    return { url: `https://example.com/mock-${file.name}` }
  }
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiClient.post<{ url: string }>(
    '/broadcasts/upload-image',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  )
  return response.data
}

/** Создать новую рассылку. */
export async function createBroadcast(
  data: CreateBroadcastRequest
): Promise<Campaign> {
  if (USE_MOCKS) {
    return mocks.mockBroadcasts.create(data)
  }
  const response = await apiClient.post<Campaign>('/broadcasts', data)
  return response.data
}
