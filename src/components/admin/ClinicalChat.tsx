"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BookingWithDetails } from "@/types"

interface Message {
  role: "user" | "assistant"
  content: string
  streaming?: boolean
}

interface ClinicalChatProps {
  booking: BookingWithDetails
}

const SUGGESTED_PROMPTS = [
  "What tests should I order?",
  "Suggest differential diagnoses",
  "What should I watch for?",
]

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-0.5 px-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-slate-400"
          style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </span>
  )
}

export function ClinicalChat({ booking }: ClinicalChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isResponding, setIsResponding] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim() || isResponding) return

    const userMsg: Message = { role: "user", content: text.trim() }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput("")
    setIsResponding(true)

    // Add placeholder streaming message
    setMessages((prev) => [...prev, { role: "assistant", content: "", streaming: true }])

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map(({ role, content }) => ({ role, content })),
          bookingContext: {
            patientName: booking.patientName,
            patientDateOfBirth: booking.patientDateOfBirth,
            chiefComplaint: booking.chiefComplaint,
            additionalNotes: booking.additionalNotes,
            specialty: booking.physician.specialty,
            intakeSummary: booking.intakeSummary,
          },
        }),
      })

      if (!res.ok || !res.body) throw new Error("Chat request failed")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullContent += chunk
        setMessages((prev) =>
          prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: fullContent, streaming: true } : m
          )
        )
      }

      // Finalise: remove streaming flag
      setMessages((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1 ? { role: "assistant", content: fullContent, streaming: false } : m
        )
      )
    } catch {
      setMessages((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1
            ? { role: "assistant", content: "Sorry, something went wrong. Please try again.", streaming: false }
            : m
        )
      )
    } finally {
      setIsResponding(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex h-[420px] flex-col">
      {/* Message list */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <div className="flex flex-col gap-3 pt-2">
            <p className="text-xs text-slate-400">
              Ask Vero AI anything about this patient encounter.
            </p>
            <div className="flex flex-col gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-left text-xs font-medium text-teal-700 transition-colors hover:bg-teal-100"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              {msg.role === "assistant" && (
                <div className="max-w-[85%]">
                  <div className="mb-1 flex items-center gap-1">
                    <Sparkles className="size-3 text-teal-600" />
                    <span className="text-xs font-medium text-teal-600">Vero AI</span>
                  </div>
                  <div className="rounded-xl rounded-tl-sm border border-slate-200 bg-white px-3 py-2 text-xs leading-relaxed text-slate-700 shadow-sm">
                    {msg.streaming && msg.content === "" ? (
                      <TypingDots />
                    ) : (
                      <>
                        {msg.content}
                        {msg.streaming && (
                          <span className="ml-0.5 inline-block h-3 w-1 animate-pulse rounded-sm bg-teal-500" />
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
              {msg.role === "user" && (
                <div className="max-w-[85%] rounded-xl rounded-tr-sm bg-teal-700 px-3 py-2 text-xs leading-relaxed text-white">
                  {msg.content}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a clinical question..."
          disabled={isResponding}
          className="h-9 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 disabled:opacity-50"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isResponding}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
