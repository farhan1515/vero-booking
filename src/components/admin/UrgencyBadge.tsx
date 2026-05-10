import { Badge } from "@/components/ui/badge"
import { URGENCY_LABELS } from "@/constants/booking"
import { UrgencyLevel } from "@/types"
import { cn } from "@/lib/utils"

interface UrgencyBadgeProps {
  urgencyLevel: string | null | undefined
}

const urgencyClasses: Record<UrgencyLevel, string> = {
  [UrgencyLevel.ROUTINE]: "bg-slate-100 text-slate-600 border-slate-200",
  [UrgencyLevel.PRIORITY]: "bg-amber-100 text-amber-700 border-amber-200",
  [UrgencyLevel.URGENT]: "bg-red-100 text-red-700 border-red-200",
}

export function UrgencyBadge({ urgencyLevel }: UrgencyBadgeProps) {
  if (!urgencyLevel) return null
  const level = urgencyLevel as UrgencyLevel
  const classes = urgencyClasses[level]
  if (!classes) return null

  return (
    <Badge className={cn("border", classes)}>
      {URGENCY_LABELS[level]}
    </Badge>
  )
}
