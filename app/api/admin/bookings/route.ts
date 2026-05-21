import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { checkAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = getDb()
    const { searchParams } = new URL(request.url)

    if (searchParams.get('stats') === 'true') {
      const bookings = db
        .prepare("SELECT status, total_price FROM bookings")
        .all() as Array<{ status: string; total_price: number }>

      let confirmed_earnings = 0
      let pending_earnings = 0
      let confirmed_bookings = 0
      const total_bookings = bookings.length

      for (const b of bookings) {
        const price = b.total_price || 0
        if (b.status === 'confirmed') {
          confirmed_earnings += price
          confirmed_bookings++
        } else if (b.status === 'pending') {
          pending_earnings += price
        }
      }

      return NextResponse.json({ confirmed_earnings, pending_earnings, total_bookings, confirmed_bookings })
    }

    const bookings = db
      .prepare(`
        SELECT b.*, tp.sessions_used as tp_sessions_used, tp.total_sessions as tp_total_sessions
        FROM bookings b
        LEFT JOIN ten_packs tp ON b.ten_pack_id = tp.id
        ORDER BY b.created_at DESC
      `)
      .all()

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}
