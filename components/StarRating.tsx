'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  interactive?: boolean
  onRatingChange?: (rating: number) => void
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = { sm: 14, md: 20, lg: 28 }

export default function StarRating({ rating, interactive = false, onRatingChange, size = 'md' }: StarRatingProps) {
  const [hovered, setHovered] = useState<number>(0)
  const starSize = sizeMap[size]
  const displayRating = interactive && hovered > 0 ? hovered : rating

  return (
    <div className="flex items-center gap-0.5" role={interactive ? 'radiogroup' : undefined}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= displayRating
        return (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
            onMouseEnter={interactive ? () => setHovered(star) : undefined}
            onMouseLeave={interactive ? () => setHovered(0) : undefined}
            className={`transition-all duration-150 ease-in-out ${
              interactive
                ? 'cursor-pointer hover:scale-125 focus:outline-none focus:ring-2 focus:ring-[#4A7FA5]/40 focus:ring-offset-1 rounded'
                : 'cursor-default'
            }`}
            aria-label={interactive ? `Rate ${star} out of 5 stars` : undefined}
            disabled={!interactive}
          >
            <Star
              size={starSize}
              className={filled ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}
            />
          </button>
        )
      })}
    </div>
  )
}
