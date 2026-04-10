import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function GET(request: NextRequest) {
  const password = request.headers.get('x-admin-password') || request.nextUrl.searchParams.get('p') || ''
  if (password !== (process.env.ADMIN_PASSWORD || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!user || !pass) {
    return NextResponse.json({
      success: false,
      error: 'Missing credentials',
      SMTP_USER: user ? 'set' : 'MISSING',
      SMTP_PASS: pass ? 'set' : 'MISSING',
    })
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
  })

  try {
    await transporter.verify()

    await transporter.sendMail({
      from: `"Swim with Shirel" <${user}>`,
      to: user, // send test to yourself
      subject: 'Test email — Swim with Shirel',
      html: '<p>If you received this, email is working correctly! ✅</p>',
    })

    return NextResponse.json({ success: true, message: `Test email sent to ${user}` })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: message })
  }
}
