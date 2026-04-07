'use client'

import { useEffect, useState } from 'react'
import AdminLogin from '@/components/admin/AdminLogin'
import BookingsManager from '@/components/admin/BookingsManager'
import ReviewsManager from '@/components/admin/ReviewsManager'
import AvailabilityManager from '@/components/admin/AvailabilityManager'
import { LogOut, Calendar, BookOpen, Star, Mail, Phone } from 'lucide-react'
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL } from '@/lib/contact'

type Tab = 'bookings' | 'reviews' | 'availability'

export default function AdminPage() {
  const [adminPassword, setAdminPassword] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('bookings')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('adminPassword')
    if (stored) setAdminPassword(stored)
    setMounted(true)
  }, [])

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
    { key: 'bookings', label: 'Bookings', icon: <BookOpen size={16} /> },
    { key: 'reviews', label: 'Reviews', icon: <Star size={16} /> },
    { key: 'availability', label: 'Availability', icon: <Calendar size={16} /> },
  ]

  return (
    <div className="min-h-screen bg-sky-50/40">
      {/* Admin Header */}
      <div className="bg-white border-b border-sky-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs tracking-widest uppercase font-semibold text-sky-600 mb-0.5">Admin Dashboard</p>
              <h1 className="text-xl font-bold text-slate-900">Swim with Shirel</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 text-sm text-slate-500">
                <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-1.5 hover:text-sky-700 transition-colors">
                  <Mail size={13} className="text-sky-400" />
                  {CONTACT_EMAIL}
                </a>
                <span className="text-slate-300">·</span>
                <a href={`tel:${CONTACT_PHONE_TEL}`} className="flex items-center gap-1.5 hover:text-sky-700 transition-colors">
                  <Phone size={13} className="text-sky-400" />
                  {CONTACT_PHONE}
                </a>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 border border-red-100 hover:bg-red-50 transition-colors"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mt-4 border-t border-sky-50 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-sky-700 text-sky-700 bg-sky-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
        {activeTab === 'bookings' && <BookingsManager adminPassword={adminPassword} />}
        {activeTab === 'reviews' && <ReviewsManager adminPassword={adminPassword} />}
        {activeTab === 'availability' && <AvailabilityManager adminPassword={adminPassword} />}
      </div>
    </div>
  )
}
