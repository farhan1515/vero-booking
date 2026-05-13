import { openai } from "@/lib/openai"
import type { ApiResponse } from "@/types"

export const runtime = "nodejs"

export async function POST(request: Request): Promise<Response> {
  try {
    const formData = await request.formData()
    const audio = formData.get("audio") as File | null
    const bookingId = formData.get("bookingId") as string | null

    if (!audio || !bookingId) {
      return Response.json(
        { success: false, data: null, error: "audio and bookingId are required" } satisfies ApiResponse<null>,
        { status: 400 }
      )
    }

    const transcription = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: audio,
      language: "en",
      prompt: "Medical consultation. Patient describing symptoms to physician.",
    })

    return Response.json({
      success: true,
      data: { transcript: transcription.text },
      error: null,
    } satisfies ApiResponse<{ transcript: string }>)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transcription failed"
    return Response.json(
      { success: false, data: null, error: message } satisfies ApiResponse<null>,
      { status: 500 }
    )
  }
}
