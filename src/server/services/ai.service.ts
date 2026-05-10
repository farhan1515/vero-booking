import { openai } from "@/lib/openai"
import { UrgencyLevel, type IcdSuggestion } from "@/types"

export async function generateIntakeSummary(
  chiefComplaint: string,
  additionalNotes: string | null | undefined,
  specialty: string
): Promise<string | null> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 400,
      messages: [
        {
          role: "system",
          content:
            "You are a clinical documentation assistant. Generate concise, accurate intake summaries using standard SOAP format. Use clinical language appropriate for physician review.",
        },
        {
          role: "user",
          content: `Generate a concise SOAP-style intake note for a physician.
Patient reports: ${chiefComplaint}
Additional notes: ${additionalNotes || "None provided"}
Specialty: ${specialty}

Format exactly as:
S: (what patient reports — subjective)
O: (what to examine — leave as "To be obtained on exam")
A: (likely considerations based on complaint)
P: (suggested next steps)

Keep under 200 words. Use clinical language.`,
        },
      ],
    })

    return response.choices[0]?.message?.content?.trim() ?? null
  } catch {
    return null
  }
}

export async function classifyUrgency(
  chiefComplaint: string,
  additionalNotes: string | null | undefined
): Promise<UrgencyLevel | null> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 10,
      messages: [
        {
          role: "system",
          content:
            "You are a clinical triage assistant. Classify patient complaint urgency. Respond with exactly one word.",
        },
        {
          role: "user",
          content: `Classify this patient complaint urgency.
Return ONLY one word: ROUTINE, PRIORITY, or URGENT.

URGENT = chest pain, difficulty breathing, severe acute symptoms, neurological changes.
PRIORITY = concerning but not emergency, worsening chronic condition, significant new symptoms.
ROUTINE = checkups, mild symptoms, prescription refills, stable follow-ups.

Complaint: ${chiefComplaint}
Notes: ${additionalNotes || "None"}`,
        },
      ],
    })

    const raw = response.choices[0]?.message?.content?.trim().toUpperCase()
    if (raw === "URGENT") return UrgencyLevel.URGENT
    if (raw === "PRIORITY") return UrgencyLevel.PRIORITY
    if (raw === "ROUTINE") return UrgencyLevel.ROUTINE
    return null
  } catch {
    return null
  }
}

export async function suggestIcdCodes(
  chiefComplaint: string,
  intakeSummary: string | null | undefined,
  specialty: string
): Promise<IcdSuggestion[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 300,
      messages: [
        {
          role: "system",
          content:
            "You are a clinical coding assistant. Suggest ICD-10 codes for clinical presentations. Return only valid JSON.",
        },
        {
          role: "user",
          content: `Suggest the top 3 most likely ICD-10 codes for this clinical presentation.
Return ONLY a valid JSON array with no other text:
[{"code":"X00.0","description":"...","confidence":0.85}]

Chief complaint: ${chiefComplaint}
Clinical summary: ${intakeSummary || "Not yet generated"}
Specialty: ${specialty}

Confidence values must sum to 1.0.`,
        },
      ],
    })

    const content = response.choices[0]?.message?.content?.trim()
    if (!content) return []

    const parsed = JSON.parse(content) as IcdSuggestion[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}
