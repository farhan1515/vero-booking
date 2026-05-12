"use client"

import { BookOpen, ExternalLink } from "lucide-react"
import type { EvidenceReference } from "@/app/api/ai/evidence/route"

interface EvidencePanelProps {
  references: EvidenceReference[] | null
  loading: boolean
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-5 w-14 animate-pulse rounded-full bg-slate-200" />
      </div>
      <div className="mb-3 h-3 w-full animate-pulse rounded bg-slate-100" />
      <div className="h-7 w-28 animate-pulse rounded-lg bg-slate-100" />
    </div>
  )
}

export function EvidencePanel({ references, loading }: EvidencePanelProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-1.5">
        <BookOpen className="size-3.5 text-teal-600" />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Clinical Evidence
        </h3>
        <span className="text-xs text-slate-400">· AI-suggested references · Always verify currency</span>
      </div>

      {!references || references.length === 0 ? (
        <p className="text-xs text-slate-400">No references available.</p>
      ) : (
        <ul className="space-y-3">
          {references.map((ref, i) => (
            <li
              key={i}
              className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-1.5 flex items-start justify-between gap-3">
                <p className="text-sm font-medium leading-snug text-slate-800">{ref.title}</p>
                <span className="shrink-0 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                  {ref.source}
                </span>
              </div>
              <p className="mb-3 text-xs leading-relaxed text-slate-600">{ref.relevance}</p>
              <a
                href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(ref.searchQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-100"
              >
                <ExternalLink className="size-3" />
                Search PubMed
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
