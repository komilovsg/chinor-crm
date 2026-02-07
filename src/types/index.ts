/** User from auth (API contract) */
export interface User {
  id: number
  email: string
  role: 'admin' | 'hostess_1' | 'hostess_2'
  display_name: string
}

/** Guest (API contract) */
export interface Guest {
  id: number
  name: string | null
  phone: string
  email: string | null
  segment: string
  visits_count: number
  last_visit_at: string | null
  created_at: string
}

/** Booking (API contract) */
export interface Booking {
  id: number
  guest_id: number
  guest?: Pick<Guest, 'id' | 'name' | 'phone'>
  booking_time: string
  guests_count: number
  status: BookingStatus
  created_at: string
}

export type BookingStatus = 'pending' | 'confirmed' | 'canceled' | 'no_show'

/** Dashboard stats (API contract) */
export interface DashboardStats {
  totalBookings: number
  todayArrivals: number
  guestCount: number
  noShowRate: number
}

/** Campaign (API contract) */
export interface Campaign {
  id: number
  name: string
  message_text: string
  target_segment: string | null
  scheduled_at: string | null
  created_at: string
  updated_at: string
}

/** Campaign send (API contract) */
export interface CampaignSend {
  id: number
  campaign_id: number
  guest_id: number
  status: 'pending' | 'sent' | 'failed'
  sent_at: string | null
  error_message: string | null
  created_at: string
}

/** Broadcast stats (API contract) */
export interface BroadcastStats {
  available: number
  delivered: number | null
  errors: number | null
}

/** Broadcast history item (API contract) */
export interface BroadcastHistoryItem {
  campaign: Campaign
  sent_count: number
  failed_count: number
}

/** Settings (API contract) */
export interface Settings {
  pushNotifications: boolean
  webhookUrl: string
  autoBackup: boolean
  segment_regular_threshold: number
  segment_vip_threshold: number
}

/** CRM User (admin only API) */
export interface CrmUser {
  id: number
  email: string
  role: 'admin' | 'hostess_1' | 'hostess_2'
  display_name: string
  created_at: string | null
}

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}
