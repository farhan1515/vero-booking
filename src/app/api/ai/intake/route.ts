import { getBookingById, updateBookingAiFields } from "@/server/services/booking.service"
import { generateIntakeSummary } from "@/server/services/ai.service"
import type { ApiResponse } from "@/types"

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json()
    const { bookingId } = body as { bookingId: string }

    if (!bookingId) {
      return Response.json(
        { success: false, data: null, error: "bookingId is required" } satisfies ApiResponse<null>,
        { status: 400 }
      )
    }

    const booking = await getBookingById(bookingId)
    if (!booking) {
      return Response.json(
        { success: false, data: null, error: "Booking not found" } satisfies ApiResponse<null>,
        { status: 404 }
      )
    }

    const summary = await generateIntakeSummary(
      booking.chiefComplaint,
      booking.additionalNotes,
      booking.physician.specialty
    )

    if (summary) {
      await updateBookingAiFields(bookingId, { intakeSummary: summary })
    }

    return Response.json({ success: true, data: summary, error: null } satisfies ApiResponse<string | null>)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate intake summary"
    return Response.json(
      { success: false, data: null, error: message } satisfies ApiResponse<null>,
      { status: 500 }
    )
  }
}
