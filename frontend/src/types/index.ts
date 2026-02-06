export interface Tenant {
  id: string
  name: string
  slug: string
  logo_url?: string
  address?: string
  phone?: string
  email?: string
  delivery_fee?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  name?: string
  role: UserRole
  tenant_id: string
  is_active: boolean
  created_at: string
  updated_at: string
  tenant?: Tenant
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  VENDOR = 'VENDOR',
  CUSTOMER = 'CUSTOMER'
}

export interface Category {
  id: string
  tenant_id: string
  name: string
  description?: string
  order_index: number
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
  order_index: number
  preparation_time?: number
  created_at: string
  updated_at: string
  category?: Category
  customizations?: ProductCustomization[]
}

export interface ProductCustomization {
  id: string
  product_id: string
  name: string
  type: CustomizationType
  price: number
  is_available: boolean
  created_at: string
  updated_at: string
}

export enum CustomizationType {
  ADDITION = 'ADDITION',
  REMOVAL = 'REMOVAL'
}

export interface CartItem {
  productId: string
  product: Product
  quantity: number
  unitPrice: number
  totalPrice: number
  customizations?: ProductCustomization[]
}

export interface CustomerInfo {
  name: string
  phone: string
  address?: string
}

export interface ProductQuery {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
  isAvailable?: boolean
  sortBy?: 'name' | 'price' | 'orderIndex' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface LoginRequest {
  email: string
  password: string
  tenantSlug?: string
}
