import { Review } from '@/lib/types'
import StarRating from './StarRating'
import { format, parseISO } from 'date-fns'

interface ReviewCardProps {
  review: Review
}

export default function ReviewCard({ review }: ReviewCardProps) {
  let formattedDate = ''
  try {
    formattedDate = format(parseISO(review.created_at.replace(' ', 'T')), 'MMMM d, yyyy')
  } catch {
    formattedDate = review.created_at
  }

  return (
    <div className="card p-6 flex flex-col gap-4 hover:shadow-md hover:border-sky-200 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold text-slate-900">{review.parent_name}</p>
          <p className="text-sm text-slate-400">Parent of {review.child_name}</p>
        </div>
        {review.lesson_type && (
          <span className="text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-100 px-2.5 py-1 rounded-full whitespace-nowrap">
            {review.lesson_type}
          </span>
        )}
      </div>

      <StarRating rating={review.rating} size="sm" />

      <p className="text-slate-600 text-sm leading-relaxed flex-1 italic">&ldquo;{review.review_text}&rdquo;</p>

      <p className="text-xs text-slate-300 border-t border-sky-50 pt-3">{formattedDate}</p>
    </div>
  )
}
