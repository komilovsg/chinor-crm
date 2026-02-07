import axios, { type AxiosError, type AxiosInstance } from 'axios'

/** Моки включены, если явно VITE_USE_MOCKS=true или не задан VITE_API_URL. См. .env.example */
export const USE_MOCKS =
  import.meta.env.VITE_USE_MOCKS === 'true' || !import.meta.env.VITE_API_URL

/** Базовый URL API. При 401 токен сбрасывается и выполняется редирект на /login. */
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/** Экземпляр axios с базовой конфигурацией. */
export const apiClient: AxiosInstance = axios.create({
  baseURL: `${baseURL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

/** Получить токен из localStorage. */
function getToken(): string | null {
  return localStorage.getItem('chinor_access_token')
}

/** Интерцептор запросов: добавляет Authorization header с JWT. */
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

/** Интерцептор ответов: обработка 401 (редирект на /login). */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('chinor_access_token')
      localStorage.removeItem('chinor_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

/** Тип ошибки API (FastAPI формат). */
export interface ApiError {
  detail: string | Array<{ msg: string; loc: string[] }>
}

/** Извлечь сообщение об ошибке из ответа бэка (detail) или из Error. Для отображения в UI. */
export function getApiErrorMessage(error: unknown, fallback: string = 'Произошла ошибка'): string {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as ApiError
    if (typeof data.detail === 'string') return data.detail
    if (Array.isArray(data.detail) && data.detail[0]?.msg) {
      return data.detail.map((d) => d.msg).join(', ')
    }
  }
  if (error instanceof Error) return error.message
  return fallback
}
