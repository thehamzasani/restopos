import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { streamFromOllama } from "@/lib/ai/client"
import { classifyIntent } from "@/lib/ai/intent-classifier"
import { buildSystemPrompt, buildUserPrompt } from "@/lib/ai/prompts"
import { fetchDataForIntent } from "@/lib/ai/data-fetcher"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { message } = await req.json()
    if (!message || typeof message !== "string") {
      return NextResponse.json({ success: false, error: "Message is required" }, { status: 400 })
    }

    const { intent, params } = classifyIntent(message)
    const data = await fetchDataForIntent(intent, params)
    const systemPrompt = buildSystemPrompt(intent)
    const userPrompt = buildUserPrompt(message, data)

    const ollamaBody = await streamFromOllama([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ])

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    let buffer = ""

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue
          try {
            const json = JSON.parse(trimmed)
            if (json.message?.content) {
              controller.enqueue(encoder.encode(json.message.content))
            }
          } catch {
          }
        }
      },
    })

    const stream = ollamaBody.pipeThrough(transformStream)

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI assistant unavailable"
    return NextResponse.json({ success: false, error: message }, { status: 503 })
  }
}
