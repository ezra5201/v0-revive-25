"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BookOpen, Database, Cloud, Code, FileText, AlertCircle, Wrench, ChevronLeft } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { useRouter } from "next/navigation"

const docs = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Overview and quick start guide",
    icon: BookOpen,
    file: "01-getting-started.md",
  },
  {
    id: "database",
    title: "Database Setup",
    description: "Neon PostgreSQL configuration",
    icon: Database,
    file: "02-database-setup.md",
  },
  {
    id: "cloud-run",
    title: "Cloud Run Deployment",
    description: "Deploy to Google Cloud Run",
    icon: Cloud,
    file: "03-cloud-run-deployment.md",
  },
  {
    id: "architecture",
    title: "Architecture",
    description: "System architecture overview",
    icon: Code,
    file: "04-architecture.md",
  },
  {
    id: "api",
    title: "API Reference",
    description: "Complete API documentation",
    icon: FileText,
    file: "05-api-reference.md",
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    description: "Common issues and solutions",
    icon: AlertCircle,
    file: "06-troubleshooting.md",
  },
  {
    id: "development",
    title: "Development Guide",
    description: "Local development workflow",
    icon: Wrench,
    file: "07-development-guide.md",
  },
]

export default function DocsPage() {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [content, setContent] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const loadDoc = async (file: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/docs/${file}`)
      const text = await response.text()
      setContent(text)
    } catch (error) {
      console.error("[v0] Error loading doc:", error)
      setContent("# Error\n\nFailed to load documentation.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDocSelect = (docId: string, file: string) => {
    setSelectedDoc(docId)
    loadDoc(file)
  }

  const handleBack = () => {
    setSelectedDoc(null)
    setContent("")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/contact-log")} className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to App
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Developer Documentation</h1>
          <p className="text-lg text-gray-600">
            Complete guide for deploying and maintaining ReVive IMPACT on Google Cloud Run
          </p>
        </div>

        {/* Content */}
        {!selectedDoc ? (
          // Documentation Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docs.map((doc) => {
              const Icon = doc.icon
              return (
                <Card
                  key={doc.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleDocSelect(doc.id, doc.file)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Icon className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                    <CardTitle className="text-xl">{doc.title}</CardTitle>
                    <CardDescription>{doc.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full bg-transparent">
                      Read Documentation
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          // Documentation Viewer
          <div className="bg-white rounded-lg shadow-lg">
            <div className="border-b border-gray-200 p-4">
              <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Back to Documentation
              </Button>
            </div>
            <ScrollArea className="h-[calc(100vh-250px)]">
              <div className="p-8">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">Loading documentation...</div>
                  </div>
                ) : (
                  <div className="prose prose-slate max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h1 className="text-4xl font-bold text-gray-900 mb-4">{children}</h1>,
                        h2: ({ children }) => (
                          <h2 className="text-3xl font-bold text-gray-900 mt-8 mb-4">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">{children}</h3>
                        ),
                        p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
                        code: ({ children, className }) => {
                          const isBlock = className?.includes("language-")
                          return isBlock ? (
                            <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                              {children}
                            </code>
                          ) : (
                            <code className="bg-gray-100 text-orange-600 px-1.5 py-0.5 rounded text-sm">
                              {children}
                            </code>
                          )
                        },
                        ul: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-4">{children}</ol>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-orange-500 pl-4 italic text-gray-600 my-4">
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  )
}
