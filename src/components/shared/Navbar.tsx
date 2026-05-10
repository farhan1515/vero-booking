import Link from "next/link"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b border-slate-200 bg-white px-6">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-teal-700">Vero</span>
          <span className="text-xl font-light tracking-tight text-slate-500">Booking</span>
        </Link>
        <nav>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-teal-700"
          >
            For Physicians
          </Link>
        </nav>
      </div>
    </header>
  )
}
