import { z } from "zod"
import { BookingStatus } from "@/types"

export const createBookingSchema = z.object({
  physicianId: z.string().min(1, "Physician is required"),
  slotId: z.string().min(1, "Time slot is required"),
  patientName: z.string().min(2, "Full name is required").max(100),
  patientEmail: z.string().email("Valid email is required"),
  patientPhone: z.string().min(7, "Phone number is required").max(20),
  patientDateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
  chiefComplaint: z
    .string()
    .min(10, "Please describe your concern in at least 10 characters")
    .max(1000),
  chiefComplaintCategory: z.string().min(1, "Category is required"),
  additionalNotes: z.string().max(2000).optional(),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>

export const updateBookingStatusSchema = z.object({
  id: z.string().min(1),
  status: z.nativeEnum(BookingStatus),
})

export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>

// ── AI route bodies ───────────────────────────────────────────────────────────

export const bookingIdBodySchema = z.object({
  bookingId: z.string().min(1, "bookingId is required"),
})

export const soapBodySchema = z.object({
  transcript: z.string().min(1, "transcript is required"),
  specialty:  z.string().min(1, "specialty is required"),
  bookingId:  z.string().min(1, "bookingId is required"),
})

export const streamIntakeBodySchema = z.object({
  chiefComplaint:  z.string().min(1, "chiefComplaint is required"),
  additionalNotes: z.string().nullish(),
  specialty:       z.string().min(1, "specialty is required"),
})

export const encounterBodySchema = z.object({
  encounterTranscript: z.string().min(1, "encounterTranscript is required"),
  soapNote:            z.string().min(1, "soapNote is required"),
})

const chatMessageSchema = z.object({
  role:    z.enum(["user", "assistant"]),
  content: z.string(),
})

const bookingContextSchema = z.object({
  patientName:        z.string(),
  patientDateOfBirth: z.string(),
  chiefComplaint:     z.string(),
  additionalNotes:    z.string().nullish(),
  specialty:          z.string(),
  intakeSummary:      z.string().nullish(),
})

export const chatBodySchema = z.object({
  messages:       z.array(chatMessageSchema).min(1),
  bookingContext: bookingContextSchema,
})
