"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, CheckCircle, XCircle, Clock } from "lucide-react"

interface NotificationStats {
  pending: number
  sent: number
  failed: number
  total: number
}

interface EmailLog {
  _id: string
  subject: string
  status: "sent" | "failed"
  error?: string
  sentAt: string
}

interface NotificationStatusData {
  notifications: NotificationStats
  recentEmails: EmailLog[]
}

export function NotificationStatus() {
  const [data, setData] = useState<NotificationStatusData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/notifications/status")
        if (response.ok) {
          const statusData = await response.json()
          setData(statusData)
        }
      } catch (error) {
        console.error("Failed to fetch notification status:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
    // Refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>Status of your study session reminders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-2xl font-bold">{data.notifications.pending}</span>
              </div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-2xl font-bold">{data.notifications.sent}</span>
              </div>
              <p className="text-sm text-muted-foreground">Sent</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-2xl font-bold">{data.notifications.failed}</span>
              </div>
              <p className="text-sm text-muted-foreground">Failed</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Bell className="h-4 w-4 text-primary" />
                <span className="text-2xl font-bold">{data.notifications.total}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {data.recentEmails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Email Activity</CardTitle>
            <CardDescription>Your latest notification emails</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentEmails.map((email) => (
                <div key={email._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate">{email.subject}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(email.sentAt)}</p>
                    {email.error && <p className="text-xs text-red-500 mt-1">{email.error}</p>}
                  </div>
                  <Badge variant={email.status === "sent" ? "default" : "destructive"}>
                    {email.status === "sent" ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {email.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
