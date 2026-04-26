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

interface ParentInfo { name: string; email: string; phone: string }
interface ChildDraft { id: string; name: string; age: string; experience: string; notes: string }
interface SessionAssignment { window_id: number; date: string; start_time: string; duration: 30 | 45; assigned_children: string[] }
interface SavedClient { parent_name: string; parent_email: string; parent_phone: string; children: ChildDraft[]; timestamp: number }

const EXPERIENCE_OPTIONS = [
  { value: 'beginner',     label: 'Beginner',                 desc: 'New to water' },
  { value: 'some-comfort', label: 'Some comfort in water',    desc: 'Getting used to the pool' },
  { value: 'basic-skills', label: 'Can float / basic skills', desc: 'Learning to kick and float' },
  { value: 'independent',  label: 'Swims independently',      desc: 'Basic strokes learned' },
  { value: 'advanced',     label: 'Advanced swimmer',         desc: 'Strong technique, wants to improve' },
]

// Updated pricing
const LESSON_TYPE_OPTIONS = [
  { value: '30min',        label: '30-Minute Lesson', duration: 30 as const, pack: false, hint: 'Great for young beginners',    pvtSession: 50,  semiSession: 75,  pvtPack: 0,   semiPack: 0    },
  { value: '45min',        label: '45-Minute Lesson', duration: 45 as const, pack: false, hint: 'More depth and real progress', pvtSession: 75,  semiSession: 115, pvtPack: 0,   semiPack: 0    },
  { value: '10pack-30min', label: '10-Pack · 30 min', duration: 30 as const, pack: true,  hint: 'Best value, save $50',        pvtSession: 50,  semiSession: 75,  pvtPack: 450, semiPack: 650  },
  { value: '10pack-45min', label: '10-Pack · 45 min', duration: 45 as const, pack: true,  hint: 'Best value, save $50',        pvtSession: 75,  semiSession: 115, pvtPack: 700, semiPack: 1000 },
]

const STEPS = [{ num: 1, label: 'You' }, { num: 2, label: 'Children' }, { num: 3, label: 'Lesson' }, { num: 4, label: 'Schedule' }, { num: 5, label: 'Review' }]

