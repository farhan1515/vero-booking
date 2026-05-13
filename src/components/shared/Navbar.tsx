"use client"

import Link from "next/link"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b border-gray-100 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="font-heading text-xl font-bold tracking-tight text-[#0F6E56]">
            Vero
          </span>
          <span className="font-heading text-xl font-light tracking-tight text-gray-400">
            Booking
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            For Physicians
          </Link>
        </nav>
      </div>
    </header>
  )
}
