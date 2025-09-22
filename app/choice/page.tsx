"use client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function ChoicePage() {
  const router = useRouter()

  const handleRunChoice = () => {
    router.push("/run-log")
  }

  const handleCenterChoice = () => {
    router.push("/contact-log?tab=today")
  }

  const handleOneOnOneChoice = () => {
    router.push("/contact-log?tab=today&mode=1x1")
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
          <CardTitle className="text-2xl font-bold text-foreground">Select Your Location</CardTitle>
          <CardDescription className="text-muted-foreground">Select where you'll be working today</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <div className="font-semibold text-lg text-foreground">Run</div>
                <div className="text-sm text-muted-foreground">I'm on a run</div>
              </div>
            </Button>

            <Button
              onClick={handleCenterChoice}
              variant="outline"
              className="h-32 flex flex-col items-center justify-center space-y-3 bg-transparent hover:bg-emerald-50 border-2 hover:border-emerald-500 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg text-foreground">Center</div>
                <div className="text-sm text-muted-foreground">I'm in the Center</div>
              </div>
            </Button>

            <Button
              onClick={handleOneOnOneChoice}
              variant="outline"
              className="h-32 flex flex-col items-center justify-center space-y-3 bg-transparent hover:bg-secondary/5 border-2 hover:border-secondary transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg text-foreground">1 x 1</div>
                <div className="text-sm text-muted-foreground">I'm with a client</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
