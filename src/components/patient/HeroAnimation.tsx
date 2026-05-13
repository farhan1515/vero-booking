import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
  Easing,
} from "remotion"

// ─── palette ───────────────────────────────────────────────────────────────
const TEAL = "#14b8a6"
const TEAL_DIM = "rgba(20,184,166,0.7)"
const TEAL_BG = "rgba(20,184,166,0.1)"
const AMBER = "#fbbf24"
const AMBER_DIM = "rgba(251,191,36,0.8)"
const AMBER_BG = "rgba(251,191,36,0.1)"
const CARD_BG = "#12161f"
const CHIP_BG = "#0d1117"
const SANS = "Inter, system-ui, sans-serif"

const SUBJECTIVE =
  "Patient reports persistent chest tightness and shortness of breath on exertion for 3 days. No fever."
const ASSESSMENT =
  "Possible angina pectoris. Recommend ECG and troponin panel."
const ICD = "R07.9  ·  I20.9  ·  Z82.49"

// ─── easing helper ─────────────────────────────────────────────────────────
function ease(
  frame: number,
  fromVal: number,
  toVal: number,
  start: number,
  end: number
) {
  return interpolate(frame, [start, end], [fromVal, toVal], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })
}

// ─── total: 220 frames @ 30 fps ≈ 7.3 s ──────────────────────────────────
export function HeroAnimation() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Slow vertical float for main card
  const floatY = Math.sin(frame * 0.038) * 7

  // — Card materialise —
  const cardOpacity = ease(frame, 0, 1, 0, 20)
  const cardScale = ease(frame, 0.93, 1, 0, 20)

  // — Header row —
  const headerOpacity = ease(frame, 0, 1, 20, 34)
  const headerY = ease(frame, 10, 0, 20, 34)

  // — "Subjective" label —
  const subjLabelOpacity = ease(frame, 0, 1, 36, 48)

  // — Subjective typing —
  const subjChars = Math.floor(
    interpolate(frame, [48, 88], [0, SUBJECTIVE.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  )
  const subjText = SUBJECTIVE.slice(0, subjChars)
  const subjCursorOn = frame >= 48 && frame < 92 && Math.floor(frame / 7) % 2 === 0

  // — "Assessment" label —
  const assLabelOpacity = ease(frame, 0, 1, 92, 104)

  // — Assessment typing —
  const assChars = Math.floor(
    interpolate(frame, [104, 128], [0, ASSESSMENT.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  )
  const assText = ASSESSMENT.slice(0, assChars)
  const assCursorOn = frame >= 104 && frame < 132 && Math.floor(frame / 7) % 2 === 0

  // — Priority row —
  const priorityOpacity = ease(frame, 0, 1, 132, 144)
  const prioritySpring = spring({ frame: frame - 132, fps, config: { damping: 10, stiffness: 240, mass: 0.5 } })

  // — ICD-10 chip —
  const icdOpacity = ease(frame, 0, 1, 148, 160)
  const icdSpring = spring({ frame: frame - 148, fps, config: { damping: 11, stiffness: 200, mass: 0.7 } })
  const icdY = ease(frame, 18, 0, 148, 160)

  // — Urgency badge —
  const badgeOpacity = ease(frame, 0, 1, 138, 150)
  const badgeSpring = spring({ frame: frame - 138, fps, config: { damping: 10, stiffness: 220, mass: 0.55 } })

  // — Fade-out at the end before loop —
  const masterFade = interpolate(frame, [198, 218], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })

  return (
    <AbsoluteFill style={{ background: "transparent" }}>
      <div style={{ position: "absolute", inset: 0, opacity: masterFade }}>

        {/* ── Main SOAP card ─────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 16,
            right: 56,
            opacity: cardOpacity,
            transform: `translateY(${floatY + ease(frame, 20, 0, 0, 20)}px) scale(${cardScale})`,
            background: CARD_BG,
            borderRadius: 18,
            padding: "20px 20px 16px",
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow: "0 28px 52px -10px rgba(0,0,0,0.65)",
          }}
        >
          {/* Header */}
          <div
            style={{
              opacity: headerOpacity,
              transform: `translateY(${headerY}px)`,
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: TEAL }} />
            <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.38)" }}>
              AI Clinical Note
            </span>
            <span style={{ marginLeft: "auto", background: TEAL_BG, borderRadius: 100, padding: "2px 9px", fontSize: 9, fontFamily: SANS, fontWeight: 600, color: TEAL }}>
              Generated
            </span>
          </div>

          {/* Subjective */}
          <div style={{ marginBottom: 14 }}>
            <p style={{ opacity: subjLabelOpacity, fontFamily: SANS, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: TEAL_DIM, marginBottom: 5 }}>
              Subjective
            </p>
            <p style={{ fontFamily: SANS, fontSize: 11, color: "rgba(255,255,255,0.58)", lineHeight: 1.65, minHeight: 40 }}>
              {subjText}
              {subjCursorOn && (
                <span style={{ display: "inline-block", width: 1, height: 12, background: TEAL, marginLeft: 2, verticalAlign: "middle" }} />
              )}
            </p>
          </div>

          {/* Assessment */}
          <div style={{ marginBottom: 14 }}>
            <p style={{ opacity: assLabelOpacity, fontFamily: SANS, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: TEAL_DIM, marginBottom: 5 }}>
              Assessment
            </p>
            <p style={{ fontFamily: SANS, fontSize: 11, color: "rgba(255,255,255,0.58)", lineHeight: 1.65, minHeight: 32 }}>
              {assText}
              {assCursorOn && (
                <span style={{ display: "inline-block", width: 1, height: 12, background: TEAL, marginLeft: 2, verticalAlign: "middle" }} />
              )}
            </p>
          </div>

          {/* Priority row */}
          <div
            style={{
              opacity: priorityOpacity,
              transform: `scale(${prioritySpring})`,
              transformOrigin: "left center",
              display: "flex",
              alignItems: "center",
              gap: 8,
              borderTop: "1px solid rgba(255,255,255,0.06)",
              paddingTop: 12,
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: AMBER, flexShrink: 0 }} />
            <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: AMBER_DIM }}>
              Priority — escalation flagged
            </span>
          </div>
        </div>

        {/* ── ICD-10 chip ────────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: 0,
            opacity: icdOpacity,
            transform: `translateY(${icdY}px) scale(${icdSpring})`,
            background: CHIP_BG,
            borderRadius: 12,
            padding: "10px 16px",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
          }}
        >
          <p style={{ fontFamily: SANS, fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.22)", marginBottom: 5 }}>
            ICD-10 Suggestions
          </p>
          <p style={{ fontFamily: "Menlo, monospace", fontSize: 12, fontWeight: 600, color: TEAL }}>
            {ICD}
          </p>
        </div>

        {/* ── Urgency badge ──────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 0,
            opacity: badgeOpacity,
            transform: `scale(${badgeSpring})`,
            background: AMBER_BG,
            border: "1px solid rgba(251,191,36,0.22)",
            borderRadius: 100,
            padding: "6px 14px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
          }}
        >
          <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: AMBER }}>
            Priority
          </span>
        </div>

      </div>
    </AbsoluteFill>
  )
}
