"use client"

import { Lightbulb, HelpCircle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ClinicalInsights } from "@/app/api/ai/insights/route"

interface InsightsPanelProps {
  insights: ClinicalInsights | null
  loading: boolean
}

function SkeletonSection() {
  return (
    <div className="space-y-2">
      <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
      <div className="space-y-1.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 w-full animate-pulse rounded-lg bg-slate-100" />
        ))}
      </div>
    </div>
  )
}

interface SectionProps {
  icon: React.ReactNode
  title: string
  items: string[]
  itemClass?: string
  itemBorderClass?: string
}

function InsightSection({ icon, title, items, itemClass, itemBorderClass }: SectionProps) {
  if (items.length === 0) return null
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        {icon}
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h4>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li
            key={i}
            className={cn(
              "rounded-lg px-3 py-2 text-xs leading-snug transition-colors",
              itemBorderClass,
              itemClass
            )}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function InsightsPanel({ insights, loading }: InsightsPanelProps) {
  if (loading) {
    return (
      <div className="space-y-5">
        <SkeletonSection />
        <SkeletonSection />
        <SkeletonSection />
      </div>
    )
  }

  if (!insights) return null

  const hasContent =
    insights.consider.length > 0 ||
    insights.questions.length > 0 ||
    insights.watchFor.length > 0

  if (!hasContent) {
    return <p className="text-xs text-slate-400">No insights available.</p>
  }

  return (
    <div className="space-y-5">
      <InsightSection
        icon={<Lightbulb className="size-3.5 text-amber-500" />}
        title="Consider"
        items={insights.consider}
        itemClass="bg-amber-50 text-amber-900 hover:bg-amber-100"
      />
      <InsightSection
        icon={<HelpCircle className="size-3.5 text-teal-600" />}
        title="Ask the Patient"
        items={insights.questions}
        itemClass="bg-slate-50 text-slate-700 hover:bg-slate-100"
      />
      <InsightSection
        icon={<AlertTriangle className="size-3.5 text-red-500" />}
        title="Watch For"
        items={insights.watchFor}
        itemClass="bg-red-50 text-red-800 hover:bg-red-100"
        itemBorderClass="border-l-2 border-l-red-400"
      />
    </div>
  )
}
