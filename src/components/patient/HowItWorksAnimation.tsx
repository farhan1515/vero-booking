import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
  Easing,
} from "remotion"

const TEAL = "#0F6E56"
const TEAL_BG = "rgba(15,110,86,0.08)"
const TEAL_BORDER = "rgba(15,110,86,0.18)"
const TEAL_ACTIVE_BG = "rgba(15,110,86,0.13)"
const GRAY_900 = "#111827"
const GRAY_500 = "#6B7280"
const GRAY_200 = "#E5E7EB"
const SANS = "Inter, system-ui, sans-serif"
const HEADING = "Manrope, Inter, system-ui, sans-serif"

// ── inline SVG icon paths ────────────────────────────────────────────────────

function StethoscopeIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.3.3 0 1 0 .2.3" />
      <path d="M8 15a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-3" />
      <circle cx="20" cy="10" r="2" />
    </svg>
  )
}

function CalendarIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="14" x2="8" y2="14" strokeWidth="2.5" />
      <line x1="12" y1="14" x2="12" y2="14" strokeWidth="2.5" />
      <path d="M14 16l1.5 1.5 3-3" />
    </svg>
  )
}

function ClipboardIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="4" rx="1" />
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="12" y2="17" />
    </svg>
  )
}

// ── easing helper ────────────────────────────────────────────────────────────

function ease(frame: number, from: number, to: number, start: number, end: number) {
  return interpolate(frame, [start, end], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })
}

// ── Step card ────────────────────────────────────────────────────────────────

interface StepProps {
  frame: number
  fps: number
  activateAt: number
  n: string
  title: string
  description: string
  x: number
  icon: React.ReactNode
  activeIcon: React.ReactNode
}

function StepCard({ frame, fps, activateAt, n, title, description, x, icon, activeIcon }: StepProps) {
  const circleSpring = spring({ frame: frame - activateAt, fps, config: { damping: 10, stiffness: 200, mass: 0.7 } })
  const circleOpacity = ease(frame, 0, 1, activateAt, activateAt + 15)
  const iconOpacity = ease(frame, 0, 1, activateAt + 10, activateAt + 25)
  const textOpacity = ease(frame, 0, 1, activateAt + 15, activateAt + 32)
  const textY = ease(frame, 10, 0, activateAt + 15, activateAt + 32)
  const isActive = frame >= activateAt

  return (
    <g>
      {/* Circle background */}
      <foreignObject x={x - 44} y={30} width={88} height={88}>
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            background: isActive ? TEAL_ACTIVE_BG : TEAL_BG,
            border: `2px solid ${isActive ? TEAL_BORDER : GRAY_200}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: circleOpacity,
            transform: `scale(${circleSpring})`,
            transition: "background 0.4s, border-color 0.4s",
          }}
        >
          <div style={{ opacity: iconOpacity }}>
            {isActive ? activeIcon : icon}
          </div>
        </div>
      </foreignObject>

      {/* Step badge */}
      <foreignObject x={x + 22} y={20} width={28} height={28}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: isActive ? GRAY_900 : GRAY_200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: circleOpacity,
            transform: `scale(${circleSpring})`,
          }}
        >
          <span style={{ fontFamily: HEADING, fontSize: 11, fontWeight: 700, color: isActive ? "#fff" : GRAY_500 }}>
            {n}
          </span>
        </div>
      </foreignObject>

      {/* Title */}
      <foreignObject x={x - 80} y={134} width={160} height={30}>
        <div
          style={{
            opacity: textOpacity,
            transform: `translateY(${textY}px)`,
            textAlign: "center",
            fontFamily: HEADING,
            fontSize: 15,
            fontWeight: 700,
            color: GRAY_900,
          }}
        >
          {title}
        </div>
      </foreignObject>

      {/* Description */}
      <foreignObject x={x - 90} y={170} width={180} height={80}>
        <div
          style={{
            opacity: textOpacity,
            transform: `translateY(${textY}px)`,
            textAlign: "center",
            fontFamily: SANS,
            fontSize: 12.5,
            lineHeight: 1.6,
            color: GRAY_500,
          }}
        >
          {description}
        </div>
      </foreignObject>
    </g>
  )
}

// ── Connector line (draws left-to-right) ─────────────────────────────────────

function Connector({ frame, drawFrom, drawTo, x1, x2, y }: {
  frame: number
  drawFrom: number
  drawTo: number
  x1: number
  x2: number
  y: number
}) {
  const progress = ease(frame, 0, 1, drawFrom, drawTo)
  const drawnX = x1 + (x2 - x1) * progress

  return (
    <line
      x1={x1}
      y1={y}
      x2={drawnX}
      y2={y}
      stroke={GRAY_200}
      strokeWidth={1.5}
      strokeDasharray="4 4"
    />
  )
}

// ── Composition: 900 × 280, 210 frames @ 30fps ───────────────────────────────

export function HowItWorksAnimation() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const masterFade = interpolate(frame, [185, 208], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })

  // Step activation frames
  const S1 = 5
  const S2 = 65
  const S3 = 125

  // Connector draw frames
  const C1_START = 28
  const C1_END = 62
  const C2_START = 88
  const C2_END = 122

  // Column x-positions (within 900px)
  const X1 = 150
  const X2 = 450
  const X3 = 750
  const LINE_Y = 74

  const inactiveIcon = (c: React.ReactNode) => <div style={{ opacity: 0.35 }}>{c}</div>

  return (
    <AbsoluteFill style={{ background: "transparent" }}>
      <svg
        width="900"
        height="280"
        viewBox="0 0 900 280"
        style={{ opacity: masterFade, overflow: "visible" }}
      >
        {/* Connector 1: step 1 → step 2 */}
        <Connector frame={frame} drawFrom={C1_START} drawTo={C1_END} x1={X1 + 46} x2={X2 - 46} y={LINE_Y} />

        {/* Connector 2: step 2 → step 3 */}
        <Connector frame={frame} drawFrom={C2_START} drawTo={C2_END} x1={X2 + 46} x2={X3 - 46} y={LINE_Y} />

        {/* Step 1 */}
        <StepCard
          frame={frame}
          fps={fps}
          activateAt={S1}
          n="1"
          title="Browse Physicians"
          description="Filter by specialty to find the right specialist for your care."
          x={X1}
          icon={inactiveIcon(<StethoscopeIcon color={GRAY_500} />)}
          activeIcon={<StethoscopeIcon color={TEAL} />}
        />

        {/* Step 2 */}
        <StepCard
          frame={frame}
          fps={fps}
          activateAt={S2}
          n="2"
          title="Choose a Slot"
          description="Pick from available appointment times that fit your schedule."
          x={X2}
          icon={inactiveIcon(<CalendarIcon color={GRAY_500} />)}
          activeIcon={<CalendarIcon color={TEAL} />}
        />

        {/* Step 3 */}
        <StepCard
          frame={frame}
          fps={fps}
          activateAt={S3}
          n="3"
          title="Fill Intake Form"
          description="Describe your symptoms — our AI prepares your clinical note before you arrive."
          x={X3}
          icon={inactiveIcon(<ClipboardIcon color={GRAY_500} />)}
          activeIcon={<ClipboardIcon color={TEAL} />}
        />
      </svg>
    </AbsoluteFill>
  )
}
