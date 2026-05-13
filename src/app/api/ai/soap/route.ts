import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { soapBodySchema } from "@/lib/validations"
import type { ApiResponse } from "@/types"

export const runtime = "edge"

export async function POST(request: Request): Promise<Response> {
  try {
    const parsed = soapBodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return Response.json(
        { success: false, data: null, error: parsed.error.issues[0]?.message ?? "Invalid request" } satisfies ApiResponse<null>,
        { status: 400 }
      )
    }
    const { transcript, specialty, bookingId } = parsed.data

    const result = streamText({
      model: openai("gpt-4o-mini"),
      temperature: 0.2,
      maxOutputTokens: 600,
      system: `You are a clinical documentation AI. Generate a structured SOAP note from this physician-patient encounter transcript. Physician specialty: ${specialty}

Format exactly as:
**SUBJECTIVE**
[What the patient reported — symptoms, duration, severity]

**OBJECTIVE**
[Observable findings mentioned in the conversation]

**ASSESSMENT**
[Clinical interpretation and likely diagnosis]

**PLAN**
[Next steps, tests ordered, treatments, follow-up]

Be concise and clinical. Use medical terminology appropriate for ${specialty}. If information is not in the transcript, write "Not discussed" rather than guessing.`,
      prompt: `Transcript: ${transcript}`,
    })

    return result.toTextStreamResponse()
  } catch (err) {
    const message = err instanceof Error ? err.message : "SOAP generation failed"
    return Response.json(
      { success: false, data: null, error: message } satisfies ApiResponse<null>,
      { status: 500 }
    )
  }
}
