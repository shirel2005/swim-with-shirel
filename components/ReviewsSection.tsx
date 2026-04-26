import Link from 'next/link'
import { Review } from '@/lib/types'
import ReviewCard from './ReviewCard'
import { Star, MessageSquarePlus } from 'lucide-react'

interface ReviewsSectionProps {
  reviews: Review[]
}

export default function ReviewsSection({ reviews }: ReviewsSectionProps) {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <p className="section-label">Reviews</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">What Parents Say</h2>
          </div>
          <Link href="/reviews" className="btn-secondary text-sm py-2.5 px-5 rounded-xl shrink-0">
            <MessageSquarePlus size={15} />
            Leave a Review
          </Link>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-16 card">
            <Star size={44} className="mx-auto mb-4" style={{ color: 'rgba(74,127,165,0.25)' }} />
            <p className="text-lg font-semibold text-slate-700 mb-2">No reviews yet. Be the first to leave one!</p>
            <p className="text-slate-400 text-sm mb-6">Share your experience with Shirel&apos;s swim lessons.</p>
            <Link href="/reviews" className="btn-primary text-sm">
              Leave a Review
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
