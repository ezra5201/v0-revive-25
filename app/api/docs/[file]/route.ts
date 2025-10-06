import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

export async function GET(request: NextRequest, { params }: { params: { file: string } }) {
  try {
    const { file } = params

    // Security: Only allow markdown files and prevent directory traversal
    if (!file.endsWith(".md") || file.includes("..")) {
      return NextResponse.json({ error: "Invalid file" }, { status: 400 })
    }

    // Read the markdown file from the docs directory
    const filePath = join(process.cwd(), "docs", file)
    const content = await readFile(filePath, "utf-8")

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/markdown",
      },
    })
  } catch (error) {
    console.error("[v0] Error reading documentation file:", error)
    return NextResponse.json({ error: "Documentation not found" }, { status: 404 })
  }
}
