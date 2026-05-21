import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { checkAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = getDb()
    const reviews = db
      .prepare('SELECT * FROM reviews ORDER BY created_at DESC')
      .all()

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}
