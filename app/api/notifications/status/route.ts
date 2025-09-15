import { getDatabase } from "@/lib/mongodb"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const database = await getDatabase()

    // Get notification statistics for the user
    const [pending, sent, failed] = await Promise.all([
      database.collection("notification_queue").countDocuments({ userId: user.id, status: "pending" }),
      database.collection("notification_queue").countDocuments({ userId: user.id, status: "sent" }),
      database.collection("notification_queue").countDocuments({ userId: user.id, status: "failed" }),
    ])

    // Get recent email logs
    const recentEmails = await database
      .collection("email_logs")
      .find({ userId: user.id })
      .sort({ sentAt: -1 })
      .limit(10)
      .toArray()

    return NextResponse.json({
      notifications: {
        pending,
        sent,
        failed,
        total: pending + sent + failed,
      },
      recentEmails,
    })
  } catch (error) {
    console.error("Error fetching notification status:", error)
    return NextResponse.json({ error: "Failed to fetch notification status" }, { status: 500 })
  }
}
