import { NotificationQueueManager } from "@/lib/notification-queue"
import { EmailService } from "@/lib/email-service"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    console.log("[CRON] Starting notification processing...")

    const notificationManager = new NotificationQueueManager()
    const emailService = new EmailService()

    // Get pending notifications
    const pendingNotifications = await notificationManager.getPendingNotifications()

    console.log(`[CRON] Found ${pendingNotifications.length} pending notifications`)

    if (pendingNotifications.length === 0) {
      return NextResponse.json({
        message: "No pending notifications",
        processed: 0,
        timestamp: new Date().toISOString(),
      })
    }

    let successCount = 0
    let failureCount = 0

    // Process each notification
    for (const notification of pendingNotifications) {
      try {
        console.log(`[CRON] Processing notification for ${notification.userEmail} - ${notification.studyBlockTitle}`)

        const emailSent = await emailService.sendStudyReminder({
          ...notification,
          notificationTime: notification.scheduledTime, // use scheduledTime directly
        })

        if (emailSent) {
          await notificationManager.markNotificationAsSent(notification._id!.toString())
          await notificationManager.logEmail(
            notification._id!.toString(),
            notification.userId,
            notification.userEmail,
            `Reminder: "${notification.studyBlockTitle}" starts in 10 minutes`,
            "sent",
          )
          successCount++
          console.log(`[CRON] ✅ Successfully sent notification to ${notification.userEmail}`)
        } else {
          throw new Error("Email service returned false")
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        await notificationManager.markNotificationAsFailed(notification._id!.toString(), errorMessage)
        await notificationManager.logEmail(
          notification._id!.toString(),
          notification.userId,
          notification.userEmail,
          `Reminder: "${notification.studyBlockTitle}" starts in 10 minutes`,
          "failed",
          errorMessage,
        )
        failureCount++
        console.log(`[CRON] ❌ Failed to send notification to ${notification.userEmail}: ${errorMessage}`)
      }
    }

    const result = {
      message: "Notifications processed",
      processed: pendingNotifications.length,
      successful: successCount,
      failed: failureCount,
      timestamp: new Date().toISOString(),
    }

    console.log(`[CRON] Completed processing: ${JSON.stringify(result)}`)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[CRON] Error processing notifications:", error)
    return NextResponse.json(
      {
        error: "Failed to process notifications",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
