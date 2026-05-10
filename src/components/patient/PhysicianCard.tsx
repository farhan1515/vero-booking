"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { PhysicianWithSlots } from "@/types"

interface PhysicianCardProps {
  physician: PhysicianWithSlots
}

function getInitials(name: string): string {
  return name
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

export function PhysicianCard({ physician }: PhysicianCardProps) {
  const availableSlots = physician.slots.filter((s) => !s.isBooked).length

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow",
        physician.isAcceptingPatients && "hover:shadow-md"
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-teal-700 text-sm font-semibold text-white">
          {getInitials(physician.name)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-slate-900">{physician.name}</h3>
          <span className="mt-1 inline-block rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
            {physician.specialty}
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-500">{physician.credentials}</p>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{physician.bio}</p>

      <div className="mt-4 flex items-center justify-between">
        {physician.isAcceptingPatients ? (
          <span className="text-sm text-slate-500">
            <span className="font-medium text-teal-700">{availableSlots}</span> slot
            {availableSlots !== 1 ? "s" : ""} available
          </span>
        ) : (
          <span className="text-sm text-slate-400">Not accepting patients</span>
        )}
      </div>

      <div className="mt-4">
        {physician.isAcceptingPatients && availableSlots > 0 ? (
          <Button
            asChild
            className="w-full bg-teal-700 text-white hover:bg-teal-800"
            size="lg"
          >
            <Link href={`/book/${physician.id}`}>Book Appointment</Link>
          </Button>
        ) : (
          <Button disabled className="w-full" size="lg" variant="outline">
            {physician.isAcceptingPatients ? "No availability" : "Unavailable"}
          </Button>
        )}
      </div>
    </div>
  )
}
