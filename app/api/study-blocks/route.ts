import { createClient } from "@/lib/supabase/server"
import { NotificationQueueManager } from "@/lib/notification-queue"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[v0] Auth error:", authError) // Added debugging
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, start_time, end_time } = body

    console.log("[v0] Creating study block for user:", user.id) // Added debugging
    console.log("[v0] Study block data:", { title, description, start_time, end_time }) // Added debugging

    // Create study block in Supabase
    const { data: studyBlock, error } = await supabase
      .from("study_blocks")
      .insert({
        title,
        description,
        start_time,
        end_time,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Supabase error:", error) // Added debugging
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log("[v0] Study block created successfully:", studyBlock) // Added debugging

    // Add notification to MongoDB queue
    const notificationManager = new NotificationQueueManager()
    await notificationManager.addNotificationToQueue(studyBlock.id, user.id)

    return NextResponse.json({ data: studyBlock }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating study block:", error) // Enhanced debugging
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studyBlockId = searchParams.get("id")

    if (!studyBlockId) {
      return NextResponse.json({ error: "Study block ID required" }, { status: 400 })
    }

    // Delete from Supabase
    const { error } = await supabase.from("study_blocks").delete().eq("id", studyBlockId).eq("user_id", user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Remove from notification queue
    const notificationManager = new NotificationQueueManager()
    await notificationManager.removeNotificationFromQueue(studyBlockId)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting study block:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
