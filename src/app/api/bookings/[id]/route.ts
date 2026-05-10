import { getBookingById, updateBookingStatus } from "@/server/services/booking.service"
import { updateBookingStatusSchema } from "@/lib/validations"
import type { ApiResponse } from "@/types"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params
    const booking = await getBookingById(id)

    if (!booking) {
      return Response.json(
        { success: false, data: null, error: "Booking not found" } satisfies ApiResponse<null>,
        { status: 404 }
      )
    }

    return Response.json({ success: true, data: booking, error: null } satisfies ApiResponse<typeof booking>)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch booking"
    return Response.json(
      { success: false, data: null, error: message } satisfies ApiResponse<null>,
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = updateBookingStatusSchema.safeParse({ ...body, id })

    if (!parsed.success) {
      const error = parsed.error.issues.map((i) => i.message).join("; ")
      return Response.json(
        { success: false, data: null, error } satisfies ApiResponse<null>,
        { status: 400 }
      )
    }

    const booking = await updateBookingStatus(parsed.data.id, parsed.data.status)
    return Response.json({ success: true, data: booking, error: null } satisfies ApiResponse<typeof booking>)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update booking"
    return Response.json(
      { success: false, data: null, error: message } satisfies ApiResponse<null>,
      { status: 500 }
    )
  }
}
