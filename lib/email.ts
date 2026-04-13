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

// RFC 2047 Base64 encoding for email subject — required for emojis & non-ASCII
function encodeSubject(text: string): string {
  return `=?UTF-8?B?${Buffer.from(text, 'utf-8').toString('base64')}?=`
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
    return dt.toLocaleDateString('en-CA', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      timeZone: 'America/Toronto',
    })
  } catch { return d }
}

function experienceLabel(exp: string): string {
  const map: Record<string, string> = {
    'beginner': 'Beginner',
    'some-comfort': 'Some Comfort',
    'basic-skills': 'Basic Skills',
    'independent': 'Swims Independently',
    'advanced': 'Advanced',
  }
  return map[exp] || exp
}

export interface ChildInfo {
  name: string
  age?: string
  experience?: string
}

export async function sendBookingConfirmation({
  parentName,
  parentEmail,
  lessonFormat,
  lessonType,
  bookingType = 'one-time',
  children = [],
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
  children?: ChildInfo[] | string[]
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

  // Normalise children to ChildInfo[]
  const childList: ChildInfo[] = children.map(c =>
    typeof c === 'string' ? { name: c } : c
  )

  // Labels
  const formatLabel = lessonFormat === 'semi-private' ? 'Semi-Private' : 'Private'

  const durationLabel = lessonType?.includes('45') ? '45-Minute Lesson' : '30-Minute Lesson'

  const bookingTypeLabel =
    bookingType === '10pack' ? '10-Pack' :
    bookingType === 'weekly' ? 'Weekly Recurring' :
    'One-Time'

  const priceLabel =
    bookingType === '10pack' ? 'Package Total' :
    slots.length > 1 ? `Total (${slots.length} sessions)` :
    'Session Price'

  // ── Shared style tokens ────────────────────────────────────────────────────
  const blue = '#2e6fa3'
  const blueMid = '#e8f2fb'
  const blueLight = '#f0f7ff'
  const textDark = '#1a2332'
  const textMid = '#4a5568'
  const textLight = '#718096'
  const divider = '#e8edf2'

  // ── Row helper for detail table ────────────────────────────────────────────
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:9px 0;border-bottom:1px solid ${divider};color:${textLight};font-size:13px;font-family:Arial,sans-serif;width:110px;vertical-align:top;">${label}</td>
      <td style="padding:9px 0;border-bottom:1px solid ${divider};color:${textDark};font-size:13px;font-family:Arial,sans-serif;font-weight:600;vertical-align:top;">${value}</td>
    </tr>`

  // ── Lesson detail rows ─────────────────────────────────────────────────────
  const lessonRows = [
    lessonType ? row('Duration', durationLabel) : '',
    row('Format', formatLabel),
    row('Booking', bookingTypeLabel),
  ].join('')

  // ── Price highlight ────────────────────────────────────────────────────────
  const priceSection = (totalPrice !== undefined && totalPrice > 0) ? `
    <div style="background:${blueLight};border:1px solid ${blueMid};border-radius:10px;padding:16px 20px;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;">
      <span style="font-size:13px;color:${textMid};font-family:Arial,sans-serif;">${priceLabel}</span>
      <span style="font-size:22px;font-weight:700;color:${blue};font-family:Arial,sans-serif;">$${totalPrice}</span>
    </div>` : ''

  // ── Children section ───────────────────────────────────────────────────────
  const childrenSection = childList.length > 0 ? `
    <div style="margin-bottom:24px;">
      <p style="margin:0 0 10px 0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:${textLight};font-family:Arial,sans-serif;">
        ${childList.length === 1 ? 'Swimmer' : 'Swimmers'}
      </p>
      ${childList.map(c => `
        <div style="background:#fafbfc;border:1px solid ${divider};border-radius:8px;padding:12px 16px;margin-bottom:8px;">
          <p style="margin:0 0 3px 0;font-size:14px;font-weight:700;color:${textDark};font-family:Arial,sans-serif;">${c.name}</p>
          ${(c.age || c.experience) ? `
            <p style="margin:0;font-size:12px;color:${textLight};font-family:Arial,sans-serif;">
              ${[c.age ? `Age ${c.age}` : '', c.experience ? experienceLabel(c.experience) : ''].filter(Boolean).join(' · ')}
            </p>` : ''}
        </div>`).join('')}
    </div>` : ''

  // ── Sessions section ───────────────────────────────────────────────────────
  let sessionsSection = ''
  if (slots.length > 0) {
    sessionsSection = `
      <div style="margin-bottom:24px;">
        <p style="margin:0 0 10px 0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:${textLight};font-family:Arial,sans-serif;">
          Confirmed Session${slots.length > 1 ? 's' : ''}
        </p>
        ${slots.map(s => `
          <div style="display:flex;align-items:center;justify-content:space-between;background:${blueLight};border:1px solid ${blueMid};border-radius:8px;padding:11px 16px;margin-bottom:6px;">
            <span style="font-size:13px;font-weight:600;color:${textDark};font-family:Arial,sans-serif;">${formatDate(s.date)}</span>
            <span style="font-size:13px;color:${blue};font-weight:600;font-family:Arial,sans-serif;white-space:nowrap;margin-left:12px;">${formatTime(s.time_slot)}&nbsp;<span style="color:${textLight};font-weight:400;">(${s.duration}&nbsp;min)</span></span>
          </div>`).join('')}
      </div>`
  } else if (isWeeklyRequest && recurringDay && recurringTime) {
    sessionsSection = `
      <div style="margin-bottom:24px;">
        <p style="margin:0 0 10px 0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:${textLight};font-family:Arial,sans-serif;">Weekly Schedule</p>
        <div style="background:${blueLight};border:1px solid ${blueMid};border-radius:8px;padding:12px 16px;">
          <span style="font-size:13px;font-weight:600;color:${textDark};font-family:Arial,sans-serif;">Every ${recurringDay} at ${formatTime(recurringTime)}</span>
        </div>
      </div>`
  }

  // ── 10-pack note ───────────────────────────────────────────────────────────
  const packNote = bookingType === '10pack' ? `
    <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:8px;padding:12px 16px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#6b21a8;font-family:Arial,sans-serif;line-height:1.6;">
        <strong>10-Pack active.</strong> Your pack covers 10 lessons total. Book sessions one or two at a time — your remaining credits are always saved.
      </p>
    </div>` : ''

  // ── Full HTML ──────────────────────────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f8;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 16px;">
  <tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">

    <!-- Header -->
    <tr><td style="background:${blue};border-radius:14px 14px 0 0;padding:28px 36px 24px;">
      <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#a8cce8;font-family:Arial,sans-serif;">Swim with Shirel &middot; C&ocirc;te Saint-Luc</p>
      <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;font-family:Georgia,serif;line-height:1.3;">Your lesson is confirmed &#127881;</h1>
    </td></tr>

    <!-- Body -->
    <tr><td style="background:#ffffff;border-radius:0 0 14px 14px;padding:32px 36px;">

      <p style="margin:0 0 6px 0;font-size:15px;color:${textDark};font-family:Georgia,serif;">Hi <strong>${parentName}</strong>,</p>
      <p style="margin:0 0 28px 0;font-size:14px;color:${textMid};font-family:Arial,sans-serif;line-height:1.65;">Shirel has confirmed your booking. Here&rsquo;s everything you need.</p>

      ${priceSection}

      <!-- Lesson details -->
      <div style="margin-bottom:24px;">
        <p style="margin:0 0 10px 0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:${textLight};font-family:Arial,sans-serif;">Lesson Details</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${lessonRows}
        </table>
      </div>

      ${packNote}
      ${childrenSection}
      ${sessionsSection}

      <!-- Payment -->
      <div style="background:#fafbfc;border:1px solid ${divider};border-radius:8px;padding:13px 16px;margin-bottom:28px;">
        <p style="margin:0;font-size:13px;color:${textMid};font-family:Arial,sans-serif;line-height:1.6;">
          &#128179;&nbsp; Payment is due <strong>within 2 hours of the lesson</strong> &mdash; cash or e-transfer accepted.
        </p>
      </div>

      <!-- Closing -->
      <p style="margin:0 0 4px 0;font-size:14px;color:${textMid};font-family:Arial,sans-serif;line-height:1.7;">To cancel or reschedule, please reach out at least <strong>2 hours before</strong> your lesson.</p>
      <p style="margin:0 0 28px 0;font-size:14px;color:${textMid};font-family:Arial,sans-serif;line-height:1.7;">Looking forward to seeing you in the pool!</p>
      <p style="margin:0 0 0 0;font-size:14px;color:${textDark};font-family:Georgia,serif;font-style:italic;">&mdash; Shirel</p>

      <!-- Divider -->
      <div style="border-top:1px solid ${divider};margin:28px 0 16px;"></div>

      <!-- Footer -->
      <p style="margin:0 0 3px 0;font-size:11px;color:${textLight};font-family:Arial,sans-serif;">Swim with Shirel &middot; Private Pool &middot; C&ocirc;te Saint-Luc, Qu&eacute;bec</p>
      <p style="margin:0;font-size:11px;font-family:Arial,sans-serif;">
        <a href="mailto:${CONTACT_EMAIL}" style="color:${blue};text-decoration:none;">${CONTACT_EMAIL}</a>
        <span style="color:${textLight};">&nbsp;&middot;&nbsp;</span>
        <a href="tel:${CONTACT_PHONE_TEL}" style="color:${blue};text-decoration:none;">${CONTACT_PHONE}</a>
      </p>

    </td></tr>
  </table>
  </td></tr>
</table>
</body>
</html>`

  // Subject encoded as RFC 2047 Base64 to handle emojis & special chars correctly
  const subject = encodeSubject('Your swim lesson is confirmed \u{1F389} | Swim with Shirel')

  const messageParts = [
    `From: "Swim with Shirel" <${CONTACT_EMAIL}>`,
    `To: ${parentEmail}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    `Content-Transfer-Encoding: 8bit`,
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
