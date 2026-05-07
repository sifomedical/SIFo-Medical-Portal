import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'noreply@sifo-medical.local'
const ADMIN_EMAIL = 'admin@sifo-medical.local'

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  replyTo?: string
}

export async function sendEmail({
  to,
  subject,
  html,
  replyTo = FROM_EMAIL,
}: SendEmailOptions) {
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      replyTo,
    })

    if (result.error) {
      console.error('Email send error:', result.error)
      return { success: false, error: result.error.message }
    }

    console.log('Email sent successfully:', result.data?.id)
    return { success: true, id: result.data?.id }
  } catch (error) {
    console.error('Email service error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function sendDraftCreatedEmail(
  adminEmail: string,
  processTitle: string,
  authorName: string,
  processUrl: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(to right, #1B3A6B, #0EA5E9); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">Neuer Prozess zur Überprüfung</h2>
      </div>

      <div style="padding: 20px; background: #f9fafb;">
        <p>Hallo,</p>

        <p><strong>${authorName}</strong> hat einen neuen Prozess erstellt:</p>

        <div style="background: white; padding: 15px; border-left: 4px solid #1B3A6B; margin: 20px 0;">
          <h3 style="margin-top: 0;">${processTitle}</h3>
          <p style="color: #666;">Der Prozess wartet auf Ihre Überprüfung und Genehmigung.</p>
        </div>

        <div style="text-align: center; margin: 20px 0;">
          <a href="${processUrl}" style="background: #1B3A6B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Prozess überprüfen
          </a>
        </div>

        <p style="color: #666; font-size: 14px;">
          Falls Sie nicht der Administrator sind oder diese E-Mail versehentlich erhalten haben, ignorieren Sie sie bitte.
        </p>
      </div>

      <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p style="margin: 0;">© SIFo Medical Process Hub</p>
      </div>
    </div>
  `

  return sendEmail({
    to: adminEmail,
    subject: `[Überprüfung erforderlich] Neuer Prozess: ${processTitle}`,
    html,
  })
}

export async function sendProcessApprovedEmail(
  authorEmail: string,
  processTitle: string,
  processUrl: string,
  approverName: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(to right, #00A68B, #008B72); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">✓ Prozess genehmigt</h2>
      </div>

      <div style="padding: 20px; background: #f9fafb;">
        <p>Hallo,</p>

        <p>Ihr Prozess wurde genehmigt und ist jetzt aktiv!</p>

        <div style="background: white; padding: 15px; border-left: 4px solid #00A68B; margin: 20px 0;">
          <h3 style="margin-top: 0;">${processTitle}</h3>
          <p style="color: #666;">Genehmigt durch: <strong>${approverName}</strong></p>
        </div>

        <div style="text-align: center; margin: 20px 0;">
          <a href="${processUrl}" style="background: #00A68B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Prozess ansehen
          </a>
        </div>

        <p style="color: #666; font-size: 14px;">
          Der Prozess ist jetzt für alle Benutzer sichtbar.
        </p>
      </div>

      <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p style="margin: 0;">© SIFo Medical Process Hub</p>
      </div>
    </div>
  `

  return sendEmail({
    to: authorEmail,
    subject: `✓ Prozess genehmigt: ${processTitle}`,
    html,
  })
}

export async function sendProcessRejectedEmail(
  authorEmail: string,
  processTitle: string,
  rejectionReason: string,
  processUrl: string,
  rejectorName: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(to right, #DC2626, #991B1B); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">⚠️ Prozess erfordert Überarbeitung</h2>
      </div>

      <div style="padding: 20px; background: #f9fafb;">
        <p>Hallo,</p>

        <p>Ihr Prozess wurde überprüft und erfordert Überarbeitungen:</p>

        <div style="background: white; padding: 15px; border-left: 4px solid #DC2626; margin: 20px 0;">
          <h3 style="margin-top: 0;">${processTitle}</h3>
          <p style="color: #666;"><strong>Überprüft durch:</strong> ${rejectorName}</p>
          <p style="color: #666;"><strong>Grund:</strong></p>
          <p style="white-space: pre-wrap; color: #333;">${rejectionReason}</p>
        </div>

        <div style="text-align: center; margin: 20px 0;">
          <a href="${processUrl}" style="background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Prozess überarbeiten
          </a>
        </div>

        <p style="color: #666; font-size: 14px;">
          Bitte bearbeiten Sie den Prozess gemäß dem Feedback und reichen Sie ihn erneut ein.
        </p>
      </div>

      <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p style="margin: 0;">© SIFo Medical Process Hub</p>
      </div>
    </div>
  `

  return sendEmail({
    to: authorEmail,
    subject: `⚠️ Überarbeitung erforderlich: ${processTitle}`,
    html,
  })
}
