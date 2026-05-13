export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
}

export enum UrgencyLevel {
  ROUTINE = "ROUTINE",
  PRIORITY = "PRIORITY",
  URGENT = "URGENT",
}

export interface Physician {
  id: string
  name: string
  specialty: string
  credentials: string
  bio: string
  avatarUrl: string | null
  isAcceptingPatients: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Slot {
  id: string
  physicianId: string
  startTime: Date
  endTime: Date
  isBooked: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Booking {
  id: string
  physicianId: string
  slotId: string
  patientName: string
  patientEmail: string
  patientPhone: string
  patientDateOfBirth: Date
  chiefComplaint: string
  chiefComplaintCategory: string
  additionalNotes: string | null
  status: BookingStatus
  urgencyLevel: UrgencyLevel | null
  intakeSummary: string | null
  icdSuggestions: string | null
  aiProcessedAt: Date | null
  encounterTranscript: string | null
  soapNote: string | null
  encounterRecordedAt: Date | null
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface BookingStatusLog {
  id: string
  bookingId: string
  previousStatus: string
  newStatus: string
  changedAt: Date
  changedBy: string
}

export interface IcdSuggestion {
  code: string
  description: string
  confidence: number
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface CreateBookingInput {
  physicianId: string
  slotId: string
  patientName: string
  patientEmail: string
  patientPhone: string
  patientDateOfBirth: string
  chiefComplaint: string
  chiefComplaintCategory: string
  additionalNotes?: string
}

export type PhysicianWithSlots = Physician & { slots: Slot[] }

export type BookingWithPhysician = Booking & { physician: Physician; slot: Slot }

export type BookingWithDetails = BookingWithPhysician & { statusLogs: BookingStatusLog[] }
