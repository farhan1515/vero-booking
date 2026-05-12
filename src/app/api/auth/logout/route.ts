import { cookies } from "next/headers"
import type { ApiResponse } from "@/types"

export async function POST(): Promise<Response> {
  const cookieStore = await cookies()
  cookieStore.delete("vb_session")
  return Response.json({ success: true, data: null, error: null } satisfies ApiResponse<null>)
}
