import { z } from 'zod'
import { 
  commonValidations, 
  paginationSchema, 
  searchSchema,
  validateRequest,
  sanitizeString,
  sanitizeEmail,
  passwordSchema,
  metadataSchema,
  nonEmptyArray,
  addressSchema
} from './base.validator'

/**
 * User validation schemas
 */

// User preferences validation
export const userPreferencesSchema = z.object({
  language: commonValidations.language,
  timezone: commonValidations.timezone,
  theme: z.enum(['light', 'dark', 'auto'], { 
    errorMap: () => ({ message: 'Invalid theme' }) 
  }),
  notifications: z.object({
    email: commonValidations.boolean,
    sms: commonValidations.boolean,
    push: commonValidations.boolean,
    desktop: commonValidations.boolean,
  }),
  dashboard: z.object({
    layout: z.string(),
    widgets: nonEmptyArray(z.string()),
    refreshInterval: z.number().min(5000, 'Refresh interval must be at least 5 seconds'),
  }),
  privacy: z.object({
    shareData: commonValidations.boolean,
    analytics: commonValidations.boolean,
    marketing: commonValidations.boolean,
  }),
})

// Create user validation
export const createUserSchema = z.object({
  email: commonValidations.email.transform(sanitizeEmail),
  name: commonValidations.name.transform(sanitizeString),
  password: passwordSchema,
  role: commonValidations.role,
  tenantId: commonValidations.id,
  phone: commonValidations.phone.optional(),
  avatar: commonValidations.url.optional(),
  preferences: userPreferencesSchema.optional(),
  isActive: commonValidations.boolean.default(true),
  emailVerified: commonValidations.boolean.default(false),
})

// Update user validation
export const updateUserSchema = z.object({
  email: commonValidations.email.transform(sanitizeEmail).optional(),
  name: commonValidations.name.transform(sanitizeString).optional(),
  phone: commonValidations.phone.optional(),
  avatar: commonValidations.url.optional(),
  role: commonValidations.role.optional(),
  isActive: commonValidations.boolean.optional(),
  emailVerified: commonValidations.boolean.optional(),
  phoneVerified: commonValidations.boolean.optional(),
  preferences: userPreferencesSchema.optional(),
  lastLoginAt: commonValidations.date.optional(),
}).partial()

// User profile validation
export const userProfileSchema = z.object({
  name: commonValidations.name.transform(sanitizeString).optional(),
  phone: commonValidations.phone.optional(),
  avatar: commonValidations.url.optional(),
  preferences: userPreferencesSchema.optional(),
  billingAddress: addressSchema.optional(),
  shippingAddress: addressSchema.optional(),
})

// User login validation
export const userLoginSchema = z.object({
  email: commonValidations.email.transform(sanitizeEmail),
  password: z.string().min(1, 'Password is required'),
  tenantSlug: z.string().min(1, 'Tenant slug is required').optional(),
  rememberMe: commonValidations.boolean.default(false),
})

// User registration validation
export const userRegistrationSchema = z.object({
  email: commonValidations.email.transform(sanitizeEmail),
  name: commonValidations.name.transform(sanitizeString),
  password: passwordSchema,
  confirmPassword: z.string(),
  tenantSlug: z.string().min(1, 'Tenant slug is required'),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
  acceptPrivacy: z.literal(true, { errorMap: () => ({ message: 'You must accept the privacy policy' }) }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// Password change validation
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// Password reset request validation
export const passwordResetRequestSchema = z.object({
  email: commonValidations.email.transform(sanitizeEmail),
  tenantSlug: z.string().min(1, 'Tenant slug is required'),
})

// Password reset validation
export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// Email verification validation
export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
})

// User query validation
export const userQuerySchema = paginationSchema.extend({
  role: commonValidations.role.optional(),
  isActive: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  emailVerified: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'role', 'createdAt', 'lastLoginAt']).optional(),
})

// User params validation
export const userParamsSchema = z.object({
  id: commonValidations.id,
})

// Search users validation
export const searchUsersSchema = searchSchema.extend({
  role: commonValidations.role.optional(),
  isActive: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
})

// Update user role validation
export const updateUserRoleSchema = z.object({
  role: commonValidations.role,
  reason: z.string().max(500, 'Reason too long').optional(),
})

// User session validation
export const userSessionSchema = z.object({
  userId: commonValidations.id,
  tenantId: commonValidations.id,
  token: z.string().min(1, 'Token is required'),
  refreshToken: z.string().min(1, 'Refresh token is required'),
  expiresAt: commonValidations.date,
  ipAddress: z.string().ip('Invalid IP address'),
  userAgent: z.string().min(1, 'User agent is required'),
})

// User activity validation
export const userActivitySchema = z.object({
  userId: commonValidations.id,
  tenantId: commonValidations.id,
  action: z.string().min(1, 'Action is required'),
  resource: z.string().min(1, 'Resource is required'),
  resourceId: commonValidations.id.optional(),
  metadata: metadataSchema,
  ipAddress: z.string().ip('Invalid IP address'),
  userAgent: z.string().min(1, 'User agent is required'),
})

// User bulk operations validation
export const userBulkOperationSchema = z.object({
  userIds: nonEmptyArray(commonValidations.id),
  operation: z.enum(['activate', 'deactivate', 'delete', 'updateRole']),
  data: z.any().optional(), // For update operations
})

// User import validation
export const userImportSchema = z.object({
  format: z.enum(['json', 'csv', 'xlsx']),
  data: z.any(), // Will be validated based on format
  overwrite: commonValidations.boolean.default(false),
  validateOnly: commonValidations.boolean.default(true),
  sendWelcomeEmail: commonValidations.boolean.default(false),
})

