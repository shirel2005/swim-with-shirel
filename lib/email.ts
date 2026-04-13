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

// RFC 2047 Base64 encoding — required for emojis & non-ASCII in email subject headers
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

// ─── Website design tokens (exact Tailwind values) ───────────────────────────
// Font: Playfair Display — matches the site exactly.
// Gmail on web supports Google Fonts via @import; other clients fall back to Georgia.
const serif = `'Playfair Display', Georgia, 'Times New Roman', serif`

// Colors from tailwind.config + globals.css
const sky700   = '#0369a1'   // primary blue — btn-primary, section headings
const sky600   = '#0284c7'   // section-label color
const sky100   = '#e0f2fe'   // card border
const sky50    = '#f0f9ff'   // card/highlight background
const slate900 = '#0f172a'   // body text dark
const slate600 = '#475569'   // body text mid
const slate500 = '#64748b'   // body text lighter
const slate400 = '#94a3b8'   // muted text
const slate200 = '#e2e8f0'   // divider
const slate50  = '#f8fafc'   // page / outer background

// ─── Section label — matches .section-label in globals.css ───────────────────
const sectionLabel = (text: string) =>
  `<p style="margin:0 0 10px 0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${sky600};font-weight:600;font-family:${serif};">${text}</p>`

// ─── Card wrapper — matches .card (rounded-2xl border border-sky-100 shadow-sm) ─
const cardOpen  = `<div style="background:#ffffff;border:1px solid ${sky100};border-radius:16px;padding:20px 24px;margin-bottom:20px;">`
const cardClose = `</div>`

// ─── Detail row ───────────────────────────────────────────────────────────────
const detailRow = (label: string, value: string) => `
  <tr>
    <td style="padding:8px 0;border-bottom:1px solid ${slate200};color:${slate400};font-size:13px;font-family:${serif};width:108px;vertical-align:top;">${label}</td>
    <td style="padding:8px 0;border-bottom:1px solid ${slate200};color:${slate900};font-size:13px;font-family:${serif};font-weight:600;vertical-align:top;">${value}</td>
  </tr>`

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
  const formatLabel    = lessonFormat === 'semi-private' ? 'Semi-Private' : 'Private'
  const durationLabel  = lessonType?.includes('45') ? '45-Minute Lesson' : '30-Minute Lesson'
  const bookingLabel   = bookingType === '10pack' ? '10-Pack' : bookingType === 'weekly' ? 'Weekly Recurring' : 'One-Time'
  const priceLabel     = bookingType === '10pack' ? 'Package Total' : slots.length > 1 ? `Total (${slots.length} sessions)` : 'Session Price'

  // ── Price card ─────────────────────────────────────────────────────────────
  // Matches the sky-50 / sky-100 highlighted sections on the website
  const priceCard = (totalPrice !== undefined && totalPrice > 0) ? `
    ${cardOpen}
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:13px;color:${slate500};font-family:${serif};">${priceLabel}</td>
          <td align="right" style="font-size:26px;font-weight:700;color:${sky700};font-family:${serif};letter-spacing:-0.02em;">$${totalPrice}</td>
        </tr>
      </table>
    ${cardClose}` : ''

  // ── Lesson detail card ─────────────────────────────────────────────────────
  const lessonCard = `
    ${cardOpen}
      ${sectionLabel('Lesson Details')}
      <table width="100%" cellpadding="0" cellspacing="0">
        ${lessonType ? detailRow('Duration', durationLabel) : ''}
        ${detailRow('Format', formatLabel)}
        ${detailRow('Booking', bookingLabel)}
      </table>
    ${cardClose}`

  // ── 10-pack note ───────────────────────────────────────────────────────────
  const packNote = bookingType === '10pack' ? `
    <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:12px;padding:14px 18px;margin-bottom:20px;">
      <p style="margin:0;font-size:13px;color:#6b21a8;font-family:${serif};line-height:1.65;">
        <strong>10-Pack active.</strong>&nbsp; Your pack covers 10 lessons. Book one or two sessions at a time — remaining credits are always saved.
      </p>
    </div>` : ''

  // ── Children card ──────────────────────────────────────────────────────────
  const childrenCard = childList.length > 0 ? `
    ${cardOpen}
      ${sectionLabel(childList.length === 1 ? 'Swimmer' : 'Swimmers')}
      ${childList.map((c, i) => `
        <div style="${i > 0 ? `border-top:1px solid ${slate200};padding-top:12px;margin-top:12px;` : ''}">
          <p style="margin:0 0 2px 0;font-size:15px;font-weight:700;color:${slate900};font-family:${serif};">${c.name}</p>
          ${(c.age || c.experience) ? `<p style="margin:0;font-size:12px;color:${slate500};font-family:${serif};">${[c.age ? `Age ${c.age}` : '', c.experience ? experienceLabel(c.experience) : ''].filter(Boolean).join(' &middot; ')}</p>` : ''}
        </div>`).join('')}
    ${cardClose}` : ''

  // ── Sessions card ──────────────────────────────────────────────────────────
  let sessionsCard = ''
  if (slots.length > 0) {
    sessionsCard = `
      ${cardOpen}
        ${sectionLabel(`Confirmed Session${slots.length > 1 ? 's' : ''}`)}
        ${slots.map((s, i) => `
          <div style="display:flex;align-items:center;justify-content:space-between;background:${sky50};border:1px solid ${sky100};border-radius:10px;padding:10px 14px;${i > 0 ? 'margin-top:6px;' : ''}">
            <span style="font-size:13px;font-weight:600;color:${slate900};font-family:${serif};">${formatDate(s.date)}</span>
            <span style="font-size:13px;color:${sky700};font-weight:600;font-family:${serif};white-space:nowrap;margin-left:10px;">${formatTime(s.time_slot)}&thinsp;<span style="color:${slate400};font-size:12px;font-weight:400;">${s.duration}&thinsp;min</span></span>
          </div>`).join('')}
      ${cardClose}`
  } else if (isWeeklyRequest && recurringDay && recurringTime) {
    sessionsCard = `
      ${cardOpen}
        ${sectionLabel('Weekly Schedule')}
        <div style="background:${sky50};border:1px solid ${sky100};border-radius:10px;padding:10px 14px;">
          <span style="font-size:13px;font-weight:600;color:${slate900};font-family:${serif};">Every ${recurringDay} at ${formatTime(recurringTime)}</span>
        </div>
      ${cardClose}`
  }

  // ── Full HTML ──────────────────────────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">
  <style>@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap');</style>
