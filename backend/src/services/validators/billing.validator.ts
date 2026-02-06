import { z } from 'zod'
import { 
  commonValidations, 
  paginationSchema, 
  validateRequest,
  sanitizeString,
  sanitizeEmail,
  metadataSchema,
  nonEmptyArray,
  addressSchema
} from './base.validator'

/**
 * Billing validation schemas
 */

// Billing plan validation
export const billingPlanSchema = z.object({
  id: z.string().min(1, 'Plan ID is required'),
  name: commonValidations.name.transform(sanitizeString),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priceId: z.string().min(1, 'Price ID is required'),
  amount: z.number().min(100, 'Amount must be at least 100 cents'),
  currency: commonValidations.currency,
  interval: z.enum(['month', 'year'], { 
    errorMap: () => ({ message: 'Invalid interval' }) 
  }),
  features: nonEmptyArray(z.string()),
  limits: z.object({
    users: z.number().min(-1, 'Users limit must be -1 (unlimited) or positive'),
    products: z.number().min(-1, 'Products limit must be -1 (unlimited) or positive'),
    orders: z.number().min(-1, 'Orders limit must be -1 (unlimited) or positive'),
    apiCalls: z.number().min(-1, 'API calls limit must be -1 (unlimited) or positive'),
    storage: z.number().min(-1, 'Storage limit must be -1 (unlimited) or positive'),
  }),
  stripePriceId: z.string().optional(),
  isActive: commonValidations.boolean,
  trialDays: z.number().min(0, 'Trial days must be non-negative').default(0),
})

// Customer validation
export const customerSchema = z.object({
  email: commonValidations.email.transform(sanitizeEmail),
  name: commonValidations.name.transform(sanitizeString),
  tenantId: commonValidations.id,
  billingAddress: addressSchema.optional(),
  paymentMethodId: z.string().optional(),
  metadata: metadataSchema,
})

// Create customer validation
export const createCustomerSchema = z.object({
  email: commonValidations.email.transform(sanitizeEmail),
  name: commonValidations.name.transform(sanitizeString),
  tenantId: commonValidations.id,
  billingAddress: addressSchema.optional(),
  metadata: metadataSchema.optional(),
})

// Update customer validation
export const updateCustomerSchema = z.object({
  email: commonValidations.email.transform(sanitizeEmail).optional(),
  name: commonValidations.name.transform(sanitizeString).optional(),
  billingAddress: addressSchema.optional(),
  metadata: metadataSchema.optional(),
}).partial()

// Payment method validation
export const paymentMethodSchema = z.object({
  type: z.enum(['card', 'bank_account', 'sepa_debit', 'bacs_debit'], { 
    errorMap: () => ({ message: 'Invalid payment method type' }) 
  }),
  card: z.object({
    number: z.string().regex(/^\d{16}$/, 'Invalid card number'),
    expMonth: z.number().min(1).max(12),
    expYear: z.number().min(new Date().getFullYear()),
    cvc: z.string().regex(/^\d{3,4}$/, 'Invalid CVC'),
  }).optional(),
  bankAccount: z.object({
    accountNumber: z.string().min(1, 'Account number is required'),
    routingNumber: z.string().min(1, 'Routing number is required'),
    accountHolderName: commonValidations.name,
  }).optional(),
  isDefault: commonValidations.boolean,
  billingAddress: addressSchema,
})

// Create payment method validation
export const createPaymentMethodSchema = z.object({
  customerId: commonValidations.id,
  paymentMethod: paymentMethodSchema,
})

// Checkout session validation
export const createCheckoutSessionSchema = z.object({
  customerId: commonValidations.id,
  planId: z.enum(['basic', 'standard', 'premium', 'enterprise'], { 
    errorMap: () => ({ message: 'Invalid plan ID' }) 
  }),
  tenantId: commonValidations.id,
  successUrl: commonValidations.url,
  cancelUrl: commonValidations.url,
  trialPeriodDays: z.number().min(0).optional(),
  metadata: metadataSchema.optional(),
})

// Customer portal session validation
export const createPortalSessionSchema = z.object({
  customerId: commonValidations.id,
  returnUrl: commonValidations.url,
  configuration: z.string().optional(),
})

// Subscription validation
export const subscriptionSchema = z.object({
  customerId: commonValidations.id,
  tenantId: commonValidations.id,
  planId: z.enum(['basic', 'standard', 'premium', 'enterprise']),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  trialPeriodDays: z.number().min(0).optional(),
  couponId: z.string().optional(),
  metadata: metadataSchema.optional(),
})

