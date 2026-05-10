import { getAllPhysicians } from "@/server/services/physician.service"
import type { ApiResponse } from "@/types"

export async function GET(): Promise<Response> {
  try {
    const physicians = await getAllPhysicians()
    return Response.json({ success: true, data: physicians, error: null } satisfies ApiResponse<typeof physicians>)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch physicians"
    return Response.json(
      { success: false, data: null, error: message } satisfies ApiResponse<null>,
      { status: 500 }
    )
  }
}
