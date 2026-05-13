import { getBookingById, updateBookingAiFields } from "@/server/services/booking.service"
import { suggestIcdCodes } from "@/server/services/ai.service"
import { bookingIdBodySchema } from "@/lib/validations"
import type { ApiResponse, IcdSuggestion } from "@/types"

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

    const suggestions = await suggestIcdCodes(
      booking.chiefComplaint,
      booking.intakeSummary,
      booking.physician.specialty
    )

    await updateBookingAiFields(bookingId, {
      icdSuggestions: JSON.stringify(suggestions),
    })

    return Response.json({
      success: true,
      data: suggestions,
      error: null,
    } satisfies ApiResponse<IcdSuggestion[]>)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate ICD suggestions"
    return Response.json(
      { success: false, data: null, error: message } satisfies ApiResponse<null>,
      { status: 500 }
    )
  }
}
