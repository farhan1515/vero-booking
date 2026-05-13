import { updateBookingEncounterData } from "@/server/services/booking.service"
import { encounterBodySchema } from "@/lib/validations"
import type { ApiResponse } from "@/types"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params
    const parsed = encounterBodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return Response.json(
        { success: false, data: null, error: parsed.error.issues[0]?.message ?? "Invalid request" } satisfies ApiResponse<null>,
        { status: 400 }
      )
    }
    const { encounterTranscript, soapNote } = parsed.data

    await updateBookingEncounterData(id, {
      encounterTranscript,
      soapNote,
      encounterRecordedAt: new Date(),
    })

    return Response.json({ success: true, data: null, error: null } satisfies ApiResponse<null>)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save encounter"
    return Response.json(
      { success: false, data: null, error: message } satisfies ApiResponse<null>,
      { status: 500 }
    )
  }
}
