import { getBookingById, updateBookingAiFields } from "@/server/services/booking.service"
import { generateIntakeSummary } from "@/server/services/ai.service"
import { bookingIdBodySchema } from "@/lib/validations"
import type { ApiResponse } from "@/types"

export async function POST(request: Request): Promise<Response> {
  try {
    const parsed = bookingIdBodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return Response.json(
        { success: false, data: null, error: parsed.error.issues[0]?.message ?? "Invalid request" } satisfies ApiResponse<null>,
        { status: 400 }
      )
    }
    const { bookingId } = parsed.data

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
