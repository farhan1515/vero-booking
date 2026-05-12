import Link from "next/link"
import { ShieldCheck } from "lucide-react"

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-teal-600" />
            <div>
              <p className="text-sm font-medium text-slate-700">Protected Health Information</p>
              <p className="mt-0.5 max-w-md text-xs leading-relaxed text-slate-500">
                This platform handles patient data in accordance with HIPAA guidelines. All information
                is encrypted in transit and at rest. Access is logged and audited. For authorized
                healthcare providers only.
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <Link href="/" className="flex items-center gap-1.5 justify-end">
              <span className="text-sm font-bold text-teal-700">Vero</span>
              <span className="text-sm font-light text-slate-500">Booking</span>
            </Link>
            <p className="mt-1 text-xs text-slate-400">
              A work sample for{" "}
              <a
                href="https://veroscribe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 hover:underline"
              >
                Vero Scribe
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
