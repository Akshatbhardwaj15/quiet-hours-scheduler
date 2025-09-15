import { NotificationQueueManager } from "@/lib/notification-queue"
import { EmailService } from "@/lib/email-service"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const notificationManager = new NotificationQueueManager()
    const emailService = new EmailService()

    // Get pending notifications
    const pendingNotifications = await notificationManager.getPendingNotifications()

    if (pendingNotifications.length === 0) {
      return NextResponse.json({ message: "No pending notifications", processed: 0 })
    }

    let successCount = 0
    let failureCount = 0

    // Process each notification
    for (const notification of pendingNotifications) {
      try {
        const emailSent = await emailService.sendStudyReminder(notification)

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
      }
    }

    return NextResponse.json({
      message: "Notifications processed",
      processed: pendingNotifications.length,
      successful: successCount,
      failed: failureCount,
    })
  } catch (error) {
    console.error("Error processing notifications:", error)
    return NextResponse.json({ error: "Failed to process notifications" }, { status: 500 })
  }
}
