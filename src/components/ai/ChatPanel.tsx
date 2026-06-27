"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Send,
  Bot,
  User,
  TrendingUp,
  Sparkles,
  PackageOpen,
  Lightbulb,
  Copy,
  Check,
  Square,
  DollarSign,
} from "lucide-react"
import { cn } from "@/lib/utils"
import MarkdownRenderer from "./MarkdownRenderer"

interface Message {
  role: "user" | "assistant"
  content: string
}

const QUICK_ACTIONS = [
  { label: "Today's Sales", icon: DollarSign, query: "What was total sales today?" },
  { label: "Top Sellers", icon: Sparkles, query: "Top 5 selling items this month" },
  { label: "Low Stock", icon: PackageOpen, query: "Which items are running low?" },
  { label: "Suggest Combo", icon: Lightbulb, query: "Suggest a combo deal from my menu" },
]

const WELCOME_CARDS = [
  { icon: TrendingUp, title: "Today's Revenue", desc: "Check your daily sales performance", query: "What was total sales today?", color: "bg-emerald-100 text-emerald-600" },
  { icon: Sparkles, title: "Top Selling Items", desc: "See what's popular right now", query: "Top 5 selling items this month", color: "bg-purple-100 text-purple-600" },
  { icon: PackageOpen, title: "Inventory Alerts", desc: "Check low stock items", query: "Which items are running low?", color: "bg-amber-100 text-amber-600" },
  { icon: Lightbulb, title: "Business Ideas", desc: "Get smart suggestions", query: "Suggest ways to increase sales", color: "bg-blue-100 text-blue-600" },
]

const FOLLOW_UP_OPTIONS = [
  { label: "Compare with yesterday", query: "Compare today's sales with yesterday" },
  { label: "Show top items", query: "Top 5 selling items this month" },
  { label: "Sales this week", query: "Sales report for last week" },
]

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [ollamaOnline, setOllamaOnline] = useState<boolean | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent, scrollToBottom])

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  useEffect(() => {
    fetch("http://localhost:11434")
      .then((r) => setOllamaOnline(r.ok))
      .catch(() => setOllamaOnline(false))
  }, [])

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 160) + "px"
  }, [])

  const copyToClipboard = useCallback(async (content: string, id: number) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
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
      textareaRef.current?.focus()
    }
  }, [isLoading])

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort()
    setIsLoading(false)
  }, [])

  const hasUserMessages = messages.some((m) => m.role === "user")

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 px-6 py-5 text-white shadow-lg">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/5" />
        <div className="absolute bottom-0 left-1/3 h-20 w-20 rounded-full bg-white/5" />
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">AI Assistant</h1>
              <p className="text-sm text-blue-100">Your intelligent restaurant copilot</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                ollamaOnline === null && "bg-yellow-400 animate-pulse",
                ollamaOnline === true && "bg-green-400",
                ollamaOnline === false && "bg-red-400",
              )}
            />
            {ollamaOnline === null ? "Connecting..." : ollamaOnline ? "Connected" : "Offline"}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.label}
              onClick={() => handleSubmit(action.query)}
              disabled={isLoading}
              className="flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
            >
              <Icon className="h-4 w-4" />
              {action.label}
            </button>
          )
        })}
      </div>

      {/* Messages */}
      <div className="relative mt-3 min-h-0 flex-1">
        <ScrollArea className="h-full rounded-xl border bg-white p-4 shadow-sm">
          <div className="space-y-4">
            {/* Welcome cards — shown before first user message */}
            {!hasUserMessages && (
              <div className="animate-fadeIn space-y-4">
                <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100">
                    <Bot className="h-7 w-7 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Hi! I&apos;m RestoAI</h2>
                    <p className="text-sm text-gray-500">
                      Ask about your sales, menu items, inventory, or get business suggestions to grow your restaurant.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {WELCOME_CARDS.map((card) => {
                    const Icon = card.icon
                    return (
                      <button
                        key={card.title}
                        onClick={() => handleSubmit(card.query)}
                        disabled={isLoading}
                        className="group flex items-start gap-3 rounded-xl border border-gray-100 p-4 text-left transition-all hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5"
                      >
                        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", card.color)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900">{card.title}</p>
                          <p className="text-xs text-gray-500">{card.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Message history */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn("flex gap-3 animate-fadeIn", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}

                <div
                  className={cn(
                    "group relative max-w-[80%]",
                    msg.role === "user" ? "order-first" : "order-none",
                  )}
                >
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "border-l-4 border-l-blue-500 bg-white text-gray-800 shadow-sm",
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <MarkdownRenderer>{msg.content}</MarkdownRenderer>
                    ) : (
                      msg.content
                    )}
                  </div>

                  {msg.role === "assistant" && (
                    <button
                      onClick={() => copyToClipboard(msg.content, i)}
                      className="absolute -right-8 top-0 flex h-7 w-7 items-center justify-center rounded-md text-gray-400 opacity-0 transition-all hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100"
                    >
                      {copiedId === i ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 shadow-sm">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Follow-up suggestions */}
            {!isLoading && messages.length > 0 && messages[messages.length - 1].role === "assistant" && (
              <div className="flex flex-wrap gap-2 pt-1">
                {FOLLOW_UP_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleSubmit(opt.query)}
                    className="rounded-full border border-dashed border-gray-300 px-3 py-1 text-xs text-gray-500 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* Streaming message */}
            {isLoading && streamingContent && (
              <div className="flex gap-3 animate-fadeIn justify-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="max-w-[80%] rounded-2xl border-l-4 border-l-blue-500 bg-white px-4 py-2.5 text-sm leading-relaxed text-gray-800 shadow-sm">
                  <MarkdownRenderer>{streamingContent}</MarkdownRenderer>
                  <span className="inline-block w-[3px] animate-pulse bg-blue-500 ml-0.5" style={{ height: "1em" }}>&nbsp;</span>
                </div>
              </div>
            )}

            {/* Loading indicator (before any tokens stream) */}
            {isLoading && !streamingContent && (
              <div className="flex gap-3 animate-fadeIn justify-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl border-l-4 border-l-blue-500 bg-white px-5 py-3 shadow-sm">
                  <span className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input area */}
      <div className="mt-3">
        <div className="flex gap-2 rounded-xl border bg-white p-2 shadow-sm">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              autoResize()
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(input)
              }
            }}
            placeholder="Ask about sales, menu, inventory..."
            disabled={isLoading}
            className="min-h-[44px] resize-none border-0 bg-transparent p-2 text-sm shadow-none focus-visible:ring-0"
            rows={1}
          />
          <div className="flex items-end gap-1">
            {isLoading ? (
              <Button onClick={stopGeneration} size="icon" variant="destructive" className="h-10 w-10 shrink-0">
                <Square className="h-4 w-4 fill-current" />
              </Button>
            ) : (
              <Button
                onClick={() => handleSubmit(input)}
                disabled={!input.trim()}
                size="icon"
                className="h-10 w-10 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <p className="mt-1 text-center text-[11px] text-gray-400">
          Enter to send &middot; Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
