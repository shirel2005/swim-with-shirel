'use client'

import { useState } from 'react'
import AvailabilityCalendar from './AvailabilityCalendar'
import { ComputedSlot, BookingFormData, Child } from '@/lib/types'
import { format, parseISO } from 'date-fns'
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL } from '@/lib/contact'
import {
  Plus, X, CheckCircle, Check, User, Users, Mail, Phone, FileText, Calendar, RepeatIcon,
} from 'lucide-react'

const SKILL_LEVELS = [
  { value: '', label: 'Select skill level...' },
  { value: 'Complete Beginner', label: 'Complete Beginner' },
  { value: 'Some Experience', label: 'Some Experience' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
]

const LESSON_TYPES = [
  { value: '30min',        label: '30-Minute Lesson',  privatePrice: '$50/session',  semiPrice: '$100/session', desc: 'Great for beginners or short attention spans' },
  { value: '45min',        label: '45-Minute Lesson',  privatePrice: '$75/session',  semiPrice: '$150/session', desc: 'More time to develop technique and confidence' },
  { value: '10pack-30min', label: '10-Pack (30 min)',  privatePrice: '$450 total',   semiPrice: '$900 total',   desc: 'Best value for regular swimmers' },
  { value: '10pack-45min', label: '10-Pack (45 min)',  privatePrice: '$600 total',   semiPrice: '$1,200 total', desc: 'Ideal for committed learners' },
]

function getSlotPrice(duration: number, lessonFormat: 'private' | 'semi-private'): number {
  if (lessonFormat === 'semi-private') return duration === 30 ? 100 : 150
  return duration === 30 ? 50 : 75
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const TIME_OPTIONS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
]

function formatTimeLabel(time: string) {
  const [h, m] = time.split(':').map(Number)
  const ampm = h < 12 ? 'AM' : 'PM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

function formatSlotDate(dateStr: string) {
  try { return format(parseISO(dateStr), 'EEEE, MMMM d, yyyy') }
  catch { return dateStr }
}

const LESSON_FORMATS = [
  {
    value: 'private' as const,
    label: 'Private',
    icon: 'user',
    tagline: 'One-on-one with Shirel',
    desc: 'Maximum focus and personalised instruction',
  },
  {
    value: 'semi-private' as const,
    label: 'Semi-Private',
    icon: 'users',
    tagline: 'Shared with one other child',
    desc: 'Double the private rate · Exactly 2 children required',
  },
]

const defaultForm: BookingFormData = {
  parent_name: '',
  parent_email: '',
  parent_phone: '',
  children: [{ name: '', age: '', skill_level: '', notes: '' }],
  slot_ids: [],
  lesson_type: '30min',
  lesson_format: 'private',
  is_weekly_request: false,
  recurring: { day: 'Monday', time: '09:00', start_date: '', end_date: '', weeks: '', frequency: 'weekly' },
  notes: '',
}

type DurationType = 'weeks' | 'end_date'

interface StepHeadingProps { step: number; title: string; subtitle?: string }

function StepHeading({ step, title, subtitle }: StepHeadingProps) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-bold text-slate-900 flex items-center gap-3">
        <span className="w-7 h-7 bg-sky-700 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
          {step}
        </span>
        {title}
      </h2>
      {subtitle && <p className="text-sm text-slate-400 mt-1 ml-10">{subtitle}</p>}
    </div>
  )
}

