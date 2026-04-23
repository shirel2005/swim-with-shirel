'use client'

import { useEffect, useState } from 'react'
import AdminLogin from '@/components/admin/AdminLogin'
import BookingsManager from '@/components/admin/BookingsManager'
import ReviewsManager from '@/components/admin/ReviewsManager'
import AvailabilityManager from '@/components/admin/AvailabilityManager'
import ScheduleView from '@/components/admin/ScheduleView'
import { LogOut, Calendar, BookOpen, Star, Mail, Phone, DollarSign, Clock, Users, CalendarDays, TrendingUp } from 'lucide-react'
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL } from '@/lib/contact'

type Tab = 'bookings' | 'reviews' | 'availability' | 'schedule'

interface EarningsStats {
  confirmed_earnings: number
  pending_earnings: number
  total_bookings: number
  confirmed_bookings: number
}

export default function AdminPage() {
  const [adminPassword, setAdminPassword] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('bookings')
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState<EarningsStats | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('adminPassword')
    if (stored) setAdminPassword(stored)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!adminPassword) return
    fetch('/api/admin/bookings?stats=true', {
      headers: { 'x-admin-password': adminPassword },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data.confirmed_earnings === 'number') setStats(data)
      })
      .catch(() => {})
  }, [adminPassword])

  const handleLogin = (password: string) => {
    sessionStorage.setItem('adminPassword', password)
    setAdminPassword(password)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('adminPassword')
    setAdminPassword(null)
  }

  if (!mounted) return null
  if (!adminPassword) return <AdminLogin onLogin={handleLogin} />

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'bookings', label: 'Bookings', icon: <BookOpen size={15} /> },
    { key: 'reviews', label: 'Reviews', icon: <Star size={15} /> },
    { key: 'availability', label: 'Availability', icon: <Calendar size={15} /> },
    { key: 'schedule', label: 'Schedule', icon: <CalendarDays size={15} /> },
  ]

  return (
    <div style={{ backgroundColor: '#F8F4ED', minHeight: '100vh' }}>

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: '#0D1F3C', position: 'relative', overflow: 'hidden' }}>
        {/* Background blob */}
        <div className="absolute pointer-events-none" style={{
          top: '-30%', right: '-5%', width: '35vw', height: '160%',
          background: 'radial-gradient(ellipse, rgba(74,127,165,0.10) 0%, transparent 65%)',
          borderRadius: '55% 45% 50% 50% / 50% 55% 45% 50%',
        }} aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
          <div style={{ paddingTop: '1.5rem', paddingBottom: '0' }}>

            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <p style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '10px', fontWeight: 700, letterSpacing: '0.32em',
                  textTransform: 'uppercase', color: 'rgba(106,175,212,0.65)',
                  marginBottom: '0.25rem',
                }}>
                  Admin Dashboard
                </p>
                <h1 style={{
                  fontFamily: 'var(--font-fraunces, Georgia, serif)',
                  fontSize: '22px', fontWeight: 800, color: '#F8F4ED',
                }}>
                  Swim with Shirel
                </h1>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                {/* Contact links */}
                <div style={{ display: 'none' }} className="sm:flex items-center gap-3">
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.375rem',
                      fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
                      color: 'rgba(248,244,237,0.42)', textDecoration: 'none',
                      transition: 'color 200ms',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(106,175,212,0.85)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(248,244,237,0.42)')}
                  >
                    <Mail size={12} style={{ color: 'rgba(74,127,165,0.7)' }} />
                    {CONTACT_EMAIL}
                  </a>
                  <span style={{ color: 'rgba(248,244,237,0.15)' }}>·</span>
                  <a
                    href={`tel:${CONTACT_PHONE_TEL}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.375rem',
                      fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
                      color: 'rgba(248,244,237,0.42)', textDecoration: 'none',
                      transition: 'color 200ms',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(106,175,212,0.85)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(248,244,237,0.42)')}
                  >
                    <Phone size={12} style={{ color: 'rgba(74,127,165,0.7)' }} />
                    {CONTACT_PHONE}
                  </a>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 1rem', borderRadius: '10px',
                    fontFamily: 'var(--font-dm-sans)', fontSize: '12px', fontWeight: 600,
                    color: 'rgba(248,244,237,0.55)',
                    background: 'rgba(248,244,237,0.06)',
                    border: '1px solid rgba(248,244,237,0.10)',
                    cursor: 'pointer', transition: 'all 200ms',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLButtonElement
                    el.style.background = 'rgba(239,68,68,0.12)'
                    el.style.borderColor = 'rgba(239,68,68,0.25)'
                    el.style.color = '#FCA5A5'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLButtonElement
                    el.style.background = 'rgba(248,244,237,0.06)'
                    el.style.borderColor = 'rgba(248,244,237,0.10)'
                    el.style.color = 'rgba(248,244,237,0.55)'
                  }}
                >
                  <LogOut size={13} />
                  Logout
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0', borderTop: '1px solid rgba(248,244,237,0.06)' }}>
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.875rem 1.25rem',
                    fontFamily: 'var(--font-dm-sans)', fontSize: '12px', fontWeight: 700,
                    letterSpacing: '0.04em',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    borderBottom: activeTab === tab.key
                      ? '2px solid #6AAFD4'
                      : '2px solid transparent',
                    color: activeTab === tab.key
                      ? '#6AAFD4'
                      : 'rgba(248,244,237,0.38)',
                    transition: 'color 200ms, border-color 200ms',
                  }}
                  onMouseEnter={e => {
                    if (activeTab !== tab.key) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(248,244,237,0.70)'
                  }}
                  onMouseLeave={e => {
                    if (activeTab !== tab.key) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(248,244,237,0.38)'
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS STRIP ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10" style={{ paddingTop: '2rem', paddingBottom: '0.5rem' }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Confirmed Earnings */}
          <div style={{
            background: 'white', borderRadius: '18px',
            border: '1.5px solid rgba(13,31,60,0.07)',
            padding: '1.375rem 1.5rem',
            borderTop: '3px solid #4A7FA5',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '10px',
                background: 'rgba(74,127,165,0.08)', border: '1px solid rgba(74,127,165,0.14)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <DollarSign size={15} style={{ color: '#4A7FA5' }} />
              </div>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(13,31,60,0.38)' }}>
                Confirmed
              </p>
            </div>
            <p style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: '28px', fontWeight: 900, color: '#0D1F3C', lineHeight: 1 }}>
              {stats ? `$${stats.confirmed_earnings.toLocaleString()}` : '—'}
            </p>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: 'rgba(13,31,60,0.35)', marginTop: '0.375rem' }}>
              {stats ? `${stats.confirmed_bookings} confirmed booking${stats.confirmed_bookings !== 1 ? 's' : ''}` : 'Loading…'}
            </p>
          </div>

          {/* Pending Revenue */}
          <div style={{
            background: 'white', borderRadius: '18px',
            border: '1.5px solid rgba(13,31,60,0.07)',
            padding: '1.375rem 1.5rem',
            borderTop: '3px solid #F59E0B',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '10px',
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Clock size={15} style={{ color: '#F59E0B' }} />
              </div>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(13,31,60,0.38)' }}>
                Pending
              </p>
            </div>
            <p style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: '28px', fontWeight: 900, color: '#0D1F3C', lineHeight: 1 }}>
              {stats ? `$${stats.pending_earnings.toLocaleString()}` : '—'}
            </p>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: 'rgba(13,31,60,0.35)', marginTop: '0.375rem' }}>
              Awaiting confirmation
            </p>
          </div>

          {/* Total Bookings */}
          <div style={{
            background: 'white', borderRadius: '18px',
            border: '1.5px solid rgba(13,31,60,0.07)',
            padding: '1.375rem 1.5rem',
            borderTop: '3px solid rgba(13,31,60,0.20)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '10px',
                background: 'rgba(13,31,60,0.05)', border: '1px solid rgba(13,31,60,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Users size={15} style={{ color: '#0D1F3C' }} />
              </div>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(13,31,60,0.38)' }}>
                Total Bookings
              </p>
            </div>
            <p style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: '28px', fontWeight: 900, color: '#0D1F3C', lineHeight: 1 }}>
              {stats ? stats.total_bookings : '—'}
            </p>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: 'rgba(13,31,60,0.35)', marginTop: '0.375rem' }}>
              All time
            </p>
          </div>

        </div>
      </div>

      {/* ── TAB CONTENT ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pb-10" style={{ paddingTop: '1.5rem' }}>
        {activeTab === 'bookings' && <BookingsManager adminPassword={adminPassword} />}
        {activeTab === 'reviews' && <ReviewsManager adminPassword={adminPassword} />}
        {activeTab === 'availability' && <AvailabilityManager adminPassword={adminPassword} />}
        {activeTab === 'schedule' && <ScheduleView adminPassword={adminPassword} />}
      </div>

    </div>
  )
}
