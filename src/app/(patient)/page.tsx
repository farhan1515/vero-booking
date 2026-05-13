"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import {
  Search,
  Brain,
  FileText,
  Shield,
  Zap,
  X,
} from "lucide-react"
import { PhysicianCard } from "@/components/patient/PhysicianCard"
import { HeroAnimationCard } from "@/components/patient/HeroAnimationCard"
import { HowItWorksSection } from "@/components/patient/HowItWorksSection"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { PhysicianWithSlots } from "@/types"

function useFadeUp(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, visible }
}


interface FeatureCardProps {
  icon: React.ElementType
  accent: string
  iconBg: string
  title: string
  description: string
  delay?: string
}

function FeatureCard({ icon: Icon, accent, iconBg, title, description, delay = "0ms" }: FeatureCardProps) {
  const { ref, visible } = useFadeUp()
  return (
    <div
      ref={ref}
      style={{ transitionDelay: delay }}
      className={cn(
        "group flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-500",
        "hover:border-gray-200 hover:shadow-md",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      )}
    >
      <div className={cn("mb-4 flex size-10 items-center justify-center rounded-xl", iconBg)}>
        <Icon className={cn("size-5", accent)} />
      </div>
      <h3 className="mb-2 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-500">{description}</p>
    </div>
  )
}


function SkeletonCard() {
  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="size-12 animate-pulse rounded-full bg-gray-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
          <div className="h-3 w-1/3 animate-pulse rounded-full bg-gray-100" />
        </div>
      </div>
      <div className="mt-3 h-2.5 w-1/4 animate-pulse rounded bg-gray-100" />
      <div className="mt-2 space-y-1.5">
        <div className="h-2.5 w-full animate-pulse rounded bg-gray-100" />
        <div className="h-2.5 w-5/6 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="mt-6 h-10 w-full animate-pulse rounded-full bg-gray-100" />
    </div>
  )
}

const STATS = [
  { value: "< 2 min", label: "Average booking time" },
  { value: "HIPAA", label: "Compliant & encrypted" },
  { value: "ICD-10", label: "Auto-coded by AI" },
  { value: "SOAP", label: "Notes generated instantly" },
]

const FEATURES = [
  {
    icon: FileText,
    accent: "text-[#0F6E56]",
    iconBg: "bg-teal-50",
    title: "SOAP Note Generator",
    description:
      "Patient intake converted into structured clinical documentation — Subjective, Objective, Assessment, Plan.",
  },
  {
    icon: Brain,
    accent: "text-violet-600",
    iconBg: "bg-violet-50",
    title: "ICD-10 Auto-Coder",
    description:
      "Top 3 probable diagnosis codes suggested from chief complaint, ready for physician review.",
  },
  {
    icon: Zap,
    accent: "text-amber-600",
    iconBg: "bg-amber-50",
    title: "Urgency Classifier",
    description:
      "Triage level (Routine · Priority · Urgent) flagged automatically so critical cases surface first.",
  },
  {
    icon: Shield,
    accent: "text-emerald-600",
    iconBg: "bg-emerald-50",
    title: "HIPAA-Safe Pipeline",
    description:
      "All patient data encrypted in transit and at rest. Access logged and audited at every step.",
  },
]


