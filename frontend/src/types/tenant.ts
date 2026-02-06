export interface Tenant {
  id: string
  name: string
  slug: string
  logo_url?: string
  address?: string
  phone?: string
  email?: string
  delivery_fee?: number
  plan?: 'basic' | 'premium' | 'enterprise'
  is_active: boolean
  created_at: string
  updated_at: string
  
  // Configurações de personalização
  theme?: TenantTheme
  branding?: TenantBranding
  settings?: TenantSettings
}

export interface TenantTheme {
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  text_color: string
  button_style: 'rounded' | 'square' | 'pill'
  font_family: string
}

export interface TenantBranding {
  logo_url: string
  favicon_url?: string
  hero_image?: string
  brand_name: string
  tagline?: string
  social_links?: {
    facebook?: string
    instagram?: string
    twitter?: string
    whatsapp?: string
  }
}

export interface TenantSettings {
  currency: string
  currency_symbol: string
  timezone: string
  language: string
  delivery_enabled: boolean
  pickup_enabled: boolean
  min_order_amount: number
  delivery_radius: number
  working_hours: {
    monday: { open: string; close: string; enabled: boolean }
    tuesday: { open: string; close: string; enabled: boolean }
    wednesday: { open: string; close: string; enabled: boolean }
    thursday: { open: string; close: string; enabled: boolean }
    friday: { open: string; close: string; enabled: boolean }
    saturday: { open: string; close: string; enabled: boolean }
    sunday: { open: string; close: string; enabled: boolean }
  }
  payment_methods: string[]
  tax_rate?: number
}
