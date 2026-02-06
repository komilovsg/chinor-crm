import { apiClient, USE_MOCKS } from './client'
import * as mocks from './mocks'
import type { Booking, BookingStatus, PaginatedResponse } from '@/types'

export interface GetBookingsParams {
  search?: string
  date?: string
  page?: number
  limit?: number
}

export interface CreateBookingRequest {
  guestId: number
  date: string
  time: string
  persons: number
}

export interface UpdateBookingStatusRequest {
  status: BookingStatus
}

/** Получить список бронирований. */
export async function getBookings(
  params?: GetBookingsParams
): Promise<PaginatedResponse<Booking>> {
  if (USE_MOCKS) {
    return mocks.mockBookings.getList(params)
  }
  const response = await apiClient.get<PaginatedResponse<Booking>>('/bookings', {
    params,
  })
  return response.data
}

/** Получить одну бронь по ID. */
export async function getBooking(id: number): Promise<Booking> {
  if (USE_MOCKS) {
    return mocks.mockBookings.getOne(id)
  }
  const response = await apiClient.get<Booking>(`/bookings/${id}`)
  return response.data
}

/** Создать новую бронь. */
export async function createBooking(
  data: CreateBookingRequest
): Promise<Booking> {
  if (USE_MOCKS) {
    return mocks.mockBookings.create(data)
  }
  const response = await apiClient.post<Booking>('/bookings', data)
  return response.data
}

/** Обновить статус брони. */
export async function updateBookingStatus(
  id: number,
  data: UpdateBookingStatusRequest
): Promise<Booking> {
  if (USE_MOCKS) {
    return mocks.mockBookings.updateStatus(id, data.status)
  }
  const response = await apiClient.patch<Booking>(`/bookings/${id}/status`, data)
  return response.data
}
