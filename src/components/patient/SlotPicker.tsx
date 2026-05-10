"use client"

import { cn } from "@/lib/utils"
import type { Slot } from "@/types"

interface SlotPickerProps {
  slots: Slot[]
  selectedSlotId: string | null
  onSelect: (slotId: string) => void
}

function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("en-CA", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function formatDateHeader(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

function toDateKey(date: Date | string): string {
  return new Date(date).toISOString().slice(0, 10)
}

export function SlotPicker({ slots, selectedSlotId, onSelect }: SlotPickerProps) {
  const grouped = slots.reduce<Record<string, Slot[]>>((acc, slot) => {
    const key = toDateKey(slot.startTime)
    if (!acc[key]) acc[key] = []
    acc[key].push(slot)
    return acc
  }, {})

  const sortedDays = Object.keys(grouped).sort()

  if (sortedDays.length === 0) {
    return (
      <p className="text-sm text-slate-500">No available slots in the next 7 days.</p>
    )
  }

  return (
    <div className="space-y-5">
      {sortedDays.map((day) => (
        <div key={day}>
          <p className="mb-2 text-sm font-medium text-slate-700">
            {formatDateHeader(day + "T12:00:00")}
          </p>
          <div className="flex flex-wrap gap-2">
            {grouped[day].map((slot) => {
              const isSelected = slot.id === selectedSlotId
              const isBooked = slot.isBooked

              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={isBooked}
                  onClick={() => !isBooked && onSelect(slot.id)}
                  title={isBooked ? "Unavailable" : undefined}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                    isBooked
                      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                      : isSelected
                      ? "border-teal-700 bg-teal-700 text-white"
                      : "border-teal-600 bg-white text-teal-700 hover:bg-teal-700 hover:text-white"
                  )}
                >
                  {formatTime(slot.startTime)}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
