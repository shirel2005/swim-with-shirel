'use client'

import { useState, useEffect } from 'react'
import AvailabilityCalendar from './AvailabilityCalendar'
import { ComputedSlot } from '@/lib/types'
import { format } from 'date-fns'
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL } from '@/lib/contact'
import {
  Plus, X, Check, CheckCircle, User, Users, Mail, Phone, FileText,
  ChevronRight, ChevronLeft, AlertCircle, Repeat, Package, Sparkles,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ParentInfo { name: string; email: string; phone: string }

interface ChildDraft {
  id: string
  name: string
  age: string
  experience: string
  notes: string
}

interface SessionAssignment {
  window_id: number
  date: string
  start_time: string
  duration: 30 | 45
  assigned_children: string[]
}

interface SavedClient {
  parent_name: string
  parent_email: string
  parent_phone: string
  children: ChildDraft[]
  timestamp: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'Beginner', desc: 'New to water' },
  { value: 'some-comfort', label: 'Some comfort in water', desc: 'Getting used to the pool' },
  { value: 'basic-skills', label: 'Can float / basic skills', desc: 'Learning to kick and float' },
  { value: 'independent', label: 'Swims independently', desc: 'Basic strokes learned' },
  { value: 'advanced', label: 'Advanced swimmer', desc: 'Strong technique, wants to improve' },
]

const LESSON_TYPE_OPTIONS = [
  { value: '30min',        label: '30-Minute Lesson',  duration: 30 as const, pack: false, hint: 'Great for young beginners',      pvtSession: 50,  semiSession: 100, pvtPack: 0,   semiPack: 0    },
  { value: '45min',        label: '45-Minute Lesson',  duration: 45 as const, pack: false, hint: 'More depth and real progress',   pvtSession: 75,  semiSession: 150, pvtPack: 0,   semiPack: 0    },
  { value: '10pack-30min', label: '10-Pack · 30 min',  duration: 30 as const, pack: true,  hint: 'Best value — save $50',          pvtSession: 50,  semiSession: 100, pvtPack: 450, semiPack: 900  },
  { value: '10pack-45min', label: '10-Pack · 45 min',  duration: 45 as const, pack: true,  hint: 'Best value — save $150',         pvtSession: 75,  semiSession: 150, pvtPack: 600, semiPack: 1200 },
]

