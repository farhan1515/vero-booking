"use client"

import { useState, useEffect } from "react"

// ─── Typewriter hook ─────────────────────────────────────────────────────────
function useTypewriter(
  text: string,
  active: boolean,
  charDelayMs: number,
  cycle: number
) {
  const [count, setCount] = useState(0)

  // Reset on every new animation cycle
  useEffect(() => { setCount(0) }, [cycle])

  useEffect(() => {
    if (!active || count >= text.length) return
    const t = setTimeout(() => setCount((c) => c + 1), charDelayMs)
    return () => clearTimeout(t)
  }, [active, count, text.length, charDelayMs])

  return text.slice(0, count)
}

const SUBJ =
  "Patient reports persistent chest tightness and shortness of breath on exertion for 3 days. No fever."
const ASSESS = "Possible angina pectoris. Recommend ECG and troponin panel."

// phase timeline (ms):
//   0   card visible
//   300 header row
//   700 subjective label
//   900 typing starts  (~100 chars × 22 ms ≈ 2 200 ms → done ~3 100)
//  3 400 assessment label
//  3 600 typing starts  (~60 chars × 26 ms ≈ 1 560 ms → done ~5 160)
//  5 400 priority badge
//  5 900 ICD + urgency badge
//  8 500 fade-out
//  9 300 reset

const SEQ = [
  [300,  1],  // header
  [700,  2],  // subj label
  [900,  3],  // subj typing
  [3400, 4],  // assess label
  [3600, 5],  // assess typing
  [5400, 6],  // priority
  [5900, 7],  // ICD + badge
  [8500, 8],  // fade-out
] as const

export function HeroAnimationCard() {
  const [cycle, setCycle] = useState(0)
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    setPhase(0)
    const timers = SEQ.map(([ms, p]) =>
      setTimeout(() => setPhase(p), ms)
    )
    const reset = setTimeout(() => setCycle((c) => c + 1), 9300)
    return () => { timers.forEach(clearTimeout); clearTimeout(reset) }
  }, [cycle])

  const subjText   = useTypewriter(SUBJ,   phase >= 3, 22, cycle)
  const assessText = useTypewriter(ASSESS, phase >= 5, 26, cycle)
  const visible    = phase < 8

  const fade = (test: boolean, delay = "0ms") => ({
    transition: `opacity 0.4s ${delay}, transform 0.4s ${delay}`,
    opacity:    test ? 1 : 0,
    transform:  test ? "translateY(0)" : "translateY(8px)",
  })

  const pop = (test: boolean, delay = "0ms") => ({
    transition: `opacity 0.4s ${delay}, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${delay}`,
    opacity:    test ? 1 : 0,
    transform:  test ? "scale(1) translateY(0)" : "scale(0.8) translateY(12px)",
  })

  return (
    <div className="relative mx-auto w-full max-w-[340px] pb-8 pl-4">

      {/* ── SOAP note card ──────────────────────────────────────────────── */}
      <div
        style={{
          transition: "opacity 0.5s, transform 0.6s cubic-bezier(0.16,1,0.3,1)",
          opacity:   visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.96)",
        }}
        className="relative z-10 rounded-2xl border border-white/[0.09] bg-[#12161f] p-5 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] animate-float"
      >
        {/* Header */}
        <div style={fade(phase >= 1)} className="mb-4 flex items-center gap-2">
          <div className="size-2 rounded-full bg-teal-400" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-white/40">
            AI Clinical Note
          </span>
          <span className="ml-auto rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-medium text-teal-400">
            Generated
          </span>
        </div>

        {/* Subjective */}
        <div className="mb-3">
          <p style={fade(phase >= 2)} className="text-[10px] font-bold uppercase tracking-widest text-teal-500/70 mb-1">
            Subjective
          </p>
          <p className="text-xs leading-relaxed text-white/60 min-h-[40px]">
            {subjText}
            {phase >= 3 && phase < 5 && (
              <span className="inline-block w-px h-[11px] bg-teal-400 ml-0.5 align-middle animate-pulse" />
            )}
          </p>
        </div>

        {/* Assessment */}
        <div className="mb-3">
          <p style={fade(phase >= 4)} className="text-[10px] font-bold uppercase tracking-widest text-teal-500/70 mb-1">
            Assessment
          </p>
          <p className="text-xs leading-relaxed text-white/60 min-h-[32px]">
            {assessText}
            {phase >= 5 && phase < 7 && (
              <span className="inline-block w-px h-[11px] bg-teal-400 ml-0.5 align-middle animate-pulse" />
            )}
          </p>
        </div>

        {/* Priority */}
        <div
          style={{
            transition: "opacity 0.4s, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
            opacity:         phase >= 6 ? 1 : 0,
            transform:       phase >= 6 ? "scaleX(1)" : "scaleX(0.85)",
            transformOrigin: "left center",
          }}
          className="flex items-center gap-2 border-t border-white/[0.06] pt-3"
        >
          <div className="size-1.5 rounded-full bg-amber-400" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-400/80">
            Priority — escalation flagged
          </span>
        </div>
      </div>

      {/* ── ICD-10 chip ─────────────────────────────────────────────────── */}
      <div
        style={pop(phase >= 7 && visible)}
        className="absolute -bottom-1 -left-2 z-20 rounded-xl border border-white/[0.07] bg-[#0d1117] px-4 py-3 shadow-xl animate-float-delayed"
      >
        <p className="text-[9px] font-bold uppercase tracking-widest text-white/25">
          ICD-10 Suggestions
        </p>
        <p className="mt-1 font-mono text-xs text-teal-400">
          R07.9 &middot; I20.9 &middot; Z82.49
        </p>
      </div>

      {/* ── Urgency badge ───────────────────────────────────────────────── */}
      <div
        style={{
          transition: "opacity 0.4s, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
          opacity:         phase >= 7 && visible ? 1 : 0,
          transform:       phase >= 7 && visible ? "scale(1)" : "scale(0.7)",
          transformOrigin: "right center",
        }}
        className="absolute -right-3 top-3 z-20 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 shadow-md animate-float-slow"
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
          Priority
        </span>
      </div>

    </div>
  )
}
