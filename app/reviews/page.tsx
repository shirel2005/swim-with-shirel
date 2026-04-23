'use client'

import { useEffect, useState } from 'react'
import ReviewForm from '@/components/ReviewForm'
import ReviewCard from '@/components/ReviewCard'
import { Review } from '@/lib/types'

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  const fetchReviews = () => {
    setLoading(true)
    fetch('/api/reviews')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setReviews(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchReviews() }, [])

  return (
    <div style={{ backgroundColor: '#F8F4ED', minHeight: '100vh' }}>

      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#0D1F3C', paddingTop: '4.5rem', paddingBottom: '0', overflow: 'hidden', position: 'relative' }}>
        <div className="absolute pointer-events-none" style={{
          top: '-20%', right: '-5%', width: '40vw', height: '60vh',
          background: 'radial-gradient(ellipse, rgba(74,127,165,0.12) 0%, transparent 65%)',
          borderRadius: '55% 45% 50% 50% / 50% 55% 45% 50%',
        }} aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-16 pb-14 relative z-10">
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(106,175,212,0.65)', marginBottom: '1rem' }}>
            Reviews
          </p>
          <h1 style={{
            fontFamily: 'var(--font-fraunces, Georgia, serif)',
            fontSize: 'clamp(40px, 7vw, 84px)', color: '#F8F4ED',
            fontWeight: 900, lineHeight: 0.92, letterSpacing: '-0.03em', marginBottom: '1.25rem',
          }}>
            What parents<br /><em style={{ color: '#6AAFD4' }}>are saying.</em>
          </h1>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '15px', color: 'rgba(248,244,237,0.42)', lineHeight: 1.75, maxWidth: '420px' }}>
            Real families, real experiences. Read what parents in Côte Saint-Luc have shared about their time with Shirel.
          </p>
        </div>

        <div style={{ lineHeight: 0 }} aria-hidden="true">
          <svg viewBox="0 0 1440 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none">
            <path d="M0 35 C180 8 360 62 540 35 C720 8 900 58 1080 35 C1230 16 1350 52 1440 35 L1440 70 L0 70 Z" fill="#F8F4ED" />
          </svg>
        </div>
      </section>

      {/* ── CONTENT ──────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: '5rem', paddingBottom: '7rem' }}>
        <div className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-16">

          {/* Leave a review */}
          <div style={{
            background: 'white', borderRadius: '24px',
            border: '1.5px solid rgba(13,31,60,0.07)',
            padding: '2rem', marginBottom: '4rem', maxWidth: '680px',
          }}>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#4A7FA5', marginBottom: '0.5rem' }}>
              Your turn
            </p>
            <h2 style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: '24px', fontWeight: 800, color: '#0D1F3C', marginBottom: '1.5rem' }}>
              Leave a Review
            </h2>
            <ReviewForm onSuccess={fetchReviews} />
          </div>

          {/* Reviews grid */}
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 0' }}>
              <div
                style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  border: '3px solid rgba(74,127,165,0.20)',
                  borderTopColor: '#4A7FA5',
                  animation: 'spin 0.7s linear infinite',
                }}
              />
            </div>
          ) : reviews.length === 0 ? (
            <div style={{
              background: 'white', borderRadius: '20px',
              border: '1.5px solid rgba(13,31,60,0.07)',
              padding: '3rem', textAlign: 'center',
            }}>
              <p style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: '20px', fontWeight: 700, color: '#0D1F3C', marginBottom: '0.5rem' }}>
                No reviews yet.
              </p>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '14px', color: 'rgba(13,31,60,0.42)' }}>
                Be the first to share your experience with Shirel&apos;s swim lessons.
              </p>
            </div>
          ) : (
            <>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#4A7FA5', marginBottom: '1.5rem' }}>
                {reviews.length} Review{reviews.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reviews.map(review => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
