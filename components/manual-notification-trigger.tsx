"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function ManualNotificationTrigger() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleTriggerNotifications = async () => {
    setIsLoading(true)
    try {
      console.log("[v0] Manually triggering notification processing...")

      const response = await fetch("/api/notifications/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()
      console.log("[v0] Notification processing result:", result)

      if (response.ok) {
        toast({
          title: "Notifications Processed",
          description: `Processed: ${result.processed}, Successful: ${result.successful}, Failed: ${result.failed}`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to process notifications",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Manual trigger error:", error)
      toast({
        title: "Error",
        description: "Failed to trigger notification processing",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleTriggerNotifications} disabled={isLoading} variant="outline">
      {isLoading ? "Processing..." : "Trigger Notifications Manually"}
    </Button>
  )
}
