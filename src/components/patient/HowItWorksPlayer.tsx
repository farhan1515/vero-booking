"use client"

import dynamic from "next/dynamic"

const HowItWorksPlayerImpl = dynamic(
  () =>
    import("./HowItWorksPlayerImpl").then((m) => ({
      default: m.HowItWorksPlayerImpl,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        style={{ paddingTop: "31.11%" }}
        className="relative w-full animate-pulse rounded-2xl bg-gray-100"
      />
    ),
  }
)

export function HowItWorksPlayer() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <HowItWorksPlayerImpl />
    </div>
  )
}
