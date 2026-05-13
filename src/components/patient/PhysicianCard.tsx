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
        "group flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300",
        physician.isAcceptingPatients && "hover:border-gray-200 hover:shadow-md"
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-[#0F6E56]">
          {getInitials(physician.name)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-gray-900">{physician.name}</h3>
          <span className="mt-1 inline-block rounded-full border border-teal-100 bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-[#0F6E56]">
            {physician.specialty}
          </span>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-400">{physician.credentials}</p>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-500">{physician.bio}</p>

      <div className="mt-4 flex items-center justify-between">
        {physician.isAcceptingPatients ? (
          <span className="text-sm text-gray-500">
            <span className="font-semibold text-[#0F6E56]">{availableSlots}</span>{" "}
            slot{availableSlots !== 1 ? "s" : ""} available
          </span>
        ) : (
          <span className="text-sm text-gray-400">Not accepting patients</span>
        )}
      </div>

      <div className="mt-5">
        {physician.isAcceptingPatients && availableSlots > 0 ? (
          <Button
            asChild
            className="w-full rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            size="lg"
          >
            <Link href={`/book/${physician.id}`}>Book Appointment</Link>
          </Button>
        ) : (
          <Button
            disabled
            className="w-full rounded-full border border-gray-200 bg-gray-50 text-gray-400"
            size="lg"
            variant="outline"
          >
            {physician.isAcceptingPatients ? "No availability" : "Unavailable"}
          </Button>
        )}
      </div>
    </div>
  )
}
