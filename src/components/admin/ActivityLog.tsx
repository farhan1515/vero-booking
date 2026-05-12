"use client"

import { CheckCircle2, XCircle, Clock, ArrowRight } from "lucide-react"
import type { BookingStatusLog } from "@/types"

interface ActivityLogProps {
  logs: BookingStatusLog[]
}

function statusIcon(status: string) {
  if (status === "CONFIRMED") return <CheckCircle2 className="size-3.5 text-green-600" />
  if (status === "CANCELLED") return <XCircle className="size-3.5 text-red-500" />
  return <Clock className="size-3.5 text-amber-500" />
}

function formatTimestamp(date: Date | string): string {
  return new Date(date).toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function actorLabel(actor: string): string {
  if (actor === "patient") return "Patient"
  if (actor === "admin") return "Physician / Admin"
  return "System"
}

export function ActivityLog({ logs }: ActivityLogProps) {
  if (logs.length === 0) {
    return <p className="text-xs text-slate-400">No activity recorded yet.</p>
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-1.5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Status History
        </h3>
        <span className="text-xs text-slate-400">· Full audit trail</span>
      </div>
      <ul className="space-y-3">
        {logs.map((log) => (
          <li key={log.id} className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
            <div className="mt-0.5 shrink-0">{statusIcon(log.newStatus)}</div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {log.previousStatus ? (
                  <>
                    <span className="font-medium text-slate-600">{log.previousStatus}</span>
                    <ArrowRight className="size-3 text-slate-400" />
                    <span className="font-semibold text-slate-800">{log.newStatus}</span>
                  </>
                ) : (
                  <span className="font-semibold text-slate-800">Created as {log.newStatus}</span>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                <span>{formatTimestamp(log.changedAt)}</span>
                <span>·</span>
                <span>{actorLabel(log.changedBy)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
