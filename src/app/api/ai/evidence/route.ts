import { getBookingById } from "@/server/services/booking.service"
import { openai } from "@/lib/openai"
import type { ApiResponse } from "@/types"

export interface EvidenceReference {
  title: string
  source: string
  relevance: string
  searchQuery: string
}

const EMPTY: EvidenceReference[] = []

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json()
    const { bookingId } = body as { bookingId: string }

    if (!bookingId) {
      return Response.json(
        { success: false, data: EMPTY, error: "bookingId is required" } satisfies ApiResponse<EvidenceReference[]>,
        { status: 400 }
      )
    }

    const booking = await getBookingById(bookingId)
    if (!booking) {
      return Response.json(
        { success: false, data: EMPTY, error: "Booking not found" } satisfies ApiResponse<EvidenceReference[]>,
        { status: 404 }
      )
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 600,
      messages: [
        {
          role: "system",
          content: "You are a clinical evidence assistant. Return ONLY valid JSON, no other text.",
        },
        {
          role: "user",
          content: `Based on this clinical presentation, suggest 3 relevant clinical guidelines or evidence-based references a physician should review.

Chief complaint: ${booking.chiefComplaint}
Specialty: ${booking.physician.specialty}

Return ONLY valid JSON array:
[
  {
    "title": "Guideline or article title",
    "source": "Organization name (e.g. ACC, AHA, NICE, CCS)",
    "relevance": "One sentence why this is relevant",
    "searchQuery": "PubMed search terms to find this"
  }
]
Return exactly 3 items. No other text.`,
        },
      ],
    })

    const raw = response.choices[0]?.message?.content?.trim()
    if (!raw) {
      return Response.json({ success: true, data: EMPTY, error: null } satisfies ApiResponse<EvidenceReference[]>)
    }

    let references: EvidenceReference[]
    try {
      references = JSON.parse(raw) as EvidenceReference[]
      if (!Array.isArray(references)) references = EMPTY
    } catch {
      references = EMPTY
    }

    return Response.json({
      success: true,
      data: references,
      error: null,
    } satisfies ApiResponse<EvidenceReference[]>)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch evidence"
    return Response.json(
      { success: false, data: EMPTY, error: message } satisfies ApiResponse<EvidenceReference[]>,
      { status: 500 }
    )
  }
}
