import { getBookingById } from "@/server/services/booking.service"
import { openai } from "@/lib/openai"
import { bookingIdBodySchema } from "@/lib/validations"
import type { ApiResponse } from "@/types"

export interface ClinicalInsights {
  consider: string[]
  questions: string[]
  watchFor: string[]
}

const EMPTY: ClinicalInsights = { consider: [], questions: [], watchFor: [] }

export async function POST(request: Request): Promise<Response> {
  try {
    const parsed = bookingIdBodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return Response.json(
        { success: false, data: EMPTY, error: parsed.error.issues[0]?.message ?? "Invalid request" } satisfies ApiResponse<ClinicalInsights>,
        { status: 400 }
      )
    }
    const { bookingId } = parsed.data

    const booking = await getBookingById(bookingId)
    if (!booking) {
      return Response.json(
        { success: false, data: EMPTY, error: "Booking not found" } satisfies ApiResponse<ClinicalInsights>,
        { status: 404 }
      )
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content:
            "You are a clinical decision support tool. Return ONLY valid JSON, no other text.",
        },
        {
          role: "user",
          content: `Based on this patient intake, generate structured insights for the physician.

Patient chief complaint: ${booking.chiefComplaint}
Additional notes: ${booking.additionalNotes || "None"}
Physician specialty: ${booking.physician.specialty}

Return ONLY valid JSON in this exact shape:
{
  "consider": ["string1", "string2", "string3"],
  "questions": ["string1", "string2", "string3"],
  "watchFor": ["string1", "string2", "string3"]
}

consider: top 3 differential diagnoses to consider
questions: top 3 follow-up questions the physician should ask
watchFor: top 3 red flags or warning signs to monitor

Be concise. Each item max 10 words. Clinical language.`,
        },
      ],
    })

    const raw = response.choices[0]?.message?.content?.trim()
    if (!raw) {
      return Response.json({ success: true, data: EMPTY, error: null } satisfies ApiResponse<ClinicalInsights>)
    }

    let insights: ClinicalInsights
    try {
      const parsed = JSON.parse(raw) as Partial<ClinicalInsights>
      insights = {
        consider: Array.isArray(parsed.consider) ? parsed.consider : [],
        questions: Array.isArray(parsed.questions) ? parsed.questions : [],
        watchFor: Array.isArray(parsed.watchFor) ? parsed.watchFor : [],
      }
    } catch {
      insights = EMPTY
    }

    return Response.json({ success: true, data: insights, error: null } satisfies ApiResponse<ClinicalInsights>)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate insights"
    return Response.json(
      { success: false, data: EMPTY, error: message } satisfies ApiResponse<ClinicalInsights>,
      { status: 500 }
    )
  }
}
