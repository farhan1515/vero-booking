# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md


PROJECT: Vero Booking — a clinical patient booking system built as a 
technical work sample for Vero Scribe (veroscribe.com), an AI medical 
documentation startup based in Toronto.

WHAT WE ARE BUILDING:
A full-stack Next.js 15 app with two flows:
1. Patient flow: browse physicians → pick a time slot → fill intake form 
   → AI summarizes intake → confirmation screen
2. Admin/physician flow: dashboard of all bookings → confirm or cancel → 
   view AI-generated intake summary and ICD-10 code suggestions per booking

THE COMPANY WE ARE BUILDING FOR:
- Vero Scribe builds AI clinical documentation tools for healthcare professionals
- Their actual product: AI medical scribe, ICD-10 auto-coding, SOAP note 
  generation, evidence search across 27M articles
- Their tech stack: Next.js, TypeScript, Tailwind CSS, Postgres
- Their design: clean, minimal, white backgrounds, clinical feel, 
  mobile-first, teal/green primary color (#0F6E56)
- They care deeply about: HIPAA compliance language, reliability, 
  product judgment, UX quality, and AI integration

WHY AI FEATURES MATTER:
The AI features are not extras — they demonstrate we understand Vero's 
core business. We must build:
- Intake summarizer: converts patient free-text complaint into structured 
  SOAP-style clinical note using OpenAI
- Urgency classifier: classifies booking as Routine / Priority / Urgent 
  based on chief complaint
- ICD-10 suggester: suggests top 3 probable ICD-10 codes for the admin 
  to review per booking
These map directly to Vero's real product features.

TECH STACK (non-negotiable, mirrors Vero):
- Next.js 15 with App Router and TypeScript
- Tailwind CSS with shadcn/ui (Nova preset, Radix)
- Prisma ORM with Supabase (Postgres) — NOT SQLite
- OpenAI gpt-4o-mini for all AI features
- Zod for all validation (forms + API + env)
- React Hook Form for forms
- Vercel for deployment

FOLDER STRUCTURE CONVENTION:
- All source code lives inside src/
- Server-only code (DB, AI, services) lives in src/server/ 
  and must never be imported by client components
- Business logic lives in src/server/services/ not in route handlers
- Zod schemas live in src/lib/validations.ts
- All TypeScript types live in src/types/index.ts
- Environment variables are validated at startup in src/config/env.ts

CODE STANDARDS I EXPECT:
- Every component is TypeScript with explicit prop interfaces
- No any types ever
- API routes return consistent JSON shape: { data, error, success }
- All DB calls go through service layer, never directly in route handlers
- Server Actions for mutations where possible, API routes for AI calls
- Loading and error states on every async operation
- Mobile-first responsive design on every page
- Use cn() from lib/utils for conditional classnames
- shadcn components as base, customize with Tailwind only

DESIGN RULES:
- Match Vero's visual style: clean, clinical, trustworthy
- Primary color: teal (#0F6E56 or Tailwind teal-700)
- Status colors: amber for pending, green for confirmed, red for cancelled
- Urgency colors: gray for routine, amber for priority, red for urgent
- No dark mode needed (Vero's product is light-only)
- Generous whitespace, card-based layouts, subtle borders
- Inter or Geist font (Geist from Nova preset)

THINGS TO NEVER DO:
- Never use SQLite or json files as database
- Never put business logic directly in route.ts files
- Never use any type in TypeScript
- Never hardcode strings that should be constants
- Never skip loading/error states
- Never make components that are not mobile responsive
