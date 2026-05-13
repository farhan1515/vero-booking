"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Loader2,
  Mic,
  Sparkles,
  CheckCircle2,
  XCircle,
  User,
  Calendar,
  Phone,
  Mail,
  Stethoscope,
  Clock,
  FileText,
  ClipboardList,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { UrgencyBadge } from "@/components/admin/UrgencyBadge"
import { IcdSuggestions } from "@/components/admin/IcdSuggestions"
import { InsightsPanel } from "@/components/admin/InsightsPanel"
import { EvidencePanel } from "@/components/admin/EvidencePanel"
import { ClinicalChat } from "@/components/admin/ClinicalChat"
import { EncounterRecorder } from "@/components/admin/EncounterRecorder"
import { ActivityLog } from "@/components/admin/ActivityLog"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { BookingStatus } from "@/types"
import type { BookingWithDetails } from "@/types"
import type { ClinicalInsights } from "@/app/api/ai/insights/route"
import type { EvidenceReference } from "@/app/api/ai/evidence/route"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatTime(d: Date | string) {
  return new Date(d).toLocaleTimeString("en-CA", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function formatDob(d: Date | string) {
  return new Date(d).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatTimestamp(d: Date) {
  return d.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit", hour12: true })
}

function renderSummary(text: string) {
  return text.split(/\n\n+/).map((para, pi) => {
    const parts = para.split(/(\*\*[^*]+\*\*)/g)
    return (
      <p key={pi} className="mb-2 last:mb-0 text-sm leading-relaxed text-slate-700">
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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function InfoItem({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100">
        <Icon className="size-3.5 text-slate-500" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <div className="mt-0.5 text-sm text-slate-800">{children}</div>
      </div>
    </div>
  )
}

type RightTab = "summary" | "insights" | "evidence" | "chat" | "activity"

const TABS: { id: RightTab; label: string; icon: React.ElementType }[] = [
  { id: "summary", label: "Summary", icon: FileText },
  { id: "insights", label: "Insights", icon: Sparkles },
  { id: "evidence", label: "Evidence", icon: ClipboardList },
  { id: "chat", label: "Chat", icon: Stethoscope },
  { id: "activity", label: "Activity", icon: Clock },
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const [booking, setBooking] = useState<BookingWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [actionLoading, setActionLoading] = useState<BookingStatus | null>(null)
  const [rightTab, setRightTab] = useState<RightTab>("summary")

  // Summary streaming
  const [streamingText, setStreamingText] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [completedAt, setCompletedAt] = useState<Date | null>(null)
  const [localSummary, setLocalSummary] = useState<string | null>(null)

  // ICD
  const [localIcdSuggestions, setLocalIcdSuggestions] = useState<string | null>(null)
  const [icdGenerating, setIcdGenerating] = useState(false)

  // Insights / Evidence
  const [insights, setInsights] = useState<ClinicalInsights | null>(null)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [insightsFetched, setInsightsFetched] = useState(false)
  const [evidence, setEvidence] = useState<EvidenceReference[] | null>(null)
  const [evidenceLoading, setEvidenceLoading] = useState(false)
  const [evidenceFetched, setEvidenceFetched] = useState(false)

  async function fetchBooking() {
    try {
      const res = await fetch(`/api/bookings/${id}`)
      const json = await res.json()
      if (json.success) setBooking(json.data as BookingWithDetails)
      else setNotFound(true)
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBooking()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleStatusChange(newStatus: BookingStatus) {
    if (!booking) return
    setActionLoading(newStatus)
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      const json = await res.json()
      if (json.success) await fetchBooking()
    } finally {
      setActionLoading(null)
    }
  }

  async function handleGenerateSummary() {
    if (!booking || isStreaming) return
    setStreamingText("")
    setLocalSummary(null)
    setCompletedAt(null)
    setIsStreaming(true)
    try {
      const res = await fetch("/api/ai/stream/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chiefComplaint: booking.chiefComplaint,
          additionalNotes: booking.additionalNotes,
          specialty: booking.physician.specialty,
        }),
      })
      if (!res.ok || !res.body) throw new Error("Stream failed")
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        setStreamingText((p) => p + chunk)
      }
      await fetch(`/api/bookings/${booking.id}/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intakeSummary: fullText }),
      })
      setLocalSummary(fullText)
      setCompletedAt(new Date())
    } catch {
      setStreamingText("")
    } finally {
      setIsStreaming(false)
    }
  }

  async function handleGenerateIcd() {
    if (!booking || icdGenerating) return
    setIcdGenerating(true)
    try {
      const res = await fetch("/api/ai/icd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id }),
      })
      const json = await res.json()
      if (json.success && json.data) setLocalIcdSuggestions(JSON.stringify(json.data))
    } finally {
      setIcdGenerating(false)
    }
  }

  async function handleTabChange(tab: RightTab) {
    setRightTab(tab)
    if (tab === "insights" && !insightsFetched && booking) {
      setInsightsLoading(true)
      setInsightsFetched(true)
      try {
        const res = await fetch("/api/ai/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: booking.id }),
        })
        const json = await res.json()
        if (json.success) setInsights(json.data as ClinicalInsights)
      } finally {
        setInsightsLoading(false)
      }
    }
    if (tab === "evidence" && !evidenceFetched && booking) {
      setEvidenceLoading(true)
      setEvidenceFetched(true)
      try {
        const res = await fetch("/api/ai/evidence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: booking.id }),
        })
        const json = await res.json()
        if (json.success) setEvidence(json.data as EvidenceReference[])
      } finally {
        setEvidenceLoading(false)
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Loading / error states
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size={36} />
      </div>
    )
  }

  if (notFound || !booking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg font-medium text-slate-700">Booking not found</p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="mr-2 size-4" />
          Back to Dashboard
        </Button>
      </div>
    )
  }

  const displaySummary = localSummary ?? booking.intakeSummary ?? null
  const showGenerateButton = !displaySummary && !isStreaming && !streamingText

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ------------------------------------------------------------------ */}
      {/* Top bar                                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="sticky top-16 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3">
          {/* Back */}
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <ArrowLeft className="size-4" />
            Dashboard
          </button>

          <div className="h-4 w-px bg-slate-200" />

          {/* Patient name + badges */}
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <h1 className="truncate text-base font-semibold text-slate-900">
              {booking.patientName}
            </h1>
            <StatusBadge status={booking.status as BookingStatus} />
            <UrgencyBadge urgencyLevel={booking.urgencyLevel} />
          </div>

          {/* Action buttons */}
          <div className="flex shrink-0 items-center gap-2">
            {booking.status === BookingStatus.PENDING && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  disabled={!!actionLoading}
                  onClick={() => handleStatusChange(BookingStatus.CANCELLED)}
                >
                  {actionLoading === BookingStatus.CANCELLED ? (
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  ) : (
                    <XCircle className="mr-1.5 size-3.5" />
                  )}
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-teal-700 text-white hover:bg-teal-800"
                  disabled={!!actionLoading}
                  onClick={() => handleStatusChange(BookingStatus.CONFIRMED)}
                >
                  {actionLoading === BookingStatus.CONFIRMED ? (
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-1.5 size-3.5" />
                  )}
                  Confirm Appointment
                </Button>
              </>
            )}
            {booking.status === BookingStatus.CONFIRMED && (
              <Button
                size="sm"
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
                disabled={!!actionLoading}
                onClick={() => handleStatusChange(BookingStatus.CANCELLED)}
              >
                {actionLoading === BookingStatus.CANCELLED ? (
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                ) : (
                  <XCircle className="mr-1.5 size-3.5" />
                )}
                Cancel Appointment
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Body                                                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* -------------------------------------------------------------- */}
          {/* Left sidebar — patient + appointment info                       */}
          {/* -------------------------------------------------------------- */}
          <aside className="flex flex-col gap-4">
            {/* Patient card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <User className="size-3.5" />
                Patient
              </h2>
              <div className="space-y-4">
                <InfoItem icon={User} label="Full Name">
                  {booking.patientName}
                </InfoItem>
                <InfoItem icon={Calendar} label="Date of Birth">
                  {formatDob(booking.patientDateOfBirth)}
                </InfoItem>
                <InfoItem icon={Phone} label="Phone">
                  {booking.patientPhone}
                </InfoItem>
                <InfoItem icon={Mail} label="Email">
                  <span className="break-all">{booking.patientEmail}</span>
                </InfoItem>
              </div>
            </div>

            {/* Appointment card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Calendar className="size-3.5" />
                Appointment
              </h2>
              <div className="space-y-4">
                <InfoItem icon={Stethoscope} label="Physician">
                  <span className="font-medium">{booking.physician.name}</span>
                  <span className="ml-1 text-xs text-slate-400">
                    · {booking.physician.specialty}
                  </span>
                </InfoItem>
                <InfoItem icon={Calendar} label="Date">
                  {formatDate(booking.slot.startTime)}
                </InfoItem>
                <InfoItem icon={Clock} label="Time">
                  {formatTime(booking.slot.startTime)} – {formatTime(booking.slot.endTime)}
                </InfoItem>
                <InfoItem icon={ClipboardList} label="Visit Type">
                  <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                    {booking.chiefComplaintCategory}
                  </span>
                </InfoItem>
              </div>
            </div>

            {/* Chief complaint card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                Chief Complaint
              </h2>
              <p className="text-sm leading-relaxed text-slate-700">{booking.chiefComplaint}</p>
              {booking.additionalNotes && (
                <>
                  <h2 className="mb-2 mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Additional Notes
                  </h2>
                  <p className="text-sm leading-relaxed text-slate-600">{booking.additionalNotes}</p>
                </>
              )}
            </div>
          </aside>

          {/* -------------------------------------------------------------- */}
          {/* Right — encounter + AI tabs                                     */}
          {/* -------------------------------------------------------------- */}
          <div className="flex flex-col gap-5">
            {/* Encounter recorder — confirmed only */}
            {booking.status === BookingStatus.CONFIRMED && (
              <EncounterRecorder booking={booking} onComplete={fetchBooking} />
            )}

            {/* AI panel */}
            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm">
              {/* Tab bar */}
              <div className="flex border-b border-gray-200 px-2">
                {TABS.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium transition-colors",
                        rightTab === tab.id
                          ? "border-b-2 border-teal-700 text-teal-700"
                          : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      <Icon className="size-3.5" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              {/* Tab content */}
              <div className="p-6">
                {/* -------------------------------------------------------- */}
                {/* Summary                                                   */}
                {/* -------------------------------------------------------- */}
                {rightTab === "summary" && (
                  <div className="space-y-6">
                    {booking.soapNote ? (
                      <>
                        <section>
                          <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-teal-700">
                            <Mic className="size-3.5" />
                            SOAP Note (from encounter recording)
                          </h3>
                          <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
                            {renderSummary(booking.soapNote)}
                          </div>
                        </section>
                        {displaySummary && (
                          <section>
                            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Pre-visit Intake Summary
                            </h3>
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                              {renderSummary(displaySummary)}
                            </div>
                          </section>
                        )}
                      </>
                    ) : (
                      <section>
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-teal-700">
                            <span className="size-1.5 rounded-full bg-teal-600" />
                            AI Intake Summary
                          </h3>
                          {isStreaming && (
                            <span className="flex items-center gap-1 text-xs text-teal-600">
                              <Loader2 className="size-3 animate-spin" />
                              AI is writing…
                            </span>
                          )}
                          {completedAt && (
                            <span className="text-xs text-slate-400">
                              Generated at {formatTimestamp(completedAt)}
                            </span>
                          )}
                        </div>

                        {isStreaming || streamingText ? (
                          <div className="min-h-24 rounded-xl border-l-2 border-teal-400 bg-white p-4 shadow-sm ring-1 ring-slate-100">
                            {renderSummary(streamingText)}
                            {isStreaming && (
                              <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse rounded-sm bg-teal-500" />
                            )}
                          </div>
                        ) : displaySummary ? (
                          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                            {renderSummary(displaySummary)}
                          </div>
                        ) : showGenerateButton ? (
                          <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5">
                            <p className="text-sm text-slate-500">
                              No intake summary yet. Generate one using AI based on the
                              patient&apos;s complaint.
                            </p>
                            <Button
                              size="sm"
                              className="bg-teal-700 text-white hover:bg-teal-800"
                              onClick={handleGenerateSummary}
                            >
                              <Sparkles className="mr-1.5 size-3.5" />
                              Generate Intake Summary
                            </Button>
                          </div>
                        ) : null}
                      </section>
                    )}

                    <IcdSuggestions
                      icdSuggestions={localIcdSuggestions ?? booking.icdSuggestions}
                      onGenerate={handleGenerateIcd}
                      generating={icdGenerating}
                    />
                  </div>
                )}

                {rightTab === "insights" && (
                  <InsightsPanel insights={insights} loading={insightsLoading} />
                )}
                {rightTab === "evidence" && (
                  <EvidencePanel references={evidence} loading={evidenceLoading} />
                )}
                {rightTab === "chat" && <ClinicalChat booking={booking} />}
                {rightTab === "activity" && <ActivityLog logs={booking.statusLogs} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
