"use client"

import { useState, useEffect, useRef } from "react"
import { Search, CalendarCheck, ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = [
  {
    icon: Search,
    iconBg: "bg-teal-50",
    iconColor: "text-[#0F6E56]",
    number: "01",
    title: "Find your physician",
    description:
      "Browse our network of specialists. Filter by name or specialty to find the right match for your needs.",
  },
  {
    icon: CalendarCheck,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    number: "02",
    title: "Pick a time & describe symptoms",
    description:
      "Select an available slot and fill a short intake form. Our AI reads your chief complaint in real time.",
  },
  {
    icon: ClipboardList,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    number: "03",
    title: "AI generates your clinical note",
    description:
      "Before you arrive, a SOAP note, ICD-10 codes, and urgency triage are ready for your physician to review.",
  },
]

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, inView }
}

export function HowItWorksSection() {
  const { ref, inView } = useInView(0.15)

  return (
    <div ref={ref} className="mx-auto max-w-5xl">
      {/* Desktop: horizontal 3-step layout */}
      <div className="hidden md:block">
        <div className="relative grid grid-cols-3 gap-8">
          {/* Connector lines */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-8 flex items-center px-[16.66%]"
          >
            {[0, 1].map((i) => (
              <div
                key={i}
                className="relative h-px flex-1"
                style={{ background: "transparent" }}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-200 origin-left"
                  style={{
                    transition: `transform 0.6s cubic-bezier(0.4,0,0.2,1) ${(i + 1) * 300 + 200}ms`,
                    transform: inView ? "scaleX(1)" : "scaleX(0)",
                  }}
                />
              </div>
            ))}
          </div>

          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <div
                key={step.number}
                className="flex flex-col items-center text-center"
                style={{
                  transition: `opacity 0.5s ease ${i * 200}ms, transform 0.5s ease ${i * 200}ms`,
                  opacity: inView ? 1 : 0,
                  transform: inView ? "translateY(0)" : "translateY(20px)",
                }}
              >
                {/* Icon circle */}
                <div
                  className={cn(
                    "relative z-10 mb-6 flex size-16 items-center justify-center rounded-full border-2 border-white shadow-md",
                    step.iconBg
                  )}
                >
                  <Icon className={cn("size-6", step.iconColor)} />
                  <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-gray-900 text-[9px] font-bold text-white">
                    {step.number}
                  </span>
                </div>

                <h3 className="mb-2 text-base font-semibold text-gray-900">{step.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile: vertical timeline */}
      <div className="md:hidden">
        <div className="relative space-y-8 pl-10">
          {/* Vertical line */}
          <div
            aria-hidden
            className="absolute bottom-4 left-4 top-4 w-px bg-gray-200 origin-top"
            style={{
              transition: "transform 1.2s cubic-bezier(0.4,0,0.2,1) 100ms",
              transform: inView ? "scaleY(1)" : "scaleY(0)",
            }}
          />

          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <div
                key={step.number}
                className="relative"
                style={{
                  transition: `opacity 0.5s ease ${i * 200 + 200}ms, transform 0.5s ease ${i * 200 + 200}ms`,
                  opacity: inView ? 1 : 0,
                  transform: inView ? "translateX(0)" : "translateX(-12px)",
                }}
              >
                {/* Dot on the line */}
                <div
                  className={cn(
                    "absolute -left-[30px] flex size-8 items-center justify-center rounded-full border-2 border-white shadow-sm",
                    step.iconBg
                  )}
                >
                  <Icon className={cn("size-4", step.iconColor)} />
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Step {step.number}
                  </span>
                  <h3 className="mt-1 text-sm font-semibold text-gray-900">{step.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
