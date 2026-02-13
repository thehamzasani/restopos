import { 
  OrderType, 
  OrderStatus, 
  PaymentMethod, 
  PaymentStatus, 
  TableStatus,
  UserRole 
} from "@prisma/client"

// Table Types
export interface Table {
  id: string
  number: number
  capacity: number
  status: TableStatus
  _count?: {
    orders: number
  }
}

// Order Setup Types (for POS flow)
export interface OrderSetup {
  orderType: OrderType
  tableId?: string
  tableName?: string
  customerName?: string
  customerPhone?: string
}

// Cart Item Types
export interface CartItem {
  id: string
  menuItemId: string
  name: string
  price: number
  quantity: number
  notes?: string
  image?: string | null
}

// Cart State Types
export interface CartState {
  items: CartItem[]
  orderSetup: OrderSetup | null
  subtotal: number
  tax: number
  total: number
}

// Menu Item Types (from Day 4)
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
  category?: {
    id: string
    name: string
  }
}

// Category Types (from Day 3)
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

// Order Types
export interface Order {
  id: string
  orderNumber: string
  orderType: OrderType
  tableId: string | null
  customerName: string | null
  customerPhone: string | null
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
    id: string
    number: number
  }
  user?: {
    id: string
    name: string
  }
  orderItems?: OrderItem[]
}

// Order Item Types
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

// User Types
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  details?: any
}