// Update subscription validation
export const updateSubscriptionSchema = z.object({
  subscriptionId: commonValidations.id,
  newPlanId: z.enum(['basic', 'standard', 'premium', 'enterprise'], { 
    errorMap: () => ({ message: 'Invalid plan ID' }) 
  }),
  quantity: z.number().min(1).optional(),
  prorationBehavior: z.enum(['create_prorations', 'none', 'always_invoice']).default('create_prorations'),
  metadata: metadataSchema.optional(),
})

// Cancel subscription validation
export const cancelSubscriptionSchema = z.object({
  subscriptionId: commonValidations.id,
  immediate: commonValidations.boolean.default(false),
  cancellationReason: z.string().max(500, 'Reason too long').optional(),
  feedback: z.string().max(1000, 'Feedback too long').optional(),
})

// Resume subscription validation
export const resumeSubscriptionSchema = z.object({
  subscriptionId: commonValidations.id,
})

// Invoice validation
export const invoiceSchema = z.object({
  customerId: commonValidations.id,
  subscriptionId: commonValidations.id.optional(),
  description: z.string().optional(),
  dueDate: commonValidations.date.optional(),
  metadata: metadataSchema.optional(),
})

// Invoice item validation
export const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  currency: commonValidations.currency,
  metadata: metadataSchema.optional(),
})

// Create invoice validation
export const createInvoiceSchema = z.object({
  customerId: commonValidations.id,
  items: nonEmptyArray(invoiceItemSchema),
  dueDate: commonValidations.date.optional(),
  description: z.string().optional(),
  metadata: metadataSchema.optional(),
})

// Usage validation
export const usageSchema = z.object({
  tenantId: commonValidations.id,
  subscriptionId: commonValidations.id.optional(),
  metric: z.string().min(1, 'Metric name is required'),
  quantity: z.number().min(0, 'Quantity must be non-negative'),
  period: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid period format (YYYY-MM)'),
  metadata: metadataSchema.optional(),
})

// Billing query validation
export const billingQuerySchema = paginationSchema.extend({
  customerId: commonValidations.id.optional(),
  status: z.enum(['active', 'canceled', 'incomplete', 'past_due', 'trialing', 'unpaid']).optional(),
  planId: z.enum(['basic', 'standard', 'premium', 'enterprise']).optional(),
  dateRange: z.object({
    startDate: commonValidations.date.optional(),
    endDate: commonValidations.date.optional(),
  }).optional(),
})

// Billing params validation
export const billingParamsSchema = z.object({
  id: commonValidations.id,
})

// Coupon validation
export const couponSchema = z.object({
  code: z.string().min(3, 'Coupon code must be at least 3 characters'),
  name: commonValidations.name,
  description: z.string().optional(),
  amountOff: z.number().min(0).optional(),
  percentOff: z.number().min(0).max(100).optional(),
  currency: commonValidations.currency.optional(),
  duration: z.enum(['once', 'repeating', 'forever']),
  durationInMonths: z.number().min(1).optional(),
  maxRedemptions: z.number().min(1).optional(),
  redeemBy: commonValidations.date.optional(),
  metadata: metadataSchema.optional(),
})

// Create coupon validation
export const createCouponSchema = couponSchema

// Apply coupon validation
export const applyCouponSchema = z.object({
  couponCode: z.string().min(1, 'Coupon code is required'),
  customerId: commonValidations.id,
  subscriptionId: commonValidations.id.optional(),
})

// Refund validation
export const refundSchema = z.object({
  chargeId: z.string().min(1, 'Charge ID is required'),
  amount: z.number().min(0, 'Refund amount must be non-negative').optional(),
  reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).optional(),
  metadata: metadataSchema.optional(),
})

// Dispute validation
export const disputeSchema = z.object({
  chargeId: z.string().min(1, 'Charge ID is required'),
  evidence: z.object({
    productDescription: z.string().optional(),
    customerCommunication: z.string().optional(),
    receipt: z.string().optional(),
    shippingDocumentation: z.string().optional(),
    serviceDate: commonValidations.date.optional(),
  }),
  metadata: metadataSchema.optional(),
})

// Billing metrics validation
export const billingMetricsSchema = z.object({
  period: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid period format (YYYY-MM)'),
  metrics: z.object({
    revenue: z.number().min(0),
    mrr: z.number().min(0),
    arr: z.number().min(0),
    churnRate: z.number().min(0).max(1),
    ltv: z.number().min(0),
    cac: z.number().min(0),
    arpu: z.number().min(0),
    activeSubscriptions: z.number().min(0),
    canceledSubscriptions: z.number().min(0),
    trialSubscriptions: z.number().min(0),
  }),
})

