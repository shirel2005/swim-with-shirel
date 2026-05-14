import { NextRequest, NextResponse } from 'next/server'
import {
  sendBookingConfirmation,
  sendBookingRequestReceived,
  sendAdminBookingNotification,
  sendAdminConfirmationNotification,
  sendBookingRejection,
  sendAdminRejectionLog,
} from '@/lib/email'
import { CONTACT_EMAIL } from '@/lib/contact'

function checkAdminAuth(req: NextRequest): boolean {
  const password = req.headers.get('x-admin-password') || req.nextUrl.searchParams.get('p') || ''
  return password === (process.env.ADMIN_PASSWORD || '')
}

// Shared mock data for all test emails
const MOCK = {
  bookingId: 0,
  parentName: 'Test Parent',
  parentEmail: CONTACT_EMAIL,
  parentPhone: '514-555-0000',
  lessonFormat: 'private' as const,
  lessonType: '30-min',
  bookingType: 'one-time' as const,
  children: [
    { name: 'Thomas', age: '8', experience: 'basic-skills' },
    { name: 'Charles', age: '10', experience: 'independent' },
  ],
  slots: [
    { date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], time_slot: '16:30', duration: 30 as const, assigned_children: ['Thomas'] },
    { date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], time_slot: '17:00', duration: 30 as const, assigned_children: ['Charles'] },
  ],
  totalPrice: 100,
}

export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const type = request.nextUrl.searchParams.get('type') || 'all'

  // ── Credential check ───────────────────────────────────────────────────────
  const envCheck = {
    GMAIL_CLIENT_ID:     process.env.GMAIL_CLIENT_ID     ? '✅ set' : '❌ MISSING',
    GMAIL_CLIENT_SECRET: process.env.GMAIL_CLIENT_SECRET ? '✅ set' : '❌ MISSING',
    GMAIL_REFRESH_TOKEN: process.env.GMAIL_REFRESH_TOKEN ? '✅ set' : '❌ MISSING',
    ADMIN_PASSWORD:      process.env.ADMIN_PASSWORD       ? '✅ set' : '❌ MISSING',
    CONTACT_EMAIL,
  }

  const missingCreds = !process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET || !process.env.GMAIL_REFRESH_TOKEN
  if (missingCreds) {
    return NextResponse.json({
      success: false,
      error: 'Gmail credentials missing — emails cannot be sent',
      env: envCheck,
    }, { status: 500 })
  }

  // ── OAuth token check ──────────────────────────────────────────────────────
  let tokenOk = false
  let tokenError: string | null = null
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: process.env.GMAIL_REFRESH_TOKEN!,
        client_id: process.env.GMAIL_CLIENT_ID!,
        client_secret: process.env.GMAIL_CLIENT_SECRET!,
      }),
    })
    const tokenData = await tokenRes.json()
    if (tokenData.access_token) {
      tokenOk = true
    } else {
      tokenError = JSON.stringify(tokenData)
    }
  } catch (e) {
    tokenError = String(e)
  }

  if (!tokenOk) {
    return NextResponse.json({
      success: false,
      error: 'OAuth token refresh failed — refresh token may be expired or revoked',
      tokenError,
      env: envCheck,
      fix: 'Re-run the Google OAuth flow to get a new refresh token and update the GMAIL_REFRESH_TOKEN env var in Railway',
    }, { status: 500 })
  }

  // ── Send test emails ───────────────────────────────────────────────────────
  const results: Record<string, { success: boolean; error?: string }> = {}

  const run = async (name: string, fn: () => Promise<void>) => {
    try { await fn(); results[name] = { success: true } }
    catch (e) { results[name] = { success: false, error: String(e) } }
  }

  if (type === 'all' || type === 'request-received') {
    await run('booking_request_received (→ parent)', () => sendBookingRequestReceived(MOCK))
  }
  if (type === 'all' || type === 'admin-notification') {
    await run('admin_booking_notification (→ admin)', () => sendAdminBookingNotification({
      ...MOCK, notes: 'Test booking — please ignore',
    }))
  }
  if (type === 'all' || type === 'confirmation') {
    await run('booking_confirmation (→ parent)', () => sendBookingConfirmation(MOCK))
  }
  if (type === 'all' || type === 'admin-confirmation') {
    await run('admin_confirmation_notification (→ admin)', () => sendAdminConfirmationNotification(MOCK))
  }
  if (type === 'all' || type === 'rejection') {
    await run('booking_rejection (→ parent)', () => sendBookingRejection({ parentName: MOCK.parentName, parentEmail: MOCK.parentEmail }))
  }
  if (type === 'all' || type === 'admin-rejection') {
    await run('admin_rejection_log (→ admin)', () => sendAdminRejectionLog({ bookingId: 0, parentName: MOCK.parentName, parentEmail: MOCK.parentEmail }))
  }

  const allPassed = Object.values(results).every(r => r.success)
  const failedNames = Object.entries(results).filter(([, r]) => !r.success).map(([n]) => n)

  return NextResponse.json({
    success: allPassed,
    oauth: '✅ token OK',
    env: envCheck,
    sent_to: CONTACT_EMAIL,
    results,
    ...(failedNames.length > 0 && { failed: failedNames }),
    note: allPassed
      ? 'All test emails sent — check your inbox at ' + CONTACT_EMAIL
      : 'Some emails failed — see results above for details',
  }, { status: allPassed ? 200 : 500 })
}
