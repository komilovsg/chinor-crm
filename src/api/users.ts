import { apiClient } from './client'
import type { CrmUser } from '@/types'

export interface CreateUserRequest {
  email: string
  password: string
  role: 'admin' | 'hostess_1' | 'hostess_2'
  display_name: string
}

export interface UpdateUserRequest {
  email?: string
  password?: string
  role?: 'admin' | 'hostess_1' | 'hostess_2'
  display_name?: string
}

/** Список всех пользователей. Доступ: только admin. */
export async function getUsers(): Promise<CrmUser[]> {
  const response = await apiClient.get<CrmUser[]>('/users')
  return response.data
}

/** Создать пользователя. Доступ: только admin. */
export async function createUser(data: CreateUserRequest): Promise<CrmUser> {
  const response = await apiClient.post<CrmUser>('/users', data)
  return response.data
}

/** Обновить пользователя. Доступ: только admin. */
export async function updateUser(
  id: number,
  data: UpdateUserRequest
): Promise<CrmUser> {
  const response = await apiClient.patch<CrmUser>(`/users/${id}`, data)
  return response.data
}

/** Удалить пользователя. Доступ: только admin. */
export async function deleteUser(id: number): Promise<void> {
  await apiClient.delete(`/users/${id}`)
}
