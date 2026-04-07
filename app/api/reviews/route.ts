import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  try {
    const db = getDb()
    const reviews = db
      .prepare(
        `SELECT * FROM reviews WHERE status = 'approved' ORDER BY created_at DESC`
      )
      .all()

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { parent_name, child_name, rating, review_text, lesson_type } = body

    if (!parent_name || typeof parent_name !== 'string' || !parent_name.trim()) {
      return NextResponse.json({ error: 'Parent name is required' }, { status: 400 })
    }
    if (!child_name || typeof child_name !== 'string' || !child_name.trim()) {
      return NextResponse.json({ error: 'Child name is required' }, { status: 400 })
    }
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }
    if (!review_text || typeof review_text !== 'string' || !review_text.trim()) {
      return NextResponse.json({ error: 'Review text is required' }, { status: 400 })
    }

    const db = getDb()
    const result = db
      .prepare(
        `INSERT INTO reviews (parent_name, child_name, rating, review_text, lesson_type)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(
        parent_name.trim(),
        child_name.trim(),
        rating,
        review_text.trim(),
        lesson_type || null
      )

    return NextResponse.json(
      { success: true, message: 'Review submitted successfully', id: result.lastInsertRowid },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}
