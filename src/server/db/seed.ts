import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../lib/generated/prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// ─── Helpers ──────────────────────────────────────────────────────────────────

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function setHour(date: Date, hour: number): Date {
  const d = new Date(date)
  d.setHours(hour, 0, 0, 0)
  return d
}

// ─── Physicians ───────────────────────────────────────────────────────────────

const physicianData = [
  {
    name: "Dr. Sarah Chen",
    specialty: "Family Medicine",
    credentials: "MD, CCFP",
    bio: "Dr. Chen has practiced family medicine in Toronto for 12 years with a focus on preventive care and chronic disease management.",
    avatarUrl: null,
    isAcceptingPatients: true,
  },
  {
    name: "Dr. Marcus Webb",
    specialty: "Internal Medicine",
    credentials: "MD, FRCPC",
    bio: "Dr. Webb specializes in complex multi-system conditions and serves as a consultant for several Toronto hospitals.",
    avatarUrl: null,
    isAcceptingPatients: true,
  },
  {
    name: "Dr. Aisha Okonkwo",
    specialty: "Cardiology",
    credentials: "MD, FRCPC, FACC",
    bio: "Dr. Okonkwo is an interventional cardiologist with expertise in heart failure and structural heart disease.",
    avatarUrl: null,
    isAcceptingPatients: true,
  },
  {
    name: "Dr. James Harrington",
    specialty: "Psychiatry",
    credentials: "MD, FRCPC",
    bio: "Dr. Harrington focuses on mood disorders, anxiety, and trauma-informed care using evidence-based therapies.",
    avatarUrl: null,
    isAcceptingPatients: true,
  },
  {
    name: "Dr. Priya Nair",
    specialty: "Pediatrics",
    credentials: "MD, FRCPC, FAAP",
    bio: "Dr. Nair specializes in child development, asthma management, and adolescent medicine.",
    avatarUrl: null,
    isAcceptingPatients: true,
  },
  {
    name: "Dr. Robert Kowalski",
    specialty: "Emergency Medicine",
    credentials: "MD, CCFP-EM, FRCPC",
    bio: "Dr. Kowalski brings 18 years of emergency medicine experience and leads urgent care training at his institution.",
    avatarUrl: null,
    isAcceptingPatients: false,
  },
]

// ─── Slot generation ──────────────────────────────────────────────────────────

const SLOT_HOURS = [9, 10, 11, 14, 15] // 9am, 10am, 11am, 2pm, 3pm

function generateSlots(physicianId: string, startFromDay = 0) {
  const slots: { physicianId: string; startTime: Date; endTime: Date; isBooked: boolean }[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let day = startFromDay; day < startFromDay + 7; day++) {
    const date = addDays(today, day + 1) // start from tomorrow
    for (const hour of SLOT_HOURS) {
      const start = setHour(new Date(date), hour)
      const end = setHour(new Date(date), hour + 1)
      slots.push({ physicianId, startTime: start, endTime: end, isBooked: false })
    }
  }
  return slots // 7 days × 5 slots = 35 slots; we'll use 15 per physician
}

// ─── Booking data ─────────────────────────────────────────────────────────────

const icdSuggestionsHypertension = JSON.stringify([
  { code: "I10", description: "Essential (primary) hypertension", probability: 0.82 },
  { code: "I11.9", description: "Hypertensive heart disease without heart failure", probability: 0.11 },
  { code: "R03.0", description: "Elevated blood-pressure reading, without diagnosis", probability: 0.07 },
])

const icdSuggestionsAnxiety = JSON.stringify([
  { code: "F41.1", description: "Generalized anxiety disorder", probability: 0.74 },
  { code: "F41.0", description: "Panic disorder without agoraphobia", probability: 0.15 },
  { code: "F41.9", description: "Anxiety disorder, unspecified", probability: 0.11 },
])

const icdSuggestionsChestPain = JSON.stringify([
  { code: "R07.9", description: "Chest pain, unspecified", probability: 0.45 },
  { code: "I25.10", description: "Atherosclerotic heart disease of native coronary artery", probability: 0.30 },
  { code: "M54.6", description: "Pain in thoracic spine", probability: 0.25 },
])

// ─── Main seed ────────────────────────────────────────────────────────────────

