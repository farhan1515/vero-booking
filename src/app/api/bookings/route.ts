import { type NextRequest } from "next/server"
import { createBooking, getAllBookings, updateBookingAiFields } from "@/server/services/booking.service"
import { generateIntakeSummary, classifyUrgency } from "@/server/services/ai.service"
import { getPhysicianById } from "@/server/services/physician.service"
import { createBookingSchema } from "@/lib/validations"
import { BookingStatus, type ApiResponse } from "@/types"

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const statusParam = request.nextUrl.searchParams.get("status")
    const status = statusParam && Object.values(BookingStatus).includes(statusParam as BookingStatus)
      ? (statusParam as BookingStatus)
      : undefined

    const bookings = await getAllBookings(status ? { status } : undefined)
    return Response.json({ success: true, data: bookings, error: null } satisfies ApiResponse<typeof bookings>)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch bookings"
    return Response.json(
      { success: false, data: null, error: message } satisfies ApiResponse<null>,
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json()
    const parsed = createBookingSchema.safeParse(body)

    if (!parsed.success) {
      const error = parsed.error.issues.map((i) => i.message).join("; ")
      return Response.json(
        { success: false, data: null, error } satisfies ApiResponse<null>,
        { status: 400 }
      )
    }

    const booking = await createBooking(parsed.data)

    // Non-blocking AI processing
    getPhysicianById(booking.physicianId)
      .then((physician) => {
        const specialty = physician?.specialty ?? "General"
        return Promise.all([
          generateIntakeSummary(booking.chiefComplaint, booking.additionalNotes, specialty),
          classifyUrgency(booking.chiefComplaint, booking.additionalNotes),
        ]).then(([intakeSummary, urgencyLevel]) =>
          updateBookingAiFields(booking.id, {
            intakeSummary: intakeSummary ?? undefined,
            urgencyLevel: urgencyLevel ?? undefined,
            aiProcessedAt: new Date(),
          })
        )
      })
      .catch(() => {
        // Swallow AI errors — do not affect booking response
      })

    return Response.json(
      { success: true, data: booking, error: null } satisfies ApiResponse<typeof booking>,
      { status: 201 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create booking"
    return Response.json(
      { success: false, data: null, error: message } satisfies ApiResponse<null>,
      { status: 500 }
    )
  }
}
