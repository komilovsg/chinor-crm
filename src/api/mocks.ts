import type {
  User,
  DashboardStats,
  Booking,
  Guest,
  BroadcastStats,
  BroadcastHistoryItem,
  Campaign,
  Settings,
  PaginatedResponse,
} from '@/types'

/** Задержка для имитации сетевого запроса (мс). */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Мок-данные. */
const mockUser: User = {
  id: 1,
  email: 'admin@chinor.com',
  role: 'admin',
  display_name: 'Администратор',
}

const mockGuestsData: Guest[] = [
  {
    id: 1,
    name: 'Искандер',
    phone: '+998901234567',
    email: null,
    segment: 'Новичок',
    visits_count: 0,
    last_visit_at: null,
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 2,
    name: 'Amir Muhidinzoda',
    phone: '+998901234568',
    email: null,
    segment: 'Новичок',
    visits_count: 0,
    last_visit_at: null,
    created_at: '2026-01-16T11:00:00Z',
  },
  {
    id: 3,
    name: 'Guest',
    phone: '+998901234569',
    email: null,
    segment: 'Новичок',
    visits_count: 0,
    last_visit_at: null,
    created_at: '2026-01-17T12:00:00Z',
  },
  {
    id: 4,
    name: 'Олег VIP',
    phone: '+998901234570',
    email: 'vip@example.com',
    segment: 'VIP',
    visits_count: 12,
    last_visit_at: '2026-02-01T19:00:00Z',
    created_at: '2025-06-10T10:00:00Z',
  },
  {
    id: 5,
    name: 'Мария Постоянная',
    phone: '+998901234571',
    email: null,
    segment: 'Постоянные',
    visits_count: 5,
    last_visit_at: '2026-01-28T14:00:00Z',
    created_at: '2025-11-20T09:00:00Z',
  },
]

const mockBookingsData: Booking[] = [
  {
    id: 58,
    guest_id: 1,
    guest: { id: 1, name: 'Искандер', phone: '+998901234567' },
    booking_time: '2026-03-12T13:00:00Z',
    guests_count: 4,
    status: 'pending',
    created_at: '2026-02-05T10:00:00Z',
  },
  {
    id: 55,
    guest_id: 2,
    guest: { id: 2, name: 'Amir Muhidinzoda', phone: '+998901234568' },
    booking_time: '2026-02-06T19:00:00Z',
    guests_count: 5,
    status: 'pending',
    created_at: '2026-02-04T15:00:00Z',
  },
  {
    id: 53,
    guest_id: 3,
    guest: { id: 3, name: 'Guest', phone: '+998901234569' },
    booking_time: '2026-02-07T20:00:00Z',
    guests_count: 8,
    status: 'confirmed',
    created_at: '2026-02-03T14:00:00Z',
  },
]

const mockSettingsData: Settings = {
  pushNotifications: true,
  webhookUrl: 'https://n8n.srv1133208.hstgr.cloud/webhook/get-list',
  autoBackup: true,
  segment_regular_threshold: 5,
  segment_vip_threshold: 10,
  broadcastWebhookUrl: '',
  bookingWebhookUrl: '',
  restaurant_place: 'CHINOR',
  default_table_message: 'будет назначен',
}

/** Мок-функции. */
export const mockAuth = {
  login: async (
    _email: string,
    _password: string
  ): Promise<{ access_token: string; user: User }> => {
    await delay(500)
    return {
      access_token: 'mock-jwt-token',
      user: mockUser,
    }
  },
}

export const mockDashboard = {
  getStats: async (): Promise<DashboardStats> => {
    await delay(300)
    return {
      totalBookings: 14,
      todayArrivals: 0,
      guestCount: 14,
      noShowRate: 14.3,
    }
  },
}

