import nodemailer from 'nodemailer'
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL } from './contact'

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
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
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[Email] SMTP_USER or SMTP_PASS not set — skipping confirmation email')
    return
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER
  const formatLabel = lessonFormat === 'semi-private' ? 'Semi-Private' : 'Private'

  let sessionsHtml = ''
  if (slots.length > 0) {
    sessionsHtml = `
      <p style="margin:0 0 6px 0;font-weight:600;color:#0f172a;">Confirmed Sessions:</p>
      <ul style="margin:0 0 16px 0;padding-left:18px;color:#475569;">
        ${slots.map(s => `<li>${s.date} at ${s.time_slot} (${s.duration} min)</li>`).join('')}
      </ul>`
  } else if (isWeeklyRequest && recurringDay && recurringTime) {
    sessionsHtml = `
      <p style="margin:0 0 6px 0;font-weight:600;color:#0f172a;">Weekly Recurring Request:</p>
      <p style="margin:0 0 16px 0;color:#475569;">Every ${recurringDay} at ${recurringTime}</p>`
  }

  const childrenHtml =
    children && children.length > 0
      ? `<p style="margin:0 0 6px 0;font-weight:600;color:#0f172a;">Child${children.length > 1 ? 'ren' : ''}:</p>
         <ul style="margin:0 0 16px 0;padding-left:18px;color:#475569;">
           ${children.map(c => `<li>${c}</li>`).join('')}
         </ul>`
      : ''

  const lessonTypeHtml = lessonType
    ? `<p style="margin:0 0 12px 0;color:#475569;"><strong style="color:#0f172a;">Lesson Type:</strong> ${lessonType}</p>`
    : ''

  const html = `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#0f172a;">
      <div style="border-top:3px solid #0369a1;padding-top:24px;margin-bottom:24px;">
        <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#94a3b8;margin:0 0 8px 0;">Swim with Shirel · Côte Saint-Luc</p>
        <h1 style="font-size:26px;font-weight:700;margin:0 0 4px 0;color:#0f172a;">Your lesson is confirmed!</h1>
      </div>

      <p style="color:#475569;margin:0 0 20px 0;">Hi <strong style="color:#0f172a;">${parentName}</strong>,</p>
      <p style="color:#475569;margin:0 0 24px 0;">
        Shirel has confirmed your booking. Here's a summary of your upcoming lesson${slots.length > 1 ? 's' : ''}.
      </p>

      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 12px 0;font-weight:600;color:#0f172a;">
          Lesson Format: <span style="color:#0369a1;">${formatLabel}</span>
        </p>
        ${lessonTypeHtml}
        ${childrenHtml}
        ${sessionsHtml}
        <p style="margin:0;color:#64748b;font-size:13px;border-top:1px solid #e0f2fe;padding-top:12px;">
          Payment is due within 2 hours of the lesson — cash or e-transfer accepted.
        </p>
      </div>

      <p style="color:#475569;margin:0 0 8px 0;">
        If you need to cancel, please do so at least <strong>2 hours before</strong> your scheduled lesson.
      </p>
      <p style="color:#475569;margin:0 0 32px 0;">
        See you at the pool!<br/>
        <strong style="color:#0f172a;">Shirel</strong>
      </p>

      <div style="border-top:1px solid #e0f2fe;padding-top:16px;">
        <p style="font-size:11px;color:#94a3b8;margin:0 0 4px 0;">Swim with Shirel · Private Pool · Côte Saint-Luc, Québec</p>
        <p style="font-size:11px;color:#94a3b8;margin:0;">
          <a href="mailto:${CONTACT_EMAIL}" style="color:#0369a1;">${CONTACT_EMAIL}</a>
          &nbsp;·&nbsp;
          <a href="tel:${CONTACT_PHONE_TEL}" style="color:#0369a1;">${CONTACT_PHONE}</a>
        </p>
      </div>
    </div>
  `

  const transporter = getTransporter()
  await transporter.sendMail({
    from: `"Swim with Shirel" <${from}>`,
    to: parentEmail,
    subject: 'Your swim lesson is confirmed — Swim with Shirel',
    html,
  })

  console.log(`[Email] Confirmation sent to ${parentEmail}`)
}
