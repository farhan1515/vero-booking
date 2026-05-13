# Vero Booking

**Live demo:** https://vero-booking.vercel.app  
**Admin dashboard:** https://vero-booking.vercel.app/dashboard

---

<!--
  SCREENSHOTS — add these after running the app locally or using the live demo.
  Recommended tool: macOS Screenshot (Cmd+Shift+4) or Cleanshot X.
  Save PNGs into /public/screenshots/ and update the paths below.
  Suggested shots:
    1. Landing page hero (with animated SOAP card visible)
    2. Physician browser / booking form
    3. Confirmation page (animated checkmark)
    4. Admin dashboard (all bookings, stat cards)
    5. Booking detail — AI Insights tab
    6. Booking detail — Encounter Recorder tab (mic button visible)
-->

<!-- ![Landing page](public/screenshots/landing.png) -->
<!-- ![Admin dashboard](public/screenshots/dashboard.png) -->
<!-- ![Encounter recorder](public/screenshots/encounter.png) -->

---

## What This Is

Two flows, one codebase:

**Patient flow** — browse physicians → pick a time slot → fill an intake form → get a confirmation. In the background, the AI pipeline fires immediately: an intake summary (SOAP format), urgency triage (Routine / Priority / Urgent), and ICD-10 code suggestions are generated and persisted before the physician opens the booking.

**Physician flow** — a dashboard showing all bookings with stats, status tabs, and patient search. Each booking opens a detail page with a full AI panel. On confirmed bookings, the physician can record the actual encounter audio, which is transcribed by Whisper and used to generate a final SOAP note — the same loop Vero ships in production.

---

## Feature Tour (Click-by-Click)

Follow this exact path to see every feature working.

### 1. Landing page — `localhost:3000`

- Watch the animated SOAP note card on the right of the hero: it types out a clinical note in real time, adds ICD-10 chips, and loops — built with a pure React phase-state machine, no external animation library.
- Scroll down to **"From search to clinical note in minutes"** — the three-step timeline animates in on scroll via IntersectionObserver.
- Scroll to **Find a physician** — filter by name or specialty.

### 2. Book an appointment

1. Click **Book Appointment** on any physician card.
2. Select any available time slot (grouped by day).
3. Fill the intake form — use a realistic chief complaint like *"chest tightness and shortness of breath on exertion for 3 days"* to get meaningful AI output.
4. Submit. You land on the confirmation page — watch the animated SVG checkmark draw itself.
5. **Copy the booking ID from the URL** — you'll need it for the admin flow.

> AI runs in the background here. By the time you open the booking in the dashboard, the intake summary, urgency level, and ICD-10 codes are already generated.

### 3. Admin dashboard — `localhost:3000/dashboard`

- **Stat cards** at the top show live counts (Total / Pending / Confirmed / Cancelled).
- **Tab bar** filters by status — click Pending, Confirmed, Cancelled.
- **Search box** filters by patient name or physician name.
- Dashboard polls every 30 seconds — leave it open and submit a new booking in another tab to see the count update automatically.

### 4. Booking detail — click any row in the table

The detail page has multiple tabs. Work through them left to right:

| Tab | What it shows |
|-----|---------------|
| **Overview** | Patient info, appointment slot, chief complaint, physician details |
| **AI Insights** | Three sections — *Consider* (differentials), *Ask the Patient* (follow-up questions), *Watch For* (red flags). Click **Generate Insights** to trigger on demand. |
| **ICD-10** | Top 3 probable codes with confidence scores, colour-coded (green / amber / red). Click **Generate Codes** if not yet generated. |
| **Evidence** | 3 AI-suggested clinical guidelines with source, one-line relevance summary, and a live PubMed deep-link. Click **Find Evidence**. |
| **Chat** | Multi-turn streaming chat — ask clinical questions like *"What differentials should I rule out first?"* Every response is grounded in this patient's specific intake. |
| **Activity Log** | Full audit trail — every status change with actor and timestamp, pulled from `BookingStatusLog`. |

### 5. Encounter Recorder — only on Confirmed bookings

> **This tab only appears after you confirm a booking.** Go back to the dashboard, find your booking, click **Confirm** from the table row quick-actions, then reopen the detail page.

On the **Encounter** tab:

1. Click the **mic button** — your browser will ask for microphone permission, allow it.
2. Speak a short patient–physician exchange (30–60 seconds). Example:  
   *"Doctor, I've had chest tightness for three days, worse when I walk upstairs. No fever, no cough. I do have a family history of heart disease."*
3. Click **Stop** — the audio is sent to OpenAI Whisper for transcription.
4. The transcript appears, then the SOAP note streams in token by token using the Vercel AI SDK edge route.
5. Both transcript and SOAP note are saved to the database.

---

## Local Setup

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- An OpenAI API key with access to `gpt-4o-mini` and `whisper-1`

### Steps

