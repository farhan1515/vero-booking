import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"

export const runtime = "edge"

interface BookingContext {
  patientName: string
  patientDateOfBirth: string
  chiefComplaint: string
  additionalNotes?: string | null
  specialty: string
  intakeSummary?: string | null
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json()
    const { messages, bookingContext } = body as {
      messages: ChatMessage[]
      bookingContext: BookingContext
    }

    const dob = bookingContext.patientDateOfBirth
      ? new Date(bookingContext.patientDateOfBirth).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Unknown"

    const systemPrompt = `You are Vero, a clinical AI assistant helping a physician prepare for a patient encounter. You have access to the patient's intake:

Patient: ${bookingContext.patientName}, DOB: ${dob}
Chief complaint: ${bookingContext.chiefComplaint}
Notes: ${bookingContext.additionalNotes || "None provided"}
Physician specialty: ${bookingContext.specialty}
AI intake summary: ${bookingContext.intakeSummary || "Not yet generated"}

Answer clinical questions concisely and accurately. When relevant, mention you'd recommend verifying with current clinical guidelines. Never diagnose — support the physician.`

    const result = streamText({
      model: openai("gpt-4o-mini"),
      temperature: 0.4,
      maxOutputTokens: 600,
      system: systemPrompt,
      messages,
    })

    return result.toTextStreamResponse()
  } catch (err) {
    const message = err instanceof Error ? err.message : "Chat stream failed"
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
