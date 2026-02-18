"use client"
// src/app/(dashboard)/pos/page.tsx

import { useState } from "react"
import { OrderType, OrderSetup, Table } from "@/types"
import OrderTypeSelector from "@/components/pos/OrderTypeSelector"
import {TableSelector} from "@/components/pos/TableSelector"
import CustomerDetailsForm from "@/components/pos/CustomerDetailsForm"
import DeliveryDetailsForm from "@/components/pos/Deliverydetailsform"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UtensilsCrossed, Package, Bike } from "lucide-react"
import {MenuGrid} from "@/components/pos/MenuGrid"
import { Cart } from "@/components/pos/Cart"
import { CartProvider, useCart } from "@/context/CartContext"

type PosStep =
  | "ORDER_TYPE"
  | "TABLE_SELECTION"
  | "CUSTOMER_DETAILS"
  | "DELIVERY_DETAILS"
  | "MENU"

// ─── Small badge in the top bar showing current order context ─────────────────

function OrderTypeBadge({ setup }: { setup: OrderSetup }) {
  if (setup.orderType === "DINE_IN") {
    return (
      <Badge className="bg-blue-100 text-blue-700 border-blue-200 flex items-center gap-1">
        <UtensilsCrossed className="h-3 w-3" />
        {setup.tableName ?? "Dine-In"}
      </Badge>
    )
  }
  if (setup.orderType === "TAKEAWAY") {
    return (
      <Badge className="bg-orange-100 text-orange-700 border-orange-200 flex items-center gap-1">
        <Package className="h-3 w-3" />
        {setup.customerName ? `Takeaway · ${setup.customerName}` : "Takeaway"}
      </Badge>
    )
  }
  return (
    <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
      <Bike className="h-3 w-3" />
      {setup.customerName ? `Delivery · ${setup.customerName}` : "Delivery"}
    </Badge>
  )
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: PosStep }) {
  const steps = [
    { key: "ORDER_TYPE", label: "Order Type" },
    { key: "SETUP", label: "Setup" },
    { key: "MENU", label: "Menu & Cart" },
  ]

  const activeIndex =
    currentStep === "ORDER_TYPE" ? 0 : currentStep === "MENU" ? 2 : 1

  return (
    <div className="flex items-center gap-2 justify-center">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${
                i <= activeIndex
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-sm ${
                i === activeIndex ? "font-medium text-gray-900" : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-px w-8 ${i < activeIndex ? "bg-blue-600" : "bg-gray-200"}`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Inner content — must be inside CartProvider so it can call useCart ───────

function POSContent() {
  const [currentStep, setCurrentStep] = useState<PosStep>("ORDER_TYPE")
  const [orderSetup, setOrderSetupState] = useState<OrderSetup | null>(null)

  // Access cart context so we can sync orderSetup into it before the menu step
  const { setOrderSetup: syncToCart } = useCart()

  const goToMenu = (setup: OrderSetup) => {
    setOrderSetupState(setup)
    syncToCart(setup)   // ← keeps CheckoutModal (which reads cart.orderSetup) in sync
    setCurrentStep("MENU")
  }

  const handleOrderTypeSelect = (orderType: OrderType) => {
    const base: OrderSetup = { orderType }
    setOrderSetupState(base)
    if (orderType === "DINE_IN") setCurrentStep("TABLE_SELECTION")
    else if (orderType === "TAKEAWAY") setCurrentStep("CUSTOMER_DETAILS")
    else setCurrentStep("DELIVERY_DETAILS")
  }

  const handleTableSelect = (table: Table) => {
    const setup: OrderSetup = {
      orderType: "DINE_IN",
      tableId: table.id,
      tableName: `Table ${table.number}`,
    }
    goToMenu(setup)
  }

  const handleCustomerDetailsSubmit = (data: {
    customerName?: string
    customerPhone?: string
  }) => {
    const setup: OrderSetup = {
      orderType: "TAKEAWAY",
      customerName: data.customerName,
      customerPhone: data.customerPhone,
    }
    goToMenu(setup)
  }

  const handleDeliveryDetailsSubmit = (data: {
    customerName?: string
    customerPhone?: string
    deliveryAddress: string
    deliveryNote?: string
    deliveryFee: number
  }) => {
    const setup: OrderSetup = {
      orderType: "DELIVERY",
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      deliveryAddress: data.deliveryAddress,
      deliveryNote: data.deliveryNote,
      deliveryFee: data.deliveryFee,
    }
    goToMenu(setup)
  }

  const handleBack = () => {
    if (
      currentStep === "TABLE_SELECTION" ||
      currentStep === "CUSTOMER_DETAILS" ||
      currentStep === "DELIVERY_DETAILS"
    ) {
      setCurrentStep("ORDER_TYPE")
    } else if (currentStep === "MENU") {
      const orderType = orderSetup?.orderType
      if (orderType === "DINE_IN") setCurrentStep("TABLE_SELECTION")
      else if (orderType === "TAKEAWAY") setCurrentStep("CUSTOMER_DETAILS")
      else setCurrentStep("DELIVERY_DETAILS")
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-white">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Point of Sale</h1>
          <p className="text-xs text-gray-500">Create a new order</p>
        </div>
        <div className="flex items-center gap-4">
          {orderSetup && <OrderTypeBadge setup={orderSetup} />}
          <StepIndicator currentStep={currentStep} />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-auto">
        {currentStep === "ORDER_TYPE" && (
          <div className="p-8">
            <OrderTypeSelector onSelect={handleOrderTypeSelect} />
          </div>
        )}

        {currentStep === "TABLE_SELECTION" && (
          <div className="p-8">
            <TableSelector onSelect={handleTableSelect} onBack={handleBack} />
          </div>
        )}

        {currentStep === "CUSTOMER_DETAILS" && (
          <div className="p-8">
            <CustomerDetailsForm
              onSubmit={handleCustomerDetailsSubmit}
              onBack={handleBack}
              onSkip={() => handleCustomerDetailsSubmit({})}
            />
          </div>
        )}

        {currentStep === "DELIVERY_DETAILS" && (
          <div className="p-8">
            <DeliveryDetailsForm
              onSubmit={handleDeliveryDetailsSubmit}
              onBack={handleBack}
            />
          </div>
        )}

        {currentStep === "MENU" && orderSetup && (
          <div className="flex h-full">
            {/* Menu grid */}
            <div className="flex-1 overflow-auto p-4">
              <MenuGrid />
            </div>
            {/* Cart sidebar */}
            <div className="w-96 border-l bg-white flex flex-col overflow-hidden">
              <Cart
                orderSetup={orderSetup}
                onBack={handleBack}
                onOrderComplete={() => {
                  setCurrentStep("ORDER_TYPE")
                  setOrderSetupState(null)
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Page — wraps POSContent in CartProvider ──────────────────────────────────

export default function POSPage() {
  return (
    <CartProvider>
      <div className="h-full flex flex-col">
        <POSContent />
      </div>
    </CartProvider>
  )
}