import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
  Easing,
} from "remotion"

const TEAL = "#0F6E56"
const TEAL_LIGHT = "rgba(15,110,86,0.12)"
const TEAL_MID = "rgba(15,110,86,0.06)"

// Circle radius for the checkmark ring
const R = 38
const CIRCUMFERENCE = 2 * Math.PI * R

// Check path approximated as a polyline — we animate stroke-dashoffset
// SVG path length for a ✓ of width ~28, height ~20 at center 60,60
const CHECK_LENGTH = 46 // approx pixel length of the checkmark stroke

// ─── 90 frames @ 30 fps = 3 s, then loop ────────────────────────────────
export function ConfirmationAnimation() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // ─ Circle draw (stroke-dashoffset 0→circumference)
  const circleProgress = interpolate(frame, [0, 28], [CIRCUMFERENCE, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  })

  // ─ Circle fill (background disc)
  const circleFill = interpolate(frame, [18, 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })

  // ─ Checkmark draw
  const checkProgress = interpolate(frame, [24, 46], [CHECK_LENGTH, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })

  // ─ Check spring bounce
  const checkScale = spring({
    frame: frame - 24,
    fps,
    config: { damping: 9, stiffness: 200, mass: 0.6 },
  })

  // ─ Ripple rings (3 rings, staggered)
  function ripple(startFrame: number) {
    const r = interpolate(frame, [startFrame, startFrame + 40], [R, R + 28], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    })
    const opacity = interpolate(frame, [startFrame, startFrame + 40], [0.5, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
    return { r, opacity }
  }

  const ring1 = ripple(38)
  const ring2 = ripple(50)
  const ring3 = ripple(62)

  // ─ Outer glow pulse (subtle, looping after frame 70)
  const glowPulse = 0.08 + 0.04 * Math.sin((frame - 70) * 0.12)
  const glowOpacity = interpolate(frame, [65, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })

  return (
    <AbsoluteFill style={{ background: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        {/* Outer glow */}
        <circle
          cx="60"
          cy="60"
          r={R + 22}
          fill={TEAL}
          opacity={glowOpacity * glowPulse}
        />

        {/* Ripple rings */}
        {[ring1, ring2, ring3].map(({ r, opacity }, i) => (
          <circle
            key={i}
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={TEAL}
            strokeWidth={2}
            opacity={opacity}
          />
        ))}

        {/* Background disc (fills in) */}
        <circle
          cx="60"
          cy="60"
          r={R}
          fill={TEAL}
          opacity={circleFill * 0.12}
        />

        {/* Ring stroke drawing itself */}
        <circle
          cx="60"
          cy="60"
          r={R}
          fill="none"
          stroke={TEAL}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={circleProgress}
          style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px" }}
        />

        {/* Checkmark — two-segment polyline animating via dashoffset */}
        <polyline
          points="40,61 53,74 80,47"
          fill="none"
          stroke={TEAL}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={CHECK_LENGTH}
          strokeDashoffset={checkProgress}
          style={{
            transform: `scale(${checkScale})`,
            transformOrigin: "60px 60px",
          }}
        />
      </svg>
    </AbsoluteFill>
  )
}