function getLessonDuration(lt: string): 30 | 45 { return lt.includes('45') ? 45 : 30 }
function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 === 0 ? 12 : h % 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}
function formatSlotDate(d: string) {
  try { return format(new Date(d + 'T00:00:00'), 'EEE, MMM d, yyyy') } catch { return d }
}
function newChild(idx: number): ChildDraft {
  return { id: `c${idx}_${Date.now()}`, name: '', age: '', experience: '', notes: '' }
}
function calcPrice(sessions: ComputedSlot[], lessonType: string, lessonFormat: 'private' | 'semi-private'): number {
  const lt = LESSON_TYPE_OPTIONS.find(t => t.value === lessonType)
  if (!lt) return 0
  if (lt.pack) return lessonFormat === 'semi-private' ? lt.semiPack : lt.pvtPack
  return sessions.reduce((sum, s) => {
    const base = lessonFormat === 'semi-private' ? (s.duration === 45 ? 115 : 75) : (s.duration === 45 ? 75 : 50)
    return sum + base
  }, 0)
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5"><AlertCircle size={11} />{msg}</p>
}

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center mb-8 px-2">
      {STEPS.map(({ num, label }, i) => {
        const done = num < current; const active = num === current
        return (
          <div key={num} className="flex items-center">
            <div className="flex flex-col items-center gap-1 w-14">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all" style={{
                background: done || active ? '#0D1F3C' : 'rgba(13,31,60,0.07)',
                color: done || active ? '#F8F4ED' : 'rgba(13,31,60,0.35)',
                boxShadow: active ? '0 0 0 4px rgba(74,127,165,0.18)' : 'none',
              }}>
                {done ? <Check size={13} /> : num}
              </div>
              <span className="text-[10px] font-semibold tracking-wide text-center" style={{
                color: active ? '#0D1F3C' : done ? '#4A7FA5' : 'rgba(13,31,60,0.35)',
              }}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-6 sm:w-10 h-0.5 mb-4 mx-0.5 transition-colors" style={{ background: done ? '#4A7FA5' : 'rgba(13,31,60,0.10)' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

const inp = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4A7FA5]/20 focus:border-[#4A7FA5] text-sm bg-white text-slate-800 placeholder-slate-400 transition-colors'
const inpErr = 'w-full px-4 py-2.5 rounded-xl border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 text-sm bg-white text-slate-800 placeholder-slate-400'
const card: React.CSSProperties = { background: 'white', borderRadius: '20px', border: '1.5px solid rgba(13,31,60,0.07)', padding: '1.75rem' }
const label11: React.CSSProperties = { fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: 'rgba(13,31,60,0.42)', display: 'block', marginBottom: '6px' }

export default function BookingForm() {
  const [step, setStep] = useState(1)
  const [parent, setParentState] = useState<ParentInfo>({ name: '', email: '', phone: '' })
  const [savedClient, setSavedClient] = useState<SavedClient | null>(null)
  const [quickFilled, setQuickFilled] = useState(false)
  const [children, setChildren] = useState<ChildDraft[]>([newChild(0)])
  const [bookingType, setBookingType] = useState<'one-time' | 'weekly' | '10pack'>('one-time')
  const [existingTenPacks, setExistingTenPacks] = useState<Array<{ id: number; lesson_type: string; lesson_format: string; sessions_used: number; total_sessions: number }>>([])
  const [selectedTenPackId, setSelectedTenPackId] = useState<number | null>(null)
  const [lessonType, setLessonTypeState] = useState('30min')
  const [lessonFormat, setLessonFormat] = useState<'private' | 'semi-private'>('private')
  const [semiPairName, setSemiPairName] = useState('')
  const [weeklyDays, setWeeklyDays] = useState<string[]>([])
  const [weeklyTime, setWeeklyTime] = useState('15:00')
  const [weeklyStart, setWeeklyStart] = useState('')
  const [weeklyDurType, setWeeklyDurType] = useState<'weeks' | 'end_date'>('weeks')
  const [weeklyWeeks, setWeeklyWeeks] = useState('')
  const [weeklyEndDate, setWeeklyEndDate] = useState('')
  const [weeklyFreq, setWeeklyFreq] = useState<'weekly' | 'biweekly'>('weekly')
  const [sessions, setSessions] = useState<ComputedSlot[]>([])
  const [assignments, setAssignments] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('swimshirel_client')
      if (raw) {
        const data: SavedClient = JSON.parse(raw)
        if (Date.now() - data.timestamp < 365 * 24 * 60 * 60 * 1000) setSavedClient(data)
      }
    } catch {}
  }, [])

  const duration = getLessonDuration(lessonType)
  const isPack = lessonType.startsWith('10pack')
  const isWeekly = bookingType === 'weekly'
  const validChildren = children.filter(c => c.name.trim())
  const needsAssignment = lessonFormat === 'private' && validChildren.length > 1 && !isWeekly

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
    setLessonTypeState(lt); setSessions([]); setAssignments({})
    if (lt.startsWith('10pack') && bookingType !== '10pack') setBookingType('10pack')
    else if (!lt.startsWith('10pack') && bookingType === '10pack') setBookingType('one-time')
  }
  const onBookingTypeChange = (bt: 'one-time' | 'weekly' | '10pack') => {
    setBookingType(bt)
    if (bt === '10pack' && !lessonType.startsWith('10pack')) setLessonTypeState('10pack-30min')
    if (bt !== '10pack' && lessonType.startsWith('10pack')) setLessonTypeState('30min')
    setSessions([]); setAssignments({})
  }
  const addChild = () => setChildren(prev => [...prev, newChild(prev.length)])
  const removeChild = (id: string) => { if (children.length <= 1) return; setChildren(prev => prev.filter(c => c.id !== id)) }
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
      if (weeklyDays.length === 0) errs.weekly_day = 'Please select at least one preferred day'
      if (!weeklyStart) errs.weekly_start = 'Start date is required'
      if (weeklyDurType === 'weeks' && !weeklyWeeks) errs.weekly_duration = 'Number of weeks is required'
      if (weeklyDurType === 'end_date' && !weeklyEndDate) errs.weekly_duration = 'End date is required'
    }
    if (s === 4 && !isWeekly) {
      if (sessions.length === 0) errs.sessions = 'Please select at least one session'
      else if (!isPack && lessonFormat === 'private' && sessions.length < validChildren.length) {
        errs.sessions = `Select ${validChildren.length} sessions, one per child (${sessions.length}/${validChildren.length} selected)`
      }
    }
    if (s === 5 && needsAssignment) {
      sessions.forEach(slot => { if (!assignments[slot.id]) errs[`assign_${slot.id}`] = 'Assign a child to this session' })
      const assignedChildIds = new Set(Object.values(assignments))
      validChildren.forEach(c => { if (!assignedChildIds.has(c.id)) errs.assignments_general = 'Every child must be assigned to at least one session' })
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const goNext = () => { if (!validateStep(step)) return; setStep(s => Math.min(s + 1, 5)); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const goBack = () => { setErrors({}); setStep(s => Math.max(s - 1, 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const buildAssignments = (): SessionAssignment[] => sessions.map(slot => {
    let assigned: string[]
    if (lessonFormat === 'semi-private') assigned = validChildren.map(c => c.name)
    else if (validChildren.length === 1) assigned = [validChildren[0].name]
    else { const child = validChildren.find(c => c.id === assignments[slot.id]); assigned = child ? [child.name] : [] }
    return { window_id: slot.window_id, date: slot.date, start_time: slot.start_time, duration: slot.duration, assigned_children: assigned }
  })

  const handleSubmit = async () => {
    if (!validateStep(5)) return
    setSubmitting(true)
    try {
      const payload = {
        parent_name: parent.name.trim(), parent_email: parent.email.trim(), parent_phone: parent.phone.trim(),
        lesson_format: lessonFormat, lesson_type: lessonType, booking_type: bookingType, pack_total: isPack ? 10 : 0,
        children: validChildren.map(({ name, age, experience, notes: n }) => ({ name, age, experience, notes: n })),
        booked_slots: isWeekly ? [] : sessions.map(s => ({ window_id: s.window_id, date: s.date, start_time: s.start_time, duration: s.duration })),
        session_assignments: buildAssignments(), notes: notes.trim() || null, slot_ids: [],
        ten_pack_id: selectedTenPackId || undefined, is_weekly_request: isWeekly ? 1 : 0,
        recurring: isWeekly ? { days: weeklyDays, time: weeklyTime, start_date: weeklyStart, end_date: weeklyDurType === 'end_date' ? weeklyEndDate : '', weeks: weeklyDurType === 'weeks' ? weeklyWeeks : '', frequency: weeklyFreq } : undefined,
      }
      const res = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) { setErrors({ submit: data.error || 'Failed to submit. Please try again.' }); return }
      try {
        localStorage.setItem('swimshirel_client', JSON.stringify({
          parent_name: parent.name.trim(), parent_email: parent.email.trim(), parent_phone: parent.phone.trim(),
          children: validChildren.map(({ name, age, experience, notes: n }) => ({ id: 'c0', name, age, experience, notes: n })),
          timestamp: Date.now(),
        }))
      } catch {}
      setSuccess(true); window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch { setErrors({ submit: 'An unexpected error occurred. Please try again.' }) }
    finally { setSubmitting(false) }
  }

  const timeOptions: string[] = []
  for (let h = 7; h <= 21; h++) { timeOptions.push(`${String(h).padStart(2, '0')}:00`); timeOptions.push(`${String(h).padStart(2, '0')}:30`) }

  // ── Success state ────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div style={{ ...card, textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(74,127,165,0.08)', border: '2px solid rgba(74,127,165,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <CheckCircle size={30} style={{ color: '#4A7FA5' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: '26px', fontWeight: 800, color: '#0D1F3C', marginBottom: '0.5rem' }}>Request Received!</h2>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '14px', color: 'rgba(13,31,60,0.50)', marginBottom: '1.5rem' }}>
            Thank you, <strong style={{ color: '#0D1F3C' }}>{parent.name}</strong>!
          </p>
          <div style={{ background: '#FFFBEB', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '1rem', textAlign: 'left' }}>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 700, color: '#92400E', marginBottom: '3px' }}>⏳ Not confirmed yet</p>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: '#92400E' }}>Your lesson times are not confirmed until you hear directly from Shirel. She&apos;ll follow up within 24 hours.</p>
          </div>
          <div style={{ background: 'rgba(74,127,165,0.05)', border: '1px solid rgba(74,127,165,0.12)', borderRadius: '14px', padding: '1.125rem 1.25rem', textAlign: 'left', marginBottom: '1.5rem' }}>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'rgba(13,31,60,0.65)', marginBottom: '4px' }}>✓ A confirmation will be sent to <strong>{parent.email}</strong></p>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'rgba(13,31,60,0.65)' }}>✓ Payment due within 2 hours of lesson, cash or e-transfer</p>
          </div>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'rgba(13,31,60,0.38)', marginBottom: '1.5rem' }}>
            Questions?{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#4A7FA5' }}>{CONTACT_EMAIL}</a>
            {' · '}
            <a href={`tel:${CONTACT_PHONE_TEL}`} style={{ color: '#4A7FA5' }}>{CONTACT_PHONE}</a>
          </p>
          <button onClick={() => { setStep(1); setParentState({ name: '', email: '', phone: '' }); setChildren([newChild(0)]); setBookingType('one-time'); setLessonTypeState('30min'); setLessonFormat('private'); setSessions([]); setAssignments({}); setNotes(''); setErrors({}); setSuccess(false); setQuickFilled(false) }}
            className="btn-primary" style={{ fontSize: '14px', padding: '0.75rem 1.5rem' }}>
            Book Another Lesson
          </button>
        </div>
      </div>
    )
  }

  // ── Main render ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto">
      <StepBar current={step} />

      {/* STEP 1 */}
      {step === 1 && (
        <div style={card}>
          <h2 style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: '22px', fontWeight: 800, color: '#0D1F3C', marginBottom: '4px' }}>Your Information</h2>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'rgba(13,31,60,0.42)', marginBottom: '1.5rem' }}>We&apos;ll use this to confirm your booking.</p>

          {savedClient && !quickFilled && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(74,127,165,0.06)', border: '1px solid rgba(74,127,165,0.18)', borderRadius: '14px', padding: '0.875rem 1rem', marginBottom: '1.25rem' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 700, color: '#0D1F3C', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={13} style={{ color: '#4A7FA5' }} /> Welcome back, {savedClient.parent_name.split(' ')[0]}!
                </p>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: '#4A7FA5', marginTop: '2px' }}>Fill in your details automatically?</p>
              </div>
              <button type="button" onClick={quickFill} style={{ padding: '0.375rem 0.875rem', background: '#0D1F3C', color: '#F8F4ED', fontSize: '12px', fontFamily: 'var(--font-dm-sans)', fontWeight: 700, borderRadius: '10px', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                Quick fill
              </button>
            </div>
          )}
          {quickFilled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#4A7FA5', fontFamily: 'var(--font-dm-sans)', background: 'rgba(74,127,165,0.06)', border: '1px solid rgba(74,127,165,0.15)', borderRadius: '10px', padding: '0.5rem 0.875rem', marginBottom: '1.25rem' }}>
              <Check size={13} /> Pre-filled from your last booking. Review and update if needed.
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label style={label11}>Full Name <span style={{ color: '#EF4444' }}>*</span></label>
              <div className="relative">
                <User size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#4A7FA5' }} />
                <input type="text" value={parent.name} onChange={e => setParent('name', e.target.value)} placeholder="Your full name" className={`${errors.parent_name ? inpErr : inp} pl-10`} />
              </div>
              <FieldError msg={errors.parent_name} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label style={label11}>Email <span style={{ color: '#EF4444' }}>*</span></label>
                <div className="relative">
                  <Mail size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#4A7FA5' }} />
                  <input type="email" value={parent.email} onChange={e => setParent('email', e.target.value)} placeholder="you@example.com" className={`${errors.parent_email ? inpErr : inp} pl-10`} />
                </div>
                <FieldError msg={errors.parent_email} />
              </div>
              <div>
                <label style={label11}>Phone <span style={{ color: '#EF4444' }}>*</span></label>
                <div className="relative">
                  <Phone size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#4A7FA5' }} />
                  <input type="tel" value={parent.phone} onChange={e => setParent('phone', e.target.value)} placeholder="(514) 000-0000" className={`${errors.parent_phone ? inpErr : inp} pl-10`} />
                </div>
                <FieldError msg={errors.parent_phone} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div style={card}>
          <h2 style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: '22px', fontWeight: 800, color: '#0D1F3C', marginBottom: '4px' }}>Children</h2>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'rgba(13,31,60,0.42)', marginBottom: '1.5rem' }}>Add each child who will be swimming.</p>

          {errors.children_general && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <AlertCircle size={14} />{errors.children_general}
            </div>
          )}

          <div className="space-y-4">
            {children.map((child, idx) => (
              <div key={child.id} style={{ background: 'rgba(74,127,165,0.04)', border: '1px solid rgba(74,127,165,0.14)', borderLeft: '4px solid #4A7FA5', borderRadius: '16px', padding: '1rem' }}>
                <div className="flex items-center justify-between mb-3">
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700, color: '#4A7FA5', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Child {idx + 1}</p>
                  {children.length > 1 && (
                    <button type="button" onClick={() => removeChild(child.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"><X size={14} /></button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Name <span className="text-red-400">*</span></label>
                    <input type="text" value={child.name} onChange={e => updateChild(child.id, 'name', e.target.value)} placeholder="Child's name" className={errors[`child_${child.id}_name`] ? inpErr : inp} />
                    <FieldError msg={errors[`child_${child.id}_name`]} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Age <span className="text-red-400">*</span></label>
                    <input type="text" value={child.age} onChange={e => updateChild(child.id, 'age', e.target.value)} placeholder="e.g. 7" className={errors[`child_${child.id}_age`] ? inpErr : inp} />
                    <FieldError msg={errors[`child_${child.id}_age`]} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Swimming Experience <span className="text-red-400">*</span></label>
                  <div className="space-y-1.5">
                    {EXPERIENCE_OPTIONS.map(opt => (
                      <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', borderRadius: '12px', padding: '0.625rem 0.875rem', border: child.experience === opt.value ? '1.5px solid #4A7FA5' : '1.5px solid rgba(13,31,60,0.10)', background: child.experience === opt.value ? 'rgba(74,127,165,0.05)' : 'white', transition: 'all 150ms' }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, border: child.experience === opt.value ? '2px solid #4A7FA5' : '2px solid rgba(13,31,60,0.20)', background: child.experience === opt.value ? '#4A7FA5' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {child.experience === opt.value && <div style={{ width: 6, height: 6, background: 'white', borderRadius: '50%' }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 600, color: '#0D1F3C', lineHeight: 1.3 }}>{opt.label}</p>
                          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: 'rgba(13,31,60,0.40)', marginTop: '1px' }}>{opt.desc}</p>
                        </div>
                        <input type="radio" name={`exp_${child.id}`} value={opt.value} checked={child.experience === opt.value} onChange={() => updateChild(child.id, 'experience', opt.value)} className="sr-only" />
                      </label>
                    ))}
                  </div>
                  <FieldError msg={errors[`child_${child.id}_experience`]} />
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Notes <span className="text-slate-300 font-normal">(optional)</span></label>
                  <textarea value={child.notes} onChange={e => updateChild(child.id, 'notes', e.target.value)} placeholder="e.g. afraid of water, wants to learn freestyle..." rows={2} className={`${inp} resize-none`} />
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={addChild} style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontFamily: 'var(--font-dm-sans)', fontWeight: 700, color: '#4A7FA5', background: 'none', border: 'none', cursor: 'pointer' }}>
            <Plus size={16} /> Add another child
          </button>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="space-y-5">
          {/* Booking type */}
          <div style={card}>
            <h2 style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: '22px', fontWeight: 800, color: '#0D1F3C', marginBottom: '1.25rem' }}>How would you like to book?</h2>
            <div className="space-y-3">
              {([
                { value: 'one-time' as const, label: 'One-time lesson',          desc: 'Book a specific date and time',               icon: <Check size={15} /> },
                { value: 'weekly' as const,   label: 'Weekly recurring request', desc: 'Request a regular weekly slot, Sun to Fri',     icon: <Repeat size={15} /> },
                { value: '10pack' as const,   label: 'Using a 10-pack',          desc: 'Already purchased. Book your next session(s).', icon: <Package size={15} /> },
              ] as const).map(opt => {
                const sel = bookingType === opt.value
                return (
                  <button key={opt.value} type="button" onClick={() => onBookingTypeChange(opt.value)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '16px', padding: '1rem', border: sel ? '2px solid #0D1F3C' : '2px solid rgba(13,31,60,0.10)', background: sel ? 'rgba(13,31,60,0.03)' : 'white', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 150ms' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '12px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: sel ? '#0D1F3C' : 'rgba(13,31,60,0.06)', color: sel ? '#F8F4ED' : 'rgba(13,31,60,0.35)' }}>{opt.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '14px', fontWeight: 700, color: '#0D1F3C' }}>{opt.label}</p>
                      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'rgba(13,31,60,0.40)', marginTop: '2px' }}>{opt.desc}</p>
                    </div>
                    {sel && <div style={{ width: 20, height: 20, background: '#0D1F3C', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Check size={11} style={{ color: '#F8F4ED' }} /></div>}
                  </button>
                )
              })}
            </div>
          </div>

          {bookingType === '10pack' && existingTenPacks.length > 0 && (
            <div style={{ background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '16px', padding: '1rem' }}>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 700, color: '#581C87', marginBottom: '0.75rem' }}>Existing 10-Pack Found</p>
              {existingTenPacks.map(pack => (
                <label key={pack.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '0.5rem', border: selectedTenPackId === pack.id ? '1.5px solid #7C3AED' : '1.5px solid #E9D5FF', background: selectedTenPackId === pack.id ? '#F3E8FF' : 'white', transition: 'all 150ms' }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 600, color: '#0D1F3C' }}>{pack.lesson_type} · {pack.lesson_format}</p>
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: 'rgba(13,31,60,0.45)', marginTop: '2px' }}>{pack.sessions_used} of {pack.total_sessions} sessions used · {pack.total_sessions - pack.sessions_used} remaining</p>
                  </div>
                  <input type="radio" name="ten_pack_select" checked={selectedTenPackId === pack.id} onChange={() => setSelectedTenPackId(pack.id)} style={{ accentColor: '#7C3AED' }} />
                </label>
              ))}
              <button type="button" onClick={() => setSelectedTenPackId(null)} style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: 'rgba(13,31,60,0.40)', background: 'none', border: 'none', cursor: 'pointer', marginTop: '4px' }}>
                + Use a new 10-pack instead
              </button>
            </div>
          )}

          {/* Lesson duration */}
          <div style={card}>
            <h2 style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: '22px', fontWeight: 800, color: '#0D1F3C', marginBottom: '4px' }}>Lesson Duration</h2>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'rgba(13,31,60,0.42)', marginBottom: '1.25rem' }}>This determines which times are available.</p>
            <div className="grid grid-cols-2 gap-3">
              {LESSON_TYPE_OPTIONS.filter(lt => bookingType === '10pack' ? lt.pack : !lt.pack).map(lt => {
                const selected = lessonType === lt.value
                const price = lessonFormat === 'semi-private' ? (lt.pack ? `$${lt.semiPack} total` : `$${lt.semiSession}/session`) : (lt.pack ? `$${lt.pvtPack} total` : `$${lt.pvtSession}/session`)
                return (
                  <button key={lt.value} type="button" onClick={() => setLessonType(lt.value)} style={{ borderRadius: '16px', padding: '1rem', cursor: 'pointer', textAlign: 'left', position: 'relative', border: selected ? '2px solid #0D1F3C' : '2px solid rgba(13,31,60,0.10)', background: selected ? 'rgba(13,31,60,0.03)' : 'white', transition: 'all 150ms' }}>
                    {selected && <span style={{ position: 'absolute', top: 10, right: 10, width: 20, height: 20, background: '#0D1F3C', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={11} style={{ color: '#F8F4ED' }} /></span>}
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 700, color: '#0D1F3C', marginBottom: '4px', paddingRight: '1.5rem' }}>{lt.label}</p>
                    <p style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: '18px', fontWeight: 800, color: selected ? '#0D1F3C' : '#4A7FA5', marginBottom: '4px' }}>{price}</p>
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: 'rgba(13,31,60,0.38)' }}>{lt.hint}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Lesson format */}
          <div style={card}>
            <h2 style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: '22px', fontWeight: 800, color: '#0D1F3C', marginBottom: '1.25rem' }}>Lesson Format</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {([
                { value: 'private' as const,      label: 'Private',      tagline: 'One-on-one with Shirel',    desc: 'Maximum focus, personalised instruction',  icon: <User size={17} /> },
                { value: 'semi-private' as const, label: 'Semi-Private', tagline: 'Shared with one other child', desc: 'Own rate · Exactly 2 children required', icon: <Users size={17} /> },
              ] as const).map(lf => {
                const sel = lessonFormat === lf.value
                return (
                  <button key={lf.value} type="button" onClick={() => setLessonFormat(lf.value)} style={{ borderRadius: '16px', padding: '1rem', cursor: 'pointer', textAlign: 'left', position: 'relative', border: sel ? '2px solid #0D1F3C' : '2px solid rgba(13,31,60,0.10)', background: sel ? 'rgba(13,31,60,0.03)' : 'white', transition: 'all 150ms' }}>
                    {sel && <span style={{ position: 'absolute', top: 12, right: 12, width: 20, height: 20, background: '#0D1F3C', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={11} style={{ color: '#F8F4ED' }} /></span>}
                    <div style={{ width: 36, height: 36, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem', background: sel ? 'rgba(74,127,165,0.12)' : 'rgba(13,31,60,0.05)', color: sel ? '#4A7FA5' : 'rgba(13,31,60,0.35)' }}>{lf.icon}</div>
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '14px', fontWeight: 700, color: '#0D1F3C' }}>{lf.label}</p>
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 500, color: sel ? '#4A7FA5' : 'rgba(13,31,60,0.50)', marginTop: '2px' }}>{lf.tagline}</p>
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: 'rgba(13,31,60,0.38)', marginTop: '3px' }}>{lf.desc}</p>
                  </button>
                )
              })}
            </div>
            {lessonFormat === 'semi-private' && (
              <div style={{ marginTop: '0.875rem' }} className="space-y-2">
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: '#4A7FA5', background: 'rgba(74,127,165,0.06)', border: '1px solid rgba(74,127,165,0.15)', borderRadius: '12px', padding: '0.625rem 0.875rem' }}>
                  Semi-private pricing: $75/session (30 min) · $115/session (45 min). Requires exactly 2 children.
                </p>
                <div>
                  <label style={{ ...label11, marginBottom: '6px' }}>Pairing with another child? <span style={{ color: 'rgba(13,31,60,0.28)', fontWeight: 400, letterSpacing: 'normal', textTransform: 'none' }}>(optional)</span></label>
                  <input type="text" value={semiPairName} onChange={e => setSemiPairName(e.target.value)} placeholder="Name of the other child, if known" className={inp} />
                </div>
              </div>
            )}
          </div>

          {/* Weekly details */}
          {isWeekly && (
            <div style={card}>
              <h2 style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: '22px', fontWeight: 800, color: '#0D1F3C', marginBottom: '0.625rem' }}>Weekly Request Details</h2>
              <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: '#92400E', background: '#FFFBEB', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '12px', padding: '0.625rem 0.875rem', marginBottom: '1.25rem' }}>
                This is a request only, not automatically confirmed. Shirel will follow up within 24 hours.
              </div>
              <div className="space-y-4">
                <div>
                  <label style={label11}>Preferred Day(s)</label>
                  <div className="flex flex-wrap gap-2">
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                      const sel = weeklyDays.includes(day)
                      return (
                        <button key={day} type="button" onClick={() => setWeeklyDays(prev => sel ? prev.filter(d => d !== day) : [...prev, day])} style={{ padding: '0.375rem 0.875rem', borderRadius: '9999px', fontSize: '13px', fontFamily: 'var(--font-dm-sans)', fontWeight: 700, border: '2px solid #0D1F3C', background: sel ? '#0D1F3C' : 'white', color: sel ? '#F8F4ED' : '#0D1F3C', cursor: 'pointer', transition: 'all 150ms' }}>{day}</button>
                      )
                    })}
                  </div>
                  {errors.weekly_day && <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: '#EF4444', marginTop: '6px' }}>{errors.weekly_day}</p>}
                </div>
                <div>
                  <label style={label11}>Preferred Time</label>
                  <select value={weeklyTime} onChange={e => setWeeklyTime(e.target.value)} className={inp}>
                    {timeOptions.map(t => <option key={t} value={t}>{formatTime(t)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={label11}>Start Date <span style={{ color: '#EF4444' }}>*</span></label>
                  <input type="date" value={weeklyStart} onChange={e => setWeeklyStart(e.target.value)} min={new Date().toISOString().split('T')[0]} className={errors.weekly_start ? inpErr : inp} />
                  <FieldError msg={errors.weekly_start} />
                </div>
                <div>
                  <label style={label11}>Frequency</label>
                  <div className="flex gap-4">
                    {[{ v: 'weekly', l: 'Every week' }, { v: 'biweekly', l: 'Every 2 weeks' }].map(f => (
                      <label key={f.v} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: '#0D1F3C' }}>
                        <input type="radio" checked={weeklyFreq === f.v} onChange={() => setWeeklyFreq(f.v as 'weekly' | 'biweekly')} style={{ accentColor: '#0D1F3C' }} />{f.l}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={label11}>Duration</label>
                  <div className="flex gap-4 mb-3">
                    {[{ v: 'weeks', l: 'Number of weeks' }, { v: 'end_date', l: 'End date' }].map(opt => (
                      <label key={opt.v} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: '#0D1F3C' }}>
                        <input type="radio" checked={weeklyDurType === opt.v} onChange={() => setWeeklyDurType(opt.v as 'weeks' | 'end_date')} style={{ accentColor: '#0D1F3C' }} />{opt.l}
                      </label>
                    ))}
                  </div>
                  {weeklyDurType === 'weeks' ? (
                    <input type="number" min={2} max={52} value={weeklyWeeks} onChange={e => setWeeklyWeeks(e.target.value)} placeholder="e.g. 8" className={errors.weekly_duration ? inpErr : inp} />
                  ) : (
                    <input type="date" value={weeklyEndDate} onChange={e => setWeeklyEndDate(e.target.value)} min={weeklyStart || new Date().toISOString().split('T')[0]} className={errors.weekly_duration ? inpErr : inp} />
                  )}
                  <FieldError msg={errors.weekly_duration} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <div style={card}>
          <h2 style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: '22px', fontWeight: 800, color: '#0D1F3C', marginBottom: '4px' }}>
            {isWeekly ? 'Your Weekly Request' : 'Select Your Sessions'}
          </h2>
          {!isWeekly && (
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'rgba(13,31,60,0.42)', marginBottom: '1rem' }}>
              {lessonFormat === 'private' && validChildren.length > 1 ? `Select ${validChildren.length} sessions, one per child.` : 'Pick a date, then choose a start time from the dropdown.'}
            </p>
          )}
          {isPack && !isWeekly && (
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: '#4A7FA5', background: 'rgba(74,127,165,0.06)', border: '1px solid rgba(74,127,165,0.15)', borderRadius: '10px', padding: '0.5rem 0.75rem', marginBottom: '1rem' }}>
              You don&apos;t need to schedule all 10 sessions now. Book 1 or 2 to get started.
            </p>
          )}
          {isWeekly ? (
            <div style={{ background: 'rgba(74,127,165,0.05)', border: '1px solid rgba(74,127,165,0.12)', borderRadius: '14px', padding: '1rem' }} className="space-y-2 text-sm">
              <div className="flex justify-between"><span style={{ color: 'rgba(13,31,60,0.45)', fontFamily: 'var(--font-dm-sans)' }}>Day(s)</span><span style={{ fontWeight: 600, color: '#0D1F3C', fontFamily: 'var(--font-dm-sans)' }}>{weeklyDays.join(', ') || '—'}</span></div>
              <div className="flex justify-between"><span style={{ color: 'rgba(13,31,60,0.45)', fontFamily: 'var(--font-dm-sans)' }}>Time</span><span style={{ fontWeight: 600, color: '#0D1F3C', fontFamily: 'var(--font-dm-sans)' }}>{formatTime(weeklyTime)}</span></div>
              {weeklyStart && <div className="flex justify-between"><span style={{ color: 'rgba(13,31,60,0.45)', fontFamily: 'var(--font-dm-sans)' }}>Starting</span><span style={{ fontWeight: 600, color: '#0D1F3C', fontFamily: 'var(--font-dm-sans)' }}>{weeklyStart}</span></div>}
              <div className="flex justify-between"><span style={{ color: 'rgba(13,31,60,0.45)', fontFamily: 'var(--font-dm-sans)' }}>Frequency</span><span style={{ fontWeight: 600, color: '#0D1F3C', fontFamily: 'var(--font-dm-sans)' }}>{weeklyFreq === 'biweekly' ? 'Every 2 weeks' : 'Weekly'}</span></div>
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

      {/* STEP 5 */}
      {step === 5 && (
        <div className="space-y-5">
          {needsAssignment && sessions.length > 0 && (
            <div style={card}>
              <h2 style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: '22px', fontWeight: 800, color: '#0D1F3C', marginBottom: '4px' }}>Assign Children to Sessions</h2>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'rgba(13,31,60,0.42)', marginBottom: '1.25rem' }}>Each child needs their own lesson slot.</p>
              {errors.assignments_general && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                  <AlertCircle size={14} />{errors.assignments_general}
                </div>
              )}
              <div className="space-y-3">
                {sessions.map(slot => {
                  const assignedId = assignments[slot.id]; const assignedChild = validChildren.find(c => c.id === assignedId)
                  return (
                    <div key={slot.id} style={{ borderRadius: '16px', padding: '1rem', border: assignedId ? '1.5px solid rgba(74,127,165,0.30)' : '1.5px solid rgba(245,158,11,0.30)', background: assignedId ? 'rgba(74,127,165,0.04)' : 'rgba(245,158,11,0.04)', transition: 'all 150ms' }}>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '14px', fontWeight: 600, color: '#0D1F3C' }}>{formatSlotDate(slot.date)}</p>
                          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'rgba(13,31,60,0.45)', marginTop: '2px' }}>{formatTime(slot.start_time)} · {slot.duration} min</p>
                        </div>
                        {assignedChild && <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px', background: '#0D1F3C', color: '#F8F4ED', flexShrink: 0 }}>{assignedChild.name}</span>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {validChildren.map(child => {
                          const isMe = assignedId === child.id; const usedElsewhere = !isMe && !isPack && Object.values(assignments).includes(child.id)
                          return (
                            <button key={child.id} type="button" onClick={() => assignSession(slot.id, child.id)} disabled={usedElsewhere} style={{ padding: '0.375rem 0.875rem', borderRadius: '12px', fontSize: '12px', fontFamily: 'var(--font-dm-sans)', fontWeight: 700, cursor: usedElsewhere ? 'not-allowed' : 'pointer', border: isMe ? '1.5px solid #0D1F3C' : usedElsewhere ? '1.5px solid rgba(13,31,60,0.08)' : '1.5px solid rgba(13,31,60,0.14)', background: isMe ? '#0D1F3C' : usedElsewhere ? 'rgba(13,31,60,0.03)' : 'white', color: isMe ? '#F8F4ED' : usedElsewhere ? 'rgba(13,31,60,0.20)' : '#0D1F3C', transition: 'all 150ms' }}>{child.name}</button>
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

          <div style={card}>
            <h2 style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: '22px', fontWeight: 800, color: '#0D1F3C', marginBottom: '4px' }}>Review Your Request</h2>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'rgba(13,31,60,0.42)', marginBottom: '1.5rem' }}>Check everything before submitting.</p>

            <div className="space-y-4">
              <div style={{ background: 'rgba(13,31,60,0.03)', borderRadius: '14px', padding: '1rem' }}>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(13,31,60,0.38)', marginBottom: '0.5rem' }}>Parent / Guardian</p>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '14px', fontWeight: 700, color: '#0D1F3C' }}>{parent.name}</p>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'rgba(13,31,60,0.50)', marginTop: '2px' }}>{parent.email} · {parent.phone}</p>
              </div>

              <div style={{ background: 'rgba(13,31,60,0.03)', borderRadius: '14px', padding: '1rem' }}>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(13,31,60,0.38)', marginBottom: '0.5rem' }}>Lesson</p>
                <div className="flex flex-wrap gap-2">
                  {[getLessonDuration(lessonType) === 45 ? '45-Minute Lesson' : '30-Minute Lesson', lessonFormat === 'semi-private' ? 'Semi-Private' : 'Private', bookingType === 'weekly' ? 'Weekly Request' : bookingType === '10pack' ? '10-Pack' : 'One-time'].map(tag => (
                    <span key={tag} style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '9999px', background: 'rgba(74,127,165,0.08)', color: '#4A7FA5', border: '1px solid rgba(74,127,165,0.15)' }}>{tag}</span>
                  ))}
                </div>
              </div>

              <div style={{ background: 'rgba(13,31,60,0.03)', borderRadius: '14px', padding: '1rem' }}>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(13,31,60,0.38)', marginBottom: '0.75rem' }}>
                  {validChildren.length === 1 ? 'Child' : `Children (${validChildren.length})`}
                </p>
                <div className="space-y-3">
                  {validChildren.map(child => {
                    const expLabel = EXPERIENCE_OPTIONS.find(e => e.value === child.experience)?.label || child.experience
                    const childSessions = !isWeekly ? sessions.filter(s => { if (lessonFormat === 'semi-private') return true; if (validChildren.length === 1) return true; return assignments[s.id] === child.id }) : []
                    return (
                      <div key={child.id} style={{ paddingBottom: '0.75rem', borderBottom: '1px solid rgba(13,31,60,0.07)' }} className="last:border-0 last:pb-0">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                          <div className="flex-1">
                            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '14px', fontWeight: 700, color: '#0D1F3C' }}>{child.name}</p>
                            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'rgba(13,31,60,0.45)', marginTop: '2px' }}>Age {child.age} · {expLabel}</p>
                            {child.notes && <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'rgba(13,31,60,0.38)', fontStyle: 'italic', marginTop: '2px' }}>{child.notes}</p>}
                          </div>
                          {!isWeekly && childSessions.length > 0 && (
                            <div className="flex flex-col gap-1">
                              {childSessions.map(s => (
                                <span key={s.id} style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 500, background: 'rgba(74,127,165,0.08)', color: '#4A7FA5', border: '1px solid rgba(74,127,165,0.15)', padding: '3px 10px', borderRadius: '9999px' }}>
                                  {formatSlotDate(s.date)} · {formatTime(s.start_time)}{lessonFormat === 'semi-private' ? ' (shared)' : ''}
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

              {isWeekly && (
                <div style={{ background: 'rgba(74,127,165,0.05)', border: '1px solid rgba(74,127,165,0.12)', borderRadius: '14px', padding: '1rem' }}>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(13,31,60,0.38)', marginBottom: '0.5rem' }}>Weekly Request</p>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '14px', fontWeight: 600, color: '#0D1F3C' }}>Preferred Days: {weeklyDays.join(', ')} at {formatTime(weeklyTime)}</p>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'rgba(13,31,60,0.45)', marginTop: '3px' }}>Starting {weeklyStart}{weeklyDurType === 'weeks' && weeklyWeeks && ` · ${weeklyWeeks} weeks`}{weeklyDurType === 'end_date' && weeklyEndDate && ` · until ${weeklyEndDate}`}{' '}· {weeklyFreq === 'biweekly' ? 'Every 2 weeks' : 'Weekly'}</p>
                </div>
              )}

              {!isWeekly && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0D1F3C', borderRadius: '16px', padding: '1rem 1.25rem' }}>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 700, color: '#F8F4ED' }}>{isPack ? 'Package price' : `${sessions.length} session${sessions.length !== 1 ? 's' : ''}`}</p>
                  <p style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: '26px', fontWeight: 900, color: '#F8F4ED' }}>${calcPrice(sessions, lessonType, lessonFormat)}</p>
                </div>
              )}

              <div>
                <label style={{ ...label11, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={11} /> Additional Notes <span style={{ color: 'rgba(13,31,60,0.28)', fontWeight: 400, letterSpacing: 'normal', textTransform: 'none' }}>(optional)</span>
                </label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything else Shirel should know..." rows={3} className={`${inp} resize-none`} />
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle size={14} />{errors.submit}
            </div>
          )}
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'rgba(13,31,60,0.38)', paddingLeft: '4px' }}>
            By submitting, you understand this is a <strong>request only</strong>. Sessions are not confirmed until Shirel responds.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center mt-6 gap-3">
        {step > 1 ? (
          <button type="button" onClick={goBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.25rem', borderRadius: '14px', fontFamily: 'var(--font-dm-sans)', fontSize: '14px', fontWeight: 700, color: '#4A7FA5', background: 'white', border: '1.5px solid rgba(74,127,165,0.30)', cursor: 'pointer', transition: 'all 150ms' }}>
            <ChevronLeft size={16} />Back
          </button>
        ) : <div />}

        {step < 5 ? (
          <button type="button" onClick={goNext} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.5rem', borderRadius: '14px', fontFamily: 'var(--font-dm-sans)', fontSize: '14px', fontWeight: 700, color: '#F8F4ED', background: '#0D1F3C', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px -4px rgba(13,31,60,0.30)', transition: 'all 150ms' }}>
            Continue<ChevronRight size={16} />
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.875rem 2rem', borderRadius: '14px', fontFamily: 'var(--font-dm-sans)', fontSize: '14px', fontWeight: 700, color: '#F8F4ED', background: '#0D1F3C', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.65 : 1, boxShadow: '0 6px 20px -4px rgba(13,31,60,0.35)', transition: 'all 150ms' }}>
            {submitting ? (
              <><div style={{ width: 16, height: 16, border: '2px solid rgba(248,244,237,0.3)', borderTopColor: '#F8F4ED', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Submitting…</>
            ) : (
              <><CheckCircle size={16} />Submit Request</>
            )}
          </button>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