```bash
git clone https://github.com/farhan1515/vero-booking
cd vero-booking

cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# Supabase — get both from: Supabase dashboard → Settings → Database → Connection string
# Use port 6543 (pooled) for DATABASE_URL, port 5432 (direct) for DIRECT_URL
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# OpenAI — https://platform.openai.com/api-keys
OPENAI_API_KEY="sk-..."

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

```bash
npm install

# Push schema to Supabase
npx prisma db push

# Seed physicians and time slots
npx tsx src/server/db/seed.ts

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Slots are seeded for 14 days from the current date.** If slots appear unavailable, re-run the seed: `npx tsx src/server/db/seed.ts`.

---

## Project Structure

```
src/
├── app/
│   ├── (patient)/              # Public patient-facing pages
│   │   ├── page.tsx            # Landing — physician browser + hero animation
│   │   ├── book/[physicianId]/ # Slot picker + intake form
│   │   └── confirmation/[id]/  # Booking confirmation page
│   ├── (admin)/
│   │   └── dashboard/
│   │       ├── page.tsx        # Booking table + stats
│   │       └── bookings/[id]/  # Full booking detail + AI tabs
│   └── api/
│       ├── bookings/           # CRUD + status update + encounter save
│       ├── physicians/         # List + single physician
│       └── ai/
│           ├── stream/intake/  # Streaming SOAP intake (edge runtime)
│           ├── chat/           # Streaming clinical chat (edge runtime)
│           ├── soap/           # Encounter SOAP from transcript (edge runtime)
│           ├── icd/            # ICD-10 suggestions
│           ├── urgency/        # Urgency classification
│           ├── insights/       # Clinical insights (differentials, questions, red flags)
│           ├── evidence/       # Evidence references with PubMed links
│           ├── intake/         # Non-streaming intake (background enrichment)
│           └── transcribe/     # Whisper audio transcription (Node runtime)
├── components/
│   ├── admin/                  # Dashboard components (BookingTable, AI panels, EncounterRecorder)
│   ├── patient/                # Landing animations, PhysicianCard, IntakeForm, SlotPicker
│   ├── shared/                 # Navbar, Footer, LoadingSpinner, ErrorBoundary
│   └── ui/                     # shadcn/ui primitives
├── server/
│   ├── services/               # All DB + AI business logic (never imported by client)
│   │   ├── booking.service.ts
│   │   ├── physician.service.ts
│   │   └── ai.service.ts
│   ├── actions/                # Next.js Server Actions for mutations
│   └── db/
│       ├── client.ts           # Prisma singleton
│       └── seed.ts             # Physician + slot seeder
├── lib/
│   ├── validations.ts          # All Zod schemas (forms, API bodies, AI routes)
│   └── openai.ts               # OpenAI client singleton
├── types/index.ts              # All shared TypeScript types
└── config/
    ├── env.ts                  # Zod-validated env at startup
    └── site.ts                 # Site constants
```

---

## Architecture Notes

**Service layer** — every database call goes through `src/server/services/`. Route handlers validate with Zod, call a service, return typed `ApiResponse<T>`. Nothing touches Prisma directly from a route.

**Non-blocking AI** — when a booking is created, the HTTP response returns immediately. Intake summary and urgency classification fire in a `.then().catch()` chain after the response is sent. No patient waits on OpenAI.

**Streaming** — intake summary and clinical chat stream via `streamText → toTextStreamResponse()` from the Vercel AI SDK. Edge runtime on all streaming routes. Database routes use Node.js runtime. The two never mix — edge routes receive full context in the request body.

**Audit trail** — every booking status change writes a `BookingStatusLog` row with actor and timestamp. The Activity Log tab surfaces this directly.

**Slot integrity** — booking creation wraps the slot availability check and booking creation in a Prisma transaction, preventing double-booking under normal load.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript — strict, zero `any` |
| Database | Supabase (Postgres) via Prisma ORM |
| AI — LLM | OpenAI gpt-4o-mini |
| AI — Transcription | OpenAI Whisper (`whisper-1`) |
| AI — Streaming | Vercel AI SDK v4 (`streamText`) |
| UI | Tailwind CSS v4 + shadcn/ui |
| Fonts | Manrope (headings) · Inter (body) · Instrument Serif (accent) |
| Validation | Zod (API bodies + forms) + React Hook Form |
| Deployment | Vercel |

---

## What I Would Add With More Time

**Real auth** — NextAuth.js with role-based access. Physicians see only their bookings; admins see all. Right now the dashboard has no auth gate by design for the work sample.

**Database-level slot locking** — current transaction prevents most races but not all under high concurrency. A `SELECT FOR UPDATE` row lock on the slot is needed for production.

**Email notifications** — Resend or Postmark for booking confirmation, status change, and appointment reminder emails.

**iCal export** — confirmed appointments should drop into the physician's calendar automatically.

**Physician availability UI** — let physicians configure recurring weekly hours instead of the manual seed script.

**Tests** — integration tests on the booking creation flow and AI service functions. The service-layer architecture makes this straightforward.
