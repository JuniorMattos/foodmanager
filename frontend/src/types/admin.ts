import { Tenant } from './tenant'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'admin'
  tenant_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TenantStats {
  total_tenants: number
  active_tenants: number
  new_tenants_this_month: number
  total_users: number
  total_orders: number
  total_revenue: number
  monthly_growth: number
}

export interface TenantWithStats extends Tenant {
  stats: {
    user_count: number
    order_count: number
    revenue: number
    last_active: string
    storage_used: number
    api_calls: number
  }
}

export interface TenantFilters {
  search: string
  status: 'all' | 'active' | 'inactive'
  plan: 'all' | 'basic' | 'premium' | 'enterprise'
  created_at: string
  sort_by: 'name' | 'created_at' | 'user_count' | 'revenue'
  sort_order: 'asc' | 'desc'
}

export interface CreateTenantData {
  name: string
  slug: string
  email: string
  phone?: string
  plan: 'basic' | 'premium' | 'enterprise'
  admin_user: {
    name: string
    email: string
    password: string
  }
  branding: {
    brand_name: string
    logo_url: string
    tagline?: string
  }
  theme: {
    primary_color: string
    secondary_color: string
    accent_color: string
    background_color: string
    text_color: string
    button_style: 'rounded' | 'square' | 'pill'
    font_family: string
  }
  settings: {
    currency: string
    currency_symbol: string
    language: string
    timezone: string
    delivery_enabled: boolean
    pickup_enabled: boolean
    min_order_amount: number
    delivery_radius: number
    payment_methods: string[]
    working_hours: {
      monday: { open: string; close: string; enabled: boolean }
      tuesday: { open: string; close: string; enabled: boolean }
      wednesday: { open: string; close: string; enabled: boolean }
      thursday: { open: string; close: string; enabled: boolean }
      friday: { open: string; close: string; enabled: boolean }
      saturday: { open: string; close: string; enabled: boolean }
      sunday: { open: string; close: string; enabled: boolean }
    }
  }
}
