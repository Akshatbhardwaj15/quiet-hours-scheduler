import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { StudyBlocksManager } from "@/components/study-blocks-manager"
import { NotificationStatus } from "@/components/notification-status"
import { TestEmailButton } from "@/components/test-email-button"
import { ManualNotificationTrigger } from "@/components/manual-notification-trigger"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch user's study blocks
  const { data: studyBlocks } = await supabase.from("study_blocks").select("*").order("start_time", { ascending: true })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Quiet Hours</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {data.user.user_metadata?.full_name || data.user.email}
            </span>
            <form action="/auth/signout" method="post">
              <Button variant="ghost" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Your Study Dashboard</h2>
          <p className="text-muted-foreground">Manage your quiet study hours and track your notifications</p>
        </div>

        <Tabs defaultValue="schedule" className="space-y-6">
          <TabsList>
            <TabsTrigger value="schedule">Study Schedule</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="debug">Debug</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule">
            <StudyBlocksManager initialBlocks={studyBlocks || []} userId={data.user.id} />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationStatus />
          </TabsContent>

          <TabsContent value="debug">
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Email Service Testing</h3>
                <p className="text-muted-foreground mb-4">
                  Test if your email service is working correctly. This will send a test email to verify your Resend
                  configuration.
                </p>
                <TestEmailButton />
              </div>

              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Manual Notification Processing</h3>
                <p className="text-muted-foreground mb-4">
                  Manually trigger the notification processing system to check for pending notifications and send
                  emails. This bypasses the CRON job for testing purposes.
                </p>
                <ManualNotificationTrigger />
              </div>

              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Environment Variables Check</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">RESEND_API_KEY:</span>
                    <span className={process.env.RESEND_API_KEY ? "text-green-600" : "text-red-600"}>
                      {process.env.RESEND_API_KEY ? "✓ Set" : "✗ Missing"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">FROM_EMAIL:</span>
                    <span className={process.env.FROM_EMAIL ? "text-green-600" : "text-yellow-600"}>
                      {process.env.FROM_EMAIL ? `✓ ${process.env.FROM_EMAIL}` : "⚠ Using default"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">CRON_SECRET:</span>
                    <span className={process.env.CRON_SECRET ? "text-green-600" : "text-red-600"}>
                      {process.env.CRON_SECRET ? "✓ Set" : "✗ Missing"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Troubleshooting Tips</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Make sure your Resend API key is valid and has sending permissions</li>
                  <li>• Check that your FROM_EMAIL domain is verified in Resend</li>
                  <li>• Ensure the CRON_SECRET is set for automated notifications</li>
                  <li>• Check the browser console and server logs for error messages</li>
                  <li>• Verify that study blocks are scheduled for future times</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
