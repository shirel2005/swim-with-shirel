'use client'

import { useState, useEffect } from 'react'
import {
  X, Plus, Trash2, CheckCircle, AlertTriangle,
  User, Users, Clock, Calendar, Mail,
} from 'lucide-react'

interface ChildForm {
  id: string
  name: string
  age: string
  experience: string
  notes: string
}

interface SessionForm {
  id: string
  date: string
  start_time: string
  duration: 30 | 45
  assigned_children: string[]
}

interface ManualBookingModalProps {
  adminPassword: string
  onClose: () => void
  onSuccess: () => void
}

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'some-comfort', label: 'Some Comfort in Water' },
  { value: 'basic-skills', label: 'Basic Skills' },
  { value: 'independent', label: 'Swims Independently' },
  { value: 'advanced', label: 'Advanced' },
]

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function suggestPrice(format: 'private' | 'semi-private', duration: 30 | 45, count: number): number {
  const perSession = format === 'private'
    ? (duration === 30 ? 50 : 75)
    : (duration === 30 ? 75 : 115)
  return perSession * count
}

function formatTimeDisplay(t: string) {
  try {
    const [h, m] = t.split(':').map(Number)
    return `${h % 12 === 0 ? 12 : h % 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
  } catch { return t }
}

export default function ManualBookingModal({ adminPassword, onClose, onSuccess }: ManualBookingModalProps) {
  // Parent
  const [parentName, setParentName] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [parentPhone, setParentPhone] = useState('')

  // Children
  const [children, setChildren] = useState<ChildForm[]>([
    { id: uid(), name: '', age: '', experience: 'beginner', notes: '' },
  ])

  // Lesson
  const [lessonFormat, setLessonFormat] = useState<'private' | 'semi-private'>('private')
  const [lessonDuration, setLessonDuration] = useState<30 | 45>(30)
  const [bookingType, setBookingType] = useState<'one-time' | '10pack'>('one-time')
  const [totalPrice, setTotalPrice] = useState('50')
  const [priceTouched, setPriceTouched] = useState(false)
  const [lessonNotes, setLessonNotes] = useState('')

  // Sessions
  const [sessions, setSessions] = useState<SessionForm[]>([
    { id: uid(), date: '', start_time: '', duration: 30, assigned_children: [] },
  ])

  // State
  const [creating, setCreating] = useState(false)
  const [conflicts, setConflicts] = useState<Record<string, string[]>>({})
  const [overrideConflicts, setOverrideConflicts] = useState(false)
  const [result, setResult] = useState<{ booking_id: number; email_sent: boolean; email_error?: string } | null>(null)
  const [error, setError] = useState('')

  // Auto-suggest price when format/duration/session count changes (unless admin has typed a custom price)
  useEffect(() => {
    if (!priceTouched) {
      setTotalPrice(String(suggestPrice(lessonFormat, lessonDuration, sessions.length)))
    }
  }, [lessonFormat, lessonDuration, sessions.length, priceTouched])

  // Sync all session durations when lesson duration changes
  useEffect(() => {
    setSessions(prev => prev.map(s => ({ ...s, duration: lessonDuration })))
  }, [lessonDuration])

  // ── Child handlers ──────────────────────────────────────────────────────────
  const addChild = () => {
    setChildren(prev => [...prev, { id: uid(), name: '', age: '', experience: 'beginner', notes: '' }])
  }

  const updateChild = (id: string, field: keyof ChildForm, value: string) => {
    setChildren(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  const removeChild = (id: string) => {
    if (children.length === 1) return
    const childName = children.find(c => c.id === id)?.name
    setChildren(prev => prev.filter(c => c.id !== id))
    if (childName) {
      setSessions(prev => prev.map(s => ({
        ...s,
        assigned_children: s.assigned_children.filter(n => n !== childName),
      })))
    }
  }

  // ── Session handlers ────────────────────────────────────────────────────────
  const addSession = () => {
    setSessions(prev => [...prev, { id: uid(), date: '', start_time: '', duration: lessonDuration, assigned_children: [] }])
  }

  const updateSession = <K extends keyof SessionForm>(id: string, field: K, value: SessionForm[K]) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const removeSession = (id: string) => {
    if (sessions.length === 1) return
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  // Toggle a child in/out of a session.
  // Empty assigned_children = "all children" (default). Clicking:
  //   - when all default: transitions to explicit, deselecting the clicked child
  //   - when explicit: toggles the child; if all selected, resets to default []
  const toggleChildInSession = (sessionId: string, childName: string) => {
    const allNames = children.map(c => c.name).filter(Boolean)
    setSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s
      const effective = s.assigned_children.length === 0 ? allNames : s.assigned_children
      const isSelected = effective.includes(childName)
      const newAssigned = isSelected
        ? effective.filter(n => n !== childName)
        : [...effective, childName]
      if (newAssigned.length === 0) return s  // prevent 0-child session
      const isAll = allNames.length > 0 && allNames.every(n => newAssigned.includes(n))
      return { ...s, assigned_children: isAll ? [] : newAssigned }
    }))
  }

  // ── Form submit ─────────────────────────────────────────────────────────────
  const validate = (): string | null => {
    if (!parentName.trim()) return 'Parent name is required'
    if (!parentEmail.trim()) return 'Parent email is required'
    if (!parentPhone.trim()) return 'Parent phone is required'
    for (const c of children) {
      if (!c.name.trim()) return 'All children must have a name'
      if (!c.age.trim()) return 'Age is required for each child'
    }
    for (const s of sessions) {
      if (!s.date) return 'All sessions must have a date'
      if (!s.start_time) return 'All sessions must have a start time'
    }
    return null
  }

  const handleSubmit = async (override = false) => {
    const err = validate()
    if (err) { setError(err); return }

    setCreating(true)
    setError('')
    setConflicts({})

    const childNames = children.map(c => c.name.trim())
    const sessionsToSubmit = sessions.map(s => ({
      date: s.date,
      start_time: s.start_time,
      duration: s.duration,
      assigned_children: s.assigned_children.length > 0 ? s.assigned_children : childNames,
    }))

    try {
      const res = await fetch('/api/admin/bookings/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
        body: JSON.stringify({
          parent_name: parentName.trim(),
          parent_email: parentEmail.trim(),
          parent_phone: parentPhone.trim(),
          children: children.map(c => ({
            name: c.name.trim(),
            age: c.age.trim(),
            experience: c.experience,
            ...(c.notes.trim() && { notes: c.notes.trim() }),
          })),
          sessions: sessionsToSubmit,
          lesson_format: lessonFormat,
          lesson_type: `${lessonDuration}min`,
          booking_type: bookingType,
          total_price: parseFloat(totalPrice) || 0,
          ...(lessonNotes.trim() && { notes: lessonNotes.trim() }),
          override_conflicts: override,
        }),
      })

      if (res.status === 409) {
        const data = await res.json()
        setConflicts(data.conflicts || {})
        setCreating(false)
        return
      }

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to create booking')
        setCreating(false)
        return
      }

      const data = await res.json()
      setResult(data)
      onSuccess()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const hasConflicts = Object.keys(conflicts).length > 0
  const childNames = children.map(c => c.name).filter(Boolean)

  // ── Styles ──────────────────────────────────────────────────────────────────
  const inputCls = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 bg-white'
  const labelCls = 'block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5'
  const sectionTitleCls = 'text-xs font-bold uppercase tracking-widest text-sky-600 mb-3 flex items-center gap-2'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Plus size={16} className="text-emerald-700" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Add Manual Lesson</h2>
              <p className="text-xs text-slate-500">Saves as confirmed and sends a confirmation email to the parent</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors flex-shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* ── Success state ───────────────────────────────────────────────────── */}
        {result ? (
          <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
              <CheckCircle size={30} className="text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Lesson created!</h3>
            <p className="text-sm text-slate-500 mb-6">
              Booking <span className="font-semibold text-slate-700">#{result.booking_id}</span> saved as confirmed.
            </p>

            {result.email_sent ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3.5 flex items-center gap-3 w-full max-w-sm">
                <Mail size={16} className="text-emerald-600 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-emerald-800">Confirmation email sent</p>
                  <p className="text-xs text-emerald-700 mt-0.5">Parent received their booking confirmation.</p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 flex items-start gap-3 w-full max-w-sm">
                <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-amber-800">Email not sent</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    {result.email_error
                      ? `Error: ${result.email_error.slice(0, 120)}`
                      : 'Check server logs for details.'}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">The booking was saved successfully — you can resend manually.</p>
                </div>
              </div>
            )}
          </div>
        ) : (

          /* ── Scrollable form ──────────────────────────────────────────────── */
          <div className="flex-1 overflow-y-auto p-6 space-y-7">

            {/* ── Parent Info ──────────────────────────────────────────────── */}
            <section>
              <div className={sectionTitleCls}>
                <User size={13} />
                Parent Info
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Full Name *</label>
                  <input
                    className={inputCls}
                    value={parentName}
                    onChange={e => setParentName(e.target.value)}
                    placeholder="e.g. Sarah Cohen"
                  />
                </div>
                <div>
                  <label className={labelCls}>Email *</label>
                  <input
                    className={inputCls}
                    type="email"
                    value={parentEmail}
                    onChange={e => setParentEmail(e.target.value)}
                    placeholder="parent@email.com"
                  />
                </div>
                <div>
                  <label className={labelCls}>Phone *</label>
                  <input
                    className={inputCls}
                    type="tel"
                    value={parentPhone}
                    onChange={e => setParentPhone(e.target.value)}
                    placeholder="514-000-0000"
                  />
                </div>
              </div>
            </section>

            {/* ── Children ─────────────────────────────────────────────────── */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <div className={sectionTitleCls} style={{ marginBottom: 0 }}>
                  <Users size={13} />
                  Children ({children.length})
                </div>
                <button
                  onClick={addChild}
                  className="flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-900 transition-colors"
                >
                  <Plus size={12} />Add child
                </button>
              </div>

              <div className="space-y-3">
                {children.map((child, idx) => (
                  <div key={child.id} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Child {idx + 1}</span>
                      {children.length > 1 && (
                        <button
                          onClick={() => removeChild(child.id)}
                          className="p-1 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Name *</label>
                        <input
                          className={inputCls}
                          value={child.name}
                          onChange={e => updateChild(child.id, 'name', e.target.value)}
                          placeholder="Child's name"
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Age *</label>
                        <input
                          className={inputCls}
                          value={child.age}
                          onChange={e => updateChild(child.id, 'age', e.target.value)}
                          placeholder="e.g. 7"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Swimming Experience</label>
                        <select
                          className={inputCls}
                          value={child.experience}
                          onChange={e => updateChild(child.id, 'experience', e.target.value)}
                        >
                          {EXPERIENCE_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Notes (optional)</label>
                        <input
                          className={inputCls}
                          value={child.notes}
                          onChange={e => updateChild(child.id, 'notes', e.target.value)}
                          placeholder="Any notes about this child"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Lesson Details ───────────────────────────────────────────── */}
            <section>
              <div className={sectionTitleCls}>
                <Clock size={13} />
                Lesson Details
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* Format */}
                <div>
                  <label className={labelCls}>Format *</label>
                  <div className="flex gap-2">
                    {(['private', 'semi-private'] as const).map(f => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setLessonFormat(f)}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors border ${
                          lessonFormat === f
                            ? 'bg-sky-700 text-white border-sky-700'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'
                        }`}
                      >
                        {f === 'private' ? 'Private' : 'Semi-Private'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className={labelCls}>Duration *</label>
                  <div className="flex gap-2">
                    {([30, 45] as const).map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setLessonDuration(d)}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors border ${
                          lessonDuration === d
                            ? 'bg-sky-700 text-white border-sky-700'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'
                        }`}
                      >
                        {d} min
                      </button>
                    ))}
                  </div>
                </div>

                {/* Booking type */}
                <div>
                  <label className={labelCls}>Booking Type</label>
                  <select
                    className={inputCls}
                    value={bookingType}
                    onChange={e => setBookingType(e.target.value as 'one-time' | '10pack')}
                  >
                    <option value="one-time">One-Time</option>
                    <option value="10pack">10-Pack Session</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className={labelCls}>Price ($) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
                    <input
                      className={`${inputCls} pl-7`}
                      type="number"
                      min="0"
                      step="5"
                      value={totalPrice}
                      onChange={e => { setTotalPrice(e.target.value); setPriceTouched(true) }}
                      placeholder="50"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {priceTouched ? (
                      <button
                        type="button"
                        onClick={() => { setPriceTouched(false) }}
                        className="text-sky-600 underline"
                      >
                        Reset to suggested (${suggestPrice(lessonFormat, lessonDuration, sessions.length)})
                      </button>
                    ) : (
                      `Suggested: $${suggestPrice(lessonFormat, lessonDuration, sessions.length)}`
                    )}
                  </p>
                </div>

                {/* Lesson notes */}
                <div className="sm:col-span-2">
                  <label className={labelCls}>Lesson Notes (optional)</label>
                  <textarea
                    className={`${inputCls} resize-none`}
                    rows={2}
                    value={lessonNotes}
                    onChange={e => setLessonNotes(e.target.value)}
                    placeholder="Any notes for this lesson"
                  />
                </div>
              </div>
            </section>

            {/* ── Sessions ─────────────────────────────────────────────────── */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <div className={sectionTitleCls} style={{ marginBottom: 0 }}>
                  <Calendar size={13} />
                  Sessions ({sessions.length})
                </div>
                <button
                  onClick={addSession}
                  className="flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-900 transition-colors"
                >
                  <Plus size={12} />Add session
                </button>
              </div>

              <div className="space-y-3">
                {sessions.map((session, idx) => {
                  const hasConflict = !!conflicts[session.date]
                  const effectiveChildren = session.assigned_children.length > 0
                    ? session.assigned_children
                    : childNames

                  return (
                    <div
                      key={session.id}
                      className={`border rounded-xl p-4 ${hasConflict ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                            Session {idx + 1}
                          </span>
                          {hasConflict && (
                            <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
                              <AlertTriangle size={11} />Conflict
                            </span>
                          )}
                        </div>
                        {sessions.length > 1 && (
                          <button
                            onClick={() => removeSession(session.id)}
                            className="p-1 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                        <div className="col-span-2 sm:col-span-1">
                          <label className={labelCls}>Date *</label>
                          <input
                            type="date"
                            className={inputCls}
                            value={session.date}
                            onChange={e => {
                              updateSession(session.id, 'date', e.target.value)
                              setConflicts({})
                              setOverrideConflicts(false)
                            }}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Start Time *</label>
                          <input
                            type="time"
                            className={inputCls}
                            value={session.start_time}
                            onChange={e => {
                              updateSession(session.id, 'start_time', e.target.value)
                              setConflicts({})
                              setOverrideConflicts(false)
                            }}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Duration</label>
                          <select
                            className={inputCls}
                            value={session.duration}
                            onChange={e => updateSession(session.id, 'duration', parseInt(e.target.value) as 30 | 45)}
                          >
                            <option value={30}>30 min</option>
                            <option value={45}>45 min</option>
                          </select>
                        </div>
                      </div>

                      {/* Child assignment */}
                      {childNames.length > 0 && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                            Assigned Children
                            {session.assigned_children.length === 0 && (
                              <span className="ml-1.5 font-normal normal-case tracking-normal text-slate-400">
                                — all by default
                              </span>
                            )}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {childNames.map(name => {
                              const isSelected = effectiveChildren.includes(name)
                              const isExplicit = session.assigned_children.length > 0
                              return (
                                <button
                                  key={name}
                                  type="button"
                                  onClick={() => toggleChildInSession(session.id, name)}
                                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${
                                    isSelected && isExplicit
                                      ? 'bg-sky-700 text-white border-sky-700'
                                      : isSelected && !isExplicit
                                      ? 'bg-sky-100 text-sky-700 border-sky-200'
                                      : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  {name}
                                </button>
                              )
                            })}
                          </div>
                          {session.assigned_children.length > 0 && (
                            <button
                              type="button"
                              onClick={() => updateSession(session.id, 'assigned_children', [])}
                              className="mt-2 text-xs text-slate-400 hover:text-slate-600 underline"
                            >
                              Reset to all children
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {lessonFormat === 'private' && children.length > 1 && sessions.length === 1 && (
                <p className="mt-2 text-xs text-slate-400">
                  Tip: for private lessons with multiple children, add a session per child and assign each child to their own time slot.
                </p>
              )}
            </section>

            {/* ── Conflict warning ─────────────────────────────────────────── */}
            {hasConflicts && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-2.5 mb-3">
                  <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800 mb-1">Schedule conflicts detected</p>
                    <p className="text-xs text-amber-700 mb-2">
                      These times overlap with already-confirmed bookings:
                    </p>
                    <ul className="space-y-0.5">
                      {Object.entries(conflicts).map(([date, times]) => (
                        <li key={date} className="text-xs text-amber-700">
                          <span className="font-semibold">{date}</span>
                          {' '}at {times.map(formatTimeDisplay).join(', ')}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={overrideConflicts}
                    onChange={e => setOverrideConflicts(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-600"
                  />
                  <span className="text-xs font-semibold text-amber-800">
                    Override conflicts and create anyway
                  </span>
                </label>
              </div>
            )}

            {/* ── Error ────────────────────────────────────────────────────── */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        )}

        {/* ── Footer ─────────────────────────────────────────────────────────── */}
        {result ? (
          <div className="flex-shrink-0 px-6 pb-6 pt-3">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="flex-shrink-0 flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSubmit(overrideConflicts)}
              disabled={creating || (hasConflicts && !overrideConflicts)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors"
            >
              {creating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <CheckCircle size={14} />
                  Create Confirmed Lesson
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
