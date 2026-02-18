"use client"
// src/components/pos/DeliveryDetailsForm.tsx

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Bike, MapPin, Phone, User, AlertCircle, Truck, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const deliveryDetailsSchema = z.object({
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  deliveryAddress: z.string().min(1, "Delivery address is required"),
  deliveryNote: z.string().optional(),
})

type DeliveryDetailsInput = z.infer<typeof deliveryDetailsSchema>

interface DeliveryDetailsFormProps {
  onSubmit: (data: {
    customerName?: string
    customerPhone?: string
    deliveryAddress: string
    deliveryNote?: string
    deliveryFee: number
  }) => void
  onBack: () => void
  defaultDeliveryFee?: number
}

export default function DeliveryDetailsForm({
  onSubmit,
  onBack,
  defaultDeliveryFee = 0,
}: DeliveryDetailsFormProps) {
  const [deliveryFee, setDeliveryFee] = useState(defaultDeliveryFee)
  const [customFee, setCustomFee] = useState(String(defaultDeliveryFee))

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<DeliveryDetailsInput>({
    resolver: zodResolver(deliveryDetailsSchema),
    mode: "onChange",
  })

  useEffect(() => {
    setDeliveryFee(defaultDeliveryFee)
    setCustomFee(String(defaultDeliveryFee))
  }, [defaultDeliveryFee])

  const handleFeeChange = (val: string) => {
    setCustomFee(val)
    const parsed = parseFloat(val)
    if (!isNaN(parsed) && parsed >= 0) {
      setDeliveryFee(parsed)
    }
  }

  const onFormSubmit = (data: DeliveryDetailsInput) => {
    onSubmit({
      ...data,
      deliveryFee,
    })
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-green-100 p-2">
            <Bike className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Delivery Details</h2>
            <p className="text-sm text-gray-500">Enter delivery address and customer information</p>
          </div>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Delivery address is required. Customer name and phone are optional but recommended.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Customer Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              Customer Information
            </CardTitle>
            <CardDescription>Optional — for records and communication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="customerName">
                  Customer Name
                  <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="customerName"
                    placeholder="e.g. John Smith"
                    className="pl-9"
                    {...register("customerName")}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="customerPhone">
                  Phone Number
                  <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="customerPhone"
                    placeholder="e.g. 555-1234"
                    className="pl-9"
                    {...register("customerPhone")}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-500" />
              Delivery Address
              <Badge className="ml-1 text-xs bg-red-100 text-red-700 border-red-200">Required</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="deliveryAddress">Full Address *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="deliveryAddress"
                  placeholder="e.g. 123 Main St, Apt 4B, City, State 12345"
                  className="pl-9 min-h-[80px] resize-none"
                  {...register("deliveryAddress")}
                />
              </div>
              {errors.deliveryAddress && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.deliveryAddress.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="deliveryNote">
                Delivery Note
                <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge>
              </Label>
              <Input
                id="deliveryNote"
                placeholder="e.g. Ring bell, Leave at door, Gate code 1234"
                {...register("deliveryNote")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Delivery Fee */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="h-4 w-4 text-gray-500" />
              Delivery Fee
            </CardTitle>
            <CardDescription>Adjust the delivery charge for this order</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  $
                </span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={customFee}
                  onChange={(e) => handleFeeChange(e.target.value)}
                  className="pl-7"
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-2">
                {[0, 2, 5, 10].map((fee) => (
                  <Button
                    key={fee}
                    type="button"
                    variant={deliveryFee === fee ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFeeChange(String(fee))}
                  >
                    ${fee}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
            Back
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            disabled={!isValid}
          >
            Continue to Menu
          </Button>
        </div>
      </form>
    </div>
  )
}