// User export validation
export const userExportSchema = z.object({
  format: z.enum(['json', 'csv', 'xlsx']),
  filters: z.object({
    role: commonValidations.role.optional(),
    isActive: commonValidations.boolean.optional(),
    dateRange: z.object({
      startDate: commonValidations.date.optional(),
      endDate: commonValidations.date.optional(),
    }).optional(),
  }),
  includeData: z.object({
    preferences: commonValidations.boolean,
    activities: commonValidations.boolean,
    sessions: commonValidations.boolean,
  }),
})

// User notification preferences validation
export const userNotificationPreferencesSchema = z.object({
  email: z.object({
    orders: commonValidations.boolean,
    promotions: commonValidations.boolean,
    security: commonValidations.boolean,
    newsletter: commonValidations.boolean,
  }),
  push: z.object({
    orders: commonValidations.boolean,
    promotions: commonValidations.boolean,
    security: commonValidations.boolean,
  }),
  sms: z.object({
    orders: commonValidations.boolean,
    promotions: commonValidations.boolean,
    security: commonValidations.boolean,
  }),
})

// User security settings validation
export const userSecuritySettingsSchema = z.object({
  twoFactorEnabled: commonValidations.boolean,
  twoFactorSecret: z.string().optional(),
  backupCodes: z.array(z.string()).optional(),
  loginAlerts: commonValidations.boolean,
  sessionTimeout: z.number().min(300, 'Session timeout must be at least 5 minutes'),
  allowedIPs: z.array(z.string().ip()).optional(),
  deviceManagement: z.object({
    enabled: commonValidations.boolean,
    maxDevices: z.number().min(1, 'Must allow at least 1 device'),
    deviceExpiry: z.number().min(86400, 'Device expiry must be at least 1 day'),
  }),
})

// User permissions validation
export const userPermissionsSchema = z.object({
  permissions: nonEmptyArray(z.string()),
  role: commonValidations.role,
  customPermissions: z.record(z.boolean()).optional(),
})

// User metadata validation
export const userMetadataSchema = z.object({
  department: z.string().optional(),
  position: z.string().optional(),
  employeeId: z.string().optional(),
  managerId: commonValidations.id.optional(),
  skills: nonEmptyArray(z.string()).optional(),
  certifications: nonEmptyArray(z.string()).optional(),
  bio: z.string().max(1000, 'Bio too long').optional(),
  socialLinks: z.record(commonValidations.url).optional(),
  customFields: metadataSchema,
})

// Validation middleware functions
export const validateCreateUser = validateRequest({
  body: createUserSchema,
})

export const validateUpdateUser = validateRequest({
  params: userParamsSchema,
  body: updateUserSchema,
})

export const validateGetUsers = validateRequest({
  query: userQuerySchema,
})

export const validateGetUser = validateRequest({
  params: userParamsSchema,
})

export const validateSearchUsers = validateRequest({
  query: searchUsersSchema,
})

export const validateUserLogin = validateRequest({
  body: userLoginSchema,
})

export const validateUserRegistration = validateRequest({
  body: userRegistrationSchema,
})

export const validateChangePassword = validateRequest({
  params: userParamsSchema,
  body: changePasswordSchema,
})

export const validatePasswordResetRequest = validateRequest({
  body: passwordResetRequestSchema,
})

export const validatePasswordReset = validateRequest({
  body: passwordResetSchema,
})

export const validateEmailVerification = validateRequest({
  body: emailVerificationSchema,
})

export const validateUpdateUserRole = validateRequest({
  params: userParamsSchema,
  body: updateUserRoleSchema,
})

export const validateUserSession = validateRequest({
  body: userSessionSchema,
})

export const validateUserActivity = validateRequest({
  body: userActivitySchema,
})

export const validateUserBulkOperation = validateRequest({
  body: userBulkOperationSchema,
})

export const validateUserImport = validateRequest({
  body: userImportSchema,
})

export const validateUserExport = validateRequest({
  body: userExportSchema,
})

export const validateUserProfile = validateRequest({
  params: userParamsSchema,
  body: userProfileSchema,
})

export const validateUserNotificationPreferences = validateRequest({
  params: userParamsSchema,
  body: userNotificationPreferencesSchema,
})

export const validateUserSecuritySettings = validateRequest({
  params: userParamsSchema,
  body: userSecuritySettingsSchema,
})

export const validateUserPermissions = validateRequest({
  params: userParamsSchema,
  body: userPermissionsSchema,
})

export const validateUserMetadata = validateRequest({
  params: userParamsSchema,
  body: userMetadataSchema,
})

export default {
  createUserSchema,
  updateUserSchema,
  userProfileSchema,
  userLoginSchema,
  userRegistrationSchema,
  changePasswordSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  emailVerificationSchema,
  userQuerySchema,
  userParamsSchema,
  searchUsersSchema,
  updateUserRoleSchema,
  userSessionSchema,
  userActivitySchema,
  userBulkOperationSchema,
  userImportSchema,
  userExportSchema,
  userPreferencesSchema,
  userNotificationPreferencesSchema,
  userSecuritySettingsSchema,
  userPermissionsSchema,
  userMetadataSchema,
  validateCreateUser,
  validateUpdateUser,
  validateGetUsers,
  validateGetUser,
  validateSearchUsers,
  validateUserLogin,
  validateUserRegistration,
  validateChangePassword,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateEmailVerification,
  validateUpdateUserRole,
  validateUserSession,
  validateUserActivity,
  validateUserBulkOperation,
  validateUserImport,
  validateUserExport,
  validateUserProfile,
  validateUserNotificationPreferences,
  validateUserSecuritySettings,
  validateUserPermissions,
  validateUserMetadata,
}
