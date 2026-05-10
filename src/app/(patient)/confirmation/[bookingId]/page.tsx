import { getBookingById } from "@/server/services/booking.service"
import Link from "next/link"
import { Check, Calendar, Clock, User } from "lucide-react"
import { notFound } from "next/navigation"

interface ConfirmationPageProps {
  params: Promise<{ bookingId: string }>
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

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { bookingId } = await params
  const booking = await getBookingById(bookingId)

  if (!booking) notFound()

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-14 sm:px-6">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-teal-100">
          <Check className="size-8 text-teal-700" strokeWidth={2.5} />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Appointment Requested</h1>
        <p className="mt-2 text-sm text-slate-500">
          Your request has been submitted. You&apos;ll receive a confirmation once it&apos;s
          reviewed.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Appointment Details
        </h2>

        <dl className="space-y-4">
          <div className="flex items-start gap-3">
            <User className="mt-0.5 size-4 shrink-0 text-teal-600" />
            <div>
              <dt className="text-xs text-slate-500">Physician</dt>
              <dd className="text-sm font-medium text-slate-900">{booking.physician.name}</dd>
              <dd className="text-xs text-slate-500">{booking.physician.specialty}</dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 size-4 shrink-0 text-teal-600" />
            <div>
              <dt className="text-xs text-slate-500">Date</dt>
              <dd className="text-sm font-medium text-slate-900">
                {formatDate(booking.slot.startTime)}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 size-4 shrink-0 text-teal-600" />
            <div>
              <dt className="text-xs text-slate-500">Time</dt>
              <dd className="text-sm font-medium text-slate-900">
                {formatTime(booking.slot.startTime)} – {formatTime(booking.slot.endTime)}
              </dd>
            </div>
          </div>
        </dl>

        <div className="mt-5 border-t border-slate-100 pt-5">
          <p className="text-xs text-slate-500">Patient</p>
          <p className="mt-0.5 text-sm font-medium text-slate-900">{booking.patientName}</p>
          <p className="text-sm text-slate-500">{booking.patientEmail}</p>
        </div>

        <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3">
          <p className="text-xs font-medium text-amber-800">
            Status: <span className="uppercase">Pending Review</span>
          </p>
          <p className="mt-0.5 text-xs text-amber-700">
            A physician&apos;s office will confirm your appointment within 1 business day.
          </p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/"
          className="text-sm font-medium text-teal-700 underline-offset-2 hover:underline"
        >
          Book another appointment
        </Link>
      </div>
    </main>
  )
}
