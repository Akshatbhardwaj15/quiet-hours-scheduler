"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export function TestEmailButton() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleTestEmail = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success!",
          description: "Test email sent successfully. Check your inbox!",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to send test email",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex gap-2 items-center">
      <Input
        type="email"
        placeholder="Enter email to test"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="max-w-xs"
      />
      <Button onClick={handleTestEmail} disabled={isLoading} variant="outline">
        {isLoading ? "Sending..." : "Test Email"}
      </Button>
    </div>
  )
}
