import { z } from 'zod'
import { 
  commonValidations, 
  paginationSchema, 
  searchSchema,
  validateRequest,
  sanitizeString,
  sanitizeSlug,
  uniqueField,
  metadataSchema,
  nonEmptyArray
} from './base.validator'

/**
 * Tenant validation schemas
 */

// Tenant settings validation
export const tenantSettingsSchema = z.object({
  timezone: commonValidations.timezone,
  currency: commonValidations.currency,
  language: commonValidations.language,
  theme: z.object({
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
    secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
    logo: commonValidations.url,
  }),
  features: z.object({
    onlineOrders: commonValidations.boolean,
    delivery: commonValidations.boolean,
    pickup: commonValidations.boolean,
    reservations: commonValidations.boolean,
    loyalty: commonValidations.boolean,
    analytics: commonValidations.boolean,
  }),
  notifications: z.object({
    email: commonValidations.boolean,
    sms: commonValidations.boolean,
    push: commonValidations.boolean,
  }),
  integrations: z.object({
    stripe: commonValidations.boolean,
    pos: commonValidations.boolean,
    inventory: commonValidations.boolean,
    accounting: commonValidations.boolean,
  }),
})

// Create tenant validation
export const createTenantSchema = z.object({
  name: commonValidations.name.transform(sanitizeString),
  slug: commonValidations.slug.transform(sanitizeSlug),
  domain: commonValidations.url.optional(),
  adminEmail: commonValidations.email,
  adminName: commonValidations.name.transform(sanitizeString),
  planId: z.enum(['basic', 'standard', 'premium', 'enterprise'], { 
    errorMap: () => ({ message: 'Invalid plan ID' }) 
  }),
  settings: tenantSettingsSchema.optional(),
})

// Update tenant validation
export const updateTenantSchema = z.object({
  name: commonValidations.name.transform(sanitizeString).optional(),
  slug: commonValidations.slug.transform(sanitizeSlug).optional(),
  domain: commonValidations.url.optional(),
  logo: commonValidations.url.optional(),
  settings: tenantSettingsSchema.optional(),
  status: commonValidations.status.optional(),
  subscriptionId: commonValidations.id.optional(),
  planId: z.enum(['basic', 'standard', 'premium', 'enterprise']).optional(),
}).partial()

// Tenant query validation
export const tenantQuerySchema = paginationSchema.extend({
  status: commonValidations.status.optional(),
  planId: z.enum(['basic', 'standard', 'premium', 'enterprise']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'slug', 'createdAt', 'updatedAt', 'status']).optional(),
})

// Tenant params validation
export const tenantParamsSchema = z.object({
  id: commonValidations.id,
})

// Search tenants validation
export const searchTenantsSchema = searchSchema.extend({
  status: commonValidations.status.optional(),
  planId: z.enum(['basic', 'standard', 'premium', 'enterprise']).optional(),
})

// Update tenant status validation
export const updateTenantStatusSchema = z.object({
  status: commonValidations.status,
  reason: z.string().max(500, 'Reason too long').optional(),
})

// Update tenant subscription validation
export const updateTenantSubscriptionSchema = z.object({
  subscriptionId: commonValidations.id,
  planId: z.enum(['basic', 'standard', 'premium', 'enterprise']),
})

// Tenant usage validation
export const tenantUsageSchema = z.object({
  tenantId: commonValidations.id,
  period: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid period format (YYYY-MM)'),
  metrics: z.object({
    users: commonValidations.positiveInteger,
    products: commonValidations.positiveInteger,
    orders: commonValidations.positiveInteger,
    apiCalls: commonValidations.positiveInteger,
    storage: commonValidations.positiveInteger,
  }),
})

// Tenant limits validation
export const tenantLimitsSchema = z.object({
  users: commonValidations.positiveInteger,
  products: commonValidations.positiveInteger,
  orders: commonValidations.positiveInteger,
  apiCalls: commonValidations.positiveInteger,
  storage: commonValidations.positiveInteger,
  features: nonEmptyArray(z.string()),
})

// Tenant theme validation
export const tenantThemeSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  logo: commonValidations.url.optional(),
  favicon: commonValidations.url.optional(),
  customCSS: z.string().max(10000, 'Custom CSS too long').optional(),
})

// Tenant features validation
export const tenantFeaturesSchema = z.object({
  onlineOrders: commonValidations.boolean,
  delivery: commonValidations.boolean,
  pickup: commonValidations.boolean,
  reservations: commonValidations.boolean,
  loyalty: commonValidations.boolean,
  analytics: commonValidations.boolean,
  customFeatures: z.record(z.boolean()).optional(),
})

// Tenant integrations validation
export const tenantIntegrationsSchema = z.object({
  stripe: z.object({
    enabled: commonValidations.boolean,
    publicKey: z.string().optional(),
    webhookSecret: z.string().optional(),
  }).optional(),
  pos: z.object({
    enabled: commonValidations.boolean,
    provider: z.string().optional(),
    apiKey: z.string().optional(),
  }).optional(),
  inventory: z.object({
    enabled: commonValidations.boolean,
    provider: z.string().optional(),
    apiKey: z.string().optional(),
  }).optional(),
  accounting: z.object({
    enabled: commonValidations.boolean,
    provider: z.string().optional(),
    apiKey: z.string().optional(),
  }).optional(),
})

