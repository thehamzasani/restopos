// src/components/settings/RestaurantSettings.tsx

"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { restaurantSettingsSchema, RestaurantSettingsInput } from "@/lib/validations/settings"
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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { ButtonLoader } from "@/components/shared/LoadingSpinner"
import { Save } from "lucide-react"

// interface RestaurantSettingsProps {
//   initialData: RestaurantSettingsInput & { id: string }
// }
interface RestaurantSettingsProps {
  initialData: RestaurantSettingsInput & {
    id: string
    taxRate?: number
    deliveryFee?: number
    minOrderAmount?: number
  }
}

export function RestaurantSettings({ initialData }: RestaurantSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<RestaurantSettingsInput>({
    resolver: zodResolver(restaurantSettingsSchema),
    defaultValues: {
      restaurantName: initialData.restaurantName,
      address: initialData.address || "",
      phone: initialData.phone || "",
      email: initialData.email || "",
      currency: initialData.currency,
      receiptHeader: initialData.receiptHeader || "",
      receiptFooter: initialData.receiptFooter || "",
    },
  })

  async function onSubmit(data: RestaurantSettingsInput) {
    try {
      setIsLoading(true)

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to update settings")
      }

      toast.success("Settings updated successfully")
    } catch (error: any) {
      console.error("Error updating settings:", error)
      toast.error(error.message || "Failed to update settings")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="restaurantName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Restaurant Name</FormLabel>
              <FormControl>
                <Input placeholder="My Restaurant" {...field} />
              </FormControl>
              <FormDescription>
                This will appear on receipts and reports
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="123 Main St, City, State, ZIP"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                Full restaurant address for receipts
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="+1 (555) 123-4567"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="restaurant@example.com"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <FormControl>
                <Input placeholder="USD" {...field} maxLength={10} />
              </FormControl>
              <FormDescription>
                Currency code (e.g., USD, EUR, GBP, PKR)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="receiptHeader"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Receipt Header</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Welcome to our restaurant!"
                  {...field}
                  value={field.value || ""}
                  rows={3}
                />
              </FormControl>
              <FormDescription>
                Custom message at the top of receipts (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="receiptFooter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Receipt Footer</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Thank you for dining with us!"
                  {...field}
                  value={field.value || ""}
                  rows={3}
                />
              </FormControl>
              <FormDescription>
                Custom message at the bottom of receipts (optional)
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
            Save Settings
          </Button>
        </div>
      </form>
    </Form>
  )
}