import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { streamIntakeBodySchema } from "@/lib/validations"
import type { ApiResponse } from "@/types"

export const runtime = "edge"

export async function POST(request: Request): Promise<Response> {
  try {
    const parsed = streamIntakeBodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return Response.json(
        { success: false, data: null, error: parsed.error.issues[0]?.message ?? "Invalid request" } satisfies ApiResponse<null>,
        { status: 400 }
      )
    }
    const { chiefComplaint, additionalNotes, specialty } = parsed.data

    const result = streamText({
      model: openai("gpt-4o-mini"),
      temperature: 0.3,
      maxOutputTokens: 400,
      system:
        "You are a clinical documentation assistant. Generate concise, accurate intake summaries using standard SOAP format. Use clinical language appropriate for physician review.",
      prompt: `Generate a concise SOAP-style intake note for a physician.
Patient reports: ${chiefComplaint}
Additional notes: ${additionalNotes || "None provided"}
Specialty: ${specialty}

Format exactly as:
S: (what patient reports — subjective)
O: (what to examine — leave as "To be obtained on exam")
A: (likely considerations based on complaint)
P: (suggested next steps)

Keep under 200 words. Use clinical language.`,
    })

    return result.toTextStreamResponse()
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stream failed"
    return Response.json(
      { success: false, data: null, error: message } satisfies ApiResponse<null>,
      { status: 500 }
    )
  }
}
