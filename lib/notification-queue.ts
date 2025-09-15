import { getDatabase, type NotificationQueue, type EmailLog } from "./mongodb"
import { createClient } from "./supabase/server"

export class NotificationQueueManager {
  private db = getDatabase()

  async addNotificationToQueue(studyBlockId: string, userId: string): Promise<void> {
    const database = await this.db
    const supabase = await createClient()

    console.log("[v0] Adding notification to queue for study block:", studyBlockId)

    // Get study block details
    const { data: studyBlock, error } = await supabase.from("study_blocks").select("*").eq("id", studyBlockId).single()

    if (error || !studyBlock) {
      console.error("[v0] Study block not found:", error)
      throw new Error("Study block not found")
    }

    // Get user details
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error("[v0] User not found:", userError)
      throw new Error("User not found")
    }

    const studyStartTime = new Date(studyBlock.start_time)
    const scheduledTime = new Date(studyStartTime.getTime() - 10 * 60 * 1000) // 10 minutes before

    console.log("[v0] Study starts at:", studyStartTime)
    console.log("[v0] Notification scheduled for:", scheduledTime)

    const notification: NotificationQueue = {
      studyBlockId,
      userId,
      userEmail: user.email!,
      userName: user.user_metadata?.full_name || user.email!,
      studyBlockTitle: studyBlock.title,
      studyBlockDescription: studyBlock.description ?? undefined,
      scheduledTime,
      studyStartTime,
      studyEndTime: new Date(studyBlock.end_time),
      status: "pending",
      attempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await database.collection<NotificationQueue>("notification_queue").insertOne(notification)
    console.log("[v0] Notification added to queue successfully")
  }

  async getPendingNotifications(): Promise<NotificationQueue[]> {
    const database = await this.db
    const now = new Date()

    console.log("[v0] Checking for pending notifications at:", now)

    const notifications = await database
      .collection<NotificationQueue>("notification_queue")
      .find({
        status: "pending",
        scheduledTime: { $lte: now },
        attempts: { $lt: 3 }, // Max 3 attempts
      })
      .toArray()

    console.log("[v0] Found", notifications.length, "pending notifications")

    notifications.forEach((notification, index) => {
      console.log(`[v0] Notification ${index + 1}:`, {
        id: notification._id,
        title: notification.studyBlockTitle,
        email: notification.userEmail,
        scheduledTime: notification.scheduledTime,
        attempts: notification.attempts,
      })
    })

    return notifications
  }

  async markNotificationAsSent(notificationId: string): Promise<void> {
    const database = await this.db
    await database.collection<NotificationQueue>("notification_queue").updateOne(
      { _id: notificationId },
      {
        $set: {
          status: "sent",
          updatedAt: new Date(),
        },
      },
    )
  }

  async markNotificationAsFailed(notificationId: string, error: string): Promise<void> {
    const database = await this.db
    console.log("[v0] Marking notification as failed:", notificationId, "Error:", error)
    await database.collection<NotificationQueue>("notification_queue").updateOne(
      { _id: notificationId },
      {
        $set: {
          status: "failed",
          error,
          lastAttempt: new Date(),
          updatedAt: new Date(),
        },
        $inc: { attempts: 1 },
      },
    )
  }

  async logEmail(
    notificationId: string,
    userId: string,
    userEmail: string,
    subject: string,
    status: "sent" | "failed",
    error?: string,
  ): Promise<void> {
    const database = await this.db
    const emailLog: EmailLog = {
      notificationId,
      userId,
      userEmail,
      subject,
      status,
      error,
      sentAt: new Date(),
    }

    await database.collection<EmailLog>("email_logs").insertOne(emailLog)
  }

  async removeNotificationFromQueue(studyBlockId: string): Promise<void> {
    const database = await this.db
    console.log("[v0] Removing notifications for study block:", studyBlockId)
    await database.collection<NotificationQueue>("notification_queue").deleteMany({ studyBlockId })
  }
}
