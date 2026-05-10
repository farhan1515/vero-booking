"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
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
import { BookingStatus } from "@/types"
import type { BookingWithDetails } from "@/types"

interface BookingDetailModalProps {
  booking: BookingWithDetails | null
  onClose: () => void
  onStatusUpdate: () => void
}

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

export function BookingDetailModal({ booking, onClose, onStatusUpdate }: BookingDetailModalProps) {
  const [actionLoading, setActionLoading] = useState<BookingStatus | null>(null)

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

  return (
    <Dialog open={!!booking} onOpenChange={(open) => !open && onClose()}>
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
              {/* Left column */}
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

              {/* Right column */}
              <div className="space-y-6">
                <section>
                  <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-teal-700">
                    <span className="size-1.5 rounded-full bg-teal-600" />
                    AI Intake Summary
                  </h3>
                  {booking.intakeSummary ? (
                    <pre className="whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50 p-3 font-sans text-xs leading-relaxed text-slate-700">
                      {booking.intakeSummary}
                    </pre>
                  ) : booking.aiProcessedAt ? (
                    <p className="text-xs text-slate-400">Not available</p>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Loader2 className="size-3 animate-spin" />
                      Processing...
                    </div>
                  )}
                </section>

                <IcdSuggestions icdSuggestions={booking.icdSuggestions} />
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
