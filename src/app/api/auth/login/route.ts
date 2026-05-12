import { cookies } from "next/headers"
import type { ApiResponse } from "@/types"

export async function POST(request: Request): Promise<Response> {
  try {
    const { password } = (await request.json()) as { password: string }

    if (!password || password !== process.env.DASHBOARD_PASSWORD) {
      return Response.json(
        { success: false, data: null, error: "Invalid password" } satisfies ApiResponse<null>,
        { status: 401 }
      )
    }

    const cookieStore = await cookies()
    cookieStore.set("vb_session", password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return Response.json({ success: true, data: null, error: null } satisfies ApiResponse<null>)
  } catch {
    return Response.json(
      { success: false, data: null, error: "Invalid request body" } satisfies ApiResponse<null>,
      { status: 400 }
    )
  }
}
