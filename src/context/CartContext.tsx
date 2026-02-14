"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { CartItem, CartState, OrderSetup } from "@/types"

interface CartContextType {
  cart: CartState
  addItem: (item: Omit<CartItem, "id">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  updateItemNotes: (id: string, notes: string) => void
  clearCart: () => void
  setOrderSetup: (setup: OrderSetup) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const TAX_RATE = 0.1 // 10% tax (will be configurable from settings later)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartState>({
    items: [],
    orderSetup: null,
    subtotal: 0,
    tax: 0,
    total: 0,
  })

  // Calculate totals whenever items change
  const calculateTotals = useCallback((items: CartItem[]) => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
    const tax = subtotal * TAX_RATE
    const total = subtotal + tax

    return { subtotal, tax, total }
  }, [])

  const addItem = useCallback(
    (newItem: Omit<CartItem, "id">) => {
      setCart((prev) => {
        // Check if item already exists
        const existingItemIndex = prev.items.findIndex(
          (item) => item.menuItemId === newItem.menuItemId
        )

        let updatedItems: CartItem[]

        if (existingItemIndex >= 0) {
          // Update quantity of existing item
          updatedItems = prev.items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + newItem.quantity }
              : item
          )
        } else {
          // Add new item
          const cartItem: CartItem = {
            ...newItem,
            id: `${Date.now()}-${Math.random()}`,
          }
          updatedItems = [...prev.items, cartItem]
        }

        const totals = calculateTotals(updatedItems)

        return {
          ...prev,
          items: updatedItems,
          ...totals,
        }
      })
    },
    [calculateTotals]
  )

  const removeItem = useCallback(
    (id: string) => {
      setCart((prev) => {
        const updatedItems = prev.items.filter((item) => item.id !== id)
        const totals = calculateTotals(updatedItems)

        return {
          ...prev,
          items: updatedItems,
          ...totals,
        }
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

        return {
          ...prev,
          items: updatedItems,
          ...totals,
        }
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
    })
  }, [])

  const setOrderSetup = useCallback((setup: OrderSetup) => {
    setCart((prev) => ({
      ...prev,
      orderSetup: setup,
    }))
  }, [])

  return (
    <CartContext.Provider
      value={{
        cart,
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