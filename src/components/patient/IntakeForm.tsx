"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createBookingSchema, type CreateBookingInput } from "@/lib/validations"
import { CHIEF_COMPLAINT_CATEGORIES } from "@/constants/booking"

interface IntakeFormProps {
  physicianId: string
  slotId: string
  physicianName: string
  onSuccess: (bookingId: string) => void
}

interface FieldErrorProps {
  message?: string
}

function FieldError({ message }: FieldErrorProps) {
  if (!message) return null
  return <p className="mt-1 text-xs text-red-600">{message}</p>
}

interface LabelProps {
  htmlFor: string
  required?: boolean
  children: React.ReactNode
}

function Label({ htmlFor, required, children }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  )
}

export function IntakeForm({ physicianId, slotId, physicianName, onSuccess }: IntakeFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateBookingInput>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      physicianId,
      slotId,
    },
  })

  async function onSubmit(data: CreateBookingInput) {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (json.success) {
      onSuccess(json.data.id)
    } else {
      throw new Error(json.error ?? "Failed to create booking")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <input type="hidden" {...register("physicianId")} />
      <input type="hidden" {...register("slotId")} />

      <p className="text-sm text-slate-500">
        Booking with <span className="font-medium text-slate-700">{physicianName}</span>
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="patientName" required>
            Full Name
          </Label>
          <Input
            id="patientName"
            placeholder="Jane Smith"
            aria-invalid={!!errors.patientName}
            {...register("patientName")}
          />
          <FieldError message={errors.patientName?.message} />
        </div>

        <div>
          <Label htmlFor="patientDateOfBirth" required>
            Date of Birth
          </Label>
          <Input
            id="patientDateOfBirth"
            type="date"
            aria-invalid={!!errors.patientDateOfBirth}
            {...register("patientDateOfBirth")}
          />
          <FieldError message={errors.patientDateOfBirth?.message} />
        </div>

        <div>
          <Label htmlFor="patientPhone" required>
            Phone Number
          </Label>
          <Input
            id="patientPhone"
            type="tel"
            placeholder="416-555-0100"
            aria-invalid={!!errors.patientPhone}
            {...register("patientPhone")}
          />
          <FieldError message={errors.patientPhone?.message} />
        </div>

        <div>
          <Label htmlFor="patientEmail" required>
            Email Address
          </Label>
          <Input
            id="patientEmail"
            type="email"
            placeholder="jane@email.com"
            aria-invalid={!!errors.patientEmail}
            {...register("patientEmail")}
          />
          <FieldError message={errors.patientEmail?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor="chiefComplaintCategory" required>
          Visit Type
        </Label>
        <Controller
          name="chiefComplaintCategory"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger
                id="chiefComplaintCategory"
                className="h-9 w-full"
                aria-invalid={!!errors.chiefComplaintCategory}
              >
                <SelectValue placeholder="Select visit type..." />
              </SelectTrigger>
              <SelectContent>
                {CHIEF_COMPLAINT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError message={errors.chiefComplaintCategory?.message} />
      </div>

      <div>
        <Label htmlFor="chiefComplaint" required>
          Chief Complaint
        </Label>
        <Textarea
          id="chiefComplaint"
          rows={4}
          placeholder="Please describe your symptoms or reason for visit in detail..."
          aria-invalid={!!errors.chiefComplaint}
          {...register("chiefComplaint")}
        />
        <FieldError message={errors.chiefComplaint?.message} />
      </div>

      <div>
        <Label htmlFor="additionalNotes">Additional Notes</Label>
        <Textarea
          id="additionalNotes"
          rows={3}
          placeholder="Any medications, allergies, or other information..."
          {...register("additionalNotes")}
        />
        <FieldError message={errors.additionalNotes?.message} />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-teal-700 text-white hover:bg-teal-800"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Request Appointment"
        )}
      </Button>
    </form>
  )
}
