import nodemailer from 'nodemailer'
import prisma from '@/lib/db'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT ?? 587),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.EMAIL_HOST) return
  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? process.env.EMAIL_USER,
    to,
    subject,
    html,
  })
}

export async function sendNotificationEmails(userIds: string[], subject: string, html: string) {
  if (!process.env.EMAIL_HOST) return
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { email: true },
  })
  await Promise.allSettled(users.map(u => sendEmail(u.email, subject, html)))
}

export function emailHtml(mesaj: string, url: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const fullUrl = url.startsWith('http') ? url : `${appUrl}${url}`
  return `<!DOCTYPE html>
<html lang="ro">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
        <tr>
          <td style="background:#1d4ed8;padding:24px 32px">
            <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700">PRAM Platform</h1>
            <p style="margin:4px 0 0;color:#bfdbfe;font-size:13px">T.A.T.A. CONSULT EX S.R.L.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px">
            <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6">${mesaj.replace(/\n/g, '<br>')}</p>
            ${appUrl ? `<a href="${fullUrl}" style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">Vezi detalii</a>` : ''}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #e5e7eb">
            <p style="margin:0;color:#9ca3af;font-size:12px">Acesta este un email automat generat de PRAM Platform. Nu răspundeți la acest mesaj.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
