"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Send, Bot, User, Sparkles, TrendingUp, PackageOpen, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  content: string
}

const QUICK_ACTIONS = [
  { label: "Today's Sales", icon: TrendingUp, query: "What was total sales today?" },
  { label: "Top Sellers", icon: Sparkles, query: "Top 5 selling items this month" },
  { label: "Low Stock", icon: PackageOpen, query: "Which items are running low?" },
  { label: "Suggest Combo", icon: Lightbulb, query: "Suggest a combo deal from my menu" },
]

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm RestoAI. Ask me about your sales, menu items, inventory, or get business suggestions.",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  const abortRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent, scrollToBottom])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = useCallback(async (query: string) => {
    if (!query.trim() || isLoading) return

    setMessages((prev) => [...prev, { role: "user", content: query }])
    setInput("")
    setIsLoading(true)
    setStreamingContent("")

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to get response")
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error("No response stream")

      const decoder = new TextDecoder()
      let content = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        content += decoder.decode(value, { stream: true })
        setStreamingContent(content)
      }

      setMessages((prev) => [...prev, { role: "assistant", content }])
      setStreamingContent("")
    } catch (err: any) {
      if (err.name === "AbortError") return
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I couldn't process that. ${err.message || "Make sure Ollama is running."}`,
        },
      ])
    } finally {
      setIsLoading(false)
      setStreamingContent("")
      abortRef.current = null
      inputRef.current?.focus()
    }
  }, [isLoading])

  const handleQuickAction = useCallback((query: string) => {
    handleSubmit(query)
  }, [handleSubmit])

  return (
    <div className="flex h-full flex-col">
      {/* Quick Actions */}
      <div className="flex gap-2 overflow-x-auto pb-4">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.label}
              onClick={() => handleQuickAction(action.query)}
              disabled={isLoading}
              className="flex shrink-0 items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
            >
              <Icon className="h-4 w-4" />
              {action.label}
            </button>
          )
        })}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto rounded-lg border bg-white p-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
          >
            {msg.role === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                <Bot className="h-4 w-4 text-blue-600" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800",
              )}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {/* Streaming message */}
        {isLoading && streamingContent && (
          <div className="flex gap-3 justify-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <Bot className="h-4 w-4 text-blue-600" />
            </div>
            <div className="max-w-[80%] rounded-2xl bg-gray-100 px-4 py-2.5 text-sm leading-relaxed text-gray-800">
              {streamingContent}
              <span className="inline-block w-1 animate-pulse">|</span>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && !streamingContent && (
          <div className="flex gap-3 justify-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <Bot className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl bg-gray-100 px-4 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              <span className="text-sm text-gray-400">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-2">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(input)
            }
          }}
          placeholder="Ask about sales, menu, inventory..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button
          onClick={() => handleSubmit(input)}
          disabled={isLoading || !input.trim()}
          size="icon"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