export async function main() {
  console.log("🌱 Seeding database...")

  // Wipe existing data in dependency order
  await prisma.bookingStatusLog.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.slot.deleteMany()
  await prisma.physician.deleteMany()

  // Create physicians
  const physicians = await Promise.all(
    physicianData.map((data) => prisma.physician.create({ data }))
  )
  console.log(`  ✔ Created ${physicians.length} physicians`)

  const [chen, webb, okonkwo, harrington, nair, kowalski] = physicians

  // Create 15 slots per physician (first 3 days × 5 hours)
  const allSlotData = physicians.flatMap((p) =>
    generateSlots(p.id).slice(0, 15)
  )
  const createdSlots = await prisma.slot.createMany({ data: allSlotData })
  console.log(`  ✔ Created ${createdSlots.count} slots`)

  // Fetch some specific slots to attach bookings to
  const chenSlots = await prisma.slot.findMany({
    where: { physicianId: chen.id },
    take: 3,
    orderBy: { startTime: "asc" },
  })
  const webbSlots = await prisma.slot.findMany({
    where: { physicianId: webb.id },
    take: 3,
    orderBy: { startTime: "asc" },
  })
  const okonkwoSlots = await prisma.slot.findMany({
    where: { physicianId: okonkwo.id },
    take: 2,
    orderBy: { startTime: "asc" },
  })

  // ── 3 CONFIRMED bookings with full AI data ──
  const confirmed1 = await prisma.booking.create({
    data: {
      physicianId: chen.id,
      slotId: chenSlots[0].id,
      patientName: "Margaret Liu",
      patientEmail: "margaret.liu@email.com",
      patientPhone: "416-555-0142",
      patientDateOfBirth: new Date("1968-03-14"),
      chiefComplaint: "Persistent headaches and elevated blood pressure readings at home for the past 3 weeks. History of hypertension.",
      chiefComplaintCategory: "Chronic Condition Follow-up",
      additionalNotes: "Patient monitors BP daily. Readings averaging 148/92.",
      status: "CONFIRMED",
      urgencyLevel: "PRIORITY",
      intakeSummary: "S: 56-year-old female with known hypertension presenting with persistent headaches and elevated home BP readings (avg 148/92) over 3 weeks. Reports compliance with current antihypertensive regimen. Denies chest pain, shortness of breath, or visual changes.\n\nO: To be obtained on exam. Home BP log provided.\n\nA: Suboptimal hypertension control; headaches likely hypertension-related. Rule out secondary causes or medication non-compliance.\n\nP: Review current medications and adherence. Consider dose adjustment or addition of second agent. Order BMP, CBC, urinalysis. Reinforce lifestyle modifications.",
      icdSuggestions: icdSuggestionsHypertension,
      aiProcessedAt: new Date(Date.now() - 1000 * 60 * 30),
    },
  })

  const confirmed2 = await prisma.booking.create({
    data: {
      physicianId: harrington.id,
      slotId: (await prisma.slot.findFirst({ where: { physicianId: harrington.id }, orderBy: { startTime: "asc" } }))!.id,
      patientName: "Daniel Osei",
      patientEmail: "d.osei@email.com",
      patientPhone: "647-555-0287",
      patientDateOfBirth: new Date("1991-07-22"),
      chiefComplaint: "Increased anxiety, difficulty concentrating, sleep disturbances for 2 months following job loss. Feeling overwhelmed and irritable.",
      chiefComplaintCategory: "Mental Health",
      additionalNotes: "No prior psychiatric history. Denies SI/HI.",
      status: "CONFIRMED",
      urgencyLevel: "ROUTINE",
      intakeSummary: "S: 34-year-old male presenting with 2-month history of anxiety, insomnia, and difficulty concentrating following recent job loss. Describes pervasive worry, irritability, and restlessness. Denies suicidal or homicidal ideation. No prior psychiatric diagnoses. Denies substance use.\n\nO: Mental status exam pending. Appears well-kempt, cooperative.\n\nA: New-onset anxiety disorder, likely situational/adjustment-related. Generalized anxiety disorder on differential.\n\nP: Complete PHQ-9 and GAD-7 screening tools. Discuss CBT referral and psychoeducation. Consider SSRI if symptoms persist or worsen. Follow-up in 4 weeks.",
      icdSuggestions: icdSuggestionsAnxiety,
      aiProcessedAt: new Date(Date.now() - 1000 * 60 * 45),
    },
  })

  const confirmed3 = await prisma.booking.create({
    data: {
      physicianId: okonkwo.id,
      slotId: okonkwoSlots[0].id,
      patientName: "Helen Tremblay",
      patientEmail: "helen.tremblay@email.com",
      patientPhone: "416-555-0399",
      patientDateOfBirth: new Date("1955-11-08"),
      chiefComplaint: "Intermittent chest tightness and shortness of breath on exertion over the past 6 weeks. Also reports occasional palpitations.",
      chiefComplaintCategory: "Cardiovascular",
      additionalNotes: "Smoker, 1 pack/day × 30 years. Family history of CAD.",
      status: "CONFIRMED",
      urgencyLevel: "URGENT",
      intakeSummary: "S: 69-year-old female with significant smoking history (30 pack-years) and family history of CAD presenting with 6-week history of exertional chest tightness, dyspnea on exertion, and palpitations. Symptoms occur with moderate activity. No rest symptoms or diaphoresis reported.\n\nO: Cardiac exam and vital signs pending. ECG to be ordered.\n\nA: High suspicion for stable angina vs. new-onset heart failure in context of significant cardiovascular risk factors. Arrhythmia on differential for palpitations.\n\nP: Urgent ECG in office. Order stress test, echo, BNP, troponin, lipid panel, HbA1c. Refer to cardiology if workup positive. Smoking cessation counseling.",
      icdSuggestions: icdSuggestionsChestPain,
      aiProcessedAt: new Date(Date.now() - 1000 * 60 * 20),
    },
  })

  // ── 3 PENDING bookings (no AI data yet) ──
  const pending1 = await prisma.booking.create({
    data: {
      physicianId: chen.id,
      slotId: chenSlots[1].id,
      patientName: "Amir Khalil",
      patientEmail: "amir.khalil@email.com",
      patientPhone: "416-555-0178",
      patientDateOfBirth: new Date("1983-05-30"),
      chiefComplaint: "Lower back pain radiating to left leg for 2 weeks. Worsens with prolonged sitting.",
      chiefComplaintCategory: "Musculoskeletal",
      status: "PENDING",
    },
  })

  const pending2 = await prisma.booking.create({
    data: {
      physicianId: nair.id,
      slotId: (await prisma.slot.findFirst({ where: { physicianId: nair.id }, orderBy: { startTime: "asc" } }))!.id,
      patientName: "Sophie Beaumont",
      patientEmail: "sophie.beaumont@email.com",
      patientPhone: "647-555-0214",
      patientDateOfBirth: new Date("2015-09-12"),
      chiefComplaint: "Child presenting with persistent cough and mild wheezing for 10 days. History of seasonal allergies.",
      chiefComplaintCategory: "Respiratory",
      status: "PENDING",
    },
  })

  const pending3 = await prisma.booking.create({
    data: {
      physicianId: webb.id,
      slotId: webbSlots[0].id,
      patientName: "Thomas Bergmann",
      patientEmail: "t.bergmann@email.com",
      patientPhone: "416-555-0461",
      patientDateOfBirth: new Date("1949-02-17"),
      chiefComplaint: "Fatigue, unexplained weight loss of 8 lbs over 3 months, and night sweats. No fever.",
      chiefComplaintCategory: "New Symptom",
      additionalNotes: "Patient requests full workup. No recent travel.",
      status: "PENDING",
    },
  })

  // ── 2 CANCELLED bookings ──
  const cancelled1 = await prisma.booking.create({
    data: {
      physicianId: chen.id,
      slotId: chenSlots[2].id,
      patientName: "Laura Sinclair",
      patientEmail: "laura.sinclair@email.com",
      patientPhone: "416-555-0552",
      patientDateOfBirth: new Date("1975-12-03"),
      chiefComplaint: "Annual physical exam and routine bloodwork review.",
      chiefComplaintCategory: "Preventive Care",
      status: "CANCELLED",
    },
  })

  const cancelled2 = await prisma.booking.create({
    data: {
      physicianId: webb.id,
      slotId: webbSlots[1].id,
      patientName: "Kevin Park",
      patientEmail: "kevin.park@email.com",
      patientPhone: "647-555-0338",
      patientDateOfBirth: new Date("1988-08-19"),
      chiefComplaint: "Follow-up for Type 2 diabetes management and HbA1c review.",
      chiefComplaintCategory: "Chronic Condition Follow-up",
      status: "CANCELLED",
    },
  })

  console.log(`  ✔ Created 8 bookings (3 CONFIRMED, 3 PENDING, 2 CANCELLED)`)

  // ── Mark booked slots ──
  const bookedSlotIds = [
    confirmed1.slotId,
    confirmed2.slotId,
    confirmed3.slotId,
    pending1.slotId,
    pending2.slotId,
    pending3.slotId,
    cancelled1.slotId,
    cancelled2.slotId,
  ]
  await prisma.slot.updateMany({
    where: { id: { in: bookedSlotIds } },
    data: { isBooked: true },
  })
  console.log(`  ✔ Marked ${bookedSlotIds.length} slots as booked`)

  // ── Audit log entries for status changes ──
  const statusLogs = [
    { bookingId: confirmed1.id, previousStatus: "PENDING", newStatus: "CONFIRMED", changedBy: "admin" },
    { bookingId: confirmed2.id, previousStatus: "PENDING", newStatus: "CONFIRMED", changedBy: "admin" },
    { bookingId: confirmed3.id, previousStatus: "PENDING", newStatus: "CONFIRMED", changedBy: "admin" },
    { bookingId: cancelled1.id, previousStatus: "PENDING", newStatus: "CANCELLED", changedBy: "patient" },
    { bookingId: cancelled2.id, previousStatus: "PENDING", newStatus: "CANCELLED", changedBy: "admin" },
  ]
  await prisma.bookingStatusLog.createMany({ data: statusLogs })
  console.log(`  ✔ Created ${statusLogs.length} audit log entries`)

  const totalPhysicians = await prisma.physician.count()
  const totalSlots = await prisma.slot.count()
  const totalBookings = await prisma.booking.count()
  const totalLogs = await prisma.bookingStatusLog.count()

  console.log("\n✅ Seed complete:")
  console.log(`   Physicians: ${totalPhysicians}`)
  console.log(`   Slots:      ${totalSlots}`)
  console.log(`   Bookings:   ${totalBookings}`)
  console.log(`   Audit logs: ${totalLogs}`)
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
