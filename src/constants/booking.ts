import { BookingStatus, UrgencyLevel } from "@/types"

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: "Pending",
  [BookingStatus.CONFIRMED]: "Confirmed",
  [BookingStatus.CANCELLED]: "Cancelled",
}

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: "bg-amber-100 text-amber-800 border-amber-200",
  [BookingStatus.CONFIRMED]: "bg-green-100 text-green-800 border-green-200",
  [BookingStatus.CANCELLED]: "bg-red-100 text-red-800 border-red-200",
}

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  [UrgencyLevel.ROUTINE]: "Routine",
  [UrgencyLevel.PRIORITY]: "Priority",
  [UrgencyLevel.URGENT]: "Urgent",
}

export const URGENCY_COLORS: Record<UrgencyLevel, string> = {
  [UrgencyLevel.ROUTINE]: "bg-gray-100 text-gray-700 border-gray-200",
  [UrgencyLevel.PRIORITY]: "bg-amber-100 text-amber-800 border-amber-200",
  [UrgencyLevel.URGENT]: "bg-red-100 text-red-800 border-red-200",
}

export const CHIEF_COMPLAINT_CATEGORIES = [
  "Routine Checkup",
  "New Symptom",
  "Follow-up Visit",
  "Urgent Concern",
  "Mental Health",
  "Referral",
  "Chronic Disease Management",
  "Preventive Care",
] as const

export type ChiefComplaintCategory = (typeof CHIEF_COMPLAINT_CATEGORIES)[number]