export const mockBookings = {
  getList: async (params?: {
    search?: string
    date?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Booking>> => {
    await delay(400)
    let filtered = [...mockBookingsData]
    if (params?.search) {
      const search = params.search.toLowerCase()
      filtered = filtered.filter(
        (b) =>
          b.guest?.name?.toLowerCase().includes(search) ||
          b.guest?.phone?.includes(search)
      )
    }
    if (params?.date) {
      const date = new Date(params.date).toISOString().split('T')[0]
      filtered = filtered.filter((b) => b.booking_time.startsWith(date))
    }
    const page = params?.page ?? 1
    const limit = params?.limit ?? 10
    const start = (page - 1) * limit
    return {
      items: filtered.slice(start, start + limit),
      total: filtered.length,
      page,
      limit,
    }
  },
  getOne: async (id: number): Promise<Booking> => {
    await delay(200)
    const booking = mockBookingsData.find((b) => b.id === id)
    if (!booking) throw new Error('Booking not found')
    return booking
  },
  create: async (data: {
    guestId?: number
    guest?: { phone: string; name?: string; email?: string }
    date: string
    time: string
    persons: number
  }): Promise<Booking> => {
    await delay(500)
    let guestId: number
    let guest: (typeof mockGuestsData)[0] | undefined
    if (data.guestId) {
      guestId = data.guestId
      guest = mockGuestsData.find((g) => g.id === guestId)
    } else if (data.guest?.phone) {
      const existing = mockGuestsData.find((g) => g.phone === data.guest!.phone)
      if (existing) {
        guestId = existing.id
        guest = existing
      } else {
        const newGuest: (typeof mockGuestsData)[0] = {
          id: mockGuestsData.length + 1,
          name: data.guest.name ?? null,
          phone: data.guest.phone,
          email: data.guest.email ?? null,
          segment: 'Новичок',
          visits_count: 0,
          last_visit_at: null,
          created_at: new Date().toISOString(),
        }
        mockGuestsData.push(newGuest)
        guestId = newGuest.id
        guest = newGuest
      }
    } else {
      throw new Error('Provide guestId or guest.phone')
    }
    const newBooking: Booking = {
      id: mockBookingsData.length + 1,
      guest_id: guestId,
      guest: guest ? { id: guest.id, name: guest.name, phone: guest.phone } : undefined,
      booking_time: `${data.date}T${data.time}:00Z`,
      guests_count: data.persons,
      status: 'pending',
      created_at: new Date().toISOString(),
    }
    mockBookingsData.push(newBooking)
    return newBooking
  },
  updateStatus: async (id: number, status: string): Promise<Booking> => {
    await delay(300)
    const booking = mockBookingsData.find((b) => b.id === id)
    if (!booking) throw new Error('Booking not found')
    booking.status = status as Booking['status']
    return booking
  },
}

function countGuestsBySegment(): { total: number; vip: number; regular: number; new: number } {
  let vip = 0
  let regular = 0
  let newCount = 0
  for (const g of mockGuestsData) {
    if (g.segment === 'VIP') vip += 1
    else if (g.segment === 'Постоянные') regular += 1
    else if (g.segment === 'Новичок' || g.segment === 'Новички') newCount += 1
  }
  return {
    total: mockGuestsData.length,
    vip,
    regular,
    new: newCount,
  }
}

export const mockGuests = {
  getStats: async (): Promise<{ total: number; vip: number; regular: number; new: number }> => {
    await delay(300)
    return countGuestsBySegment()
  },
  getList: async (params?: {
    search?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Guest>> => {
    await delay(400)
    let filtered = [...mockGuestsData]
    if (params?.search) {
      const search = params.search.toLowerCase()
      filtered = filtered.filter(
        (g) =>
          g.name?.toLowerCase().includes(search) || g.phone.includes(search)
      )
    }
    const page = params?.page ?? 1
    const limit = params?.limit ?? 10
    const start = (page - 1) * limit
    return {
      items: filtered.slice(start, start + limit),
      total: filtered.length,
      page,
      limit,
    }
  },
  getOne: async (id: number): Promise<Guest> => {
    await delay(200)
    const guest = mockGuestsData.find((g) => g.id === id)
    if (!guest) throw new Error('Guest not found')
    return guest
  },
  create: async (data: { name?: string; phone: string; email?: string }): Promise<Guest> => {
    await delay(500)
    const newGuest: Guest = {
      id: mockGuestsData.length + 1,
      name: data.name ?? null,
      phone: data.phone,
      email: data.email ?? null,
      segment: 'Новичок',
      visits_count: 0,
      last_visit_at: null,
      created_at: new Date().toISOString(),
    }
    mockGuestsData.push(newGuest)
    return newGuest
  },
  update: async (id: number, data: Partial<Guest>): Promise<Guest> => {
    await delay(300)
    const guest = mockGuestsData.find((g) => g.id === id)
    if (!guest) throw new Error('Guest not found')
    Object.assign(guest, data)
    return guest
  },
  export: async (params?: { search?: string }): Promise<Blob> => {
    await delay(500)
    let filtered = [...mockGuestsData]
    if (params?.search) {
      const search = params.search.toLowerCase()
      filtered = filtered.filter(
        (g) =>
          g.name?.toLowerCase().includes(search) || g.phone.includes(search)
      )
    }
    const csv = [
      'Имя,Телефон,Email,Сегмент,Визиты,Последний визит',
      ...filtered.map(
        (g) =>
          `"${g.name ?? ''}","${g.phone}","${g.email ?? ''}","${g.segment}",${g.visits_count},"${g.last_visit_at ?? ''}"`
      ),
    ].join('\n')
    return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  },
}

const mockBroadcastHistoryData: BroadcastHistoryItem[] = []

export const mockBroadcasts = {
  getStats: async (): Promise<BroadcastStats> => {
    await delay(300)
    return {
      available: 14,
      delivered: null,
      errors: null,
    }
  },
  getHistory: async (): Promise<BroadcastHistoryItem[]> => {
    await delay(400)
    return [...mockBroadcastHistoryData]
  },
  create: async (data: {
    segment: string
    messageText: string
    imageUrl?: string
  }): Promise<Campaign> => {
    await delay(500)
    const now = new Date().toISOString()
    const campaign: Campaign = {
      id: mockBroadcastHistoryData.length + 1,
      name: `Рассылка: ${data.segment}`,
      message_text: data.messageText,
      image_url: (data.imageUrl || '').trim() || null,
      target_segment: data.segment,
      scheduled_at: null,
      created_at: now,
      updated_at: now,
    }
    mockBroadcastHistoryData.push({
      campaign,
      sent_count: 0,
      failed_count: 0,
    })
    return campaign
  },
}

export const mockSettings = {
  get: async (): Promise<Settings> => {
    await delay(200)
    return { ...mockSettingsData }
  },
  update: async (data: Partial<Settings>): Promise<Settings> => {
    await delay(300)
    Object.assign(mockSettingsData, data)
    return { ...mockSettingsData }
  },
}
