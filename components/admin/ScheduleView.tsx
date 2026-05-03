'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  format, addDays, startOfWeek, isSameDay, isSameMonth, isSameYear,
} from 'date-fns'
import { ChevronLeft, ChevronRight, RefreshCw, User, Users } from 'lucide-react'
import { Booking } from '@/lib/types'

interface Props { adminPassword: string }

interface LessonEntry {
  time: string
  sortKey: number
  childNames: string[]
  lessonFormat: string
  lessonType: string | null
  parentName: string
  bookingId: number
  bookingType: string | null
  duration: number
}

function formatTime(t: string) {
  try {
    const [h, m] = t.split(':').map(Number)
    return `${h % 12 === 0 ? 12 : h % 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
  } catch { return t }
}

function parseJSON<T>(raw: string | null | undefined, fallback: T): T {
  try {
    if (!raw) return fallback
    const p = JSON.parse(raw)
    return p ?? fallback
  } catch { return fallback }
}

function weekLabel(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6)
  if (isSameMonth(weekStart, weekEnd) && isSameYear(weekStart, weekEnd)) {
    return `${format(weekStart, 'MMMM d')}–${format(weekEnd, 'd, yyyy')}`
  }
  if (isSameYear(weekStart, weekEnd)) {
    return `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`
  }
  return `${format(weekStart, 'MMM d, yyyy')} – ${format(weekEnd, 'MMM d, yyyy')}`
}

function getEntriesForDate(bookings: Booking[], dateStr: string): LessonEntry[] {
  const entries: LessonEntry[] = []

  for (const booking of bookings) {
    if (booking.status !== 'confirmed') continue

    // Primary: session_assignments
    const assignments = parseJSON<Array<{
      date: string; start_time: string; duration: number; assigned_children: string[]
    }>>(booking.session_assignments, [])
    const slotsForDate = assignments.filter(a => a.date === dateStr)

    if (slotsForDate.length > 0) {
      for (const slot of slotsForDate) {
        const [h, m] = slot.start_time.split(':').map(Number)
        entries.push({
          time: slot.start_time,
          sortKey: h * 60 + m,
          childNames: slot.assigned_children || [],
          lessonFormat: booking.lesson_format || 'private',
          lessonType: booking.lesson_type,
          parentName: booking.parent_name,
          bookingId: booking.id,
          bookingType: booking.booking_type,
          duration: slot.duration,
        })
      }
      continue
    }

    // Fallback: booked_slots
    const bookedSlots = parseJSON<Array<{ date: string; start_time: string; duration: number }>>(booking.booked_slots, [])
    const legacyForDate = bookedSlots.filter(s => s.date === dateStr)
    if (legacyForDate.length > 0) {
      const children = parseJSON<Array<{ name: string }>>(booking.children, [])
      const childNames = children.map(c => c.name || String(c))
      for (const slot of legacyForDate) {
        const [h, m] = slot.start_time.split(':').map(Number)
        entries.push({
          time: slot.start_time,
          sortKey: h * 60 + m,
          childNames,
          lessonFormat: booking.lesson_format || 'private',
          lessonType: booking.lesson_type,
          parentName: booking.parent_name,
          bookingId: booking.id,
          bookingType: booking.booking_type,
          duration: slot.duration,
        })
      }
    }
  }

  entries.sort((a, b) => a.sortKey - b.sortKey)
  return entries
}

export default function ScheduleView({ adminPassword }: Props) {
  const [weekStart, setWeekStart] = useState<Date>(() =>
    startOfWeek(new Date(), { weekStartsOn: 0 })
  )
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/bookings', {
        headers: { 'x-admin-password': adminPassword },
      })
      if (!res.ok) throw new Error()
      setBookings(await res.json())
    } catch {
      setError('Failed to load bookings.')
    } finally {
      setLoading(false)
    }
  }, [adminPassword])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const today = new Date()
  const todayWeekStart = startOfWeek(today, { weekStartsOn: 0 })
  const isCurrentWeek = weekStart.toDateString() === todayWeekStart.toDateString()
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const totalThisWeek = weekDays.reduce((sum, day) =>
    sum + getEntriesForDate(bookings, format(day, 'yyyy-MM-dd')).length, 0)

  /* ── Loading ── */
  if (loading) return (
    <div className="flex items-center justify-center" style={{ padding: '5rem 0' }}>
      <div
        className="animate-spin"
        style={{
          width: 26, height: 26, borderRadius: '50%',
          border: '3px solid rgba(74,127,165,0.20)',
          borderTopColor: '#4A7FA5',
        }}
      />
      <span style={{
        marginLeft: '0.875rem',
        fontFamily: 'var(--font-dm-sans)', fontSize: '14px',
        color: 'rgba(13,31,60,0.42)',
      }}>
        Loading schedule…
      </span>
    </div>
  )

  /* ── Error ── */
  if (error) return (
    <div style={{
      background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)',
      borderRadius: '14px', padding: '1rem 1.25rem',
      color: '#DC2626', fontSize: '14px', fontFamily: 'var(--font-dm-sans)',
    }}>
      {error}
      <button
        onClick={fetchBookings}
        style={{ marginLeft: '0.5rem', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626' }}
      >
        Retry
      </button>
    </div>
  )

  return (
    <div>

      {/* ── Navigation header ─────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap',
      }}>

        {/* Title + count */}
        <div>
          <p style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700,
            letterSpacing: '0.24em', textTransform: 'uppercase',
            color: 'rgba(13,31,60,0.32)', marginBottom: '0.25rem',
          }}>
            Weekly Schedule · Confirmed only
          </p>
          <h2 style={{
            fontFamily: 'var(--font-fraunces, Georgia, serif)',
            fontSize: 'clamp(18px, 2.5vw, 24px)', fontWeight: 800,
            color: '#0D1F3C', lineHeight: 1.1,
          }}>
            Week of {weekLabel(weekStart)}
          </h2>
          <p style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
            color: 'rgba(13,31,60,0.38)', marginTop: '0.3rem',
          }}>
            {totalThisWeek === 0
              ? 'No confirmed lessons this week'
              : `${totalThisWeek} confirmed lesson${totalThisWeek !== 1 ? 's' : ''} this week`}
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap' }}>

          {/* Prev */}
          <NavBtn onClick={() => setWeekStart(d => addDays(d, -7))} title="Previous week">
            <ChevronLeft size={16} />
          </NavBtn>

          {/* This week */}
          <button
            onClick={() => setWeekStart(todayWeekStart)}
            style={{
              padding: '0.5rem 1rem', borderRadius: '10px',
              fontFamily: 'var(--font-dm-sans)', fontSize: '12px', fontWeight: 700,
              background: isCurrentWeek ? '#4A7FA5' : 'white',
              color: isCurrentWeek ? 'white' : 'rgba(13,31,60,0.50)',
              border: `1.5px solid ${isCurrentWeek ? '#4A7FA5' : 'rgba(13,31,60,0.10)'}`,
              cursor: 'pointer', transition: 'all 200ms',
              whiteSpace: 'nowrap',
            }}
          >
            This week
          </button>

          {/* Next */}
          <NavBtn onClick={() => setWeekStart(d => addDays(d, 7))} title="Next week">
            <ChevronRight size={16} />
          </NavBtn>

          {/* Refresh */}
          <button
            onClick={fetchBookings}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.5rem 0.875rem', borderRadius: '10px',
              fontFamily: 'var(--font-dm-sans)', fontSize: '12px', fontWeight: 600,
              background: 'white', border: '1.5px solid rgba(13,31,60,0.10)',
              color: 'rgba(13,31,60,0.42)', cursor: 'pointer', transition: 'all 200ms',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.borderColor = '#4A7FA5'; el.style.color = '#4A7FA5'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.borderColor = 'rgba(13,31,60,0.10)'; el.style.color = 'rgba(13,31,60,0.42)'
            }}
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Day rows ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {weekDays.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const isToday = isSameDay(day, today)
          const entries = getEntriesForDate(bookings, dateStr)
          const hasLessons = entries.length > 0

          return (
            <div
              key={dateStr}
              style={{
                background: 'white',
                borderRadius: '18px',
                border: `1.5px solid ${isToday ? 'rgba(74,127,165,0.30)' : 'rgba(13,31,60,0.07)'}`,
                overflow: 'hidden',
              }}
            >
              {/* Day header row */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.875rem',
                padding: '0.8rem 1.25rem',
                background: isToday
                  ? 'rgba(74,127,165,0.05)'
                  : hasLessons ? 'rgba(13,31,60,0.015)' : 'transparent',
                borderBottom: hasLessons ? '1px solid rgba(13,31,60,0.05)' : 'none',
              }}>
                {/* Day name + date */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <p style={{
                    fontFamily: 'var(--font-fraunces, Georgia, serif)',
                    fontSize: '14px', fontWeight: 800,
                    color: isToday ? '#4A7FA5' : '#0D1F3C',
                    minWidth: '80px',
                  }}>
                    {format(day, 'EEEE')}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
                    color: isToday ? '#4A7FA5' : 'rgba(13,31,60,0.38)',
                  }}>
                    {format(day, 'MMMM d')}
                  </p>
                  {isToday && (
                    <span style={{
                      fontFamily: 'var(--font-dm-sans)', fontSize: '9px', fontWeight: 700,
                      letterSpacing: '0.10em', textTransform: 'uppercase',
                      background: '#4A7FA5', color: 'white',
                      padding: '1px 8px', borderRadius: '9999px',
                    }}>
                      Today
                    </span>
                  )}
                </div>

                {/* Lesson count badge (only if there are lessons) */}
                {hasLessons && (
                  <span style={{
                    fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 600,
                    color: '#4A7FA5', background: 'rgba(74,127,165,0.08)',
                    border: '1px solid rgba(74,127,165,0.18)',
                    padding: '2px 10px', borderRadius: '9999px', whiteSpace: 'nowrap',
                  }}>
                    {entries.length} lesson{entries.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Lessons list or empty */}
              {!hasLessons ? (
                <p style={{
                  fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
                  color: 'rgba(13,31,60,0.22)', padding: '0.7rem 1.25rem',
                  fontStyle: 'italic',
                }}>
                  No confirmed lessons
                </p>
              ) : (
                <div>
                  {entries.map((entry, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0',
                        borderTop: i > 0 ? '1px solid rgba(13,31,60,0.04)' : 'none',
                      }}
                    >
                      {/* Time block */}
                      <div style={{
                        flexShrink: 0, textAlign: 'right',
                        padding: '0.8rem 0.875rem 0.8rem 1.25rem',
                        minWidth: '100px',
                      }}>
                        <p style={{
                          fontFamily: 'var(--font-fraunces, Georgia, serif)',
                          fontSize: '13px', fontWeight: 800,
                          color: '#0D1F3C', whiteSpace: 'nowrap',
                        }}>
                          {formatTime(entry.time)}
                        </p>
                        <p style={{
                          fontFamily: 'var(--font-dm-sans)', fontSize: '10px',
                          color: 'rgba(13,31,60,0.32)', marginTop: '1px',
                        }}>
                          {entry.duration} min
                        </p>
                      </div>

                      {/* Divider */}
                      <div style={{
                        width: '1px', alignSelf: 'stretch',
                        background: 'rgba(13,31,60,0.06)', flexShrink: 0,
                        margin: '0.5rem 0',
                      }} />

                      {/* Details */}
                      <div style={{
                        flex: 1, minWidth: 0,
                        padding: '0.8rem 1rem 0.8rem 1rem',
                        display: 'flex', alignItems: 'center',
                        gap: '0.75rem', flexWrap: 'wrap',
                      }}>
                        {/* Child names */}
                        <span style={{
                          fontFamily: 'var(--font-dm-sans)', fontSize: '13px',
                          fontWeight: 700, color: '#0D1F3C',
                        }}>
                          {entry.childNames.length > 0
                            ? entry.childNames.join(' + ')
                            : '—'}
                        </span>

                        {/* Format pill */}
                        {entry.lessonFormat === 'semi-private' ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '3px',
                            fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 600,
                            color: '#4A7FA5', background: 'rgba(74,127,165,0.08)',
                            border: '1px solid rgba(74,127,165,0.18)',
                            padding: '2px 8px', borderRadius: '9999px', whiteSpace: 'nowrap',
                          }}>
                            <Users size={9} />Semi-private
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '3px',
                            fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 600,
                            color: 'rgba(13,31,60,0.42)', background: 'rgba(13,31,60,0.04)',
                            border: '1px solid rgba(13,31,60,0.08)',
                            padding: '2px 8px', borderRadius: '9999px', whiteSpace: 'nowrap',
                          }}>
                            <User size={9} />Private
                          </span>
                        )}

                        {/* 10-pack badge */}
                        {entry.bookingType === '10pack' && (
                          <span style={{
                            fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 600,
                            color: '#7C3AED', background: 'rgba(124,58,237,0.07)',
                            border: '1px solid rgba(124,58,237,0.15)',
                            padding: '2px 8px', borderRadius: '9999px', whiteSpace: 'nowrap',
                          }}>
                            10-pack
                          </span>
                        )}

                        {/* Parent + lesson type */}
                        <span style={{
                          fontFamily: 'var(--font-dm-sans)', fontSize: '11px',
                          color: 'rgba(13,31,60,0.38)',
                        }}>
                          {entry.parentName}
                          {entry.lessonType && (
                            <span style={{ marginLeft: '0.4rem', color: 'rgba(13,31,60,0.24)' }}>
                              · {entry.lessonType}
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Booking ID */}
                      <div style={{
                        flexShrink: 0, padding: '0.8rem 1.25rem 0.8rem 0.5rem',
                        textAlign: 'right',
                      }}>
                        <span style={{
                          fontFamily: 'var(--font-dm-sans)', fontSize: '10px',
                          color: 'rgba(13,31,60,0.22)',
                        }}>
                          #{entry.bookingId}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Footer note ── */}
      {totalThisWeek > 0 && (
        <p style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: '11px',
          color: 'rgba(13,31,60,0.28)', textAlign: 'center',
          marginTop: '1.25rem',
        }}>
          Showing confirmed lessons only · {totalThisWeek} total this week
        </p>
      )}

    </div>
  )
}

/* ── Small helper: nav arrow button ── */
function NavBtn({
  onClick, title, children,
}: {
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '36px', height: '36px', borderRadius: '10px',
        background: 'white', border: '1.5px solid rgba(13,31,60,0.10)',
        color: 'rgba(13,31,60,0.55)', cursor: 'pointer', transition: 'all 200ms',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.borderColor = '#4A7FA5'; el.style.color = '#4A7FA5'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.borderColor = 'rgba(13,31,60,0.10)'; el.style.color = 'rgba(13,31,60,0.55)'
      }}
    >
      {children}
    </button>
  )
}
