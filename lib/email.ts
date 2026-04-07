import nodemailer from 'nodemailer'
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL } from './contact'

function getTransporter() {
  const port = Number(process.env.SMTP_PORT) || 465
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
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
    console.warn('Email not configured — skipping confirmation email')
    return
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER
  const formatLabel = lessonFormat === 'semi-private' ? 'Semi-Private' : 'Private'

  let sessionsHtml = ''
  if (slots.length > 0) {
    sessionsHtml = `
      <p style="margin:0 0 6px 0;font-weight:600;color:#1c1917;">Confirmed Sessions:</p>
      <ul style="margin:0 0 16px 0;padding-left:18px;color:#57534e;">
        ${slots.map(s => `<li>${s.date} at ${s.time_slot} (${s.duration} min)</li>`).join('')}
      </ul>`
  } else if (isWeeklyRequest && recurringDay && recurringTime) {
    sessionsHtml = `
      <p style="margin:0 0 6px 0;font-weight:600;color:#1c1917;">Weekly Recurring Request:</p>
      <p style="margin:0 0 16px 0;color:#57534e;">Every ${recurringDay} at ${recurringTime}</p>`
  }

  const childrenHtml =
    children && children.length > 0
      ? `<p style="margin:0 0 6px 0;font-weight:600;color:#1c1917;">Child${children.length > 1 ? 'ren' : ''}:</p>
         <ul style="margin:0 0 16px 0;padding-left:18px;color:#57534e;">
           ${children.map((c) => `<li>${c}</li>`).join('')}
         </ul>`
      : ''

  const lessonTypeHtml = lessonType
    ? `<p style="margin:0 0 16px 0;color:#57534e;"><strong style="color:#1c1917;">Lesson Type:</strong> ${lessonType}</p>`
    : ''

  const html = `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1c1917;">
      <div style="border-top:2px solid #1c1917;padding-top:24px;margin-bottom:24px;">
        <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#a8a29e;margin:0 0 8px 0;">Swim with Shirel · Côte Saint-Luc</p>
        <h1 style="font-size:26px;font-weight:700;margin:0 0 4px 0;">Your lesson is confirmed!</h1>
      </div>

      <p style="color:#57534e;margin:0 0 20px 0;">Hi <strong style="color:#1c1917;">${parentName}</strong>,</p>
      <p style="color:#57534e;margin:0 0 24px 0;">
        Shirel has confirmed your booking. Here's a summary of your upcoming lesson${slots.length > 1 ? 's' : ''}.
      </p>

      <div style="border:1px solid #e7e5e4;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 6px 0;font-weight:600;color:#1c1917;">Lesson Format: <span style="color:#0369a1;">${formatLabel}</span></p>
        ${lessonTypeHtml}
        ${childrenHtml}
        ${sessionsHtml}
        <p style="margin:0;color:#78716c;font-size:13px;">Payment is due within 2 hours of the lesson — cash or e-transfer accepted.</p>
      </div>

      <p style="color:#57534e;margin:0 0 8px 0;">
        If you need to cancel, please do so at least <strong>2 hours before</strong> your scheduled lesson.
      </p>
      <p style="color:#57534e;margin:0 0 32px 0;">
        See you at the pool!<br/>
        <strong style="color:#1c1917;">Shirel</strong>
      </p>

      <div style="border-top:1px solid #e0f2fe;padding-top:16px;">
        <p style="font-size:11px;color:#94a3b8;margin:0;">Swim with Shirel · Private Pool · Côte Saint-Luc, Québec</p>
        <p style="font-size:11px;color:#94a3b8;margin:4px 0 0 0;">
          <a href="mailto:${CONTACT_EMAIL}" style="color:#0369a1;">${CONTACT_EMAIL}</a> ·
          <a href="tel:${CONTACT_PHONE_TEL}" style="color:#0369a1;">${CONTACT_PHONE}</a>
        </p>
      </div>
    </div>
  `

  await getTransporter().sendMail({
    from: `"Swim with Shirel" <${from}>`,
    to: parentEmail,
    subject: 'Your swim lesson is confirmed — Swim with Shirel',
    html,
  })
}
