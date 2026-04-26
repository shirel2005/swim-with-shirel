import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL } from './contact'

// ─── Gmail OAuth2 ─────────────────────────────────────────────────────────────
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

async function sendRaw(to: string, subject: string, html: string) {
  const accessToken = await getAccessToken()
  const encoded = encodeSubject(subject)
  const parts = [
    `From: "Swim with Shirel" <${CONTACT_EMAIL}>`,
    `To: ${to}`,
    `Subject: ${encoded}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    `Content-Transfer-Encoding: 8bit`,
    ``,
    html,
  ]
  const raw = Buffer.from(parts.join('\r\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw }),
  })
  if (!res.ok) throw new Error(`Gmail API send failed: ${await res.text()}`)
}

// RFC 2047 Base64 encoding — required for emojis & non-ASCII in subject headers
function encodeSubject(text: string): string {
  return `=?UTF-8?B?${Buffer.from(text, 'utf-8').toString('base64')}?=`
}

// ─── Design tokens — site brand palette ───────────────────────────────────────
const serif     = `'Playfair Display', Georgia, 'Times New Roman', serif`
const navy      = '#0D1F3C'   // site primary — headers, bold text
const brandBlue = '#4A7FA5'   // brand accent — links, labels, highlights
const lightBlue = '#6AAFD4'   // soft accent — eyebrow text in header
const cream     = '#F8F4ED'   // page background, header text
const cardBg    = '#ffffff'
const cardBorder= '#E4E9EE'   // rgba(13,31,60,0.09) approximated
const tintBg    = '#EEF4F9'   // rgba(74,127,165,0.09) approximated — info panels
const tintBorder= '#D4E4F0'   // rgba(74,127,165,0.22) approximated
const bodyText  = '#374151'   // readable mid-dark
const mutedText = '#6B7280'   // secondary body
const dimText   = '#9CA3AF'   // timestamps, footer
const divider   = '#E5E7EB'
const pageBg    = '#F5F6F8'

// ─── Shared component builders ────────────────────────────────────────────────
const label = (text: string) =>
  `<p style="margin:0 0 10px 0;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:${brandBlue};font-weight:700;font-family:${serif};">${text}</p>`

const card = (inner: string) =>
  `<div style="background:${cardBg};border:1px solid ${cardBorder};border-radius:14px;padding:20px 22px;margin-bottom:18px;">${inner}</div>`

const tintPanel = (inner: string) =>
  `<div style="background:${tintBg};border:1px solid ${tintBorder};border-radius:12px;padding:14px 18px;margin-bottom:18px;">${inner}</div>`

const detailRow = (lbl: string, val: string) => `
  <tr>
    <td style="padding:8px 0;border-bottom:1px solid ${divider};color:${dimText};font-size:13px;font-family:${serif};width:110px;vertical-align:top;">${lbl}</td>
    <td style="padding:8px 0;border-bottom:1px solid ${divider};color:${navy};font-size:13px;font-family:${serif};font-weight:600;vertical-align:top;">${val}</td>
  </tr>`

// ─── Shared email shell ───────────────────────────────────────────────────────
// Both emails use exactly this wrapper — only the heading and body content differ.
function buildEmail(heading: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,700&display=swap" rel="stylesheet">
  <style>@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,700&display=swap');</style>
</head>
<body style="margin:0;padding:0;background:${pageBg};font-family:${serif};">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${pageBg};padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">

  <!-- ── Header ── -->
  <tr><td style="background:${navy};border-radius:16px 16px 0 0;padding:30px 36px 28px;">
    <p style="margin:0 0 12px 0;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:${lightBlue};font-family:${serif};font-weight:700;opacity:0.75;">Swim with Shirel &nbsp;&middot;&nbsp; C&ocirc;te Saint-Luc</p>
    <h1 style="margin:0;font-size:26px;font-weight:700;color:${cream};font-family:${serif};line-height:1.25;letter-spacing:-0.01em;font-style:italic;">${heading}</h1>
  </td></tr>

  <!-- ── Body ── -->
  <tr><td style="background:${cardBg};border-radius:0 0 16px 16px;padding:32px 36px 36px;">

    ${bodyHtml}

    <!-- Divider -->
    <div style="border-top:1px solid ${divider};margin:28px 0 18px;"></div>

    <!-- Footer -->
    <p style="margin:0 0 4px 0;font-size:11px;color:${dimText};font-family:${serif};">Swim with Shirel &nbsp;&middot;&nbsp; Private Pool &nbsp;&middot;&nbsp; C&ocirc;te Saint-Luc, Qu&eacute;bec</p>
    <p style="margin:0;font-size:11px;font-family:${serif};">
      <a href="mailto:${CONTACT_EMAIL}" style="color:${brandBlue};text-decoration:none;">${CONTACT_EMAIL}</a>
      <span style="color:${dimText};">&nbsp;&middot;&nbsp;</span>
      <a href="tel:${CONTACT_PHONE_TEL}" style="color:${brandBlue};text-decoration:none;">${CONTACT_PHONE}</a>
    </p>

  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(t: string): string {
  try {
    const [h, m] = t.split(':').map(Number)
    return `${h % 12 === 0 ? 12 : h % 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
  } catch { return t }
}

function formatDate(d: string): string {
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-CA', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      timeZone: 'America/Toronto',
    })
  } catch { return d }
}

