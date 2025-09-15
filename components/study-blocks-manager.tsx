"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Calendar, Clock, Trash2, Bell } from "lucide-react"
import { useRouter } from "next/navigation"

interface StudyBlock {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  user_id: string
}

interface StudyBlocksManagerProps {
  initialBlocks: StudyBlock[]
  userId: string
}

export function StudyBlocksManager({ initialBlocks, userId }: StudyBlocksManagerProps) {
  const [studyBlocks, setStudyBlocks] = useState<StudyBlock[]>(initialBlocks)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("")

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setStartDate("")
    setStartTime("")
    setEndDate("")
    setEndTime("")
    setError(null)
  }

  const handleCreateStudyBlock = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Combine date and time
      const startDateTime = new Date(`${startDate}T${startTime}`)
      const endDateTime = new Date(`${endDate}T${endTime}`)

      // Validate times
      if (startDateTime >= endDateTime) {
        throw new Error("End time must be after start time")
      }

      if (startDateTime < new Date()) {
        throw new Error("Start time cannot be in the past")
      }

      // Check for overlapping blocks
      const hasOverlap = studyBlocks.some((block) => {
        const blockStart = new Date(block.start_time)
        const blockEnd = new Date(block.end_time)
        return (
          (startDateTime >= blockStart && startDateTime < blockEnd) ||
          (endDateTime > blockStart && endDateTime <= blockEnd) ||
          (startDateTime <= blockStart && endDateTime >= blockEnd)
        )
      })

      if (hasOverlap) {
        throw new Error("This time slot overlaps with an existing study block")
      }

      const response = await fetch("/api/study-blocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description: description || null,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create study block")
      }

      const { data } = await response.json()

      setStudyBlocks([...studyBlocks, data])
      setIsCreateDialogOpen(false)
      resetForm()
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteStudyBlock = async (id: string) => {
    try {
      const response = await fetch(`/api/study-blocks?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete study block")
      }

      setStudyBlocks(studyBlocks.filter((block) => block.id !== id))
      router.refresh()
    } catch (error: unknown) {
      console.error("Error deleting study block:", error)
    }
  }

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getDuration = (start: string, end: string) => {
    const startTime = new Date(start)
    const endTime = new Date(end)
    const diffMs = endTime.getTime() - startTime.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`
    }
    return `${diffMinutes}m`
  }

  const upcomingBlocks = studyBlocks.filter((block) => new Date(block.start_time) > new Date())
  const pastBlocks = studyBlocks.filter((block) => new Date(block.end_time) <= new Date())

  return (
    <div className="space-y-8">
      {/* Create New Block Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Upcoming Sessions</h3>
          <p className="text-sm text-muted-foreground">
            {upcomingBlocks.length} session{upcomingBlocks.length !== 1 ? "s" : ""} scheduled
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Study Time
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule New Study Block</DialogTitle>
              <DialogDescription>Create a focused study session with email reminders</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateStudyBlock} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Math Study Session"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="What will you be studying?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Study Block"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Study Blocks */}
      {upcomingBlocks.length > 0 ? (
        <div className="grid gap-4">
          {upcomingBlocks.map((block) => (
            <Card key={block.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{block.title}</CardTitle>
                    {block.description && <CardDescription className="mt-1">{block.description}</CardDescription>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteStudyBlock(block.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDateTime(block.start_time)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{getDuration(block.start_time, block.end_time)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bell className="h-4 w-4 text-accent" />
                    <span>10min reminder</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No study sessions scheduled</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first study block to start building focused study habits
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Study Time
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Past Study Blocks */}
      {pastBlocks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">Past Sessions</h3>
          <div className="grid gap-4">
            {pastBlocks.slice(0, 5).map((block) => (
              <Card key={block.id} className="opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{block.title}</CardTitle>
                      {block.description && <CardDescription className="mt-1">{block.description}</CardDescription>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDateTime(block.start_time)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{getDuration(block.start_time, block.end_time)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
