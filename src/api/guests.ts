import { apiClient, USE_MOCKS } from './client'
import * as mocks from './mocks'
import type { Guest, PaginatedResponse } from '@/types'

export interface GetGuestsParams {
  search?: string
  page?: number
  limit?: number
}

export interface CreateGuestRequest {
  name?: string
  phone: string
  email?: string
}

export interface UpdateGuestRequest {
  name?: string
  phone?: string
  email?: string
  segment?: string
  exclude_from_broadcasts?: boolean
}

export interface GuestStats {
  total: number
  vip: number
  regular: number
  new: number
}

/** Получить статистику по гостям (всего, VIP, постоянные, новички). */
export async function getGuestStats(): Promise<GuestStats> {
  if (USE_MOCKS) {
    return mocks.mockGuests.getStats()
  }
  const response = await apiClient.get<GuestStats>('/guests/stats')
  return response.data
}

/** Получить список гостей. */
export async function getGuests(
  params?: GetGuestsParams
): Promise<PaginatedResponse<Guest>> {
  if (USE_MOCKS) {
    return mocks.mockGuests.getList(params)
  }
  const response = await apiClient.get<PaginatedResponse<Guest>>('/guests', {
    params,
  })
  return response.data
}

/** Получить одного гостя по ID. */
export async function getGuest(id: number): Promise<Guest> {
  if (USE_MOCKS) {
    return mocks.mockGuests.getOne(id)
  }
  const response = await apiClient.get<Guest>(`/guests/${id}`)
  return response.data
}

/** Создать нового гостя. */
export async function createGuest(data: CreateGuestRequest): Promise<Guest> {
  if (USE_MOCKS) {
    return mocks.mockGuests.create(data)
  }
  const response = await apiClient.post<Guest>('/guests', data)
  return response.data
}

/** Добавить гостя с публичной формы (QR): POST /api/public/guest, без JWT. */
export async function createGuestGuestForm(data: CreateGuestRequest): Promise<Guest> {
  if (USE_MOCKS) {
    return mocks.mockGuests.create(data)
  }
  const response = await apiClient.post<Guest>('/public/guest', data)
  return response.data
}

/** Обновить данные гостя. */
export async function updateGuest(
  id: number,
  data: UpdateGuestRequest
): Promise<Guest> {
  if (USE_MOCKS) {
    return mocks.mockGuests.update(id, data)
  }
  const response = await apiClient.patch<Guest>(`/guests/${id}`, data)
  return response.data
}

/** Добавить визит гостю. Увеличивает visits_count, пересчитывает сегмент. Доступ: admin, hostess_1, hostess_2. */
export async function addGuestVisit(guestId: number): Promise<Guest> {
  if (USE_MOCKS) {
    const g = await mocks.mockGuests.getOne(guestId)
    return mocks.mockGuests.update(guestId, {
      visits_count: (g.visits_count || 0) + 1,
      last_visit_at: new Date().toISOString(),
    })
  }
  const response = await apiClient.post<Guest>(`/guests/${guestId}/visits`)
  return response.data
}

/** Экспорт гостей в CSV. */
export async function exportGuests(params?: { search?: string }): Promise<Blob> {
  if (USE_MOCKS) {
    return mocks.mockGuests.export(params)
  }
  const response = await apiClient.get('/guests/export', {
    params,
    responseType: 'blob',
  })
  return response.data
}