function experienceLabel(exp: string): string {
  const map: Record<string, string> = {
    'beginner': 'Beginner', 'some-comfort': 'Some Comfort',
    'basic-skills': 'Basic Skills', 'independent': 'Swims Independently', 'advanced': 'Advanced',
  }
  return map[exp] || exp
}

// ─── Exported types ───────────────────────────────────────────────────────────
export interface ChildInfo { name: string; age?: string; experience?: string }

// ─── Confirmation email ───────────────────────────────────────────────────────
export async function sendBookingConfirmation({
  parentName, parentEmail, lessonFormat, lessonType,
  bookingType = 'one-time', children = [], slots, totalPrice,
  isWeeklyRequest, recurringDay, recurringTime,
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
  const creds = process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN
  if (!creds) { console.warn('[Email] Gmail credentials not set — skipping.'); return }

  console.log('[Email] Sending confirmation to:', parentEmail)

  const childList: ChildInfo[] = children.map(c => typeof c === 'string' ? { name: c } : c)

  const formatLabel   = lessonFormat === 'semi-private' ? 'Semi-Private' : 'Private'
  const durationLabel = lessonType?.includes('45') ? '45-Minute' : '30-Minute'
  const bookingLabel  = bookingType === '10pack' ? '10-Pack' : bookingType === 'weekly' ? 'Weekly Recurring' : 'One-Time'
  const priceLabel    = bookingType === '10pack' ? 'Package Total' : slots.length > 1 ? `Total (${slots.length} sessions)` : 'Session Price'

  // Price
  const priceBlock = (totalPrice !== undefined && totalPrice > 0) ? card(`
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="font-size:13px;color:${mutedText};font-family:${serif};">${priceLabel}</td>
        <td align="right" style="font-size:28px;font-weight:700;color:${navy};font-family:${serif};letter-spacing:-0.02em;">$${totalPrice}</td>
      </tr>
    </table>`) : ''

  // Lesson details
  const detailsBlock = card(`
    ${label('Lesson Details')}
    <table width="100%" cellpadding="0" cellspacing="0">
      ${lessonType ? detailRow('Duration', durationLabel) : ''}
      ${detailRow('Format', formatLabel)}
      ${detailRow('Booking', bookingLabel)}
    </table>`)

  // 10-pack note
  const packBlock = bookingType === '10pack' ? tintPanel(`
    <p style="margin:0;font-size:13px;color:${navy};font-family:${serif};line-height:1.65;">
      <strong>10-Pack active.</strong>&nbsp; Your pack covers 10 lessons. Book one or two sessions at a time — remaining credits are always saved.
    </p>`) : ''

  // Children
  const childrenBlock = childList.length > 0 ? card(`
    ${label(childList.length === 1 ? 'Swimmer' : 'Swimmers')}
    ${childList.map((c, i) => `
      <div style="${i > 0 ? `border-top:1px solid ${divider};padding-top:12px;margin-top:12px;` : ''}">
        <p style="margin:0 0 2px 0;font-size:15px;font-weight:700;color:${navy};font-family:${serif};">${c.name}</p>
        ${(c.age || c.experience) ? `<p style="margin:0;font-size:12px;color:${mutedText};font-family:${serif};">${[c.age ? `Age ${c.age}` : '', c.experience ? experienceLabel(c.experience) : ''].filter(Boolean).join(' &middot; ')}</p>` : ''}
      </div>`).join('')}`) : ''

  // Sessions
  let sessionsBlock = ''
  if (slots.length > 0) {
    sessionsBlock = card(`
      ${label(`Confirmed Session${slots.length > 1 ? 's' : ''}`)}
      ${slots.map((s, i) => `
        <div style="display:flex;align-items:center;justify-content:space-between;background:${tintBg};border:1px solid ${tintBorder};border-radius:10px;padding:10px 14px;${i > 0 ? 'margin-top:6px;' : ''}">
          <span style="font-size:13px;font-weight:600;color:${navy};font-family:${serif};">${formatDate(s.date)}</span>
          <span style="font-size:13px;color:${brandBlue};font-weight:600;font-family:${serif};white-space:nowrap;margin-left:10px;">${formatTime(s.time_slot)}&thinsp;<span style="color:${dimText};font-size:12px;font-weight:400;">${s.duration}&thinsp;min</span></span>
        </div>`).join('')}`)
  } else if (isWeeklyRequest && recurringDay && recurringTime) {
    sessionsBlock = card(`
      ${label('Weekly Schedule')}
      <div style="background:${tintBg};border:1px solid ${tintBorder};border-radius:10px;padding:10px 14px;">
        <span style="font-size:13px;font-weight:600;color:${navy};font-family:${serif};">Every ${recurringDay} at ${formatTime(recurringTime)}</span>
      </div>`)
  }

  // Payment note
  const paymentNote = tintPanel(`
    <p style="margin:0;font-size:13px;color:${bodyText};font-family:${serif};line-height:1.65;">
      &#128179;&nbsp; Payment is due <strong>within 2 hours of the lesson</strong>. Cash or e-transfer accepted.
    </p>`)

  const body = `
    <p style="margin:0 0 6px 0;font-size:16px;color:${navy};font-family:${serif};">Hi <strong>${parentName}</strong>,</p>
    <p style="margin:0 0 24px 0;font-size:14px;color:${mutedText};font-family:${serif};line-height:1.75;">Shirel has confirmed your booking. Here&rsquo;s everything you need to know.</p>

    ${priceBlock}
    ${detailsBlock}
    ${packBlock}
    ${childrenBlock}
    ${sessionsBlock}
    ${paymentNote}

    <p style="margin:0 0 4px 0;font-size:14px;color:${mutedText};font-family:${serif};line-height:1.75;">To cancel or reschedule, please reach out at least <strong>2 hours before</strong> your lesson.</p>
    <p style="margin:0 0 4px 0;font-size:14px;color:${mutedText};font-family:${serif};line-height:1.75;">Looking forward to seeing you in the pool!</p>
    <p style="margin:10px 0 0 0;font-size:15px;color:${navy};font-family:${serif};font-style:italic;">Shirel</p>`

  const html = buildEmail('Your lesson is confirmed.', body)
  await sendRaw(parentEmail, 'Your swim lesson is confirmed | Swim with Shirel', html)
  console.log('[Email] Confirmation sent to:', parentEmail)
}

// ─── Rejection / cancellation email ──────────────────────────────────────────
export async function sendBookingRejection({
  parentName,
  parentEmail,
}: {
  parentName: string
  parentEmail: string
}) {
  const creds = process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN
  if (!creds) { console.warn('[Email] Gmail credentials not set — skipping.'); return }

  console.log('[Email] Sending cancellation notice to:', parentEmail)

  const body = `
    <p style="margin:0 0 6px 0;font-size:16px;color:${navy};font-family:${serif};">Hi <strong>${parentName}</strong>,</p>
    <p style="margin:0 0 24px 0;font-size:14px;color:${mutedText};font-family:${serif};line-height:1.75;">
      Unfortunately, I&rsquo;m unable to accommodate your requested booking at this time. This may be due to a scheduling conflict or unavailability on the requested date.
    </p>

    ${tintPanel(`
      <p style="margin:0 0 6px 0;font-size:13px;font-weight:700;color:${navy};font-family:${serif};">Still want to book?</p>
      <p style="margin:0;font-size:13px;color:${bodyText};font-family:${serif};line-height:1.65;">
        Head back to the booking page to choose a different date or time, or reply to this email and I&rsquo;ll help you find a slot that works.
      </p>`)}

    <p style="margin:0 0 4px 0;font-size:14px;color:${mutedText};font-family:${serif};line-height:1.75;">Sorry for any inconvenience, and I hope to see you in the pool soon!</p>
    <p style="margin:10px 0 0 0;font-size:15px;color:${navy};font-family:${serif};font-style:italic;">Shirel</p>`

  const html = buildEmail('Booking update.', body)
  await sendRaw(parentEmail, 'Booking update | Swim with Shirel', html)
  console.log('[Email] Cancellation notice sent to:', parentEmail)
}