</head>
<body style="margin:0;padding:0;background:${slate50};font-family:${serif};">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${slate50};padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">

  <!-- Header — matches sky-700 sections on site (stats strip, contact CTA) -->
  <tr><td style="background:${sky700};border-radius:16px 16px 0 0;padding:30px 36px 26px;">
    <p style="margin:0 0 10px 0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#bae6fd;font-family:${serif};font-weight:600;">Swim with Shirel &middot; C&ocirc;te Saint-Luc</p>
    <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;font-family:${serif};line-height:1.25;letter-spacing:-0.01em;">Your lesson is confirmed &#127881;</h1>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#ffffff;border-radius:0 0 16px 16px;padding:32px 36px 36px;">

    <p style="margin:0 0 6px 0;font-size:16px;color:${slate900};font-family:${serif};">Hi <strong>${parentName}</strong>,</p>
    <p style="margin:0 0 28px 0;font-size:14px;color:${slate600};font-family:${serif};line-height:1.7;">Shirel has confirmed your booking. Here&rsquo;s everything you need to know.</p>

    ${priceCard}
    ${lessonCard}
    ${packNote}
    ${childrenCard}
    ${sessionsCard}

    <!-- Payment note — matches the soft info cards on the site -->
    <div style="background:${sky50};border:1px solid ${sky100};border-radius:12px;padding:13px 18px;margin-bottom:28px;">
      <p style="margin:0;font-size:13px;color:${slate600};font-family:${serif};line-height:1.65;">
        &#128179;&nbsp; Payment is due <strong>within 2 hours of the lesson</strong> &mdash; cash or e-transfer accepted.
      </p>
    </div>

    <!-- Closing -->
    <p style="margin:0 0 4px 0;font-size:14px;color:${slate600};font-family:${serif};line-height:1.7;">To cancel or reschedule, please reach out at least <strong>2 hours before</strong> your lesson.</p>
    <p style="margin:0 0 4px 0;font-size:14px;color:${slate600};font-family:${serif};line-height:1.7;">Looking forward to seeing you in the pool!</p>
    <p style="margin:6px 0 0 0;font-size:15px;color:${slate900};font-family:${serif};font-style:italic;">&mdash; Shirel</p>

    <!-- Divider -->
    <div style="border-top:1px solid ${slate200};margin:28px 0 18px;"></div>

    <!-- Footer -->
    <p style="margin:0 0 3px 0;font-size:11px;color:${slate400};font-family:${serif};">Swim with Shirel &middot; Private Pool &middot; C&ocirc;te Saint-Luc, Qu&eacute;bec</p>
    <p style="margin:0;font-size:11px;font-family:${serif};">
      <a href="mailto:${CONTACT_EMAIL}" style="color:${sky700};text-decoration:none;">${CONTACT_EMAIL}</a>
      <span style="color:${slate400};">&nbsp;&middot;&nbsp;</span>
      <a href="tel:${CONTACT_PHONE_TEL}" style="color:${sky700};text-decoration:none;">${CONTACT_PHONE}</a>
    </p>

  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`

  // Subject: RFC 2047 Base64 encoded so emoji renders correctly in Gmail
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