const STEPS = [
  { num: 1, label: 'You' },
  { num: 2, label: 'Children' },
  { num: 3, label: 'Lesson' },
  { num: 4, label: 'Schedule' },
  { num: 5, label: 'Review' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getLessonDuration(lt: string): 30 | 45 {
  return lt.includes('45') ? 45 : 30
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 === 0 ? 12 : h % 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}

function formatSlotDate(d: string) {
  try { return format(new Date(d + 'T00:00:00'), 'EEE, MMM d, yyyy') }
  catch { return d }
}

function newChild(idx: number): ChildDraft {
  return { id: `c${idx}_${Date.now()}`, name: '', age: '', experience: '', notes: '' }
}

function calcPrice(sessions: ComputedSlot[], lessonType: string, lessonFormat: 'private' | 'semi-private'): number {
  const lt = LESSON_TYPE_OPTIONS.find(t => t.value === lessonType)
  if (!lt) return 0
  if (lt.pack) return lessonFormat === 'semi-private' ? lt.semiPack : lt.pvtPack
  return sessions.reduce((sum, s) => {
    const base = s.duration === 45 ? 75 : 50
    return sum + (lessonFormat === 'semi-private' ? base * 2 : base)
  }, 0)
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5">
      <AlertCircle size={11} />{msg}
    </p>
  )
}

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center mb-8 px-2">
      {STEPS.map(({ num, label }, i) => {
        const done = num < current
        const active = num === current
        return (
          <div key={num} className="flex items-center">
            <div className="flex flex-col items-center gap-1 w-14">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                done ? 'bg-sky-700 text-white' :
                active ? 'bg-sky-700 text-white ring-4 ring-sky-100 shadow-sm' :
                'bg-slate-100 text-slate-400'
              }`}>
                {done ? <Check size={13} /> : num}
              </div>
              <span className={`text-[10px] font-semibold tracking-wide text-center ${
                active ? 'text-sky-700' : done ? 'text-sky-500' : 'text-slate-400'
              }`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-6 sm:w-10 h-0.5 mb-4 mx-0.5 transition-colors ${done ? 'bg-sky-600' : 'bg-slate-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

const inp = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 text-sm bg-white text-slate-800 placeholder-slate-400'
const inpErr = 'w-full px-4 py-2.5 rounded-xl border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 text-sm bg-white text-slate-800 placeholder-slate-400'

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function BookingForm() {
  const [step, setStep] = useState(1)

  // Step 1 — Parent info
  const [parent, setParentState] = useState<ParentInfo>({ name: '', email: '', phone: '' })
  const [savedClient, setSavedClient] = useState<SavedClient | null>(null)
  const [quickFilled, setQuickFilled] = useState(false)

  // Step 2 — Children
  const [children, setChildren] = useState<ChildDraft[]>([newChild(0)])

  // Step 3 — Lesson config
  const [bookingType, setBookingType] = useState<'one-time' | 'weekly' | '10pack'>('one-time')
  const [existingTenPacks, setExistingTenPacks] = useState<Array<{ id: number; lesson_type: string; lesson_format: string; sessions_used: number; total_sessions: number }>>([])
  const [selectedTenPackId, setSelectedTenPackId] = useState<number | null>(null)
  const [lessonType, setLessonTypeState] = useState('30min')
  const [lessonFormat, setLessonFormat] = useState<'private' | 'semi-private'>('private')
  const [semiPairName, setSemiPairName] = useState('')
  // Weekly request
  const [weeklyDay, setWeeklyDay] = useState<'Sunday' | 'Monday'>('Monday')
  const [weeklyTime, setWeeklyTime] = useState('15:00')
  const [weeklyStart, setWeeklyStart] = useState('')
  const [weeklyDurType, setWeeklyDurType] = useState<'weeks' | 'end_date'>('weeks')
  const [weeklyWeeks, setWeeklyWeeks] = useState('')
  const [weeklyEndDate, setWeeklyEndDate] = useState('')
  const [weeklyFreq, setWeeklyFreq] = useState<'weekly' | 'biweekly'>('weekly')

  // Step 4 — Sessions
  const [sessions, setSessions] = useState<ComputedSlot[]>([])

  // Step 5 — Review
  const [assignments, setAssignments] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState('')

  // Form state
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Load saved client
  useEffect(() => {
    try {
      const raw = localStorage.getItem('swimshirel_client')
      if (raw) {
        const data: SavedClient = JSON.parse(raw)
        if (Date.now() - data.timestamp < 365 * 24 * 60 * 60 * 1000) {
          setSavedClient(data)
        }
      }
    } catch {}
  }, [])

  const duration = getLessonDuration(lessonType)
  const isPack = lessonType.startsWith('10pack')
  const isWeekly = bookingType === 'weekly'
  const validChildren = children.filter(c => c.name.trim())
  const needsAssignment = lessonFormat === 'private' && validChildren.length > 1 && !isWeekly

  // ── Helpers ────────────────────────────────────────────────────────────────

  const setParent = (k: keyof ParentInfo, v: string) => {
    setParentState(p => ({ ...p, [k]: v }))
    const ek = `parent_${k}`
    if (errors[ek]) setErrors(e => { const n = { ...e }; delete n[ek]; return n })
  }

  const quickFill = () => {
    if (!savedClient) return
    setParentState({ name: savedClient.parent_name, email: savedClient.parent_email, phone: savedClient.parent_phone })
    setChildren(savedClient.children.map((c, i) => ({ ...c, id: `c${i}_${Date.now()}` })))
    setQuickFilled(true)
  }

  useEffect(() => {
    if (bookingType !== '10pack' || !parent.email.includes('@')) { setExistingTenPacks([]); return }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/ten-packs/lookup?email=${encodeURIComponent(parent.email)}`)
        const data = await res.json()
        setExistingTenPacks(data.packs || [])
      } catch { setExistingTenPacks([]) }
    }, 500)
    return () => clearTimeout(t)
  }, [parent.email, bookingType])

  const setLessonType = (lt: string) => {
    setLessonTypeState(lt)
    setSessions([])
    setAssignments({})
    if (lt.startsWith('10pack') && bookingType !== '10pack') setBookingType('10pack')
    else if (!lt.startsWith('10pack') && bookingType === '10pack') setBookingType('one-time')
  }

  const onBookingTypeChange = (bt: 'one-time' | 'weekly' | '10pack') => {
    setBookingType(bt)
    if (bt === '10pack' && !lessonType.startsWith('10pack')) setLessonTypeState('10pack-30min')
    if (bt !== '10pack' && lessonType.startsWith('10pack')) setLessonTypeState('30min')
    setSessions([])
    setAssignments({})
  }

  const addChild = () => setChildren(prev => [...prev, newChild(prev.length)])
  const removeChild = (id: string) => {
    if (children.length <= 1) return
    setChildren(prev => prev.filter(c => c.id !== id))
  }
  const updateChild = (id: string, k: keyof ChildDraft, v: string) => {
    setChildren(prev => prev.map(c => c.id === id ? { ...c, [k]: v } : c))
    const ek = `child_${id}_${k}`
    if (errors[ek]) setErrors(e => { const n = { ...e }; delete n[ek]; return n })
  }

  const onSlotsChange = (slots: ComputedSlot[]) => {
    setSessions(slots)
    if (errors.sessions) setErrors(e => { const n = { ...e }; delete n.sessions; return n })
  }

  const assignSession = (slotId: string, childId: string) => {
    setAssignments(prev => ({ ...prev, [slotId]: childId }))
    const ek = `assign_${slotId}`
    if (errors[ek]) setErrors(e => { const n = { ...e }; delete n[ek]; return n })
  }

  // ── Validation ──────────────────────────────────────────────────────────────

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {}

    if (s === 1) {
      if (!parent.name.trim()) errs.parent_name = 'Full name is required'
      if (!parent.email.trim() || !parent.email.includes('@')) errs.parent_email = 'Valid email is required'
      if (!parent.phone.trim()) errs.parent_phone = 'Phone number is required'
    }

    if (s === 2) {
      const valid = children.filter(c => c.name.trim())
      if (valid.length === 0) errs.children_general = 'Add at least one child'
      children.forEach(c => {
        if (c.name.trim()) {
          if (!c.age.trim()) errs[`child_${c.id}_age`] = 'Age is required'
          if (!c.experience) errs[`child_${c.id}_experience`] = 'Swimming experience is required'
        }
      })
      if (lessonFormat === 'semi-private') {
        if (valid.length < 2) errs.children_general = 'Semi-private requires exactly 2 children'
        if (valid.length > 2) errs.children_general = 'Semi-private allows a maximum of 2 children'
      }
    }

    if (s === 3 && isWeekly) {
      if (!weeklyStart) errs.weekly_start = 'Start date is required'
      if (weeklyDurType === 'weeks' && !weeklyWeeks) errs.weekly_duration = 'Number of weeks is required'
      if (weeklyDurType === 'end_date' && !weeklyEndDate) errs.weekly_duration = 'End date is required'
    }

    if (s === 4 && !isWeekly) {
      if (sessions.length === 0) errs.sessions = 'Please select at least one session'
      else if (!isPack && lessonFormat === 'private' && sessions.length < validChildren.length) {
        errs.sessions = `Select ${validChildren.length} sessions — one per child (${sessions.length}/${validChildren.length} selected)`
      }
    }

    if (s === 5 && needsAssignment) {
      sessions.forEach(slot => {
        if (!assignments[slot.id]) errs[`assign_${slot.id}`] = 'Assign a child to this session'
      })
      const assignedChildIds = new Set(Object.values(assignments))
      validChildren.forEach(c => {
        if (!assignedChildIds.has(c.id)) {
          errs.assignments_general = 'Every child must be assigned to at least one session'
        }
      })
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const goNext = () => {
    if (!validateStep(step)) return
    setStep(s => Math.min(s + 1, 5))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const goBack = () => {
    setErrors({})
    setStep(s => Math.max(s - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Build assignments ───────────────────────────────────────────────────────

  const buildAssignments = (): SessionAssignment[] => {
    return sessions.map(slot => {
      let assigned: string[]
      if (lessonFormat === 'semi-private') {
        assigned = validChildren.map(c => c.name)
      } else if (validChildren.length === 1) {
        assigned = [validChildren[0].name]
      } else {
        const child = validChildren.find(c => c.id === assignments[slot.id])
        assigned = child ? [child.name] : []
      }
      return { window_id: slot.window_id, date: slot.date, start_time: slot.start_time, duration: slot.duration, assigned_children: assigned }
    })
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validateStep(5)) return
    setSubmitting(true)
    try {
      const payload = {
        parent_name: parent.name.trim(),
        parent_email: parent.email.trim(),
        parent_phone: parent.phone.trim(),
        lesson_format: lessonFormat,
        lesson_type: lessonType,
        booking_type: bookingType,
        pack_total: isPack ? 10 : 0,
        children: validChildren.map(({ name, age, experience, notes: n }) => ({ name, age, experience, notes: n })),
        booked_slots: isWeekly ? [] : sessions.map(s => ({ window_id: s.window_id, date: s.date, start_time: s.start_time, duration: s.duration })),
        session_assignments: buildAssignments(),
        notes: notes.trim() || null,
        slot_ids: [],
        ten_pack_id: selectedTenPackId || undefined,
        is_weekly_request: isWeekly ? 1 : 0,
        recurring: isWeekly ? {
          day: weeklyDay,
          time: weeklyTime,
          start_date: weeklyStart,
          end_date: weeklyDurType === 'end_date' ? weeklyEndDate : '',
          weeks: weeklyDurType === 'weeks' ? weeklyWeeks : '',
          frequency: weeklyFreq,
        } : undefined,
      }

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) { setErrors({ submit: data.error || 'Failed to submit. Please try again.' }); return }

      // Save for returning client
      try {
        localStorage.setItem('swimshirel_client', JSON.stringify({
          parent_name: parent.name.trim(),
          parent_email: parent.email.trim(),
          parent_phone: parent.phone.trim(),
          children: validChildren.map(({ name, age, experience, notes: n }) => ({ id: 'c0', name, age, experience, notes: n })),
          timestamp: Date.now(),
        }))
      } catch {}

      setSuccess(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  // ── Time options ────────────────────────────────────────────────────────────
  const timeOptions: string[] = []
  for (let h = 7; h <= 21; h++) {
    timeOptions.push(`${String(h).padStart(2, '0')}:00`)
    timeOptions.push(`${String(h).padStart(2, '0')}:30`)
  }

  // ── Success ─────────────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-10 text-center">
          <div className="w-16 h-16 bg-sky-50 border-2 border-sky-200 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-sky-700" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Request Received!</h2>
          <p className="text-slate-500 mb-5">
            Thank you, <strong className="text-slate-800">{parent.name}</strong>!
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 text-sm text-amber-800 text-left">
            <p className="font-bold mb-1">⏳ Not confirmed yet</p>
            <p>Your lesson times are not confirmed until you hear directly from Shirel. She&apos;ll follow up within 24 hours.</p>
          </div>
          <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5 text-left text-sm space-y-1.5 mb-6">
            <p>✓ A confirmation will be sent to <strong>{parent.email}</strong></p>
            <p>✓ Payment due within 2 hours of lesson — cash or e-transfer</p>
          </div>
          <p className="text-sm text-slate-400 mb-6">
            Questions?{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-sky-700 hover:underline">{CONTACT_EMAIL}</a>
            {' '}·{' '}
            <a href={`tel:${CONTACT_PHONE_TEL}`} className="text-sky-700 hover:underline">{CONTACT_PHONE}</a>
          </p>
          <button
            onClick={() => {
              setStep(1); setParentState({ name: '', email: '', phone: '' })
              setChildren([newChild(0)]); setBookingType('one-time'); setLessonTypeState('30min')
              setLessonFormat('private'); setSessions([]); setAssignments({})
              setNotes(''); setErrors({}); setSuccess(false); setQuickFilled(false)
            }}
            className="btn-secondary text-sm"
          >Book Another Lesson</button>
        </div>
      </div>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const card = 'card p-6 sm:p-7'

  return (
    <div className="max-w-2xl mx-auto">
      <StepBar current={step} />

      {/* ── STEP 1: Parent Info ─────────────────────────────────────────────── */}
      {step === 1 && (
        <div className={card}>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Your Information</h2>
            <p className="text-sm text-slate-400 mt-1">We&apos;ll use this to confirm your booking.</p>
          </div>

          {savedClient && !quickFilled && (
            <div className="flex items-center justify-between bg-sky-50 border border-sky-200 rounded-2xl px-4 py-3.5 mb-5">
              <div>
                <p className="text-sm font-bold text-sky-900 flex items-center gap-1.5">
                  <Sparkles size={14} /> Welcome back, {savedClient.parent_name.split(' ')[0]}!
                </p>
                <p className="text-xs text-sky-600 mt-0.5">Fill in your details automatically?</p>
              </div>
              <button type="button" onClick={quickFill}
                className="px-3 py-1.5 bg-sky-700 text-white text-xs font-semibold rounded-xl hover:bg-sky-800 transition-colors flex-shrink-0">
                Quick fill
              </button>
            </div>
          )}

          {quickFilled && (
            <div className="flex items-center gap-2 text-xs text-sky-700 bg-sky-50 border border-sky-100 rounded-xl px-3 py-2 mb-5">
              <Check size={13} /> Pre-filled from your last booking — review and update if needed.
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-slate-500 mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400" />
                <input type="text" value={parent.name} onChange={e => setParent('name', e.target.value)}
                  placeholder="Your full name" className={`${errors.parent_name ? inpErr : inp} pl-10`} />
              </div>
              <FieldError msg={errors.parent_name} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-slate-500 mb-1.5">
                  Email <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400" />
                  <input type="email" value={parent.email} onChange={e => setParent('email', e.target.value)}
                    placeholder="you@example.com" className={`${errors.parent_email ? inpErr : inp} pl-10`} />
                </div>
                <FieldError msg={errors.parent_email} />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-slate-500 mb-1.5">
                  Phone <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400" />
                  <input type="tel" value={parent.phone} onChange={e => setParent('phone', e.target.value)}
                    placeholder="(514) 000-0000" className={`${errors.parent_phone ? inpErr : inp} pl-10`} />
                </div>
                <FieldError msg={errors.parent_phone} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: Children ────────────────────────────────────────────────── */}
      {step === 2 && (
        <div className={card}>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Children</h2>
            <p className="text-sm text-slate-400 mt-1">Add each child who will be swimming.</p>
          </div>

          {errors.children_general && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <AlertCircle size={14} />{errors.children_general}
            </div>
          )}

          <div className="space-y-4">
            {children.map((child, idx) => (
              <div key={child.id} className="relative bg-sky-50/60 border border-sky-100 rounded-2xl p-4 border-l-4 border-l-sky-400">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-sky-700 uppercase tracking-widest">Child {idx + 1}</p>
                  {children.length > 1 && (
                    <button type="button" onClick={() => removeChild(child.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Name <span className="text-red-400">*</span></label>
                    <input type="text" value={child.name} onChange={e => updateChild(child.id, 'name', e.target.value)}
                      placeholder="Child's name" className={errors[`child_${child.id}_name`] ? inpErr : inp} />
                    <FieldError msg={errors[`child_${child.id}_name`]} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Age <span className="text-red-400">*</span></label>
                    <input type="text" value={child.age} onChange={e => updateChild(child.id, 'age', e.target.value)}
                      placeholder="e.g. 7" className={errors[`child_${child.id}_age`] ? inpErr : inp} />
                    <FieldError msg={errors[`child_${child.id}_age`]} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">
                    Swimming Experience <span className="text-red-400">*</span>
                  </label>
                  <div className="space-y-1.5">
                    {EXPERIENCE_OPTIONS.map(opt => (
                      <label key={opt.value}
                        className={`flex items-center gap-3 cursor-pointer rounded-xl border px-3 py-2.5 transition-all select-none ${
                          child.experience === opt.value
                            ? 'border-sky-400 bg-sky-50'
                            : 'border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50/40'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                          child.experience === opt.value ? 'border-sky-600 bg-sky-600' : 'border-slate-300'
                        }`}>
                          {child.experience === opt.value && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 leading-tight">{opt.label}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                        </div>
                        <input type="radio" name={`exp_${child.id}`} value={opt.value}
                          checked={child.experience === opt.value}
                          onChange={() => updateChild(child.id, 'experience', opt.value)}
                          className="sr-only" />
                      </label>
                    ))}
                  </div>
                  <FieldError msg={errors[`child_${child.id}_experience`]} />
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Notes <span className="text-slate-300 font-normal">(optional)</span>
                  </label>
                  <textarea value={child.notes} onChange={e => updateChild(child.id, 'notes', e.target.value)}
                    placeholder="e.g. afraid of water, wants to learn freestyle..." rows={2}
                    className={`${inp} resize-none`} />
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={addChild}
            className="mt-4 flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-sky-800 transition-colors">
            <Plus size={16} /> Add another child
          </button>
        </div>
      )}

      {/* ── STEP 3: Lesson ──────────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-5">
          {/* Booking type */}
          <div className={card}>
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900">How would you like to book?</h2>
            </div>
            <div className="space-y-3">
              {[
                { value: 'one-time' as const, label: 'One-time lesson', desc: 'Book a specific date and time', icon: <Check size={15} /> },
                { value: 'weekly' as const,   label: 'Weekly recurring request', desc: 'Request a regular weekly slot — Sundays or Mondays only', icon: <Repeat size={15} /> },
                { value: '10pack' as const,   label: 'Using a 10-pack', desc: 'Already purchased — book your next session(s)', icon: <Package size={15} /> },
              ].map(opt => (
                <button key={opt.value} type="button" onClick={() => onBookingTypeChange(opt.value)}
                  className={`flex items-center gap-4 rounded-2xl border-2 p-4 cursor-pointer transition-all text-left w-full ${
                    bookingType === opt.value ? 'border-sky-700 bg-sky-50 shadow-sm' : 'border-sky-100 bg-white hover:border-sky-300'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    bookingType === opt.value ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>{opt.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm ${bookingType === opt.value ? 'text-sky-900' : 'text-slate-800'}`}>{opt.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                  </div>
                  {bookingType === opt.value && (
                    <div className="w-5 h-5 bg-sky-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={11} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Existing 10-pack lookup */}
          {bookingType === '10pack' && existingTenPacks.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
              <p className="text-sm font-bold text-purple-900 mb-3">Existing 10-Pack Found</p>
              {existingTenPacks.map(pack => (
                <label key={pack.id}
                  className={`flex items-center justify-between cursor-pointer rounded-xl border px-4 py-3 mb-2 transition-all ${selectedTenPackId === pack.id ? 'border-purple-500 bg-purple-100' : 'border-purple-200 bg-white hover:border-purple-400'}`}
                >
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{pack.lesson_type} · {pack.lesson_format}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{pack.sessions_used} of {pack.total_sessions} sessions used · {pack.total_sessions - pack.sessions_used} remaining</p>
                  </div>
                  <input type="radio" name="ten_pack_select" checked={selectedTenPackId === pack.id}
                    onChange={() => setSelectedTenPackId(pack.id)} className="accent-purple-600" />
                </label>
              ))}
              <button type="button" onClick={() => setSelectedTenPackId(null)}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors mt-1">
                + Use a new 10-pack instead
              </button>
            </div>
          )}

          {/* Lesson duration */}
          <div className={card}>
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900">Lesson Duration</h2>
              <p className="text-sm text-slate-400 mt-1">This determines which times are available.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {LESSON_TYPE_OPTIONS.filter(lt => bookingType === '10pack' ? lt.pack : !lt.pack).map(lt => {
                const selected = lessonType === lt.value
                const price = lessonFormat === 'semi-private'
                  ? (lt.pack ? `$${lt.semiPack} total` : `$${lt.semiSession}/session`)
                  : (lt.pack ? `$${lt.pvtPack} total` : `$${lt.pvtSession}/session`)
                return (
                  <button key={lt.value} type="button" onClick={() => setLessonType(lt.value)}
                    className={`rounded-2xl border-2 p-4 cursor-pointer transition-all text-left relative ${
                      selected ? 'border-sky-700 bg-sky-50 shadow-sm' : 'border-sky-100 bg-white hover:border-sky-300 hover:bg-sky-50/50'
                    }`}
                  >
                    {selected && (
                      <span className="absolute top-2.5 right-2.5 w-5 h-5 bg-sky-700 rounded-full flex items-center justify-center">
                        <Check size={11} className="text-white" />
                      </span>
                    )}
                    <p className={`font-bold text-sm mb-1 pr-6 ${selected ? 'text-sky-900' : 'text-slate-800'}`}>{lt.label}</p>
                    <p className={`font-bold text-base ${selected ? 'text-sky-700' : 'text-slate-500'}`}>{price}</p>
                    <p className="text-xs text-slate-400 mt-1">{lt.hint}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Lesson format */}
          <div className={card}>
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900">Lesson Format</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { value: 'private' as const, label: 'Private', tagline: 'One-on-one with Shirel', desc: 'Maximum focus, personalised instruction', icon: <User size={17} /> },
                { value: 'semi-private' as const, label: 'Semi-Private', tagline: 'Shared with one other child', desc: 'Double rate · Exactly 2 children required', icon: <Users size={17} /> },
              ].map(lf => {
                const sel = lessonFormat === lf.value
                return (
                  <button key={lf.value} type="button" onClick={() => setLessonFormat(lf.value)}
                    className={`rounded-2xl border-2 p-4 cursor-pointer transition-all text-left relative ${
                      sel ? 'border-sky-700 bg-sky-50 shadow-sm' : 'border-sky-100 bg-white hover:border-sky-300'
                    }`}
                  >
                    {sel && (
                      <span className="absolute top-3 right-3 w-5 h-5 bg-sky-700 rounded-full flex items-center justify-center">
                        <Check size={11} className="text-white" />
                      </span>
                    )}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${sel ? 'bg-sky-100 text-sky-700' : 'bg-slate-50 text-slate-400'}`}>
                      {lf.icon}
                    </div>
                    <p className={`font-bold text-sm ${sel ? 'text-sky-900' : 'text-slate-800'}`}>{lf.label}</p>
                    <p className={`text-sm font-medium mt-0.5 ${sel ? 'text-sky-700' : 'text-slate-500'}`}>{lf.tagline}</p>
                    <p className="text-xs text-slate-400 mt-1">{lf.desc}</p>
                  </button>
                )
              })}
            </div>
            {lessonFormat === 'semi-private' && (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-sky-700 bg-sky-50 border border-sky-100 rounded-xl px-4 py-2.5">
                  Semi-private pricing: $100/session (30 min) · $150/session (45 min). Requires exactly 2 children.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    Pairing with another child? <span className="text-slate-300 font-normal">(optional)</span>
                  </label>
                  <input type="text" value={semiPairName} onChange={e => setSemiPairName(e.target.value)}
                    placeholder="Name of the other child, if known" className={inp} />
                </div>
              </div>
            )}
          </div>

          {/* Weekly details */}
          {isWeekly && (
            <div className={card}>
              <div className="mb-5">
                <h2 className="text-xl font-bold text-slate-900">Weekly Request Details</h2>
                <div className="mt-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  This is a request only — not automatically confirmed. Shirel will follow up within 24 hours.
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Preferred Day</label>
                  <div className="flex gap-3">
                    {(['Sunday', 'Monday'] as const).map(day => (
                      <button key={day} type="button" onClick={() => setWeeklyDay(day)}
                        className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                          weeklyDay === day ? 'border-sky-700 bg-sky-700 text-white' : 'border-sky-100 text-slate-700 hover:border-sky-300'
                        }`}
                      >{day}</button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">Weekly lessons are available on Sundays and Mondays only.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Preferred Time</label>
                  <select value={weeklyTime} onChange={e => setWeeklyTime(e.target.value)} className={inp}>
                    {timeOptions.map(t => <option key={t} value={t}>{formatTime(t)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Start Date <span className="text-red-400">*</span></label>
                  <input type="date" value={weeklyStart} onChange={e => setWeeklyStart(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={errors.weekly_start ? inpErr : inp} />
                  <FieldError msg={errors.weekly_start} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Frequency</label>
                  <div className="flex gap-4">
                    {[{ v: 'weekly', l: 'Every week' }, { v: 'biweekly', l: 'Every 2 weeks' }].map(f => (
                      <label key={f.v} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                        <input type="radio" checked={weeklyFreq === f.v}
                          onChange={() => setWeeklyFreq(f.v as 'weekly' | 'biweekly')} className="accent-sky-700" />
                        {f.l}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Duration</label>
                  <div className="flex gap-4 mb-3">
                    {[{ v: 'weeks', l: 'Number of weeks' }, { v: 'end_date', l: 'End date' }].map(opt => (
                      <label key={opt.v} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                        <input type="radio" checked={weeklyDurType === opt.v}
                          onChange={() => setWeeklyDurType(opt.v as 'weeks' | 'end_date')} className="accent-sky-700" />
                        {opt.l}
                      </label>
                    ))}
                  </div>
                  {weeklyDurType === 'weeks' ? (
                    <input type="number" min={2} max={52} value={weeklyWeeks}
                      onChange={e => setWeeklyWeeks(e.target.value)} placeholder="e.g. 8"
                      className={errors.weekly_duration ? inpErr : inp} />
                  ) : (
                    <input type="date" value={weeklyEndDate} onChange={e => setWeeklyEndDate(e.target.value)}
                      min={weeklyStart || new Date().toISOString().split('T')[0]}
                      className={errors.weekly_duration ? inpErr : inp} />
                  )}
                  <FieldError msg={errors.weekly_duration} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 4: Schedule ────────────────────────────────────────────────── */}
      {step === 4 && (
        <div className={card}>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              {isWeekly ? 'Your Weekly Request' : 'Select Your Sessions'}
            </h2>
            {!isWeekly && (
              <p className="text-sm text-slate-400 mt-1">
                {lessonFormat === 'private' && validChildren.length > 1
                  ? `Select ${validChildren.length} sessions — one per child.`
                  : `Pick a date, then choose a start time from the dropdown.`
                }
              </p>
            )}
            {isPack && !isWeekly && (
              <p className="text-xs text-sky-700 bg-sky-50 border border-sky-100 rounded-xl px-3 py-2 mt-2">
                You don&apos;t need to schedule all 10 sessions now — book 1–2 to get started.
              </p>
            )}
          </div>

          {isWeekly ? (
            <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Day</span><span className="font-semibold text-slate-800">{weeklyDay}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Time</span><span className="font-semibold text-slate-800">{formatTime(weeklyTime)}</span></div>
              {weeklyStart && <div className="flex justify-between"><span className="text-slate-500">Starting</span><span className="font-semibold text-slate-800">{weeklyStart}</span></div>}
              <div className="flex justify-between"><span className="text-slate-500">Frequency</span><span className="font-semibold text-slate-800">{weeklyFreq === 'biweekly' ? 'Every 2 weeks' : 'Weekly'}</span></div>
            </div>
          ) : (
            <>
              <AvailabilityCalendar onSlotsChange={onSlotsChange} duration={duration} />
              {errors.sessions && (
                <div className="mt-3 flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle size={14} />{errors.sessions}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── STEP 5: Review ──────────────────────────────────────────────────── */}
      {step === 5 && (
        <div className="space-y-5">
          {/* Assignment UI */}
          {needsAssignment && sessions.length > 0 && (
            <div className={card}>
              <div className="mb-5">
                <h2 className="text-xl font-bold text-slate-900">Assign Children to Sessions</h2>
                <p className="text-sm text-slate-400 mt-1">Each child needs their own lesson slot.</p>
              </div>

              {errors.assignments_general && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                  <AlertCircle size={14} />{errors.assignments_general}
                </div>
              )}

              <div className="space-y-3">
                {sessions.map(slot => {
                  const assignedId = assignments[slot.id]
                  const assignedChild = validChildren.find(c => c.id === assignedId)
                  return (
                    <div key={slot.id} className={`rounded-2xl border p-4 transition-all ${
                      assignedId ? 'border-sky-200 bg-sky-50/60' : 'border-orange-200 bg-orange-50/40'
                    }`}>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{formatSlotDate(slot.date)}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{formatTime(slot.start_time)} · {slot.duration} min</p>
                        </div>
                        {assignedChild && (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-700 text-white flex-shrink-0">
                            {assignedChild.name}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {validChildren.map(child => {
                          const isMe = assignedId === child.id
                          const usedElsewhere = !isMe && !isPack && Object.values(assignments).includes(child.id)
                          return (
                            <button key={child.id} type="button"
                              onClick={() => assignSession(slot.id, child.id)}
                              disabled={usedElsewhere}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                isMe ? 'bg-sky-700 text-white border-sky-700 shadow-sm'
                                  : usedElsewhere ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-sky-400 hover:text-sky-700'
                              }`}
                            >{child.name}</button>
                          )
                        })}
                      </div>
                      <FieldError msg={errors[`assign_${slot.id}`]} />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className={card}>
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900">Review Your Request</h2>
              <p className="text-sm text-slate-400 mt-1">Check everything before submitting.</p>
            </div>

            <div className="space-y-4">
              {/* Parent */}
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Parent / Guardian</p>
                <p className="font-bold text-slate-900">{parent.name}</p>
                <p className="text-sm text-slate-500">{parent.email} · {parent.phone}</p>
              </div>

              {/* Lesson info */}
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Lesson</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                    {LESSON_TYPE_OPTIONS.find(lt => lt.value === lessonType)?.label || lessonType}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    lessonFormat === 'semi-private' ? 'bg-sky-50 text-sky-700 border-sky-100' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>{lessonFormat === 'semi-private' ? 'Semi-Private' : 'Private'}</span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {bookingType === 'weekly' ? 'Weekly Request' : bookingType === '10pack' ? '10-Pack' : 'One-time'}
                  </span>
                </div>
              </div>

              {/* Children with sessions */}
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                  {validChildren.length === 1 ? 'Child' : `Children (${validChildren.length})`}
                </p>
                <div className="space-y-3">
                  {validChildren.map(child => {
                    const expLabel = EXPERIENCE_OPTIONS.find(e => e.value === child.experience)?.label || child.experience
                    const childSessions = !isWeekly ? sessions.filter(s => {
                      if (lessonFormat === 'semi-private') return true
                      if (validChildren.length === 1) return true
                      return assignments[s.id] === child.id
                    }) : []

                    return (
                      <div key={child.id} className="pb-3 border-b border-slate-200 last:border-0 last:pb-0">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                          <div className="flex-1">
                            <p className="font-bold text-slate-900 text-sm">{child.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Age {child.age} · {expLabel}</p>
                            {child.notes && <p className="text-xs text-slate-400 italic mt-0.5">{child.notes}</p>}
                          </div>
                          {!isWeekly && childSessions.length > 0 && (
                            <div className="flex flex-col gap-1">
                              {childSessions.map(s => (
                                <span key={s.id} className="text-xs bg-sky-50 text-sky-700 border border-sky-100 px-2.5 py-1 rounded-full font-medium">
                                  {formatSlotDate(s.date)} · {formatTime(s.start_time)}
                                  {lessonFormat === 'semi-private' ? ' (shared)' : ''}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Weekly summary */}
              {isWeekly && (
                <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Weekly Request</p>
                  <p className="font-semibold text-slate-800 text-sm">{weeklyDay}s at {formatTime(weeklyTime)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Starting {weeklyStart}
                    {weeklyDurType === 'weeks' && weeklyWeeks && ` · ${weeklyWeeks} weeks`}
                    {weeklyDurType === 'end_date' && weeklyEndDate && ` · until ${weeklyEndDate}`}
                    {' '}· {weeklyFreq === 'biweekly' ? 'Every 2 weeks' : 'Weekly'}
                  </p>
                </div>
              )}

              {/* Price */}
              {!isWeekly && (
                <div className="flex items-center justify-between bg-sky-700 text-white rounded-2xl px-5 py-4">
                  <p className="font-bold text-sm">
                    {isPack ? 'Package price' : `${sessions.length} session${sessions.length !== 1 ? 's' : ''}`}
                  </p>
                  <p className="text-2xl font-bold">${calcPrice(sessions, lessonType, lessonFormat)}</p>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  <FileText size={11} className="inline mr-1" />
                  Additional Notes <span className="text-slate-300 font-normal">(optional)</span>
                </label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Anything else Shirel should know..." rows={3}
                  className={`${inp} resize-none`} />
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle size={14} />{errors.submit}
            </div>
          )}

          <p className="text-xs text-slate-400 px-1">
            By submitting, you understand this is a <strong>request only</strong>. Sessions are not confirmed until Shirel responds.
          </p>
        </div>
      )}

      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center mt-6 gap-3">
        {step > 1 ? (
          <button type="button" onClick={goBack}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-sky-200 text-sky-700 font-semibold text-sm hover:bg-sky-50 transition-colors">
            <ChevronLeft size={16} />Back
          </button>
        ) : <div />}

        {step < 5 ? (
          <button type="button" onClick={goNext}
            className="flex items-center gap-2 px-6 py-3 bg-sky-700 text-white font-bold text-sm rounded-xl hover:bg-sky-800 transition-colors shadow-sm shadow-sky-200">
            Continue<ChevronRight size={16} />
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={submitting}
            className="flex items-center gap-2 px-8 py-3 bg-sky-700 text-white font-bold text-sm rounded-xl hover:bg-sky-800 transition-colors shadow-md shadow-sky-200 disabled:opacity-60 disabled:cursor-not-allowed">
            {submitting ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting...</>
            ) : (
              <><CheckCircle size={16} />Submit Request</>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
