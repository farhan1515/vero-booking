import { Info, Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { IcdSuggestion } from "@/types"

interface IcdSuggestionsProps {
  icdSuggestions: string | null | undefined
  onGenerate?: () => void
  generating?: boolean
}

function parseIcd(raw: string | null | undefined): IcdSuggestion[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function confidencePillClass(confidence: number): string {
  if (confidence > 0.8) return "bg-green-100 text-green-700"
  if (confidence >= 0.5) return "bg-amber-100 text-amber-700"
  return "bg-slate-100 text-slate-600"
}

export function IcdSuggestions({ icdSuggestions, onGenerate, generating }: IcdSuggestionsProps) {
  const suggestions = parseIcd(icdSuggestions)

  return (
    <div>
      <div className="mb-3 flex items-center gap-1.5">
        <h3 className="text-sm font-semibold text-slate-800">Suggested ICD-10 Codes</h3>
        <div className="group relative">
          <Info className="size-3.5 cursor-help text-slate-400" />
          <div className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 w-52 -translate-x-1/2 rounded-lg bg-slate-800 px-3 py-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
            AI-generated suggestions. Always verify before use.
          </div>
        </div>
      </div>

      {suggestions.length === 0 ? (
        onGenerate ? (
          <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">No ICD-10 codes generated yet.</p>
            <Button
              size="sm"
              className="bg-teal-700 text-white hover:bg-teal-800"
              onClick={onGenerate}
              disabled={generating}
            >
              {generating ? (
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              ) : (
                <Sparkles className="mr-1.5 size-3.5" />
              )}
              {generating ? "Generating..." : "Generate ICD-10 Codes"}
            </Button>
          </div>
        ) : (
          <p className="text-xs text-slate-400">No suggestions available</p>
        )
      ) : (
        <ul className="space-y-2">
          {suggestions.map((s) => (
            <li key={s.code} className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
              <div className="min-w-0">
                <span className="font-mono text-xs font-bold text-slate-800">{s.code}</span>
                <p className="mt-0.5 text-xs text-slate-600">{s.description}</p>
              </div>
              <span
                className={cn(
                  "mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                  confidencePillClass(s.confidence)
                )}
              >
                {Math.round(s.confidence * 100)}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