export default function HomePage() {
  const [physicians, setPhysicians] = useState<PhysicianWithSlots[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nameFilter, setNameFilter] = useState("")
  const [specialtyFilter, setSpecialtyFilter] = useState("all")

  const heroFade = useFadeUp(0)
  const statsFade = useFadeUp()
  const featureHeadFade = useFadeUp()
  const stepsHeadFade = useFadeUp()
  const bookFade = useFadeUp()

  useEffect(() => {
    fetch("/api/physicians")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setPhysicians(res.data)
        else setError(res.error ?? "Failed to load physicians")
      })
      .catch(() => setError("Failed to load physicians"))
      .finally(() => setLoading(false))
  }, [])

  const specialties = useMemo(
    () => Array.from(new Set(physicians.map((p) => p.specialty))).sort(),
    [physicians]
  )

  const filtered = useMemo(
    () =>
      physicians.filter((p) => {
        const matchName = p.name.toLowerCase().includes(nameFilter.toLowerCase())
        const matchSpecialty =
          specialtyFilter === "all" || p.specialty === specialtyFilter
        return matchName && matchSpecialty
      }),
    [physicians, nameFilter, specialtyFilter]
  )

  return (
    <div className="bg-white text-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F4FAF8] to-white">
        {/* Subtle background accents */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -right-40 -top-40 size-[700px] rounded-full bg-teal-50 opacity-70 blur-[140px]" />
          <div className="absolute -left-20 bottom-0 size-[500px] rounded-full bg-teal-50/50 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-20 lg:pb-32 lg:pt-28">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Left copy */}
            <div
              ref={heroFade.ref}
              className={cn(
                "transition-all duration-700",
                heroFade.visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              )}
            >
              {/* Eyebrow */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5">
                <div className="size-1.5 rounded-full bg-[#0F6E56]" />
                <span className="text-xs font-semibold uppercase tracking-widest text-[#0F6E56]">
                  Powered by AI
                </span>
              </div>

              <h1 className="font-heading text-5xl font-bold leading-[1.08] tracking-tight text-gray-900 lg:text-6xl">
                Clinical booking,{" "}
                <em className="font-serif not-italic text-[#0F6E56]">
                  intelligently
                </em>{" "}
                done.
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-relaxed text-gray-500">
                Book your appointment in minutes. Our AI generates your clinical
                note, suggests ICD-10 codes, and flags urgency — so your
                physician is ready before you walk in.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a
                  href="#book"
                  className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                >
                  Book Appointment
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900"
                >
                  How it works
                </a>
              </div>

              <p className="mt-8 text-xs text-gray-400">
                HIPAA compliant &middot; Encrypted in transit and at rest &middot; For authorized healthcare providers
              </p>
            </div>

            {/* Right — Remotion animated product demo */}
            <div
              className={cn(
                "flex items-center justify-center transition-all duration-700 delay-150",
                heroFade.visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              )}
            >
              <HeroAnimationCard />
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div
          ref={statsFade.ref}
          className={cn(
            "mx-auto grid max-w-5xl grid-cols-2 gap-px md:grid-cols-4 transition-all duration-600",
            statsFade.visible ? "opacity-100" : "opacity-0"
          )}
        >
          {STATS.map(({ value, label }) => (
            <div
              key={label}
              className="flex flex-col items-center px-6 py-8 text-center"
            >
              <span className="font-heading text-2xl font-bold text-gray-900">{value}</span>
              <span className="mt-1 text-xs text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* AI Features */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div
          ref={featureHeadFade.ref}
          className={cn(
            "mb-14 text-center transition-all duration-500",
            featureHeadFade.visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          )}
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#0F6E56]">
            AI-Powered Clinical Tools
          </p>
          <h2 className="font-heading text-4xl font-bold tracking-tight text-gray-900">
            Documentation that works as hard as you do
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-500">
            Every booking triggers a full AI clinical pipeline — the same
            technology Vero Scribe brings to medical documentation at scale.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <FeatureCard
              key={f.title}
              {...f}
              delay={`${i * 80}ms`}
            />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-t border-gray-100 bg-gray-50 px-6 py-24"
      >
        <div
          ref={stepsHeadFade.ref}
          className={cn(
            "mb-14 text-center transition-all duration-500",
            stepsHeadFade.visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          )}
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#0F6E56]">
            Simple Process
          </p>
          <h2 className="font-heading text-4xl font-bold tracking-tight text-gray-900">
            From search to clinical note in minutes
          </h2>
        </div>

        <HowItWorksSection />
      </section>

      {/* Physician browser */}
      <section id="book" className="mx-auto max-w-7xl px-6 py-24">
        <div
          ref={bookFade.ref}
          className={cn(
            "mb-10 transition-all duration-500",
            bookFade.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          )}
        >
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#0F6E56]">
            Our Network
          </p>
          <h2 className="font-heading text-4xl font-bold tracking-tight text-gray-900">
            Find a physician
          </h2>
          <p className="mt-3 text-base text-gray-500">
            Browse our network of trusted specialists and book your appointment today.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by physician name…"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="h-10 w-full rounded-full border border-gray-200 bg-white pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0F6E56]/40 focus:outline-none focus:ring-2 focus:ring-[#0F6E56]/20 transition-colors"
            />
            {nameFilter && (
              <button
                onClick={() => setNameFilter("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
            <SelectTrigger className="h-10 w-full rounded-full border-gray-200 bg-white text-sm text-gray-700 sm:w-52">
              <SelectValue placeholder="All specialties" />
            </SelectTrigger>
            <SelectContent className="border-gray-100 bg-white text-gray-900">
              <SelectItem value="all">All specialties</SelectItem>
              {specialties.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-20 text-center">
            <p className="text-base font-medium text-red-600">{error}</p>
            <p className="mt-1 text-sm text-gray-400">Please try refreshing the page.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <p className="text-base font-medium text-gray-600">No physicians found</p>
            <p className="mt-1 text-sm text-gray-400">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PhysicianCard key={p.id} physician={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
