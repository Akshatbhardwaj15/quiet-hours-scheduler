import { Button } from "@/components/ui/button"
import { Clock, Calendar, Bell, Shield } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Quiet Hours</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-foreground mb-6 text-balance">Schedule Your Perfect Study Sessions</h2>
          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            Create focused quiet hours, get timely reminders, and build better study habits. Join thousands of students
            who&apos;ve improved their academic focus.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="px-8">
                Start scheduling
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="px-8 bg-transparent">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-foreground mb-4">Everything you need for focused study</h3>
          <p className="text-lg text-muted-foreground">
            Simple tools to help you create and maintain productive study habits
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-muted rounded-lg p-6 mb-4">
              <Calendar className="h-12 w-12 text-primary mx-auto" />
            </div>
            <h4 className="text-xl font-semibold text-foreground mb-2">Smart Scheduling</h4>
            <p className="text-muted-foreground">Block out quiet study hours that work with your schedule</p>
          </div>

          <div className="text-center">
            <div className="bg-muted rounded-lg p-6 mb-4">
              <Bell className="h-12 w-12 text-primary mx-auto" />
            </div>
            <h4 className="text-xl font-semibold text-foreground mb-2">Email Reminders</h4>
            <p className="text-muted-foreground">Get notified 10 minutes before your study session starts</p>
          </div>

          <div className="text-center">
            <div className="bg-muted rounded-lg p-6 mb-4">
              <Shield className="h-12 w-12 text-primary mx-auto" />
            </div>
            <h4 className="text-xl font-semibold text-foreground mb-2">No Conflicts</h4>
            <p className="text-muted-foreground">Smart system prevents overlapping study sessions</p>
          </div>

          <div className="text-center">
            <div className="bg-muted rounded-lg p-6 mb-4">
              <Clock className="h-12 w-12 text-primary mx-auto" />
            </div>
            <h4 className="text-xl font-semibold text-foreground mb-2">Focus Time</h4>
            <p className="text-muted-foreground">Dedicated quiet hours for deep, uninterrupted learning</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="h-6 w-6 text-primary" />
            <span className="font-semibold text-foreground">Quiet Hours</span>
          </div>
          <p className="text-sm text-muted-foreground">Built for students who value focused study time</p>
        </div>
      </footer>
    </div>
  )
}
