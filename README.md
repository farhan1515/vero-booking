# Vero Booking

> A clinical patient booking system built as a technical work sample for Vero Scribe.

**Live demo:** [https://vero-booking.vercel.app](https://vero-booking.vercel.app)  
**Admin dashboard:** [https://vero-booking.vercel.app/dashboard](https://vero-booking.vercel.app/dashboard)

---

## Getting Started

```bash
git clone https://github.com/farhan1515/vero-booking
cd vero-booking
cp .env.local.example .env.local
# Add DATABASE_URL, DIRECT_URL, OPENAI_API_KEY
npm install
npx prisma db push
npx tsx src/server/db/seed.ts
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## What I Built

The patient flow lets users browse a list of accepting physicians filtered by name and specialty, select an available time slot grouped by day, and submit a structured intake form (React Hook Form + Zod). On submission the booking is created synchronously and the patient lands on a confirmation screen showing appointment details and status. AI enrichment — intake summary and urgency classification — runs in the background without blocking that response, so the confirmation page is always fast.

The physician dashboard at `/dashboard` shows all bookings with real-time status counts and per-status filtering. Each row is clickable and opens a detail modal with the patient's full intake, appointment info, and a four-tab AI panel. Physicians can confirm or cancel bookings directly from the modal or via quick-action icon buttons in the table, with changes reflected immediately via a 30-second polling loop.

The AI layer is the deliberate centrepiece. It maps directly to Vero's product DNA: streaming intake summaries (SOAP-format, token-by-token via Vercel AI SDK edge routes), clinical insights broken into Consider / Ask the Patient / Watch For sections, ICD-10 code suggestions with confidence scores, evidence-backed references with PubMed deep links, and a multi-turn clinical chat where every response is grounded in the patient's specific intake context. These aren't bolted-on demos — they're the same primitives Vero ships post-encounter, embedded here at the pre-encounter booking layer.

---

## Key Technical Decisions

**Service layer architecture**  
All database logic lives in `src/server/services/` — never in route handlers. Routes validate input with Zod, call a service function, and return a typed `ApiResponse<T>`. This keeps business logic testable in isolation and keeps routes thin enough to read at a glance.

**Supabase + Prisma over SQLite**  
A real Postgres database because healthcare data architecture decisions matter even in a prototype. The schema includes soft deletes (`deletedAt`) and a `BookingStatusLog` audit table tracking every status transition with actor and timestamp. These aren't afterthoughts — they're in the initial schema because retrofitting them later is painful.

**Non-blocking AI processing**  
When a booking is created, the POST handler returns the confirmation immediately. AI enrichment (intake summary + urgency classification) fires in a `.then().catch()` chain after the response is sent. The dashboard shows AI data as it populates — urgency badges and summaries appear without the patient ever waiting on OpenAI.

**Streaming with Vercel AI SDK**  
Intake summary generation and clinical chat both stream via server-sent events using AI SDK v6's `streamText → toTextStreamResponse()`. Edge runtime on streaming routes (`/api/ai/stream/intake`, `/api/ai/chat`), Node.js runtime on database routes. The runtimes are not mixed — edge routes receive all context in the request body and never touch Prisma.

**Clinical context in every AI call**  
Every AI feature receives the patient's specialty, chief complaint, additional notes, and intake summary where available. The chat system prompt injects the full patient record so physician questions get grounded answers rather than generic clinical boilerplate. The insights and evidence prompts include specialty so differential diagnoses and guidelines are domain-appropriate.

---

## AI Features

- **Streaming Intake Summary** — SOAP-style note generated token by token; saves to DB on stream completion
- **Urgency Classification** — ROUTINE / PRIORITY / URGENT badge on every booking, set at creation time
- **Clinical Insights** — Consider, Ask the Patient, and Watch For sections generated per booking on demand
- **ICD-10 Suggestions** — Top 3 probable codes with confidence scores, colour-coded by confidence band
- **Evidence Search** — 3 AI-suggested clinical guidelines with source, relevance summary, and PubMed deep links
- **Clinical Chat** — Multi-turn streaming chat with full patient context injected into every system prompt

---

## What I Would Add With More Time

**Real authentication** with role-based access (NextAuth.js) — physicians see only their own bookings, admins see all. Right now the dashboard is fully open.

**Audio transcription** using OpenAI Whisper — record a patient encounter and generate the SOAP note automatically, which is exactly what Vero does post-encounter. The intake summary here is a pre-encounter approximation of the same feature.

**Notification system** — email confirmations on booking status change via Resend or Postmark. Patients currently have no channel other than the confirmation page.

**HIPAA audit trail** — every data access logged with user ID, timestamp, and action type. `BookingStatusLog` covers status changes, but reads are untracked. A production system needs row-level access logging.

**Database-level slot locking** — the current booking creation uses a Prisma transaction but not `SELECT FOR UPDATE`. Under concurrent load, two patients could book the same slot before either transaction completes. A proper advisory lock or row-level lock on the slot is needed.

**Conflict detection** — warn a physician or admin if the patient already has a pending booking before confirming a second one.

**Calendar integration** — iCal export for confirmed appointments so the booking lands in the physician's actual calendar.

**Physician availability management** — a UI for physicians to configure recurring weekly availability instead of the current manual slot seeding script.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | Supabase (Postgres) via Prisma |
| AI | OpenAI gpt-4o-mini + Vercel AI SDK v6 |
| UI | Tailwind CSS v4 + shadcn/ui (Nova) |
| Deployment | Vercel |
| Validation | Zod + React Hook Form |
