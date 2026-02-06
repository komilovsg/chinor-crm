import { apiClient, USE_MOCKS } from './client'
import * as mocks from './mocks'
import type { User } from '@/types'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: User
}

/** Вход: email и пароль → токен и данные пользователя. */
export async function login(
  data: LoginRequest
): Promise<LoginResponse> {
  if (USE_MOCKS) {
    return mocks.mockAuth.login(data.email, data.password)
  }
  const response = await apiClient.post<LoginResponse>('/auth/login', data)
  return response.data
}
