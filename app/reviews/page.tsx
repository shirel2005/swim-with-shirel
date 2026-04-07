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
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setReviews(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchReviews() }, [])

  return (
    <div className="min-h-screen bg-sky-50/40">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-14">

        <div className="mb-12">
          <p className="section-label">Reviews</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Parent Reviews</h1>
          <p className="text-slate-500 max-w-xl">
            Read what families in Côte Saint-Luc have to say about their experience with Shirel.
          </p>
        </div>

        {/* Review Form */}
        <div className="card p-8 mb-14 max-w-2xl">
          <p className="section-label">Your turn</p>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Leave a Review</h2>
          <ReviewForm onSuccess={fetchReviews} />
        </div>

        {/* Reviews Grid */}
        <div>
          <p className="section-label mb-6">
            {loading ? 'Loading...' : `${reviews.length} Review${reviews.length !== 1 ? 's' : ''}`}
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-7 h-7 border-[3px] border-sky-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 card">
              <p className="text-lg font-semibold text-slate-700 mb-2">No reviews yet</p>
              <p className="text-slate-400 text-sm">Be the first to share your experience.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
