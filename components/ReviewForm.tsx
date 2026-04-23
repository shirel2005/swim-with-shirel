'use client'

import { useState } from 'react'
import StarRating from './StarRating'
import { Send } from 'lucide-react'

interface ReviewFormProps {
  onSuccess?: () => void
}

export default function ReviewForm({ onSuccess }: ReviewFormProps) {
  const [parentName, setParentName] = useState('')
  const [childName, setChildName] = useState('')
  const [rating, setRating] = useState(0)
  const [lessonType, setLessonType] = useState('')
  const [reviewText, setReviewText] = useState('')

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!parentName.trim()) return setError('Parent name is required.')
    if (!childName.trim()) return setError('Child name is required.')
    if (!rating || rating < 1) return setError('Please select a star rating.')
    if (!reviewText.trim()) return setError('Review text is required.')

    setLoading(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_name: parentName,
          child_name: childName,
          rating,
          review_text: reviewText,
          lesson_type: lessonType || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to submit review.')
      } else {
        setSuccess(true)
        setParentName('')
        setChildName('')
        setRating(0)
        setLessonType('')
        setReviewText('')
        onSuccess?.()
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: 'rgba(74,127,165,0.07)', border: '1px solid rgba(74,127,165,0.2)' }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(74,127,165,0.12)', border: '1px solid rgba(74,127,165,0.2)' }}>
          <Send size={20} style={{ color: '#4A7FA5' }} />
        </div>
        <p className="font-bold text-lg mb-2" style={{ color: '#0D1F3C' }}>Thank you for your review!</p>
        <p className="text-sm" style={{ color: '#4A7FA5' }}>
          Your review has been submitted and will appear once approved.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-5 text-sm underline transition-colors"
          style={{ color: '#4A7FA5' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#0D1F3C')}
          onMouseLeave={e => (e.currentTarget.style.color = '#4A7FA5')}
        >
          Submit another review
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs tracking-[0.15em] uppercase font-semibold text-slate-600 mb-2">
            Parent Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            placeholder="Your name"
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-xs tracking-[0.15em] uppercase font-semibold text-slate-600 mb-2">
            Child&apos;s Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder="Child's name"
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs tracking-[0.15em] uppercase font-semibold text-slate-600 mb-3">
          Rating <span className="text-red-400">*</span>
        </label>
        <StarRating rating={rating} interactive onRatingChange={setRating} size="lg" />
        {rating > 0 && (
          <p className="text-xs mt-1 font-medium" style={{ color: '#4A7FA5' }}>
            {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs tracking-[0.15em] uppercase font-semibold text-slate-600 mb-2">
          Lesson Type <span className="text-slate-300">(optional)</span>
        </label>
        <select value={lessonType} onChange={(e) => setLessonType(e.target.value)} className="input-field">
          <option value="">Select lesson type...</option>
          <option value="30 min">Single – 30 min</option>
          <option value="45 min">Single – 45 min</option>
          <option value="10-pack 30 min">10-Pack – 30 min</option>
          <option value="10-pack 45 min">10-Pack – 45 min</option>
        </select>
      </div>

      <div>
        <label className="block text-xs tracking-[0.15em] uppercase font-semibold text-slate-600 mb-2">
          Your Review <span className="text-red-400">*</span>
        </label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your experience..."
          rows={4}
          className="input-field resize-none"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send size={15} />
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}
