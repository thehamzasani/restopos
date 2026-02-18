"use client"
// src/components/settings/DeliverySettings.tsx

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bike, Loader2, CheckCircle2, AlertCircle, Truck, ShoppingCart } from "lucide-react"
import { deliverySettingsSchema, DeliverySettingsInput } from "@/lib/validations/settings"
import { toast } from "sonner"

export default function DeliverySettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<DeliverySettingsInput>({
    resolver: zodResolver(deliverySettingsSchema),
    defaultValues: { deliveryFee: 0, minOrderAmount: 0 },
  })

  const watchDeliveryFee = watch("deliveryFee")
  const watchMinOrder = watch("minOrderAmount")

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings/delivery")
      const data = await res.json()
      if (data.success) {
        reset({
          deliveryFee: Number(data.data.deliveryFee),
          minOrderAmount: Number(data.data.minOrderAmount),
        })
      }
    } catch (error) {
      console.error("Failed to fetch delivery settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (values: DeliverySettingsInput) => {
    setSaving(true)
    try {
      const res = await fetch("/api/settings/delivery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error ?? "Save failed")

      reset(values)
      setSaved(true)
      toast.success("Delivery settings saved!")
      setTimeout(() => setSaved(false), 2000)
    } catch (error: any) {
      toast.error(error.message ?? "Failed to save delivery settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bike className="h-5 w-5 text-green-600" />
            Delivery Settings
          </CardTitle>
          <CardDescription>
            Configure default delivery fee and minimum order amount for delivery orders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Delivery Fee */}
            <div className="space-y-2">
              <Label htmlFor="deliveryFee" className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-gray-500" />
                Default Delivery Fee
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  $
                </span>
                <Input
                  id="deliveryFee"
                  type="number"
                  min="0"
                  step="0.01"
                  className="pl-7"
                  placeholder="0.00"
                  {...register("deliveryFee", { valueAsNumber: true })}
                />
              </div>
              {errors.deliveryFee && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.deliveryFee.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                This is the default fee shown when creating a delivery order. It can be adjusted per order.
              </p>
            </div>

            {/* Minimum Order */}
            <div className="space-y-2">
              <Label htmlFor="minOrderAmount" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-gray-500" />
                Minimum Order Amount
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  $
                </span>
                <Input
                  id="minOrderAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  className="pl-7"
                  placeholder="0.00"
                  {...register("minOrderAmount", { valueAsNumber: true })}
                />
              </div>
              {errors.minOrderAmount && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.minOrderAmount.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Set to 0 to allow any order amount. Orders below this amount cannot use delivery.
              </p>
            </div>
          </div>

          {/* Preview */}
          <Alert>
            <Bike className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium text-sm mb-1">Delivery Pricing Preview</p>
              <div className="text-xs text-gray-600 space-y-1">
                <p>Default delivery fee: <span className="font-semibold">${Number(watchDeliveryFee || 0).toFixed(2)}</span></p>
                {Number(watchMinOrder || 0) > 0 && (
                  <p>Minimum order for delivery: <span className="font-semibold">${Number(watchMinOrder || 0).toFixed(2)}</span></p>
                )}
                {Number(watchMinOrder || 0) === 0 && (
                  <p>No minimum order required for delivery</p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={saving || saved || !isDirty} className="min-w-32">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Saved!
            </>
          ) : (
            "Save Delivery Settings"
          )}
        </Button>
      </div>
    </form>
  )
}