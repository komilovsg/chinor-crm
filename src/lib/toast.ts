/**
 * Уведомления-тостеры для CRM.
 * Единый API для success/error с понятными текстами для пользователей.
 */
import { toast as rtToast } from 'react-toastify'

/** Успешные действия — понятный текст для хостесов и админов. */
export const toast = {
  success: (message: string) => {
    rtToast.success(message, { autoClose: 4000 })
  },
  error: (message: string) => {
    rtToast.error(message, { autoClose: 6000 })
  },
}
