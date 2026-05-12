import { updateBookingAiFields } from "@/server/services/booking.service"
import type { ApiResponse } from "@/types"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params
    const body = await request.json()
    const { intakeSummary } = body as { intakeSummary: string }

    if (!intakeSummary) {
      return Response.json(
        { success: false, data: null, error: "intakeSummary is required" } satisfies ApiResponse<null>,
        { status: 400 }
      )
    }

    await updateBookingAiFields(id, {
      intakeSummary,
      aiProcessedAt: new Date(),
    })

    return Response.json({ success: true, data: null, error: null } satisfies ApiResponse<null>)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save summary"
    return Response.json(
      { success: false, data: null, error: message } satisfies ApiResponse<null>,
      { status: 500 }
    )
  }
}