// Billing export validation
export const billingExportSchema = z.object({
  format: z.enum(['json', 'csv', 'xlsx']),
  type: z.enum(['customers', 'subscriptions', 'invoices', 'usage', 'metrics']),
  filters: z.object({
    customerId: commonValidations.id.optional(),
    planId: z.enum(['basic', 'standard', 'premium', 'enterprise']).optional(),
    status: z.string().optional(),
    dateRange: z.object({
      startDate: commonValidations.date.optional(),
      endDate: commonValidations.date.optional(),
    }).optional(),
  }),
  includeData: z.object({
    metadata: commonValidations.boolean,
    lineItems: commonValidations.boolean,
    usage: commonValidations.boolean,
  }),
})

// Billing import validation
export const billingImportSchema = z.object({
  format: z.enum(['json', 'csv', 'xlsx']),
  type: z.enum(['customers', 'subscriptions', 'invoices']),
  data: z.any(), // Will be validated based on format
  overwrite: commonValidations.boolean.default(false),
  validateOnly: commonValidations.boolean.default(true),
})

// Validation middleware functions
export const validateCreateCustomer = validateRequest({
  body: createCustomerSchema,
})

export const validateUpdateCustomer = validateRequest({
  params: billingParamsSchema,
  body: updateCustomerSchema,
})

export const validateCreatePaymentMethod = validateRequest({
  body: createPaymentMethodSchema,
})

export const validateCreateCheckoutSession = validateRequest({
  body: createCheckoutSessionSchema,
})

export const validateCreatePortalSession = validateRequest({
  body: createPortalSessionSchema,
})

export const validateCreateSubscription = validateRequest({
  body: subscriptionSchema,
})

export const validateUpdateSubscription = validateRequest({
  body: updateSubscriptionSchema,
})

export const validateCancelSubscription = validateRequest({
  params: billingParamsSchema,
  body: cancelSubscriptionSchema,
})

export const validateResumeSubscription = validateRequest({
  params: billingParamsSchema,
  body: resumeSubscriptionSchema,
})

export const validateCreateInvoice = validateRequest({
  body: createInvoiceSchema,
})

export const validateUsage = validateRequest({
  body: usageSchema,
})

export const validateGetBilling = validateRequest({
  query: billingQuerySchema,
})

export const validateGetBillingItem = validateRequest({
  params: billingParamsSchema,
})

export const validateCreateCoupon = validateRequest({
  body: createCouponSchema,
})

export const validateApplyCoupon = validateRequest({
  body: applyCouponSchema,
})

export const validateRefund = validateRequest({
  body: refundSchema,
})

export const validateDispute = validateRequest({
  body: disputeSchema,
})

export const validateBillingMetrics = validateRequest({
  body: billingMetricsSchema,
})

export const validateBillingExport = validateRequest({
  body: billingExportSchema,
})

export const validateBillingImport = validateRequest({
  body: billingImportSchema,
})

export default {
  billingPlanSchema,
  customerSchema,
  createCustomerSchema,
  updateCustomerSchema,
  paymentMethodSchema,
  createPaymentMethodSchema,
  createCheckoutSessionSchema,
  createPortalSessionSchema,
  subscriptionSchema,
  updateSubscriptionSchema,
  cancelSubscriptionSchema,
  resumeSubscriptionSchema,
  invoiceSchema,
  invoiceItemSchema,
  createInvoiceSchema,
  usageSchema,
  billingQuerySchema,
  billingParamsSchema,
  couponSchema,
  createCouponSchema,
  applyCouponSchema,
  refundSchema,
  disputeSchema,
  billingMetricsSchema,
  billingExportSchema,
  billingImportSchema,
  validateCreateCustomer,
  validateUpdateCustomer,
  validateCreatePaymentMethod,
  validateCreateCheckoutSession,
  validateCreatePortalSession,
  validateCreateSubscription,
  validateUpdateSubscription,
  validateCancelSubscription,
  validateResumeSubscription,
  validateCreateInvoice,
  validateUsage,
  validateGetBilling,
  validateGetBillingItem,
  validateCreateCoupon,
  validateApplyCoupon,
  validateRefund,
  validateDispute,
  validateBillingMetrics,
  validateBillingExport,
  validateBillingImport,
}
