import { Badge } from "@/components/ui/badge"
import { BOOKING_STATUS_LABELS } from "@/constants/booking"
import { BookingStatus } from "@/types"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: BookingStatus
}

const statusClasses: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: "bg-amber-100 text-amber-700 border-amber-200",
  [BookingStatus.CONFIRMED]: "bg-green-100 text-green-700 border-green-200",
  [BookingStatus.CANCELLED]: "bg-red-100 text-red-700 border-red-200",
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge className={cn("border", statusClasses[status])}>
      {BOOKING_STATUS_LABELS[status]}
    </Badge>
  )
}
