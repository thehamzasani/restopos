// src/types/index.ts

// ============================================
// ENUMS
// ============================================

export type OrderType = "DINE_IN" | "TAKEAWAY" | "DELIVERY"
export type OrderStatus = "PENDING" | "PREPARING" | "READY" | "OUT_FOR_DELIVERY" | "COMPLETED" | "CANCELLED"
export type PaymentMethod = "CASH" | "CARD" | "UPI" | "OTHER"
export type PaymentStatus = "PENDING" | "PAID" | "REFUNDED"
export type UserRole = "ADMIN" | "MANAGER" | "CASHIER" | "KITCHEN"
export type TableStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED"
export type StockType = "IN" | "OUT" | "ADJUSTMENT"

// ============================================
// TABLE TYPES
// ============================================

export interface Table {
  id: string
  number: number
  capacity: number
  status: TableStatus
  _count?: {
    orders: number
  }
}

// ============================================
// ORDER SETUP TYPES (for POS flow)
// ============================================

export interface OrderSetup {
  orderType: OrderType
  // Dine-in
  tableId?: string
  tableName?: string
  // Takeaway & Delivery
  customerName?: string
  customerPhone?: string
  // Delivery only
  deliveryAddress?: string
  deliveryNote?: string
  deliveryFee?: number
}

// ============================================
// CART TYPES
// ============================================

export interface CartItem {
  id: string
  menuItemId: string
  name: string
  price: number
  quantity: number
  notes?: string
  image?: string | null
}

export interface CartState {
  items: CartItem[]
  orderSetup: OrderSetup | null
  subtotal: number
  tax: number
  discount: number
  deliveryFee: number
  total: number
}

// ============================================
// MENU ITEM TYPES
// ============================================

export interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  image: string | null
  categoryId: string
  isAvailable: boolean
  preparationTime: number | null
  createdAt: Date
  updatedAt: Date
  category: {
    id: string
    name: string
  }
  _count?: {
    ingredients?: number
  }
}

// ============================================
// CATEGORY TYPES
// ============================================

export interface Category {
  id: string
  name: string
  description: string | null
  image: string | null
  sortOrder: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count?: {
    menuItems: number
  }
}

// ============================================
// ORDER TYPES
// ============================================

export interface Order {
  id: string
  orderNumber: string
  orderType: OrderType
  // Dine-in
  tableId: string | null
  // Takeaway & Delivery
  customerName: string | null
  customerPhone: string | null
  // Delivery
  deliveryAddress: string | null
  deliveryNote: string | null
  deliveryFee: number
  // Common
  userId: string
  subtotal: number
  tax: number
  discount: number
  total: number
  status: OrderStatus
  paymentMethod: PaymentMethod | null
  paymentStatus: PaymentStatus
  notes: string | null
  createdAt: Date
  updatedAt: Date
  table?: {
    id?: string
    number: number
  } | null
  user?: {
    id: string
    name: string
  }
  orderItems?: OrderItem[]
}

// ============================================
// ORDER ITEM TYPES
// ============================================

export interface OrderItem {
  id: string
  orderId: string
  menuItemId: string
  quantity: number
  price: number
  subtotal: number
  notes: string | null
  createdAt: Date
  menuItem?: MenuItem
}

// ============================================
// USER TYPES
// ============================================

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// ============================================
// INVENTORY TYPES
// ============================================

export interface Inventory {
  id: string
  name: string
  description: string | null
  quantity: number
  unit: string
  lowStockThreshold: number
  costPerUnit: number | null
  supplierId: string | null
  lastRestocked: Date | null
  createdAt: Date
  updatedAt: Date
  supplier?: Supplier
}

export interface Supplier {
  id: string
  name: string
  contact: string | null
  email: string | null
  phone: string | null
  address: string | null
}

export interface StockHistory {
  id: string
  inventoryId: string
  quantity: number
  type: StockType
  reason: string | null
  createdAt: Date
}

// ============================================
// SETTINGS TYPES
// ============================================

export interface Settings {
  id: string
  restaurantName: string
  address: string | null
  phone: string | null
  email: string | null
  taxRate: number
  currency: string
  receiptHeader: string | null
  receiptFooter: string | null
  deliveryFee: number
  minOrderAmount: number
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ============================================
// REPORT TYPES
// ============================================

export interface SalesReport {
  totalRevenue: number
  totalOrders: number
  dineInRevenue: number
  takeawayRevenue: number
  deliveryRevenue: number
  dineInOrders: number
  takeawayOrders: number
  deliveryOrders: number
  averageOrderValue: number
}