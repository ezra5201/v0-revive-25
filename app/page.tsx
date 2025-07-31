"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Use replace to avoid adding to browser history
    router.replace("/contact-log")
  }, [router])

  // Show a loading state while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-4" />
        <p className="text-gray-600">Loading ReVive 25...</p>
      </div>
    </div>
  )
}
