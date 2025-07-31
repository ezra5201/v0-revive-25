"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

type ActiveTab = "today" | "all"

export default function ContactLogPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/contact-log")
  }, [router])

  // Show a loading state while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-4" />
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}
