"use client"

import { useState } from "react"
import { Loader2, Sparkles } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { UrgencyBadge } from "@/components/admin/UrgencyBadge"
import { IcdSuggestions } from "@/components/admin/IcdSuggestions"
import { InsightsPanel } from "@/components/admin/InsightsPanel"
import { EvidencePanel } from "@/components/admin/EvidencePanel"
import { ClinicalChat } from "@/components/admin/ClinicalChat"
import { BookingStatus } from "@/types"
import type { BookingWithDetails } from "@/types"
import type { ClinicalInsights } from "@/app/api/ai/insights/route"
import type { EvidenceReference } from "@/app/api/ai/evidence/route"
import { cn } from "@/lib/utils"

interface BookingDetailModalProps {
  booking: BookingWithDetails | null
  onClose: () => void
  onStatusUpdate: () => void
}

type RightTab = "summary" | "insights" | "evidence" | "chat"

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("en-CA", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function formatDob(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString("en-CA", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

interface InfoRowProps {
  label: string
  value: React.ReactNode
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
      <span className="text-sm text-slate-800">{value}</span>
    </div>
  )
}

const RIGHT_TABS: { id: RightTab; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "insights", label: "Insights" },
  { id: "evidence", label: "Evidence" },
  { id: "chat", label: "Chat" },
]

export function BookingDetailModal({ booking, onClose, onStatusUpdate }: BookingDetailModalProps) {
  const [actionLoading, setActionLoading] = useState<BookingStatus | null>(null)

  // Summary streaming state
  const [streamingText, setStreamingText] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [completedAt, setCompletedAt] = useState<Date | null>(null)
  const [localSummary, setLocalSummary] = useState<string | null>(null)

  // ICD local state
  const [localIcdSuggestions, setLocalIcdSuggestions] = useState<string | null>(null)
  const [icdGenerating, setIcdGenerating] = useState(false)

  // Tab + insights + evidence state
  const [rightTab, setRightTab] = useState<RightTab>("summary")
  const [insights, setInsights] = useState<ClinicalInsights | null>(null)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [insightsFetched, setInsightsFetched] = useState(false)
  const [evidence, setEvidence] = useState<EvidenceReference[] | null>(null)
  const [evidenceLoading, setEvidenceLoading] = useState(false)
  const [evidenceFetched, setEvidenceFetched] = useState(false)

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
      if (json.success) {
        onStatusUpdate()
        onClose()
      }
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

      if (!res.ok || !res.body) throw new Error("Stream request failed")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        setStreamingText((prev) => prev + chunk)
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
      if (json.success && json.data) {
        setLocalIcdSuggestions(JSON.stringify(json.data))
      }
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

  function handleClose() {
    // Reset per-booking state on close
    setStreamingText("")
    setIsStreaming(false)
    setCompletedAt(null)
    setLocalSummary(null)
    setRightTab("summary")
    setInsights(null)
    setInsightsFetched(false)
    setEvidence(null)
    setEvidenceFetched(false)
    setLocalIcdSuggestions(null)
    onClose()
  }

  function renderSummary(text: string) {
    return text.split(/\n\n+/).map((para, pi) => {
      const parts = para.split(/(\*\*[^*]+\*\*)/g)
      return (
        <p key={pi} className="mb-2 last:mb-0 text-xs leading-relaxed text-slate-700">
          {parts.map((part, i) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={i} className="font-semibold text-slate-800">{part.slice(2, -2)}</strong>
            ) : (
              part
            )
          )}
        </p>
      )
    })
  }

  const displaySummary = localSummary ?? booking?.intakeSummary ?? null
  const showGenerateButton = !displaySummary && !isStreaming && !streamingText

  return (
    <Dialog open={!!booking} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="max-h-[90vh] w-full overflow-y-auto sm:max-w-3xl"
        showCloseButton
      >
        {booking && (
          <>
            <DialogHeader>
              <DialogTitle className="flex flex-wrap items-center gap-2 text-base">
                {booking.patientName}
                <StatusBadge status={booking.status as BookingStatus} />
                <UrgencyBadge urgencyLevel={booking.urgencyLevel} />
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Left column — patient + appointment info */}
              <div className="space-y-6">
                <section>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Patient Info
                  </h3>
                  <div className="space-y-3">
                    <InfoRow label="Full Name" value={booking.patientName} />
                    <InfoRow label="Date of Birth" value={formatDob(booking.patientDateOfBirth)} />
                    <InfoRow label="Phone" value={booking.patientPhone} />
                    <InfoRow label="Email" value={booking.patientEmail} />
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Appointment
                  </h3>
                  <div className="space-y-3">
                    <InfoRow
                      label="Physician"
                      value={
                        <span>
                          {booking.physician.name}
                          <span className="ml-1 text-slate-500">· {booking.physician.specialty}</span>
                        </span>
                      }
                    />
                    <InfoRow label="Date" value={formatDate(booking.slot.startTime)} />
                    <InfoRow
                      label="Time"
                      value={`${formatTime(booking.slot.startTime)} – ${formatTime(booking.slot.endTime)}`}
                    />
                    <InfoRow
                      label="Visit Type"
                      value={
                        <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          {booking.chiefComplaintCategory}
                        </span>
                      }
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Chief Complaint
                      </span>
                      <p className="text-sm text-slate-800">{booking.chiefComplaint}</p>
                    </div>
                    {booking.additionalNotes && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Additional Notes
                        </span>
                        <p className="text-sm text-slate-600">{booking.additionalNotes}</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Right column — tabbed AI panel */}
              <div className="flex flex-col">
                {/* Tab bar */}
                <div className="mb-4 flex border-b border-slate-200">
                  {RIGHT_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={cn(
                        "px-3 pb-2.5 text-xs font-medium transition-colors",
                        rightTab === tab.id
                          ? "border-b-2 border-teal-700 text-teal-700"
                          : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Summary tab */}
                {rightTab === "summary" && (
                  <div className="space-y-5">
                    <section>
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-teal-700">
                          <span className="size-1.5 rounded-full bg-teal-600" />
                          AI Intake Summary
                        </h3>
                        {isStreaming && (
                          <span className="flex items-center gap-1 text-xs text-teal-600">
                            <Loader2 className="size-3 animate-spin" />
                            AI is writing...
                          </span>
                        )}
                        {completedAt && (
                          <span className="text-xs text-slate-400">
                            Generated at {formatTimestamp(completedAt)}
                          </span>
                        )}
                      </div>

                      {(isStreaming || streamingText) ? (
                        <div className="min-h-24 rounded-lg border-l-2 border-teal-400 bg-white p-3 shadow-sm ring-1 ring-slate-100">
                          {renderSummary(streamingText)}
                          {isStreaming && (
                            <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse rounded-sm bg-teal-500" />
                          )}
                        </div>
                      ) : displaySummary ? (
                        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                          {renderSummary(displaySummary)}
                        </div>
                      ) : showGenerateButton ? (
                        <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
                          <p className="text-xs text-slate-500">
                            No intake summary yet. Generate one using AI based on the patient&apos;s complaint.
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

                    <IcdSuggestions
                      icdSuggestions={localIcdSuggestions ?? booking.icdSuggestions}
                      onGenerate={handleGenerateIcd}
                      generating={icdGenerating}
                    />
                  </div>
                )}

                {/* Insights tab */}
                {rightTab === "insights" && (
                  <InsightsPanel insights={insights} loading={insightsLoading} />
                )}

                {/* Evidence tab */}
                {rightTab === "evidence" && (
                  <EvidencePanel references={evidence} loading={evidenceLoading} />
                )}

                {/* Chat tab */}
                {rightTab === "chat" && (
                  <ClinicalChat booking={booking} />
                )}
              </div>
            </div>

            <DialogFooter className="gap-2" showCloseButton>
              {booking.status === BookingStatus.PENDING && (
                <>
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    disabled={!!actionLoading}
                    onClick={() => handleStatusChange(BookingStatus.CANCELLED)}
                  >
                    {actionLoading === BookingStatus.CANCELLED ? (
                      <Loader2 className="mr-1 size-3.5 animate-spin" />
                    ) : null}
                    Cancel
                  </Button>
                  <Button
                    className="bg-teal-700 text-white hover:bg-teal-800"
                    disabled={!!actionLoading}
                    onClick={() => handleStatusChange(BookingStatus.CONFIRMED)}
                  >
                    {actionLoading === BookingStatus.CONFIRMED ? (
                      <Loader2 className="mr-1 size-3.5 animate-spin" />
                    ) : null}
                    Confirm Appointment
                  </Button>
                </>
              )}
              {booking.status === BookingStatus.CONFIRMED && (
                <Button
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  disabled={!!actionLoading}
                  onClick={() => handleStatusChange(BookingStatus.CANCELLED)}
                >
                  {actionLoading === BookingStatus.CANCELLED ? (
                    <Loader2 className="mr-1 size-3.5 animate-spin" />
                  ) : null}
                  Cancel Appointment
                </Button>
              )}
              {booking.status === BookingStatus.CANCELLED && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
                  Cancelled
                </span>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