// Tenant notification settings validation
export const tenantNotificationsSchema = z.object({
  email: z.object({
    enabled: commonValidations.boolean,
    address: commonValidations.email.optional(),
    templates: z.record(z.string()).optional(),
  }).optional(),
  sms: z.object({
    enabled: commonValidations.boolean,
    provider: z.string().optional(),
    apiKey: z.string().optional(),
  }).optional(),
  push: z.object({
    enabled: commonValidations.boolean,
    vapidKey: z.string().optional(),
  }).optional(),
  webhook: z.object({
    enabled: commonValidations.boolean,
    url: commonValidations.url.optional(),
    events: nonEmptyArray(z.string()).optional(),
  }).optional(),
})

// Tenant metadata validation
export const tenantMetadataSchema = z.object({
  industry: z.string().optional(),
  companySize: z.enum(['small', 'medium', 'large', 'enterprise']).optional(),
  website: commonValidations.url.optional(),
  description: z.string().max(500, 'Description too long').optional(),
  tags: nonEmptyArray(z.string()).optional(),
  customFields: metadataSchema,
})

// Tenant export validation
export const tenantExportSchema = z.object({
  format: z.enum(['json', 'csv', 'xlsx']),
  includeData: z.object({
    users: commonValidations.boolean,
    products: commonValidations.boolean,
    orders: commonValidations.boolean,
    settings: commonValidations.boolean,
  }),
  dateRange: z.object({
    startDate: commonValidations.date.optional(),
    endDate: commonValidations.date.optional(),
  }).optional(),
})

// Tenant import validation
export const tenantImportSchema = z.object({
  format: z.enum(['json', 'csv', 'xlsx']),
  data: z.any(), // Will be validated based on format
  overwrite: commonValidations.boolean.default(false),
  validateOnly: commonValidations.boolean.default(true),
})

// Tenant backup validation
export const tenantBackupSchema = z.object({
  includeData: z.object({
    users: commonValidations.boolean,
    products: commonValidations.boolean,
    orders: commonValidations.boolean,
    settings: commonValidations.boolean,
    files: commonValidations.boolean,
  }),
  compression: z.enum(['gzip', 'bzip2', 'none']).default('gzip'),
  encryption: z.object({
    enabled: commonValidations.boolean,
    algorithm: z.string().optional(),
    key: z.string().optional(),
  }).optional(),
})

// Tenant restore validation
export const tenantRestoreSchema = z.object({
  backupId: commonValidations.id,
  overwrite: commonValidations.boolean.default(false),
  validateOnly: commonValidations.boolean.default(true),
  selectedData: z.object({
    users: commonValidations.boolean,
    products: commonValidations.boolean,
    orders: commonValidations.boolean,
    settings: commonValidations.boolean,
    files: commonValidations.boolean,
  }),
})

// Validation middleware functions
export const validateCreateTenant = validateRequest({
  body: createTenantSchema,
})

export const validateUpdateTenant = validateRequest({
  params: tenantParamsSchema,
  body: updateTenantSchema,
})

export const validateGetTenants = validateRequest({
  query: tenantQuerySchema,
})

export const validateGetTenant = validateRequest({
  params: tenantParamsSchema,
})

export const validateSearchTenants = validateRequest({
  query: searchTenantsSchema,
})

export const validateUpdateTenantStatus = validateRequest({
  params: tenantParamsSchema,
  body: updateTenantStatusSchema,
})

export const validateUpdateTenantSubscription = validateRequest({
  params: tenantParamsSchema,
  body: updateTenantSubscriptionSchema,
})

export const validateTenantUsage = validateRequest({
  body: tenantUsageSchema,
})

export const validateTenantLimits = validateRequest({
  params: tenantParamsSchema,
  body: tenantLimitsSchema,
})

export const validateTenantTheme = validateRequest({
  params: tenantParamsSchema,
  body: tenantThemeSchema,
})

export const validateTenantFeatures = validateRequest({
  params: tenantParamsSchema,
  body: tenantFeaturesSchema,
})

export const validateTenantIntegrations = validateRequest({
  params: tenantParamsSchema,
  body: tenantIntegrationsSchema,
})

export const validateTenantNotifications = validateRequest({
  params: tenantParamsSchema,
  body: tenantNotificationsSchema,
})

export const validateTenantMetadata = validateRequest({
  params: tenantParamsSchema,
  body: tenantMetadataSchema,
})

export const validateTenantExport = validateRequest({
  params: tenantParamsSchema,
  body: tenantExportSchema,
})

export const validateTenantImport = validateRequest({
  params: tenantParamsSchema,
  body: tenantImportSchema,
})

export const validateTenantBackup = validateRequest({
  params: tenantParamsSchema,
  body: tenantBackupSchema,
})

export const validateTenantRestore = validateRequest({
  params: tenantParamsSchema,
  body: tenantRestoreSchema,
})

export default {
  createTenantSchema,
  updateTenantSchema,
  tenantQuerySchema,
  tenantParamsSchema,
  searchTenantsSchema,
  updateTenantStatusSchema,
  updateTenantSubscriptionSchema,
  tenantUsageSchema,
  tenantLimitsSchema,
  tenantSettingsSchema,
  tenantThemeSchema,
  tenantFeaturesSchema,
  tenantIntegrationsSchema,
  tenantNotificationsSchema,
  tenantMetadataSchema,
  tenantExportSchema,
  tenantImportSchema,
  tenantBackupSchema,
  tenantRestoreSchema,
  validateCreateTenant,
  validateUpdateTenant,
  validateGetTenants,
  validateGetTenant,
  validateSearchTenants,
  validateUpdateTenantStatus,
  validateUpdateTenantSubscription,
  validateTenantUsage,
  validateTenantLimits,
  validateTenantTheme,
  validateTenantFeatures,
  validateTenantIntegrations,
  validateTenantNotifications,
  validateTenantMetadata,
  validateTenantExport,
  validateTenantImport,
  validateTenantBackup,
  validateTenantRestore,
}
