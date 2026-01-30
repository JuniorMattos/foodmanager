export interface Tenant {
  id: string
  name: string
  slug: string
  logo_url?: string
  address?: string
  phone?: string
  email?: string
  delivery_fee?: number
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  name?: string
  role: UserRole
  tenant_id: string
  created_at: string
  updated_at: string
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  VENDOR = 'vendor'
}

export interface Category {
  id: string
  tenant_id: string
  name: string
  description?: string
  order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  tenant_id: string
  category_id: string
  name: string
  description?: string
  price: number
  image_url?: string
  is_available: boolean
  order: number
  created_at: string
  updated_at: string
}

export interface ProductCustomization {
  id: string
  product_id: string
  name: string
  type: 'addition' | 'removal'
  price: number
  is_available: boolean
}

export interface InventoryItem {
  id: string
  tenant_id: string
  name: string
  description?: string
  quantity: number
  min_quantity: number
  unit: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  tenant_id: string
  customer_name?: string
  customer_phone?: string
  customer_address?: string
  delivery_type: 'pickup' | 'delivery'
  status: OrderStatus
  total_amount: number
  delivery_fee?: number
  notes?: string
  created_at: string
  updated_at: string
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  customizations?: ProductCustomization[]
}

export interface Payment {
  id: string
  order_id: string
  method: PaymentMethod
  amount: number
  status: PaymentStatus
  pix_qr_code?: string
  created_at: string
  updated_at: string
}

export enum PaymentMethod {
  PIX = 'pix',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  CASH = 'cash',
  MEAL_VOUCHER = 'meal_voucher'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export interface FinancialRecord {
  id: string
  tenant_id: string
  type: 'income' | 'expense'
  description: string
  amount: number
  category: string
  date: string
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  tenant_id: string
  order_id: string
  type: 'nfse' | 'sat' | 'nfc'
  number: string
  status: 'pending' | 'issued' | 'cancelled'
  xml_url?: string
  pdf_url?: string
  created_at: string
  updated_at: string
}
