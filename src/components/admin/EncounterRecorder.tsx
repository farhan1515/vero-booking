"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Square, CheckCircle2, ChevronDown, ChevronUp, RotateCcw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { BookingWithDetails } from "@/types"

type RecorderState = "idle" | "recording" | "processing" | "generating" | "complete"

interface EncounterRecorderProps {
  booking: BookingWithDetails
  onComplete: () => void
}

function formatTimer(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
}

const WAVE_HEIGHTS = [10, 18, 26, 18, 10]

export function EncounterRecorder({ booking, onComplete }: EncounterRecorderProps) {
  const [state, setState] = useState<RecorderState>(() =>
    booking.encounterTranscript ? "complete" : "idle"
  )
  const [seconds, setSeconds] = useState(0)
  const [transcript, setTranscript] = useState(booking.encounterTranscript ?? "")
  const [soapStreamText, setSoapStreamText] = useState("")
  const [soapNote, setSoapNote] = useState(booking.soapNote ?? "")
  const [recordedAt, setRecordedAt] = useState<Date | null>(
    booking.encounterRecordedAt ? new Date(booking.encounterRecordedAt) : null
  )
  const [transcriptExpanded, setTranscriptExpanded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
    }
  }, [])

  async function startRecording() {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4"
      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: mimeType })
        handleTranscribe(blob)
      }

      recorder.start(250)
      setState("recording")
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } catch {
      setError("Microphone access denied. Please allow microphone access and try again.")
    }
  }

  function stopRecording() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    mediaRecorderRef.current?.stop()
    setState("processing")
  }

  async function handleTranscribe(blob: Blob) {
    setError(null)
    try {
      const ext = blob.type.includes("mp4") ? "mp4" : "webm"
      const formData = new FormData()
      formData.append("audio", blob, `encounter.${ext}`)
      formData.append("bookingId", booking.id)

      const res = await fetch("/api/ai/transcribe", { method: "POST", body: formData })
      const json = await res.json()

      if (!json.success || !json.data?.transcript) {
        throw new Error(json.error ?? "Transcription failed")
      }

      const text = json.data.transcript as string
      setTranscript(text)
      setState("generating")
      await handleGenerateSoap(text)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transcription failed")
      setState("idle")
    }
  }

  async function handleGenerateSoap(transcriptText: string) {
    setSoapStreamText("")
    setError(null)
    try {
      const res = await fetch("/api/ai/soap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: transcriptText,
          specialty: booking.physician.specialty,
          bookingId: booking.id,
        }),
      })

      if (!res.ok || !res.body) throw new Error("SOAP generation failed")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        setSoapStreamText((prev) => prev + chunk)
      }

      await fetch(`/api/bookings/${booking.id}/encounter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encounterTranscript: transcriptText, soapNote: fullText }),
      })

      setSoapNote(fullText)
      setRecordedAt(new Date())
      setState("complete")
      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : "SOAP generation failed")
      setState("idle")
    }
  }

  function handleReRecord() {
    setSoapStreamText("")
    setSoapNote("")
    setTranscript("")
    setRecordedAt(null)
    setError(null)
    setState("idle")
  }

  function renderSoapText(text: string) {
    return text.split(/\n\n+/).map((para, pi) => {
      const parts = para.split(/(\*\*[^*]+\*\*)/g)
      return (
        <p key={pi} className="mb-2 last:mb-0 text-xs leading-relaxed text-slate-700">
          {parts.map((part, i) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={i} className="font-semibold text-slate-800">
                {part.slice(2, -2)}
              </strong>
            ) : (
              part
            )
          )}
        </p>
      )
    })
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Mic className="size-3.5 text-teal-600" />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Encounter Recording
        </h3>
      </div>

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
      )}

      {/* STATE: idle */}
      {state === "idle" && (
        <div className="flex flex-col items-center gap-3 py-3">
          <button
            onClick={startRecording}
            className="flex size-16 items-center justify-center rounded-full bg-teal-700 text-white shadow-md transition-transform hover:scale-105 hover:bg-teal-800"
          >
            <Mic className="size-7" />
          </button>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700">Tap to start recording</p>
            <p className="text-xs text-slate-400">Records the patient encounter for AI transcription</p>
          </div>
        </div>
      )}

      {/* STATE: recording */}
      {state === "recording" && (
        <div className="flex flex-col items-center gap-3 py-3">
          <button
            onClick={stopRecording}
            className="flex size-16 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-transform hover:scale-105 hover:bg-red-600"
          >
            <Square className="size-6 fill-white" />
          </button>
          <div className="flex items-end gap-0.5 h-8">
            {WAVE_HEIGHTS.map((h, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-red-400 animate-pulse"
                style={{ height: h, animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
          <div className="text-center">
            <p className="font-mono text-lg font-semibold text-red-600">{formatTimer(seconds)}</p>
            <p className="text-xs text-slate-500">Stop Recording</p>
          </div>
        </div>
      )}

      {/* STATE: processing */}
      {state === "processing" && (
        <div className="flex flex-col items-center gap-3 py-4">
          <Loader2 className="size-8 animate-spin text-teal-600" />
          <p className="text-sm text-slate-600">Transcribing with Whisper...</p>
        </div>
      )}

      {/* STATE: generating */}
      {state === "generating" && (
        <div className="space-y-3">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Transcript
            </p>
            <div className="max-h-24 overflow-y-auto rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 leading-relaxed">
              {transcript}
            </div>
          </div>
          <div>
            <div className="mb-1.5 flex items-center gap-1.5">
              <Loader2 className="size-3 animate-spin text-teal-600" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Generating SOAP note...
              </p>
            </div>
            {soapStreamText && (
              <div className="min-h-16 rounded-lg border-l-2 border-teal-400 bg-white p-3 shadow-sm ring-1 ring-slate-100">
                {renderSoapText(soapStreamText)}
                <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse rounded-sm bg-teal-500" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* STATE: complete */}
      {state === "complete" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-green-600" />
              <span className="text-sm font-medium text-slate-700">Encounter documented</span>
              {recordedAt && (
                <span className="text-xs text-slate-400">
                  ·{" "}
                  {recordedAt.toLocaleTimeString("en-CA", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 gap-1 text-xs text-slate-500 hover:text-slate-700"
              onClick={handleReRecord}
            >
              <RotateCcw className="size-3" />
              Re-record
            </Button>
          </div>

          {/* Collapsible transcript */}
          {transcript && (
            <div>
              <button
                onClick={() => setTranscriptExpanded((e) => !e)}
                className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-600"
              >
                Transcript
                {transcriptExpanded ? (
                  <ChevronUp className="size-3" />
                ) : (
                  <ChevronDown className="size-3" />
                )}
              </button>
              {transcriptExpanded && (
                <div className="mt-1.5 max-h-28 overflow-y-auto rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 leading-relaxed">
                  {transcript}
                </div>
              )}
            </div>
          )}

          {/* SOAP note */}
          {soapNote && (
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              {renderSoapText(soapNote)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
