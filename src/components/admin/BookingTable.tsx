"use client"

import { useRouter } from "next/navigation"
import { Check, X } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { UrgencyBadge } from "@/components/admin/UrgencyBadge"
import { BookingStatus } from "@/types"
import type { BookingWithPhysician } from "@/types"

interface BookingTableProps {
  bookings: BookingWithPhysician[]
  onStatusUpdate: (id: string, status: BookingStatus) => void
}

function formatSlotDate(date: Date | string): string {
  return (
    new Date(date).toLocaleDateString("en-CA", {
      month: "short",
      day: "numeric",
    }) +
    ", " +
    new Date(date).toLocaleTimeString("en-CA", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  )
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + "…" : str
}

export function BookingTable({ bookings, onStatusUpdate }: BookingTableProps) {
  const router = useRouter()

  if (bookings.length === 0) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-xl border border-slate-200 bg-white">
        <p className="text-sm text-slate-400">No bookings found</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="pl-4">Patient</TableHead>
            <TableHead>Physician</TableHead>
            <TableHead>Specialty</TableHead>
            <TableHead>Date &amp; Time</TableHead>
            <TableHead>Chief Complaint</TableHead>
            <TableHead>Urgency</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="pr-4 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow
              key={booking.id}
              className="cursor-pointer hover:bg-slate-50"
              onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
            >
              <TableCell className="pl-4">
                <div>
                  <p className="font-medium text-slate-900">{booking.patientName}</p>
                  <p className="text-xs text-slate-400">{booking.patientEmail}</p>
                </div>
              </TableCell>
              <TableCell className="text-slate-700">{booking.physician.name}</TableCell>
              <TableCell>
                <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
                  {booking.physician.specialty}
                </span>
              </TableCell>
              <TableCell className="text-slate-600">
                {formatSlotDate(booking.slot.startTime)}
              </TableCell>
              <TableCell>
                <span className="text-slate-600" title={booking.chiefComplaint}>
                  {truncate(booking.chiefComplaint, 30)}
                </span>
              </TableCell>
              <TableCell>
                <UrgencyBadge urgencyLevel={booking.urgencyLevel} />
              </TableCell>
              <TableCell>
                <StatusBadge status={booking.status as BookingStatus} />
              </TableCell>
              <TableCell className="pr-4 text-right">
                <div
                  className="flex items-center justify-end gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {booking.status === BookingStatus.PENDING && (
                    <>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="text-green-600 hover:bg-green-50 hover:text-green-700"
                        title="Confirm"
                        onClick={() => onStatusUpdate(booking.id, BookingStatus.CONFIRMED)}
                      >
                        <Check className="size-3.5" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        title="Cancel"
                        onClick={() => onStatusUpdate(booking.id, BookingStatus.CANCELLED)}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </>
                  )}
                  {booking.status === BookingStatus.CONFIRMED && (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      title="Cancel"
                      onClick={() => onStatusUpdate(booking.id, BookingStatus.CANCELLED)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
