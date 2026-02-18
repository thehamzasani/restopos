"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { CartItem, CartState, OrderSetup } from "@/types"

interface CartContextType {
  cart: CartState
  taxRate: number
  addItem: (item: Omit<CartItem, "id">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  updateItemNotes: (id: string, notes: string) => void
  clearCart: () => void
  setOrderSetup: (setup: OrderSetup) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  // taxRate stored as percentage e.g. 10 = 10%
  const [taxRate, setTaxRate] = useState<number>(10)

  const [cart, setCart] = useState<CartState>({
    items: [],
    orderSetup: null,
    subtotal: 0,
    tax: 0,
    total: 0,
    discount: 0,      // ✅ add
  deliveryFee: 0,
  })

  // Fetch tax rate from settings on mount
  useEffect(() => {
    const fetchTaxRate = async () => {
      try {
        const res = await fetch("/api/settings/tax")
        const result = await res.json()
        if (result.success && result.data?.taxRate !== undefined) {
          setTaxRate(Number(result.data.taxRate))
        }
      } catch (err) {
        console.error("Failed to fetch tax rate, using default 10%", err)
      }
    }
    fetchTaxRate()
  }, [])

  // calculateTotals uses taxRate as percentage (10 = 10%)
  const calculateTotals = useCallback(
    (items: CartItem[]) => {
      const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )
      const tax = (subtotal * taxRate) / 100
      const total = subtotal + tax
      return { subtotal, tax, total }
    },
    [taxRate]
  )

  // Recalculate totals when taxRate changes
  useEffect(() => {
    setCart((prev) => {
      if (prev.items.length === 0) return prev
      const totals = calculateTotals(prev.items)
      return { ...prev, ...totals }
    })
  }, [taxRate, calculateTotals])

  const addItem = useCallback(
    (newItem: Omit<CartItem, "id">) => {
      setCart((prev) => {
        const existingItemIndex = prev.items.findIndex(
          (item) => item.menuItemId === newItem.menuItemId
        )

        let updatedItems: CartItem[]

        if (existingItemIndex >= 0) {
          updatedItems = prev.items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + newItem.quantity }
              : item
          )
        } else {
          const cartItem: CartItem = {
            ...newItem,
            id: `${Date.now()}-${Math.random()}`,
          }
          updatedItems = [...prev.items, cartItem]
        }

        const totals = calculateTotals(updatedItems)
        return { ...prev, items: updatedItems, ...totals }
      })
    },
    [calculateTotals]
  )

  const removeItem = useCallback(
    (id: string) => {
      setCart((prev) => {
        const updatedItems = prev.items.filter((item) => item.id !== id)
        const totals = calculateTotals(updatedItems)
        return { ...prev, items: updatedItems, ...totals }
      })
    },
    [calculateTotals]
  )

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity < 1) return
      setCart((prev) => {
        const updatedItems = prev.items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        )
        const totals = calculateTotals(updatedItems)
        return { ...prev, items: updatedItems, ...totals }
      })
    },
    [calculateTotals]
  )

  const updateItemNotes = useCallback((id: string, notes: string) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, notes } : item
      ),
    }))
  }, [])

  const clearCart = useCallback(() => {
    setCart({
      items: [],
      orderSetup: null,
      subtotal: 0,
      tax: 0,
      total: 0,
      discount: 0,      // ✅ add
  deliveryFee: 0,
    })
  }, [])

  const setOrderSetup = useCallback((setup: OrderSetup) => {
    setCart((prev) => ({ ...prev, orderSetup: setup }))
  }, [])

  return (
    <CartContext.Provider
      value={{
        cart,
        taxRate,
        addItem,
        removeItem,
        updateQuantity,
        updateItemNotes,
        clearCart,
        setOrderSetup,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}