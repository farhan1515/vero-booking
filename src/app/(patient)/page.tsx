"use client"

import { useState, useEffect, useMemo } from "react"
import { Search } from "lucide-react"
import { PhysicianCard } from "@/components/patient/PhysicianCard"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { PhysicianWithSlots } from "@/types"

function SkeletonCard() {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="size-12 animate-pulse rounded-full bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-1/3 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>
      <div className="mt-3 h-3 w-1/4 animate-pulse rounded bg-slate-200" />
      <div className="mt-2 space-y-1.5">
        <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="mt-4 h-9 w-full animate-pulse rounded-lg bg-slate-200" />
    </div>
  )
}

export default function PhysiciansPage() {
  const [physicians, setPhysicians] = useState<PhysicianWithSlots[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nameFilter, setNameFilter] = useState("")
  const [specialtyFilter, setSpecialtyFilter] = useState("all")

  useEffect(() => {
    fetch("/api/physicians")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setPhysicians(res.data)
        else setError(res.error ?? "Failed to load physicians")
      })
      .catch(() => setError("Failed to load physicians"))
      .finally(() => setLoading(false))
  }, [])

  const specialties = useMemo(
    () => Array.from(new Set(physicians.map((p) => p.specialty))).sort(),
    [physicians]
  )

  const filtered = useMemo(() => {
    return physicians.filter((p) => {
      const matchesName = p.name.toLowerCase().includes(nameFilter.toLowerCase())
      const matchesSpecialty = specialtyFilter === "all" || p.specialty === specialtyFilter
      return matchesName && matchesSpecialty
    })
  }, [physicians, nameFilter, specialtyFilter])

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pt-8 pb-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Find a Physician</h1>
        <p className="mt-2 text-base text-slate-500">
          Browse our network of trusted specialists and book your appointment today.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by physician name..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
          />
        </div>
        <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
          <SelectTrigger className="h-9 w-full sm:w-52">
            <SelectValue placeholder="All specialties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All specialties</SelectItem>
            {specialties.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-20 text-center">
          <p className="text-base font-medium text-red-600">{error}</p>
          <p className="mt-1 text-sm text-slate-500">Please try refreshing the page.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <p className="text-base font-medium text-slate-700">No physicians found</p>
          <p className="mt-1 text-sm text-slate-500">
            Try adjusting your search or filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PhysicianCard key={p.id} physician={p} />
          ))}
        </div>
      )}
    </main>
  )
}
