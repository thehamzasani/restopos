// src/components/settings/TaxSettings.tsx

"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { taxSettingsSchema, TaxSettingsInput } from "@/lib/validations/settings"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { ButtonLoader } from "@/components/shared/LoadingSpinner"
import { Save, Percent } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface TaxSettingsProps {
  initialTaxRate: number
}

export function TaxSettings({ initialTaxRate }: TaxSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<TaxSettingsInput>({
    resolver: zodResolver(taxSettingsSchema),
    defaultValues: {
      taxRate: Number(initialTaxRate),
    },
  })

  async function onSubmit(data: TaxSettingsInput) {
    try {
      setIsLoading(true)

      const response = await fetch("/api/settings/tax", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to update tax rate")
      }

      toast.success("Tax rate updated successfully")
    } catch (error: any) {
      console.error("Error updating tax rate:", error)
      toast.error(error.message || "Failed to update tax rate")
    } finally {
      setIsLoading(false)
    }
  }

  const currentTaxRate = form.watch("taxRate")
  const exampleAmount = 100
  const exampleTax = (exampleAmount * currentTaxRate) / 100
  const exampleTotal = exampleAmount + exampleTax

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="taxRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax Rate (%)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="10.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className="pr-10"
                    />
                    <Percent className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormDescription>
                  Enter the tax percentage (e.g., 10 for 10% tax)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isLoading}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <ButtonLoader />}
              <Save className="mr-2 h-4 w-4" />
              Save Tax Rate
            </Button>
          </div>
        </form>
      </Form>

      {/* Example Calculation */}
      <Card>
        <CardHeader>
          <CardTitle>Example Calculation</CardTitle>
          <CardDescription>
            See how the tax rate affects order totals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">Rs {exampleAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Tax ({currentTaxRate}%):
              </span>
              <span className="font-medium">Rs {exampleTax.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between">
                <span className="font-semibold">Total:</span>
                <span className="font-semibold">Rs {exampleTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Alert */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> The tax rate will be applied to all new orders. 
            Existing orders will not be affected.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}