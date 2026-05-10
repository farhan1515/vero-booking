import { db } from "@/server/db/client"
import type { PhysicianWithSlots } from "@/types"

export async function getAllPhysicians(): Promise<PhysicianWithSlots[]> {
  const physicians = await db.physician.findMany({
    where: { isAcceptingPatients: true },
    orderBy: { specialty: "asc" },
    include: {
      slots: {
        where: {
          isBooked: false,
          startTime: { gt: new Date() },
        },
        orderBy: { startTime: "asc" },
      },
    },
  })
  return physicians as PhysicianWithSlots[]
}

export async function getPhysicianById(id: string): Promise<PhysicianWithSlots | null> {
  const physician = await db.physician.findUnique({
    where: { id },
    include: {
      slots: {
        where: {
          isBooked: false,
          startTime: { gt: new Date() },
        },
        orderBy: { startTime: "asc" },
      },
    },
  })
  return physician as PhysicianWithSlots | null
}

export async function getAvailableSlots(physicianId: string) {
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

  return db.slot.findMany({
    where: {
      physicianId,
      isBooked: false,
      startTime: {
        gt: new Date(),
        lte: sevenDaysFromNow,
      },
    },
    orderBy: { startTime: "asc" },
  })
}
