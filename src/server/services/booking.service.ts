import { db } from "@/server/db/client"
import { BookingStatus, UrgencyLevel } from "@/types"
import type { CreateBookingInput } from "@/lib/validations"
import type { BookingWithDetails, BookingWithPhysician } from "@/types"

export async function createBooking(input: CreateBookingInput): Promise<BookingWithPhysician> {
  const booking = await db.$transaction(async (tx) => {
    const created = await tx.booking.create({
      data: {
        physicianId: input.physicianId,
        slotId: input.slotId,
        patientName: input.patientName,
        patientEmail: input.patientEmail,
        patientPhone: input.patientPhone,
        patientDateOfBirth: new Date(input.patientDateOfBirth),
        chiefComplaint: input.chiefComplaint,
        chiefComplaintCategory: input.chiefComplaintCategory,
        additionalNotes: input.additionalNotes,
        status: BookingStatus.PENDING,
      },
      include: { physician: true, slot: true },
    })

    await tx.slot.update({
      where: { id: input.slotId },
      data: { isBooked: true },
    })

    await tx.bookingStatusLog.create({
      data: {
        bookingId: created.id,
        previousStatus: "",
        newStatus: BookingStatus.PENDING,
        changedBy: "patient",
      },
    })

    return created
  })

  return booking as BookingWithPhysician
}

export async function getAllBookings(filters?: {
  status?: BookingStatus
}): Promise<BookingWithPhysician[]> {
  const bookings = await db.booking.findMany({
    where: {
      ...(filters?.status ? { status: filters.status } : {}),
    },
    include: { physician: true, slot: true },
    orderBy: { createdAt: "desc" },
  })
  return bookings as BookingWithPhysician[]
}

export async function getBookingById(id: string): Promise<BookingWithDetails | null> {
  const booking = await db.booking.findUnique({
    where: { id },
    include: {
      physician: true,
      slot: true,
      statusLogs: { orderBy: { changedAt: "asc" } },
    },
  })
  return booking as BookingWithDetails | null
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
  changedBy = "admin"
): Promise<BookingWithPhysician> {
  const booking = await db.$transaction(async (tx) => {
    const current = await tx.booking.findUniqueOrThrow({ where: { id } })

    const updated = await tx.booking.update({
      where: { id },
      data: { status },
      include: { physician: true, slot: true },
    })

    await tx.bookingStatusLog.create({
      data: {
        bookingId: id,
        previousStatus: current.status,
        newStatus: status,
        changedBy,
      },
    })

    return updated
  })

  return booking as BookingWithPhysician
}

export async function updateBookingEncounterData(
  id: string,
  data: {
    encounterTranscript: string
    soapNote: string
    encounterRecordedAt: Date
  }
) {
  return db.booking.update({
    where: { id },
    data,
  })
}

export async function updateBookingAiFields(
  id: string,
  fields: {
    urgencyLevel?: UrgencyLevel
    intakeSummary?: string
    icdSuggestions?: string
    aiProcessedAt?: Date
  }
) {
  return db.booking.update({
    where: { id },
    data: {
      ...fields,
      aiProcessedAt: fields.aiProcessedAt ?? new Date(),
    },
  })
}
