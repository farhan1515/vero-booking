"use client"

import dynamic from "next/dynamic"

const ConfirmationPlayerImpl = dynamic(
  () =>
    import("./ConfirmationPlayerImpl").then((m) => ({
      default: m.ConfirmationPlayerImpl,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex size-16 items-center justify-center rounded-full bg-teal-50">
        <div className="size-8 rounded-full border-2 border-[#0F6E56]/30" />
      </div>
    ),
  }
)

export function ConfirmationPlayer() {
  return <ConfirmationPlayerImpl />
}
