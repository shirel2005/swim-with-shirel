export interface AvailabilityWindow {
  id: number
  date: string
  start_time: string
  end_time: string
  created_at: string
}

export interface ComputedSlot {
  id: string          // e.g. "w1_900_30" (windowId_startMinutes_duration)
  window_id: number
  date: string
  start_time: string  // "15:00"
  duration: 30 | 45
}

export interface AvailabilitySlot {
  id: number
  date: string         // YYYY-MM-DD
  time_slot: string    // HH:MM
  duration: 30 | 45
  is_available: number // 1 = available, 0 = booked
  created_at: string
}

// Updated Child — experience replaces skill_level, age is required
export interface Child {
  id: string           // temp client-side ID
  name: string
  age: string          // REQUIRED
  experience: string   // REQUIRED: 'beginner' | 'some-comfort' | 'basic-skills' | 'independent' | 'advanced'
  notes: string
}

// Assignment of a session to specific children
export interface SessionAssignment {
  window_id: number
  date: string
  start_time: string
  duration: 30 | 45
  assigned_children: string[]  // child names
}

export interface RecurringRequest {
  days: string[]   // Sun–Fri allowed
  time: string
  start_date: string
  end_date: string
  weeks: string
  frequency: 'weekly' | 'biweekly'
}

export interface Booking {
  id: number
  parent_name: string
  parent_email: string
  parent_phone: string
  children: string           // JSON
  slot_ids: string           // JSON (legacy)
  booked_slots: string       // JSON array of {window_id, date, start_time, duration}
  session_assignments: string // JSON array of SessionAssignment
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled'
  notes: string | null
  created_at: string
  lesson_type: string | null
  lesson_format: 'private' | 'semi-private' | null
  booking_type: 'one-time' | 'weekly' | '10pack' | null
  pack_total: number         // 10 for 10-packs, 0 otherwise
  pack_used: number          // sessions used from pack (manual override)
  ten_pack_id: number | null
  tp_sessions_used?: number  // from LEFT JOIN ten_packs (auto-tracked)
  tp_total_sessions?: number // from LEFT JOIN ten_packs
  is_weekly_request: number
  recurring_day: string | null
  recurring_time: string | null
  recurring_start_date: string | null
  recurring_end_date: string | null
  recurring_weeks: string | null
  recurring_frequency: string | null
}

export interface TenPack {
  id: number
  parent_name: string
  parent_email: string
  parent_phone: string
  children: string      // JSON
  lesson_type: string
  lesson_format: string
  total_sessions: number
  sessions_used: number
  status: 'active' | 'completed' | 'cancelled'
  created_at: string
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
