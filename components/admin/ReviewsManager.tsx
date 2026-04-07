'use client'

import { useEffect, useState } from 'react'
import { Review } from '@/lib/types'
import { format, parseISO } from 'date-fns'
import { Trash2, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import StarRating from '../StarRating'

interface ReviewsManagerProps { adminPassword: string }
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

export default function ReviewsManager({ adminPassword }: ReviewsManagerProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/reviews', { headers: { 'x-admin-password': adminPassword } })
      if (!res.ok) throw new Error('Failed to fetch')
      setReviews(await res.json())
    } catch { setError('Failed to load reviews.') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchReviews() }, [adminPassword])

  const updateStatus = async (id: number, status: string) => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update')
      await fetchReviews()
    } catch { alert('Failed to update review status.') }
    finally { setActionLoading(null) }
  }

  const deleteReview = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE', headers: { 'x-admin-password': adminPassword } })
      if (!res.ok) throw new Error('Failed to delete')
      await fetchReviews()
    } catch { alert('Failed to delete review.') }
    finally { setActionLoading(null) }
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-700 border border-amber-200',
      approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      rejected: 'bg-red-50 text-red-600 border border-red-200',
    }
    return (
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${map[status] || 'bg-slate-100 text-slate-600'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const formatDate = (dateStr: string) => {
    try { return format(parseISO(dateStr.replace(' ', 'T')), 'MMM d, yyyy') }
    catch { return dateStr }
  }

  const filteredReviews = filter === 'all' ? reviews : reviews.filter((r) => r.status === filter)
  const tabs: StatusFilter[] = ['all', 'pending', 'approved', 'rejected']
  const counts: Record<string, number> = {
    all: reviews.length,
    pending: reviews.filter((r) => r.status === 'pending').length,
    approved: reviews.filter((r) => r.status === 'approved').length,
    rejected: reviews.filter((r) => r.status === 'rejected').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-7 h-7 border-[3px] border-sky-600 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-slate-500 text-sm">Loading reviews...</span>
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">{error} <button onClick={fetchReviews} className="underline ml-2">Retry</button></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Reviews ({reviews.length})</h2>
        <button onClick={fetchReviews} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-sky-700 border border-sky-200 hover:bg-sky-50 transition-colors">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              filter === tab ? 'bg-sky-700 text-white shadow-sm' : 'bg-white text-slate-600 border border-sky-100 hover:border-sky-300 hover:text-sky-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
          </button>
        ))}
      </div>

      {filteredReviews.length === 0 ? (
        <div className="text-center py-12 card"><p className="text-slate-400 text-sm">No reviews found.</p></div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => {
            const isLoading = actionLoading === review.id
            return (
              <div key={review.id} className="card p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-slate-400">#{review.id}</span>
                      {statusBadge(review.status)}
                      {review.lesson_type && (
                        <span className="text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-100 px-2 py-0.5 rounded-full">
                          {review.lesson_type}
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-slate-900">{review.parent_name}</p>
                    <p className="text-sm text-slate-400">Parent of {review.child_name}</p>
                  </div>
                  <div className="text-right">
                    <StarRating rating={review.rating} size="sm" />
                    <p className="text-xs text-slate-400 mt-1">{formatDate(review.created_at)}</p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-4 line-clamp-3 leading-relaxed italic">
                  &ldquo;{review.review_text}&rdquo;
                </p>

                <div className="flex flex-wrap gap-2 border-t border-sky-50 pt-4">
                  {review.status !== 'approved' && (
                    <button onClick={() => updateStatus(review.id, 'approved')} disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                      <CheckCircle size={13} /> Approve
                    </button>
                  )}
                  {review.status !== 'rejected' && (
                    <button onClick={() => updateStatus(review.id, 'rejected')} disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
                      <XCircle size={13} /> Reject
                    </button>
                  )}
                  {review.status !== 'pending' && (
                    <button onClick={() => updateStatus(review.id, 'pending')} disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-500 text-white hover:bg-slate-600 disabled:opacity-50 transition-colors">
                      <RefreshCw size={13} /> Set Pending
                    </button>
                  )}
                  <button onClick={() => deleteReview(review.id)} disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 border border-red-100 hover:bg-red-50 disabled:opacity-50 transition-colors ml-auto">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>

                {isLoading && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-sky-600">
                    <div className="w-3 h-3 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
