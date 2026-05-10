import { getPhysicianById } from "@/server/services/physician.service"
import type { ApiResponse } from "@/types"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params
    const physician = await getPhysicianById(id)

    if (!physician) {
      return Response.json(
        { success: false, data: null, error: "Physician not found" } satisfies ApiResponse<null>,
        { status: 404 }
      )
    }

    return Response.json({ success: true, data: physician, error: null } satisfies ApiResponse<typeof physician>)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch physician"
    return Response.json(
      { success: false, data: null, error: message } satisfies ApiResponse<null>,
      { status: 500 }
    )
  }
}
