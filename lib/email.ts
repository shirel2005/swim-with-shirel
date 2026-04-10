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

export async function sendBookingConfirmation({
  parentName,
  parentEmail,
  lessonFormat,
  lessonType,
  children,
  slots,
  isWeeklyRequest,
  recurringDay,
  recurringTime,
}: {
  parentName: string
  parentEmail: string
  lessonFormat: string
  lessonType?: string
  children?: string[]
  slots: Array<{ date: string; time_slot: string; duration: number }>
  isWeeklyRequest: boolean
  recurringDay?: string | null
  recurringTime?: string | null
}) {
  const clientId = process.env.GMAIL_CLIENT_ID
  const clientSecret = process.env.GMAIL_CLIENT_SECRET
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    console.warn('[Email] Gmail credentials not set — skipping. Need: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN')
    return
  }

  console.log('[Email] Sending confirmation to:', parentEmail)

  const formatLabel = lessonFormat === 'semi-private' ? 'Semi-Private' : 'Private'

  const sessionsHtml = slots.length > 0
    ? `<p style="margin:0 0 6px 0;font-weight:600;color:#0f172a;">Confirmed Sessions:</p>
       <ul style="margin:0 0 16px 0;padding-left:18px;color:#475569;">
         ${slots.map(s => `<li>${s.date} at ${s.time_slot} (${s.duration} min)</li>`).join('')}
       </ul>`
    : isWeeklyRequest && recurringDay && recurringTime
      ? `<p style="margin:0 0 6px 0;font-weight:600;color:#0f172a;">Weekly Recurring:</p>
         <p style="margin:0 0 16px 0;color:#475569;">Every ${recurringDay} at ${recurringTime}</p>`
      : ''

  const childrenHtml = children && children.length > 0
    ? `<p style="margin:0 0 6px 0;font-weight:600;color:#0f172a;">Child${children.length > 1 ? 'ren' : ''}:</p>
       <ul style="margin:0 0 16px 0;padding-left:18px;color:#475569;">
         ${children.map(c => `<li>${c}</li>`).join('')}
       </ul>`
    : ''

  const lessonTypeHtml = lessonType
    ? `<p style="margin:0 0 12px 0;color:#475569;"><strong>Lesson Type:</strong> ${lessonType}</p>`
    : ''

  const html = `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#0f172a;">
      <div style="border-top:3px solid #0369a1;padding-top:24px;margin-bottom:24px;">
        <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#94a3b8;margin:0 0 8px 0;">Swim with Shirel · Côte Saint-Luc</p>
        <h1 style="font-size:26px;font-weight:700;margin:0 0 4px 0;">Your lesson is confirmed!</h1>
      </div>
      <p style="color:#475569;margin:0 0 20px 0;">Hi <strong>${parentName}</strong>,</p>
      <p style="color:#475569;margin:0 0 24px 0;">Shirel has confirmed your booking. Here's what's scheduled.</p>
      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 12px 0;font-weight:600;">Lesson Format: <span style="color:#0369a1;">${formatLabel}</span></p>
        ${lessonTypeHtml}${childrenHtml}${sessionsHtml}
        <p style="margin:0;color:#64748b;font-size:13px;border-top:1px solid #e0f2fe;padding-top:12px;">
          Payment is due within 2 hours of the lesson — cash or e-transfer accepted.
        </p>
      </div>
      <p style="color:#475569;margin:0 0 8px 0;">To cancel, please do so at least <strong>2 hours before</strong> your lesson.</p>
      <p style="color:#475569;margin:0 0 32px 0;">See you at the pool!<br/><strong>Shirel</strong></p>
      <div style="border-top:1px solid #e0f2fe;padding-top:16px;">
        <p style="font-size:11px;color:#94a3b8;margin:0 0 4px 0;">Swim with Shirel · Private Pool · Côte Saint-Luc, Québec</p>
        <p style="font-size:11px;color:#94a3b8;margin:0;">
          <a href="mailto:${CONTACT_EMAIL}" style="color:#0369a1;">${CONTACT_EMAIL}</a> ·
          <a href="tel:${CONTACT_PHONE_TEL}" style="color:#0369a1;">${CONTACT_PHONE}</a>
        </p>
      </div>
    </div>`

  // Build RFC 2822 email message
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
