import { useCallback, useState } from 'react'
import type { User } from '@/types'

const STORAGE_KEYS = {
  token: 'chinor_access_token',
  user: 'chinor_user',
} as const

function readToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.token)
}

function readUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user)
    if (!raw) return null
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

/** Хук аутентификации: токен и пользователь из localStorage (пока мок, без API). */
export function useAuth() {
  const [token, setTokenState] = useState<string | null>(readToken)
  const [user, setUserState] = useState<User | null>(readUser)

  const setToken = useCallback((value: string | null) => {
    if (value !== null) {
      localStorage.setItem(STORAGE_KEYS.token, value)
    } else {
      localStorage.removeItem(STORAGE_KEYS.token)
    }
    setTokenState(value)
  }, [])

  const setUser = useCallback((value: User | null) => {
    if (value !== null) {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(value))
    } else {
      localStorage.removeItem(STORAGE_KEYS.user)
    }
    setUserState(value)
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [setToken, setUser])

  const isAuthenticated = token !== null && token.length > 0

  return {
    token,
    user,
    setToken,
    setUser,
    logout,
    isAuthenticated,
  }
}
