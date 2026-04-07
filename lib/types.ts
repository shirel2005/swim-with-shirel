export interface AvailabilitySlot {
  id: number
  date: string         // YYYY-MM-DD
  time_slot: string    // HH:MM
  duration: 30 | 45
  is_available: number // 1 = available, 0 = booked
  created_at: string
}

export interface Child {
  name: string
  age: string
  skill_level: string
  notes: string
}

export interface RecurringRequest {
  day: string         // e.g. "Monday"
  time: string        // e.g. "09:00"
  start_date: string  // YYYY-MM-DD
  end_date: string    // YYYY-MM-DD (optional, can be empty)
  weeks: string       // number of weeks (optional, can be empty)
  frequency: 'weekly' | 'biweekly'
}

export interface BookingFormData {
  parent_name: string
  parent_email: string
  parent_phone: string
  children: Child[]
  slot_ids: number[]
  lesson_type: string
  lesson_format: 'private' | 'semi-private'
  is_weekly_request: boolean
  recurring?: RecurringRequest
  notes: string
}

export interface Booking {
  id: number
  parent_name: string
  parent_email: string
  parent_phone: string
  children: string     // JSON string array
  slot_ids: string     // JSON number array
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled'
  notes: string | null
  created_at: string
  lesson_type: string | null
  is_weekly_request: number   // 0 or 1
  recurring_day: string | null
  recurring_time: string | null
  recurring_start_date: string | null
  recurring_end_date: string | null
  recurring_weeks: string | null
  recurring_frequency: string | null
  lesson_format: 'private' | 'semi-private' | null
}

export interface Review {
  id: number
  parent_name: string
  child_name: string
  rating: number
  review_text: string
  lesson_type: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}
