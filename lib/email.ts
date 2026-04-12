import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL } from './contact'

// Uses Gmail HTTP API (OAuth2) — no SMTP ports needed, works on Railway
async function getAccessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: process.env.GMAIL_REFRESH_TOKEN!,
      client_id: process.env.GMAIL_CLIENT_ID!,
      client_secret: process.env.GMAIL_CLIENT_SECRET!,
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error('Failed to get Gmail access token: ' + JSON.stringify(data))
  return data.access_token
}

function formatTime(t: string): string {
  try {
    const [h, m] = t.split(':').map(Number)
    return `${h % 12 === 0 ? 12 : h % 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
  } catch { return t }
}

function formatDate(d: string): string {
  try {
    const dt = new Date(d + 'T00:00:00')
    return dt.toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Toronto' })
  } catch { return d }
}

export async function sendBookingConfirmation({
  parentName,
  parentEmail,
  lessonFormat,
  lessonType,
  bookingType = 'one-time',
  children,
  slots,
  totalPrice,
  isWeeklyRequest,
  recurringDay,
  recurringTime,
}: {
  parentName: string
  parentEmail: string
  lessonFormat: string
  lessonType?: string
  bookingType?: 'one-time' | 'weekly' | '10pack'
  children?: string[]
  slots: Array<{ date: string; time_slot: string; duration: number }>
  totalPrice?: number
  isWeeklyRequest: boolean
  recurringDay?: string | null
  recurringTime?: string | null
}) {
  const clientId = process.env.GMAIL_CLIENT_ID
  const clientSecret = process.env.GMAIL_CLIENT_SECRET
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    console.warn('[Email] Gmail credentials not set — skipping.')
    return
  }

  console.log('[Email] Sending confirmation to:', parentEmail)

  const formatLabel = lessonFormat === 'semi-private' ? 'Semi-Private' : 'Private'

  const lessonTypeLabel = lessonType
    ? lessonType === '30min' ? '30-Minute Lesson'
    : lessonType === '45min' ? '45-Minute Lesson'
    : lessonType === '10pack-30min' ? '10-Pack · 30-Minute Lessons'
    : lessonType === '10pack-45min' ? '10-Pack · 45-Minute Lessons'
    : lessonType
    : null

  // Sessions section
  const sessionsHtml = slots.length > 0
    ? `
      <p style="margin:0 0 8px 0;font-weight:700;color:#0f172a;font-size:14px;">📅 Confirmed Session${slots.length > 1 ? 's' : ''}:</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        ${slots.map(s => `
          <tr>
            <td style="padding:8px 12px;background:#f0f9ff;border-radius:8px;margin-bottom:4px;display:block;">
              <span style="font-weight:600;color:#0369a1;">${formatDate(s.date)}</span>
              <span style="color:#475569;"> at </span>
              <span style="font-weight:600;color:#0369a1;">${formatTime(s.time_slot)}</span>
              <span style="color:#94a3b8;font-size:12px;"> (${s.duration} min)</span>
            </td>
          </tr>
        `).join('<tr><td style="height:4px;"></td></tr>')}
      </table>`
    : isWeeklyRequest && recurringDay && recurringTime
      ? `<p style="margin:0 0 8px 0;font-weight:700;color:#0f172a;font-size:14px;">📅 Weekly Schedule:</p>
         <p style="margin:0 0 16px 0;padding:8px 12px;background:#f0f9ff;border-radius:8px;color:#0369a1;font-weight:600;">
           Every ${recurringDay} at ${formatTime(recurringTime)}
         </p>`
      : ''

  // Children section
  const childrenHtml = children && children.length > 0
    ? `<p style="margin:0 0 8px 0;font-weight:700;color:#0f172a;font-size:14px;">🏊 Swimmer${children.length > 1 ? 's' : ''}:</p>
       <p style="margin:0 0 16px 0;color:#475569;">${children.join(', ')}</p>`
    : ''

  // Price section
  const priceHtml = (totalPrice !== undefined && totalPrice > 0)
    ? `<div style="background:#0369a1;color:#fff;border-radius:10px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;">
         <span style="font-size:14px;font-weight:600;">${bookingType === '10pack' ? '10-Pack Total' : slots.length > 1 ? `Total (${slots.length} sessions)` : 'Session Price'}</span>
         <span style="font-size:22px;font-weight:800;">$${totalPrice}</span>
       </div>`
    : ''

  // Booking type note
  const packNoteHtml = bookingType === '10pack'
    ? `<p style="margin:0 0 16px 0;padding:10px 14px;background:#faf5ff;border:1px solid #e9d5ff;border-radius:8px;color:#7c3aed;font-size:13px;">
         <strong>10-Pack purchased.</strong> This covers 10 lessons. Your sessions will be tracked as they are booked and confirmed.
       </p>`
    : ''

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f8fafc;font-family:Georgia,serif;">
    <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="background:#0369a1;padding:28px 32px;">
        <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#bae6fd;font-family:Arial,sans-serif;">Swim with Shirel · Côte Saint-Luc</p>
        <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;">Your lesson is confirmed! 🎉</h1>
      </div>

      <!-- Body -->
      <div style="padding:28px 32px;">
        <p style="color:#475569;margin:0 0 20px 0;font-size:15px;">Hi <strong style="color:#0f172a;">${parentName}</strong>,</p>
        <p style="color:#475569;margin:0 0 24px 0;">Great news — Shirel has confirmed your booking. Here are the details.</p>

        <!-- Booking summary box -->
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin-bottom:24px;">

          ${priceHtml}

          <!-- Format + type -->
          <div style="margin-bottom:14px;">
            <p style="margin:0 0 6px 0;font-weight:700;color:#0f172a;font-size:14px;">📚 Lesson Details:</p>
            <p style="margin:0;color:#475569;line-height:1.7;">
              ${lessonTypeLabel ? `<strong>Type:</strong> ${lessonTypeLabel}<br/>` : ''}
              <strong>Format:</strong> ${formatLabel}
              ${bookingType === '10pack' ? '<br/><strong>Booking:</strong> 10-Pack' : bookingType === 'weekly' ? '<br/><strong>Booking:</strong> Weekly Recurring' : ''}
            </p>
          </div>

          ${packNoteHtml}
          ${childrenHtml}
          ${sessionsHtml}

          <!-- Payment note -->
          <div style="border-top:1px solid #e2e8f0;padding-top:14px;margin-top:4px;">
            <p style="margin:0;color:#64748b;font-size:13px;">
              💳 Payment is due <strong>within 2 hours of the lesson</strong> — cash or e-transfer accepted.
            </p>
          </div>
        </div>

        <p style="color:#475569;margin:0 0 8px 0;font-size:14px;">To cancel or reschedule, please reach out at least <strong>2 hours before</strong> your lesson.</p>
        <p style="color:#475569;margin:0 0 32px 0;font-size:14px;">See you at the pool! 🏊<br/><strong style="color:#0f172a;">Shirel</strong></p>

        <!-- Contact -->
        <div style="border-top:1px solid #e2e8f0;padding-top:16px;">
          <p style="font-size:11px;color:#94a3b8;margin:0 0 4px 0;font-family:Arial,sans-serif;">Swim with Shirel · Private Pool · Côte Saint-Luc, Québec</p>
          <p style="font-size:11px;color:#94a3b8;margin:0;font-family:Arial,sans-serif;">
            <a href="mailto:${CONTACT_EMAIL}" style="color:#0369a1;text-decoration:none;">${CONTACT_EMAIL}</a>
            &nbsp;·&nbsp;
            <a href="tel:${CONTACT_PHONE_TEL}" style="color:#0369a1;text-decoration:none;">${CONTACT_PHONE}</a>
          </p>
        </div>
      </div>
    </div>
    </body>
    </html>`

  const subject = 'Your swim lesson is confirmed — Swim with Shirel'
  const messageParts = [
    `From: "Swim with Shirel" <${CONTACT_EMAIL}>`,
    `To: ${parentEmail}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    ``,
    html,
  ]
  const raw = Buffer.from(messageParts.join('\r\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  const accessToken = await getAccessToken()

  const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  })

  if (!sendRes.ok) {
    const err = await sendRes.text()
    throw new Error(`Gmail API send failed: ${err}`)
  }

  console.log('[Email] Sent successfully via Gmail API to:', parentEmail)
}
