"use client"

import { useEffect, useState } from "react"

export function ConfirmationCheck() {
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 50)
    return () => clearTimeout(t)
  }, [])

  // SVG circle: circumference = 2π × 30 ≈ 188.5
  const C = 2 * Math.PI * 30

  return (
    <div className="relative flex size-16 items-center justify-center">
      {/* Ripple rings */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          aria-hidden
          className="absolute inset-0 rounded-full border border-teal-200"
          style={{
            animation: started
              ? `confirmation-ripple 1.6s cubic-bezier(0,0,0.2,1) ${i * 320 + 500}ms both`
              : "none",
          }}
        />
      ))}

      {/* Circle progress SVG */}
      <svg
        viewBox="0 0 64 64"
        className="absolute inset-0 size-full -rotate-90"
        fill="none"
      >
        {/* Track */}
        <circle cx="32" cy="32" r="30" stroke="#e5e7eb" strokeWidth="3" />
        {/* Progress */}
        <circle
          cx="32"
          cy="32"
          r="30"
          stroke="#0F6E56"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={started ? 0 : C}
          style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1) 0ms" }}
        />
      </svg>

      {/* Checkmark SVG */}
      <svg
        viewBox="0 0 24 24"
        className="relative z-10 size-7"
        fill="none"
        stroke="#0F6E56"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline
          points="4,13 9,18 20,6"
          strokeDasharray="24"
          strokeDashoffset={started ? 0 : 24}
          style={{ transition: "stroke-dashoffset 0.45s cubic-bezier(0.4,0,0.2,1) 0.55s" }}
        />
      </svg>
    </div>
  )
}
