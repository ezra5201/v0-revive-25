"use client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function ChoicePage() {
  const router = useRouter()

  const handleRunChoice = () => {
    // TODO: Navigate to Run dashboard
    console.log("Run selected")
  }

  const handleCenterChoice = () => {
    // TODO: Navigate to Center dashboard
    console.log("Center selected")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Image
              src="/revive-impact-logo.png"
              alt="ReVive IMPACT Logo"
              width={280}
              height={80}
              className="h-16 w-auto"
              priority
            />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Choose Your Role</CardTitle>
          <CardDescription className="text-muted-foreground">Select how you'll be working today</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Button
              onClick={handleRunChoice}
              variant="outline"
              className="h-32 flex flex-col items-center justify-center space-y-3 bg-transparent hover:bg-primary/5 border-2 hover:border-primary transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">Run</div>
                <div className="text-sm text-muted-foreground">Field operations and outreach</div>
              </div>
            </Button>

            <Button
              onClick={handleCenterChoice}
              variant="outline"
              className="h-32 flex flex-col items-center justify-center space-y-3 bg-transparent hover:bg-accent/5 border-2 hover:border-accent transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">Center</div>
                <div className="text-sm text-muted-foreground">Administrative and coordination</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
