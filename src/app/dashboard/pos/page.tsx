"use client"

import { useState } from "react"
import OrderTypeSelector from "@/components/pos/OrderTypeSelector"
import { TableSelector } from "@/components/pos/TableSelector"
import CustomerDetailsForm from "@/components/pos/CustomerDetailsForm"
import { MenuGrid } from "@/components/pos/MenuGrid"
import { Cart } from "@/components/pos/Cart"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UtensilsCrossed, Package, ArrowLeft } from "lucide-react"
import { useCart } from "@/hooks/useCart"
import { Table } from "@/types"

type PosStep = "ORDER_TYPE" | "TABLE_SELECTION" | "CUSTOMER_DETAILS" | "MENU"

export default function POSPage() {
  const [currentStep, setCurrentStep] = useState<PosStep>("ORDER_TYPE")
  const { cart, setOrderSetup } = useCart()
  const orderSetup = cart.orderSetup

  // Step 1: Order Type Selection
  const handleOrderTypeSelect = (orderType: "DINE_IN" | "TAKEAWAY") => {
    setOrderSetup({
      orderType,
    })

    if (orderType === "DINE_IN") {
      setCurrentStep("TABLE_SELECTION")
    } else {
      setCurrentStep("CUSTOMER_DETAILS")
    }
  }

  // Step 2A: Table Selection (Dine-In)
  // ✅ FIXED: Now accepts Table object instead of two separate parameters
  const handleTableSelect = (table: Table) => {
    setOrderSetup({
      ...orderSetup!,
      tableId: table.id,
      tableName: `Table ${table.number}`,
    })
    setCurrentStep("MENU")
  }

  // Step 2B: Customer Details (Takeaway)
  const handleCustomerDetailsSubmit = (data: {
    customerName?: string
    customerPhone?: string
  }) => {
    setOrderSetup({
      ...orderSetup!,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
    })
    setCurrentStep("MENU")
  }

  const handleCustomerDetailsSkip = () => {
    setCurrentStep("MENU")
  }

  // Back handlers
  const handleBackFromTable = () => {
    setOrderSetup({
      orderType: orderSetup!.orderType,
    })
    setCurrentStep("ORDER_TYPE")
  }

  const handleBackFromCustomer = () => {
    setOrderSetup({
      orderType: orderSetup!.orderType,
    })
    setCurrentStep("ORDER_TYPE")
  }

  const handleBackFromMenu = () => {
    if (orderSetup?.orderType === "DINE_IN") {
      setCurrentStep("TABLE_SELECTION")
    } else {
      setCurrentStep("CUSTOMER_DETAILS")
    }
  }

  const handleStartNewOrder = () => {
    setOrderSetup({
      orderType: "DINE_IN",
    })
    setCurrentStep("ORDER_TYPE")
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Point of Sale</h1>
        <p className="text-gray-500">Create new orders for dine-in or takeaway</p>
      </div>

      {/* Order Setup Indicator */}
      {orderSetup && currentStep !== "ORDER_TYPE" && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {orderSetup.orderType === "DINE_IN" ? (
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="h-5 w-5 text-blue-600" />
                    <Badge className="bg-blue-600">Dine-In</Badge>
                    {orderSetup.tableName && (
                      <span className="text-sm text-gray-700">
                        • {orderSetup.tableName}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-orange-600" />
                    <Badge className="bg-orange-600">Takeaway</Badge>
                    {orderSetup.customerName && (
                      <span className="text-sm text-gray-700">
                        • {orderSetup.customerName}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {currentStep === "MENU" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartNewOrder}
                >
                  Start New Order
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {currentStep === "ORDER_TYPE" && (
        <OrderTypeSelector onSelect={handleOrderTypeSelect} />
      )}

      {currentStep === "TABLE_SELECTION" && (
        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={handleBackFromTable}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Order Type
          </Button>
          <TableSelector
            onSelect={handleTableSelect}
            onBack={handleBackFromTable}
          />
        </div>
      )}

      {currentStep === "CUSTOMER_DETAILS" && (
        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={handleBackFromCustomer}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Order Type
          </Button>
          <CustomerDetailsForm
            onSubmit={handleCustomerDetailsSubmit}
            onBack={handleBackFromCustomer}
            onSkip={handleCustomerDetailsSkip}
          />
        </div>
      )}

      {currentStep === "MENU" && (
        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={handleBackFromMenu}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {/* Split Layout: Menu (70%) + Cart (30%) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Menu Grid - 2 columns on large screens */}
            <div className="lg:col-span-2">
              <MenuGrid />
            </div>

            {/* Cart - 1 column on large screens, sticky on desktop */}
            <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-8rem)]">
              <Cart />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}