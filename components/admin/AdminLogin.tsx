'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'

interface AdminLoginProps {
  onLogin: (password: string) => void
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!password.trim()) { setError('Please enter a password.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/reviews', { headers: { 'x-admin-password': password } })
      if (res.status === 401) setError('Incorrect password. Please try again.')
      else if (res.ok) { sessionStorage.setItem('adminPassword', password); onLogin(password) }
      else setError('An unexpected error occurred. Please try again.')
    } catch {
      setError('Could not connect to the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-sky-50/40 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-sky-50 border border-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Lock size={28} className="text-sky-700" />
            </div>
            <p className="section-label justify-center flex">Admin Access</p>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Swim with Shirel</h1>
            <p className="text-slate-400 text-sm">Enter your admin password to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-slate-500 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="input-field pl-10"
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                'Enter Admin Panel'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
