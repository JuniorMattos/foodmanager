export interface Tenant {
  id: string
  name: string
  slug: string
  domain?: string
  logo?: string
  settings: TenantSettings
  status: TenantStatus
  subscriptionId?: string
  planId: string
  createdAt: Date
  updatedAt: Date
}

export interface TenantSettings {
  timezone: string
  currency: string
  language: string
  theme: {
    primaryColor: string
    secondaryColor: string
    logo?: string
  }
  features: {
    onlineOrders: boolean
    delivery: boolean
    pickup: boolean
    reservations: boolean
    loyalty: boolean
    analytics: boolean
  }
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
  }
  integrations: {
    stripe: boolean
    pos: boolean
    inventory: boolean
    accounting: boolean
  }
}

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  TRIAL = 'TRIAL',
  CANCELLED = 'CANCELLED',
}

export interface TenantUsage {
  tenantId: string
  period: string // YYYY-MM
  metrics: {
    users: number
    products: number
    orders: number
    apiCalls: number
    storage: number // bytes
  }
  limits: {
    users: number
    products: number
    orders: number
    apiCalls: number
    storage: number // bytes
  }
  exceeded: string[] // metric names that exceeded limits
}

export interface TenantMetrics {
  totalTenants: number
  activeTenants: number
  trialTenants: number
  suspendedTenants: number
  totalRevenue: number
  mrr: number // Monthly Recurring Revenue
  churnRate: number
  averagePlan: string
  growthRate: number
}
