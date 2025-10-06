"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BookOpen, Database, Cloud, Code, FileText, AlertCircle, Wrench, ChevronLeft } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
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
      const response = await fetch(`/api/docs/${file}`)
      if (!response.ok) {
        throw new Error("Failed to load documentation")
      }
      const text = await response.text()
      setContent(text)
    } catch (error) {
      console.error("[v0] Error loading doc:", error)
      setContent("# Error\n\nFailed to load documentation. Please try again.")
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/contact-log")} className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to App
            </Button>
          </div>
          <h1 className="text-4xl font-bold mb-2">Developer Documentation</h1>
          <p className="text-lg text-muted-foreground">
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
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                        <Icon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
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
          <Card className="shadow-lg">
            <div className="border-b p-4">
              <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Back to Documentation
              </Button>
            </div>
            <ScrollArea className="h-[calc(100vh-250px)]">
              <div className="p-8">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-muted-foreground">Loading documentation...</div>
                  </div>
                ) : (
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-4xl font-bold mb-6 mt-2 text-foreground">{children}</h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-3xl font-bold mt-12 mb-4 text-foreground border-b pb-2">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-2xl font-semibold mt-8 mb-3 text-foreground">{children}</h3>
                        ),
                        h4: ({ children }) => (
                          <h4 className="text-xl font-semibold mt-6 mb-2 text-foreground">{children}</h4>
                        ),
                        p: ({ children }) => <p className="text-foreground leading-relaxed mb-4">{children}</p>,
                        a: ({ children, href }) => (
                          <a href={href} className="text-orange-600 hover:text-orange-700 underline">
                            {children}
                          </a>
                        ),
                        code: ({ node, inline, className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || "")
                          const language = match ? match[1] : ""

                          return !inline && language ? (
                            <div className="my-4 rounded-lg overflow-hidden">
                              <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={language}
                                PreTag="div"
                                customStyle={{
                                  margin: 0,
                                  borderRadius: "0.5rem",
                                  fontSize: "0.875rem",
                                }}
                                {...props}
                              >
                                {String(children).replace(/\n$/, "")}
                              </SyntaxHighlighter>
                            </div>
                          ) : (
                            <code
                              className="bg-muted text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded text-sm font-mono"
                              {...props}
                            >
                              {children}
                            </code>
                          )
                        },
                        pre: ({ children }) => <div className="my-4">{children}</div>,
                        ul: ({ children }) => (
                          <ul className="list-disc list-outside ml-6 space-y-2 mb-4 text-foreground">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-outside ml-6 space-y-2 mb-4 text-foreground">{children}</ol>
                        ),
                        li: ({ children }) => <li className="text-foreground leading-relaxed">{children}</li>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-orange-500 pl-4 italic text-muted-foreground my-4 bg-muted/50 py-2 rounded-r">
                            {children}
                          </blockquote>
                        ),
                        table: ({ children }) => (
                          <div className="my-4 overflow-x-auto">
                            <table className="min-w-full divide-y divide-border">{children}</table>
                          </div>
                        ),
                        thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
                        tbody: ({ children }) => <tbody className="divide-y divide-border">{children}</tbody>,
                        tr: ({ children }) => <tr>{children}</tr>,
                        th: ({ children }) => (
                          <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">{children}</th>
                        ),
                        td: ({ children }) => <td className="px-4 py-2 text-sm text-foreground">{children}</td>,
                        hr: () => <hr className="my-8 border-border" />,
                        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                      }}
                    >
                      {content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        )}
      </div>
    </div>
  )
}
