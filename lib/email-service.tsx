import { Resend } from "resend"

export interface NotificationData {
  _id?: string
  userId: string
  userEmail: string
  studyBlockTitle: string
  studyBlockDescription?: string
  scheduledTime: Date
  notificationTime: Date
  status: "pending" | "sent" | "failed"
  createdAt: Date
}

export class EmailService {
  private resend: Resend

  constructor() {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is required")
    }
    this.resend = new Resend(apiKey)
  }

  async sendStudyReminder(notification: NotificationData): Promise<boolean> {
    try {
      const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev"

      console.log("[v0] Sending email to:", notification.userEmail)
      console.log("[v0] Study block:", notification.studyBlockTitle)

      const { data, error } = await this.resend.emails.send({
        from: fromEmail,
        to: [notification.userEmail],
        subject: `🔔 Study Reminder: "${notification.studyBlockTitle}" starts in 10 minutes`,
        html: this.generateEmailTemplate(notification),
      })

      if (error) {
        console.error("[v0] Resend error:", error)
        return false
      }

      console.log("[v0] Email sent successfully:", data?.id)
      return true
    } catch (error) {
      console.error("[v0] Email service error:", error)
      return false
    }
  }

  private generateEmailTemplate(notification: NotificationData): string {
    const studyTime = new Date(notification.scheduledTime).toLocaleString()

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Study Reminder</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🔔 Study Time Reminder</h1>
          </div>
          
          <div style="padding: 30px; background: #f8fafc; border-radius: 10px; margin-top: 20px;">
            <h2 style="color: #1e293b; margin-top: 0;">${notification.studyBlockTitle}</h2>
            
            ${
              notification.studyBlockDescription
                ? `
              <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
                ${notification.studyBlockDescription}
              </p>
            `
                : ""
            }
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
              <p style="margin: 0; color: #1e293b; font-weight: 600;">
                ⏰ Your study session starts at: <strong>${studyTime}</strong>
              </p>
              <p style="margin: 10px 0 0 0; color: #64748b;">
                That's in about 10 minutes! Time to prepare your study space.
              </p>
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
              <p style="color: #64748b; font-size: 14px; margin: 0;">
                Good luck with your study session! 📚✨
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px;">
            <p>This reminder was sent by Quiet Hours Scheduler</p>
          </div>
        </body>
      </html>
    `
  }

  async sendTestEmail(email: string): Promise<boolean> {
    try {
      const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev"

      console.log("[v0] Sending test email to:", email)

      const { data, error } = await this.resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: "✅ Test Email from Quiet Hours Scheduler",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #667eea;">✅ Email Service Test</h1>
            <p>This is a test email from your Quiet Hours Scheduler application.</p>
            <p>If you received this email, your email service is working correctly!</p>
            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              Sent at: ${new Date().toLocaleString()}
            </p>
          </div>
        `,
      })

      if (error) {
        console.error("[v0] Test email error:", error)
        return false
      }

      console.log("[v0] Test email sent successfully:", data?.id)
      return true
    } catch (error) {
      console.error("[v0] Test email service error:", error)
      return false
    }
  }
}
