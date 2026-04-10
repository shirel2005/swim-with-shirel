import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const password = request.headers.get('x-admin-password') || request.nextUrl.searchParams.get('p') || ''
  if (password !== (process.env.ADMIN_PASSWORD || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clientId = process.env.GMAIL_CLIENT_ID
  const clientSecret = process.env.GMAIL_CLIENT_SECRET
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    return NextResponse.json({
      success: false,
      error: 'Missing Gmail credentials in Railway Variables',
      GMAIL_CLIENT_ID: clientId ? '✅ set' : '❌ MISSING',
      GMAIL_CLIENT_SECRET: clientSecret ? '✅ set' : '❌ MISSING',
      GMAIL_REFRESH_TOKEN: refreshToken ? '✅ set' : '❌ MISSING',
    })
  }

  try {
    // Get access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    })
    const tokenData = await tokenRes.json()
    if (!tokenData.access_token) {
      return NextResponse.json({ success: false, error: 'Failed to get access token', details: tokenData })
    }

    // Send test email to yourself
    const subject = 'Test — Swim with Shirel email working ✅'
    const html = '<p>If you got this, Gmail API email is working correctly!</p>'
    const to = 'swim.with.shirel@gmail.com'
    const raw = Buffer.from([
      `From: "Swim with Shirel" <swim.with.shirel@gmail.com>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=utf-8`,
      ``,
      html,
    ].join('\r\n')).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

    const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw }),
    })

    if (!sendRes.ok) {
      const err = await sendRes.text()
      return NextResponse.json({ success: false, error: 'Gmail API send failed', details: err })
    }

    return NextResponse.json({ success: true, message: `Test email sent to ${to} — check your inbox!` })
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) })
  }
}
