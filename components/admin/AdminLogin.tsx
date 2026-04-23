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
    <div style={{ backgroundColor: '#F8F4ED', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>

      {/* Background blobs */}
      <div className="absolute pointer-events-none" style={{
        top: '-10%', right: '-10%', width: '45vw', height: '55vh',
        background: 'radial-gradient(ellipse, rgba(74,127,165,0.10) 0%, transparent 65%)',
        borderRadius: '55% 45% 50% 50% / 50% 55% 45% 50%',
      }} aria-hidden="true" />
      <div className="absolute pointer-events-none" style={{
        bottom: '-10%', left: '-8%', width: '35vw', height: '45vh',
        background: 'radial-gradient(ellipse, rgba(13,31,60,0.05) 0%, transparent 65%)',
        borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%',
      }} aria-hidden="true" />

      <div style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1 }}>
        <div style={{
          background: 'white', borderRadius: '24px',
          border: '1.5px solid rgba(13,31,60,0.07)',
          boxShadow: '0 24px 72px -16px rgba(13,31,60,0.12)',
          padding: '2.5rem',
        }}>
          {/* Icon + heading */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '16px',
              background: 'rgba(74,127,165,0.08)', border: '1px solid rgba(74,127,165,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              <Lock size={22} style={{ color: '#4A7FA5' }} />
            </div>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#4A7FA5', marginBottom: '0.5rem' }}>
              Admin Access
            </p>
            <h1 style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: '26px', fontWeight: 800, color: '#0D1F3C', marginBottom: '0.375rem' }}>
              Swim with Shirel
            </h1>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'rgba(13,31,60,0.42)' }}>
              Enter your admin password to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(13,31,60,0.45)', display: 'block', marginBottom: '0.5rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={13} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(74,127,165,0.5)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="input-field"
                  style={{ paddingLeft: '2.25rem' }}
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid rgba(239,68,68,0.20)', borderRadius: '12px', padding: '0.75rem 1rem' }}>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: '#DC2626' }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ padding: '0.875rem', fontSize: '14px', justifyContent: 'center', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? (
                <>
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(248,244,237,0.3)', borderTopColor: '#F8F4ED', animation: 'spin 0.7s linear infinite' }} />
                  Verifying…
                </>
              ) : 'Enter Admin Panel'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
