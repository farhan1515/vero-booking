"use client"

import dynamic from "next/dynamic"

const HeroPlayerImpl = dynamic(
  () => import("./HeroPlayerImpl").then((m) => ({ default: m.HeroPlayerImpl })),
  {
    ssr: false,
    loading: () => (
      <div
        style={{ paddingTop: "88.89%" }}
        className="relative w-full rounded-3xl bg-[#12161f] animate-pulse"
      />
    ),
  }
)

export function HeroPlayer() {
  return (
    <div className="mx-auto w-full max-w-[380px]">
      <HeroPlayerImpl />
    </div>
  )
}
