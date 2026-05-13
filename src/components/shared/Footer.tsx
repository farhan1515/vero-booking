import Link from "next/link"
import { ShieldCheck, Lock, Activity } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="mb-3 flex items-center gap-1.5">
              <span className="font-heading text-base font-bold tracking-tight text-[#0F6E56]">Vero</span>
              <span className="font-heading text-base font-light tracking-tight text-gray-400">Booking</span>
            </Link>
            <p className="text-xs leading-relaxed text-gray-500">
              A clinical patient booking system built as a technical work sample for{" "}
              <a
                href="https://veroscribe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0F6E56] transition-colors hover:text-teal-700"
              >
                Vero Scribe
              </a>
              .
            </p>
          </div>

          {/* Compliance */}
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#0F6E56]" />
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Protected Health Information
              </p>
              <p className="text-xs leading-relaxed text-gray-500">
                Patient data handled in accordance with HIPAA guidelines. Encrypted in transit and at rest.
                Access is logged and audited.
              </p>
            </div>
          </div>

          {/* Trust signals */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Lock className="size-3.5 text-[#0F6E56]" />
              <span className="text-xs text-gray-500">End-to-end encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="size-3.5 text-[#0F6E56]" />
              <span className="text-xs text-gray-500">Full audit trail on all status changes</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-[#0F6E56]" />
              <span className="text-xs text-gray-500">For authorized healthcare providers only</span>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-100 pt-6 text-center">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Vero Booking · Built on Next.js 16 · Powered by GPT-4o
          </p>
        </div>
      </div>
    </footer>
  )
}