export default function BookingForm() {
  const [form, setForm] = useState<BookingFormData>(defaultForm)
  const [selectedSlots, setSelectedSlots] = useState<ComputedSlot[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [durationType, setDurationType] = useState<DurationType>('weeks')

  const setField = <K extends keyof BookingFormData>(key: K, value: BookingFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => { const e = { ...prev }; delete e[key]; return e })
    // Clear selected slots when lesson type changes (duration may differ)
    if (key === 'lesson_type') setSelectedSlots([])
  }

  const setRecurring = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, recurring: { ...prev.recurring!, [key]: value } }))
    const errKey = `recurring_${key}`
    if (errors[errKey]) setErrors((prev) => { const e = { ...prev }; delete e[errKey]; return e })
  }

  const updateChild = (idx: number, key: keyof Child, value: string) => {
    const updated = form.children.map((c, i) => i === idx ? { ...c, [key]: value } : c)
    setField('children', updated)
    if (errors[`child_${idx}_name`]) setErrors((prev) => { const e = { ...prev }; delete e[`child_${idx}_name`]; return e })
  }

  const addChild = () => setField('children', [...form.children, { name: '', age: '', skill_level: '', notes: '' }])
  const removeChild = (idx: number) => { if (form.children.length <= 1) return; setField('children', form.children.filter((_, i) => i !== idx)) }

  const handleSlotsChange = (slots: ComputedSlot[]) => {
    setSelectedSlots(slots)
    setField('slot_ids', [])
    if (errors.sessions) setErrors((prev) => { const e = { ...prev }; delete e.sessions; return e })
  }

  const removeSlot = (slotId: string) => {
    const updated = selectedSlots.filter((s) => s.id !== slotId)
    setSelectedSlots(updated)
    setField('slot_ids', [])
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.parent_name.trim()) newErrors.parent_name = 'Name is required'
    if (!form.parent_email.trim() || !form.parent_email.includes('@')) newErrors.parent_email = 'Valid email is required'
    if (!form.parent_phone.trim()) newErrors.parent_phone = 'Phone number is required'

    let hasChildName = false
    form.children.forEach((child, idx) => {
      if (!child.name.trim()) newErrors[`child_${idx}_name`] = "Child's name is required"
      else hasChildName = true
    })
    if (!hasChildName) newErrors.children = 'At least one child name is required'

    if (form.lesson_format === 'semi-private' && form.children.length !== 2) {
      newErrors.lesson_format = 'Semi-Private lessons require exactly 2 children. Please add or remove a child.'
    }
    if (selectedSlots.length === 0 && !form.is_weekly_request) {
      newErrors.sessions = 'Please select at least one session or enable a weekly recurring request'
    }
    if (form.is_weekly_request) {
      if (!form.recurring?.day) newErrors.recurring_day = 'Preferred day is required'
      if (!form.recurring?.time) newErrors.recurring_time = 'Preferred time is required'
      if (!form.recurring?.start_date) newErrors.recurring_start_date = 'Start date is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        children: form.children.filter((c) => c.name.trim()),
        booked_slots: selectedSlots.map(s => ({
          window_id: s.window_id,
          date: s.date,
          start_time: s.start_time,
          duration: s.duration,
        })),
        slot_ids: [],  // kept for DB compatibility
        recurring: form.is_weekly_request ? {
          ...form.recurring,
          weeks: durationType === 'weeks' ? form.recurring?.weeks : '',
          end_date: durationType === 'end_date' ? form.recurring?.end_date : '',
        } : undefined,
      }
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) setErrors({ submit: data.error || 'Failed to submit. Please try again.' })
      else setSuccess(true)
    } catch {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => { setForm(defaultForm); setSelectedSlots([]); setErrors({}); setSuccess(false); setDurationType('weeks') }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-10 text-center">
          <div className="w-16 h-16 bg-sky-50 border-2 border-sky-200 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-sky-700" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Request Received!</h2>
          <p className="text-slate-500 mb-1">
            Thank you, <strong className="text-slate-800">{form.parent_name}</strong>! Your reservation request has been submitted.
          </p>

          <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5 text-left text-sm text-slate-600 mt-6 mb-8 space-y-2">
            <p className="font-bold text-slate-800 mb-3">What happens next:</p>
            <p>✓ Shirel will review your request within 24 hours</p>
            <p>✓ You&apos;ll receive a confirmation email at <strong>{form.parent_email}</strong></p>
            <p>✓ Sessions are not confirmed until Shirel responds</p>
            <p>✓ Lesson Format: <strong>{form.lesson_format === 'semi-private' ? 'Semi-Private' : 'Private'}</strong></p>
            {selectedSlots.length > 0 && (
              <p>✓ Estimated Total: <strong>${selectedSlots.reduce((sum, s) => sum + getSlotPrice(s.duration, form.lesson_format), 0)}</strong> ({selectedSlots.length} session{selectedSlots.length > 1 ? 's' : ''})</p>
            )}
            <p className="pt-3 border-t border-sky-100 text-slate-400">
              Payment is due within 2 hours of the lesson — cash or e-transfer.
            </p>
          </div>

          <p className="text-sm text-slate-400 mb-6">
            Questions? Email{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-sky-700 hover:underline">{CONTACT_EMAIL}</a>
            {' '}or call{' '}
            <a href={`tel:${CONTACT_PHONE_TEL}`} className="text-sky-700 hover:underline">{CONTACT_PHONE}</a>
          </p>

          <button onClick={resetForm} className="btn-secondary text-sm">
            Book Another Lesson
          </button>
        </div>
      </div>
    )
  }

  const inputClass = 'input-field'
  const inputErrorClass = 'input-error'
  const cardClass = 'card p-6'

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl mx-auto">

      {/* Section 1: Parent Information */}
      <div className={cardClass}>
        <StepHeading step={1} title="Parent / Guardian Information" subtitle="We'll use this to confirm your booking." />
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-slate-500 mb-1.5">
              Full Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400" />
              <input
                type="text"
                value={form.parent_name}
                onChange={(e) => setField('parent_name', e.target.value)}
                placeholder="Your full name"
                className={`${errors.parent_name ? inputErrorClass : inputClass} pl-10`}
              />
            </div>
            {errors.parent_name && <p className="text-red-500 text-xs mt-1">{errors.parent_name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-slate-500 mb-1.5">
                Email <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400" />
                <input
                  type="email"
                  value={form.parent_email}
                  onChange={(e) => setField('parent_email', e.target.value)}
                  placeholder="you@example.com"
                  className={`${errors.parent_email ? inputErrorClass : inputClass} pl-10`}
                />
              </div>
              {errors.parent_email && <p className="text-red-500 text-xs mt-1">{errors.parent_email}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-slate-500 mb-1.5">
                Phone <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400" />
                <input
                  type="tel"
                  value={form.parent_phone}
                  onChange={(e) => setField('parent_phone', e.target.value)}
                  placeholder="(514) 000-0000"
                  className={`${errors.parent_phone ? inputErrorClass : inputClass} pl-10`}
                />
              </div>
              {errors.parent_phone && <p className="text-red-500 text-xs mt-1">{errors.parent_phone}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Children */}
      <div className={cardClass}>
        <StepHeading step={2} title="Children Attending" subtitle="Add each child who will be swimming." />
        {errors.children && <p className="text-red-500 text-xs mb-3 -mt-2">{errors.children}</p>}
        <div className="space-y-4">
          {form.children.map((child, idx) => (
            <div key={idx} className="bg-sky-50/50 rounded-xl border-l-4 border-sky-400 border border-sky-100 p-4 relative">
              {form.children.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeChild(idx)}
                  className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
              <p className="text-xs font-bold text-sky-700 uppercase tracking-widest mb-3">Child {idx + 1}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Name <span className="text-red-400">*</span></label>
                  <input type="text" value={child.name} onChange={(e) => updateChild(idx, 'name', e.target.value)} placeholder="Child's name" className={errors[`child_${idx}_name`] ? inputErrorClass : inputClass} />
                  {errors[`child_${idx}_name`] && <p className="text-red-500 text-xs mt-1">{errors[`child_${idx}_name`]}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Age</label>
                  <input type="text" value={child.age} onChange={(e) => updateChild(idx, 'age', e.target.value)} placeholder="e.g. 6" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Skill Level</label>
                  <select value={child.skill_level} onChange={(e) => updateChild(idx, 'skill_level', e.target.value)} className={inputClass}>
                    {SKILL_LEVELS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Notes</label>
                  <textarea value={child.notes} onChange={(e) => updateChild(idx, 'notes', e.target.value)} placeholder="e.g. afraid of water, wants to learn freestyle" rows={2} className={`${inputClass} resize-none`} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addChild} className="mt-4 flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-sky-800 transition-colors">
          <Plus size={16} />
          Add Another Child
        </button>
      </div>

      {/* Section 3: Lesson Type */}
      <div className={cardClass}>
        <StepHeading step={3} title="Lesson Type" subtitle="Choose the duration that works best for your child." />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {LESSON_TYPES.map((lt) => {
            const selected = form.lesson_type === lt.value
            return (
              <button
                key={lt.value}
                type="button"
                onClick={() => setField('lesson_type', lt.value)}
                className={`rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 text-left relative ${
                  selected ? 'border-sky-700 bg-sky-50 shadow-sm' : 'border-sky-100 bg-white hover:border-sky-300 hover:bg-sky-50/50'
                }`}
              >
                {selected && (
                  <span className="absolute top-3 right-3 w-5 h-5 bg-sky-700 rounded-full flex items-center justify-center">
                    <Check size={11} className="text-white" />
                  </span>
                )}
                <p className={`font-bold text-sm mb-0.5 ${selected ? 'text-sky-900' : 'text-slate-800'}`}>{lt.label}</p>
                <p className={`text-base font-bold ${selected ? 'text-sky-700' : 'text-slate-600'}`}>
                  {form.lesson_format === 'semi-private' ? lt.semiPrice : lt.privatePrice}
                </p>
                <p className="text-xs text-slate-400 mt-1">{lt.desc}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Section 4: Lesson Format */}
      <div className={cardClass}>
        <StepHeading step={4} title="Lesson Format" subtitle="Private one-on-one or semi-private shared with one other child." />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {LESSON_FORMATS.map((lf) => {
            const selected = form.lesson_format === lf.value
            return (
              <button
                key={lf.value}
                type="button"
                onClick={() => setField('lesson_format', lf.value)}
                className={`rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 text-left relative ${
                  selected ? 'border-sky-700 bg-sky-50 shadow-sm' : 'border-sky-100 bg-white hover:border-sky-300 hover:bg-sky-50/50'
                }`}
              >
                {selected && (
                  <span className="absolute top-3 right-3 w-5 h-5 bg-sky-700 rounded-full flex items-center justify-center">
                    <Check size={11} className="text-white" />
                  </span>
                )}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${selected ? 'bg-sky-100' : 'bg-slate-50'}`}>
                  {lf.icon === 'user'
                    ? <User size={17} className={selected ? 'text-sky-700' : 'text-slate-400'} />
                    : <Users size={17} className={selected ? 'text-sky-700' : 'text-slate-400'} />
                  }
                </div>
                <p className={`font-bold text-sm mb-0.5 ${selected ? 'text-sky-900' : 'text-slate-800'}`}>{lf.label}</p>
                <p className={`text-sm font-medium ${selected ? 'text-sky-700' : 'text-slate-500'}`}>{lf.tagline}</p>
                <p className="text-xs text-slate-400 mt-1">{lf.desc}</p>
              </button>
            )
          })}
        </div>
        {form.lesson_format === 'semi-private' && (
          <p className="text-sm text-sky-700 bg-sky-50 border border-sky-100 rounded-xl px-4 py-2.5 mt-3">
            Semi-Private pricing: $100 / 30 min · $150 / 45 min. Requires exactly 2 children.
          </p>
        )}
        {errors.lesson_format && <p className="text-red-500 text-xs mt-2">{errors.lesson_format}</p>}
      </div>

      {/* Section 5: Session Selection */}
      <div className={cardClass}>
        <StepHeading step={5} title="Session Selection" subtitle="Select a date, then pick a start time from the dropdown." />
        <AvailabilityCalendar
          onSlotsChange={handleSlotsChange}
          duration={form.lesson_type.includes('45') ? 45 : 30}
        />

        <div className="mt-5">
          <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Calendar size={14} className="text-sky-600" />
            Selected Sessions
          </p>
          {selectedSlots.length === 0 ? (
            <div className="bg-sky-50/50 rounded-xl border border-sky-100 p-4 text-center">
              <p className="text-sm text-slate-400">No sessions selected yet. Click a date on the calendar above.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedSlots.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between bg-sky-50 rounded-xl px-4 py-2.5 border border-sky-100">
                  <div className="text-sm">
                    <span className="font-semibold text-slate-800">{formatSlotDate(slot.date)}</span>
                    <span className="text-slate-500 ml-2">at {slot.start_time}</span>
                    <span className="text-slate-400 ml-2 text-xs">({slot.duration} min)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-sky-700">${getSlotPrice(slot.duration, form.lesson_format)}</span>
                    <button type="button" onClick={() => removeSlot(slot.id)} className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex justify-end pt-1">
                <span className="text-sm font-bold text-slate-800">
                  Total: ${selectedSlots.reduce((sum, s) => sum + getSlotPrice(s.duration, form.lesson_format), 0)}
                </span>
              </div>
            </div>
          )}
        </div>
        {errors.sessions && <p className="text-red-500 text-xs mt-3">{errors.sessions}</p>}
      </div>

      {/* Section 6: Weekly Recurring */}
      <div className={cardClass}>
        <StepHeading step={6} title="Weekly Recurring Request" />
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <div className="relative mt-0.5">
            <input type="checkbox" checked={form.is_weekly_request} onChange={(e) => setField('is_weekly_request', e.target.checked)} className="sr-only" />
            <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${form.is_weekly_request ? 'bg-sky-700' : 'bg-slate-200'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${form.is_weekly_request ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <RepeatIcon size={13} className="text-sky-600" />
              Request a weekly recurring lesson
            </p>
            <p className="text-xs text-slate-400 mt-0.5">This is a request only — not a confirmed booking. Shirel will follow up.</p>
          </div>
        </label>

        {form.is_weekly_request && (
          <div className="mt-4 bg-sky-50 border border-sky-100 rounded-xl p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Preferred Day <span className="text-red-400">*</span></label>
                <select value={form.recurring?.day || 'Monday'} onChange={(e) => setRecurring('day', e.target.value)} className={errors.recurring_day ? inputErrorClass : inputClass}>
                  {DAYS_OF_WEEK.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.recurring_day && <p className="text-red-500 text-xs mt-1">{errors.recurring_day}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Preferred Time <span className="text-red-400">*</span></label>
                <select value={form.recurring?.time || '09:00'} onChange={(e) => setRecurring('time', e.target.value)} className={errors.recurring_time ? inputErrorClass : inputClass}>
                  {TIME_OPTIONS.map((t) => <option key={t} value={t}>{formatTimeLabel(t)}</option>)}
                </select>
                {errors.recurring_time && <p className="text-red-500 text-xs mt-1">{errors.recurring_time}</p>}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Start Date <span className="text-red-400">*</span></label>
              <input type="date" value={form.recurring?.start_date || ''} onChange={(e) => setRecurring('start_date', e.target.value)} className={errors.recurring_start_date ? inputErrorClass : inputClass} />
              {errors.recurring_start_date && <p className="text-red-500 text-xs mt-1">{errors.recurring_start_date}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Frequency</label>
              <div className="flex gap-4">
                {[{ value: 'weekly', label: 'Every week' }, { value: 'biweekly', label: 'Every 2 weeks' }].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                    <input type="radio" name="frequency" value={opt.value} checked={(form.recurring?.frequency || 'weekly') === opt.value} onChange={() => setRecurring('frequency', opt.value)} className="accent-sky-700" />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Duration</label>
              <div className="flex gap-4 mb-3">
                {[{ value: 'weeks', label: 'Number of weeks' }, { value: 'end_date', label: 'End date' }].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                    <input type="radio" name="durationType" value={opt.value} checked={durationType === opt.value} onChange={() => setDurationType(opt.value as DurationType)} className="accent-sky-700" />
                    {opt.label}
                  </label>
                ))}
              </div>
              {durationType === 'weeks' ? (
                <div>
                  <input type="number" min={2} max={52} value={form.recurring?.weeks || ''} onChange={(e) => setRecurring('weeks', e.target.value)} placeholder="e.g. 10" className={inputClass} />
                  <p className="text-xs text-slate-400 mt-1">Between 2 and 52 weeks</p>
                </div>
              ) : (
                <input type="date" value={form.recurring?.end_date || ''} onChange={(e) => setRecurring('end_date', e.target.value)} className={inputClass} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Section 7: Notes */}
      <div className={cardClass}>
        <StepHeading step={7} title="Notes & Goals" subtitle="Optional — share anything helpful for Shirel to know." />
        <div className="relative">
          <FileText size={14} className="absolute left-3.5 top-3.5 text-sky-400" />
          <textarea
            value={form.notes}
            onChange={(e) => setField('notes', e.target.value)}
            placeholder="E.g. building water confidence, beginner swimmer, specific stroke goals..."
            rows={4}
            className={`${inputClass} pl-10 resize-none`}
          />
        </div>
      </div>

      {/* Contact note */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400 px-1">
        <span>Questions?</span>
        <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 hover:underline transition-colors">
          <Mail size={13} />
          {CONTACT_EMAIL}
        </a>
        <span>·</span>
        <a href={`tel:${CONTACT_PHONE_TEL}`} className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 hover:underline transition-colors">
          <Phone size={13} />
          {CONTACT_PHONE}
        </a>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 text-sm">{errors.submit}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-200"
      >
        {submitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Reservation Request'
        )}
      </button>
    </form>
  )
}
