"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { SlotPicker } from "@/components/patient/SlotPicker"
import { IntakeForm } from "@/components/patient/IntakeForm"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import type { PhysicianWithSlots } from "@/types"

interface BookPageProps {
  params: Promise<{ physicianId: string }>
}

export default function BookPage({ params }: BookPageProps) {
  const { physicianId } = use(params)
  const router = useRouter()
  const [physician, setPhysician] = useState<PhysicianWithSlots | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/physicians/${physicianId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setPhysician(res.data)
        else setError(res.error ?? "Physician not found")
      })
      .catch(() => setError("Failed to load physician"))
      .finally(() => setLoading(false))
  }, [physicianId])

  function handleBookingSuccess(bookingId: string) {
    router.push(`/confirmation/${bookingId}`)
  }

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </main>
    )
  }

  if (error || !physician) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="text-base font-medium text-red-600">{error ?? "Physician not found"}</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 text-sm text-teal-700 underline-offset-2 hover:underline"
        >
          Back to physicians
        </button>
      </main>
    )
  }

  const availableSlots = physician.slots.filter((s) => !s.isBooked)

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <button
        onClick={() => router.back()}
        className="mb-6 text-sm text-slate-500 hover:text-teal-700"
      >
        ← Back
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Book with {physician.name}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {physician.specialty} · {physician.credentials}
        </p>
      </div>

      <div className="space-y-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="mb-4 text-base font-semibold text-slate-800">
            1. Select a time slot
          </h2>
          {availableSlots.length === 0 ? (
            <p className="text-sm text-slate-500">No available slots. Please check back later.</p>
          ) : (
            <SlotPicker
              slots={availableSlots}
              selectedSlotId={selectedSlotId}
              onSelect={setSelectedSlotId}
            />
          )}
        </div>

        {selectedSlotId && (
          <div className="border-t border-slate-100 pt-8">
            <h2 className="mb-4 text-base font-semibold text-slate-800">
              2. Complete your intake form
            </h2>
            <IntakeForm
              physicianId={physician.id}
              slotId={selectedSlotId}
              physicianName={physician.name}
              onSuccess={handleBookingSuccess}
            />
          </div>
        )}
      </div>
    </main>
  )
}
