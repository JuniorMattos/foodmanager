export interface BillingPlan {
  id: string
  name: string
  description: string
  priceId: string
  amount: number
  currency: string
  interval: BillingInterval
  features: string[]
  limits: BillingLimits
  stripePriceId?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export enum BillingInterval {
  MONTH = 'month',
  YEAR = 'year',
}

export interface BillingLimits {
  users: number
  products: number
  orders: number
  apiCalls: number
  storage: number // bytes
  features: string[]
}

export interface Customer {
  id: string
  email: string
  name: string
  tenantId: string
  stripeCustomerId?: string
  subscriptionId?: string
  planId: string
  status: CustomerStatus
  billingAddress?: BillingAddress
  paymentMethods: PaymentMethod[]
  createdAt: Date
  updatedAt: Date
}

export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CANCELLED = 'cancelled',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing',
}

export interface BillingAddress {
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface PaymentMethod {
  id: string
  customerId: string
  stripePaymentMethodId: string
  type: PaymentMethodType
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
  createdAt: Date
}

export enum PaymentMethodType {
  CARD = 'card',
  BANK_ACCOUNT = 'bank_account',
  SEPA_DEBIT = 'sepa_debit',
  BACS_DEBIT = 'bacs_debit',
}

export interface Subscription {
  id: string
  customerId: string
  tenantId: string
  planId: string
  stripeSubscriptionId: string
  status: SubscriptionStatus
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  trialEnd?: Date
  canceledAt?: Date
  endedAt?: Date
  quantity: number
  amount: number
  currency: string
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing',
  UNPAID = 'unpaid',
}

export interface Invoice {
  id: string
  customerId: string
  subscriptionId?: string
  stripeInvoiceId: string
  status: InvoiceStatus
  amount: number
  currency: string
  dueDate?: Date
  paidAt?: Date
  finalizedAt?: Date
  hostedInvoiceUrl?: string
  invoicePdf?: string
  lines: InvoiceLine[]
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  PAID = 'paid',
  UNCERTAIN_COLLECTIBILITY = 'uncollectible',
  VOID = 'void',
}

export interface InvoiceLine {
  id: string
  invoiceId: string
  description: string
  amount: number
  quantity: number
  unitAmount: number
  period: {
    start: Date
    end: Date
  }
  metadata?: Record<string, any>
}

export interface Usage {
  id: string
  tenantId: string
  subscriptionId?: string
  metric: string
  quantity: number
  period: string // YYYY-MM
  recordedAt: Date
  metadata?: Record<string, any>
  createdAt: Date
}

export interface BillingMetrics {
  totalRevenue: number
  mrr: number // Monthly Recurring Revenue
  arr: number // Annual Recurring Revenue
  churnRate: number
  ltv: number // Lifetime Value
  cac: number // Customer Acquisition Cost
  arpu: number // Average Revenue Per User
  activeSubscriptions: number
  canceledSubscriptions: number
  trialSubscriptions: number
  revenueByPlan: Record<string, number>
  subscriptionsByStatus: Record<SubscriptionStatus, number>
  growthRate: number
}
