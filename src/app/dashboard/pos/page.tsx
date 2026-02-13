"use client"

import { useState } from "react"
import { OrderType } from "@prisma/client"
import OrderTypeSelector from "@/components/pos/OrderTypeSelector"
import TableSelector from "@/components/pos/TableSelector"
import CustomerDetailsForm from "@/components/pos/CustomerDetailsForm"
import { Table, OrderSetup } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UtensilsCrossed, Package } from "lucide-react"

type PosStep = "ORDER_TYPE" | "TABLE_SELECTION" | "CUSTOMER_DETAILS" | "MENU"

export default function POSPage() {
  const [currentStep, setCurrentStep] = useState<PosStep>("ORDER_TYPE")
  const [orderSetup, setOrderSetup] = useState<OrderSetup | null>(null)

  // Step 1: Order Type Selection
  const handleOrderTypeSelect = (orderType: OrderType) => {
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
  const handleTableSelect = (table: Table) => {
    setOrderSetup((prev) => ({
      ...prev!,
      tableId: table.id,
      tableName: `Table ${table.number}`,
    }))
    setCurrentStep("MENU")
  }

  // Step 2B: Customer Details (Takeaway)
  const handleCustomerDetailsSubmit = (data: {
    customerName?: string
    customerPhone?: string
  }) => {
    setOrderSetup((prev) => ({
      ...prev!,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
    }))
    setCurrentStep("MENU")
  }

  const handleCustomerDetailsSkip = () => {
    setCurrentStep("MENU")
  }

  // Back handlers
  const handleBackFromTable = () => {
    setOrderSetup(null)
    setCurrentStep("ORDER_TYPE")
  }

  const handleBackFromCustomer = () => {
    setOrderSetup(null)
    setCurrentStep("ORDER_TYPE")
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Point of Sale</h1>
        <p className="text-gray-500">Create new orders for dine-in or takeaway</p>
      </div>

      {/* Step Indicator */}
      {orderSetup && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
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
          </CardContent>
        </Card>
      )}

      {/* Main Content - Step-based Rendering */}
      <div className="bg-white rounded-lg shadow p-6">
        {currentStep === "ORDER_TYPE" && (
          <OrderTypeSelector onSelect={handleOrderTypeSelect} />
        )}

        {currentStep === "TABLE_SELECTION" && (
          <TableSelector
            onSelect={handleTableSelect}
            onBack={handleBackFromTable}
          />
        )}

        {currentStep === "CUSTOMER_DETAILS" && (
          <CustomerDetailsForm
            onSubmit={handleCustomerDetailsSubmit}
            onBack={handleBackFromCustomer}
            onSkip={handleCustomerDetailsSkip}
          />
        )}

        {currentStep === "MENU" && (
          <div className="text-center py-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Menu Selection
            </h3>
            <p className="text-gray-600 mb-6">
              This is where the menu grid and cart will be displayed
            </p>
            <div className="bg-gray-100 rounded-lg p-8">
              <p className="text-sm text-gray-500">
                Coming in Day 6: Menu Grid + Shopping Cart
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}