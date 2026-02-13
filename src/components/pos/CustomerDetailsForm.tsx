"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Info } from "lucide-react"

const customerDetailsSchema = z.object({
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
})

type CustomerDetailsInput = z.infer<typeof customerDetailsSchema>

interface CustomerDetailsFormProps {
  onSubmit: (data: CustomerDetailsInput) => void
  onBack: () => void
  onSkip: () => void
}

export default function CustomerDetailsForm({
  onSubmit,
  onBack,
  onSkip,
}: CustomerDetailsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerDetailsInput>({
    resolver: zodResolver(customerDetailsSchema),
  })

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Customer Details</h2>
          <p className="text-gray-600">Optional - Add customer information for this takeaway order</p>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Customer details are optional. You can skip this step or add information for record keeping.
        </AlertDescription>
      </Alert>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
          <CardDescription>
            Enter customer name and phone number (both optional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Name */}
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                type="text"
                placeholder="e.g., John Doe"
                {...register("customerName")}
              />
              {errors.customerName && (
                <p className="text-sm text-red-500">{errors.customerName.message}</p>
              )}
            </div>

            {/* Customer Phone */}
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone Number</Label>
              <Input
                id="customerPhone"
                type="tel"
                placeholder="e.g., +1234567890"
                {...register("customerPhone")}
              />
              {errors.customerPhone && (
                <p className="text-sm text-red-500">{errors.customerPhone.message}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onSkip}
              >
                Skip
              </Button>
              <Button type="submit" className="flex-1">
                Continue
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}