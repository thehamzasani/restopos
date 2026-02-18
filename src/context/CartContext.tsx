"use client"
// src/context/CartContext.tsx

import React, { createContext, useContext, useReducer, useCallback, useEffect } from "react"
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
  applyDiscount: (amount: number) => void
  applyDiscountPercent: (percent: number) => void
  clearDiscount: () => void
  setDeliveryFee: (fee: number) => void
}

// ─── Internal state shape ────────────────────────────────────────────────────

interface InternalState {
  items: CartItem[]
  orderSetup: OrderSetup | null
  discount: number
  deliveryFee: number
  taxRate: number
}

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "id"> }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "UPDATE_NOTES"; payload: { id: string; notes: string } }
  | { type: "SET_ORDER_SETUP"; payload: OrderSetup }
  | { type: "SET_DISCOUNT"; payload: number }
  | { type: "SET_DELIVERY_FEE"; payload: number }
  | { type: "SET_TAX_RATE"; payload: number }
  | { type: "CLEAR" }

// ─── Totals helper ───────────────────────────────────────────────────────────

function round(n: number) {
  return Math.round(n * 100) / 100
}

function computeTotals(
  items: CartItem[],
  taxRate: number,
  discount: number,
  deliveryFee: number
): Pick<CartState, "subtotal" | "tax" | "discount" | "deliveryFee" | "total"> {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const safeDiscount = Math.min(discount, subtotal)
  const taxableAmount = subtotal - safeDiscount
  const tax = taxableAmount * (taxRate / 100)
  const total = taxableAmount + tax + deliveryFee

  return {
    subtotal: round(subtotal),
    discount: round(safeDiscount),
    tax: round(tax),
    deliveryFee: round(deliveryFee),
    total: round(total),
  }
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

const initialState: InternalState = {
  items: [],
  orderSetup: null,
  discount: 0,
  deliveryFee: 0,
  taxRate: 10,
}

function reducer(state: InternalState, action: Action): InternalState {
  switch (action.type) {
    case "ADD_ITEM": {
      // If same menuItemId with no special notes, just increment quantity
      const existing = state.items.find(
        (i) => i.menuItemId === action.payload.menuItemId && !action.payload.notes
      )
      const items = existing
        ? state.items.map((i) =>
            i.menuItemId === action.payload.menuItemId && !action.payload.notes
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i
          )
        : [
            ...state.items,
            {
              ...action.payload,
              id: `${Date.now()}-${Math.random()}`,
            },
          ]
      return { ...state, items }
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.payload),
      }

    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload
      if (quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.id !== id) }
      }
      return {
        ...state,
        items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
      }
    }

    case "UPDATE_NOTES":
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id ? { ...i, notes: action.payload.notes } : i
        ),
      }

    case "SET_ORDER_SETUP": {
      const setup = action.payload
      // Determine the correct deliveryFee from the setup
      let newDeliveryFee: number
      if (setup.orderType === "DELIVERY") {
        // Use the fee from the setup if provided, otherwise keep existing
        newDeliveryFee = setup.deliveryFee !== undefined ? setup.deliveryFee : state.deliveryFee
      } else {
        // Non-delivery orders have no delivery fee
        newDeliveryFee = 0
      }
      return {
        ...state,
        orderSetup: setup,
        deliveryFee: newDeliveryFee,
      }
    }

    case "SET_DISCOUNT":
      return { ...state, discount: Math.max(0, action.payload) }

    case "SET_DELIVERY_FEE":
      return { ...state, deliveryFee: Math.max(0, action.payload) }

    case "SET_TAX_RATE":
      return { ...state, taxRate: action.payload }

    case "CLEAR":
      return initialState

    default:
      return state
  }
}

// ─── Build the public CartState from internal state ───────────────────────────

function buildCartState(state: InternalState): CartState {
  const totals = computeTotals(
    state.items,
    state.taxRate,
    state.discount,
    state.deliveryFee
  )
  return {
    items: state.items,
    orderSetup: state.orderSetup,
    subtotal: totals.subtotal,
    discount: totals.discount,
    tax: totals.tax,
    deliveryFee: totals.deliveryFee,
    total: totals.total,
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextType | undefined>(undefined)

// ─── Provider ────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Fetch tax rate from settings API on mount
  useEffect(() => {
    const fetchTaxRate = async () => {
      try {
        const res = await fetch("/api/settings/tax")
        const result = await res.json()
        if (result.success && result.data?.taxRate !== undefined) {
          dispatch({ type: "SET_TAX_RATE", payload: Number(result.data.taxRate) })
        }
      } catch {
        // Fall back to default 10% — no action needed
      }
    }
    fetchTaxRate()
  }, [])

  const cart = buildCartState(state)

  const addItem = useCallback((item: Omit<CartItem, "id">) => {
    dispatch({ type: "ADD_ITEM", payload: item })
  }, [])

  const removeItem = useCallback((id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }, [])

  const updateItemNotes = useCallback((id: string, notes: string) => {
    dispatch({ type: "UPDATE_NOTES", payload: { id, notes } })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR" })
  }, [])

  const setOrderSetup = useCallback((setup: OrderSetup) => {
    dispatch({ type: "SET_ORDER_SETUP", payload: setup })
  }, [])

  const applyDiscount = useCallback((amount: number) => {
    dispatch({ type: "SET_DISCOUNT", payload: amount })
  }, [])

  const applyDiscountPercent = useCallback(
    (percent: number) => {
      // Use the current subtotal to calculate the fixed amount
      const subtotal = buildCartState(state).subtotal
      const amount = (subtotal * percent) / 100
      dispatch({ type: "SET_DISCOUNT", payload: amount })
    },
    [state]
  )

  const clearDiscount = useCallback(() => {
    dispatch({ type: "SET_DISCOUNT", payload: 0 })
  }, [])

  const setDeliveryFee = useCallback((fee: number) => {
    dispatch({ type: "SET_DELIVERY_FEE", payload: fee })
  }, [])

  return (
    <CartContext.Provider
      value={{
        cart,
        taxRate: state.taxRate,
        addItem,
        removeItem,
        updateQuantity,
        updateItemNotes,
        clearCart,
        setOrderSetup,
        applyDiscount,
        applyDiscountPercent,
        clearDiscount,
        setDeliveryFee,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}