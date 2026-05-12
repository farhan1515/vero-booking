"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Search } from "lucide-react"
import { BookingTable } from "@/components/admin/BookingTable"
import { BookingDetailModal } from "@/components/admin/BookingDetailModal"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { BookingStatus } from "@/types"
import type { BookingWithPhysician, BookingWithDetails } from "@/types"
import { cn } from "@/lib/utils"

type TabFilter = "ALL" | BookingStatus

interface StatCardProps {
  label: string
  value: number
  accentClass: string
  borderClass: string
}

function StatCard({ label, value, accentClass, borderClass }: StatCardProps) {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-5 shadow-sm", borderClass)}>
      <p className={cn("text-3xl font-bold", accentClass)}>{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  )
}

const TABS: { label: string; value: TabFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: BookingStatus.PENDING },
  { label: "Confirmed", value: BookingStatus.CONFIRMED },
  { label: "Cancelled", value: BookingStatus.CANCELLED },
]

export default function DashboardPage() {
  const [bookings, setBookings] = useState<BookingWithPhysician[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabFilter>("ALL")
  const [nameSearch, setNameSearch] = useState("")
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch("/api/bookings")
      const json = await res.json()
      if (json.success) setBookings(json.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookings()
    intervalRef.current = setInterval(fetchBookings, 30_000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchBookings])

  async function handleRowClick(booking: BookingWithPhysician) {
    const res = await fetch(`/api/bookings/${booking.id}`)
    const json = await res.json()
    if (json.success) setSelectedBooking(json.data as BookingWithDetails)
  }

  async function handleQuickStatus(id: string, status: BookingStatus) {
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    await fetchBookings()
  }

  const counts = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === BookingStatus.PENDING).length,
    confirmed: bookings.filter((b) => b.status === BookingStatus.CONFIRMED).length,
    cancelled: bookings.filter((b) => b.status === BookingStatus.CANCELLED).length,
  }

  const filtered = bookings
    .filter((b) => activeTab === "ALL" || b.status === activeTab)
    .filter((b) =>
      nameSearch === "" ||
      b.patientName.toLowerCase().includes(nameSearch.toLowerCase()) ||
      b.physician.name.toLowerCase().includes(nameSearch.toLowerCase())
    )

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Physician Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Vero Booking Admin</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Bookings" value={counts.total} accentClass="text-slate-800" borderClass="border-l-4 border-l-slate-400" />
        <StatCard label="Pending" value={counts.pending} accentClass="text-amber-600" borderClass="border-l-4 border-l-amber-400" />
        <StatCard label="Confirmed" value={counts.confirmed} accentClass="text-green-600" borderClass="border-l-4 border-l-green-500" />
        <StatCard label="Cancelled" value={counts.cancelled} accentClass="text-red-500" borderClass="border-l-4 border-l-red-400" />
      </div>

      {/* Filter tabs */}
      <div className="mb-5 flex border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "px-4 pb-3 text-sm font-medium transition-colors",
              activeTab === tab.value
                ? "border-b-2 border-teal-700 text-teal-700"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {tab.label}
            {tab.value !== "ALL" && (
              <span
                className={cn(
                  "ml-1.5 rounded-full px-1.5 py-0.5 text-xs",
                  activeTab === tab.value
                    ? "bg-teal-100 text-teal-700"
                    : "bg-slate-100 text-slate-500"
                )}
              >
                {tab.value === BookingStatus.PENDING
                  ? counts.pending
                  : tab.value === BookingStatus.CONFIRMED
                  ? counts.confirmed
                  : counts.cancelled}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient or physician..."
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
          />
        </div>
        {nameSearch && (
          <button
            onClick={() => setNameSearch("")}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex min-h-60 items-center justify-center">
          <LoadingSpinner size={32} />
        </div>
      ) : (
        <BookingTable
          bookings={filtered}
          onBookingClick={handleRowClick}
          onStatusUpdate={handleQuickStatus}
        />
      )}

      <BookingDetailModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onStatusUpdate={fetchBookings}
        onBookingRefresh={(updated) => setSelectedBooking(updated)}
      />
    </main>
  )
}
