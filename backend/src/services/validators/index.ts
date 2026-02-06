// Base validators
export * from './base.validator'

// Domain validators
export * from './tenant.validator'
export * from './user.validator'
export * from './billing.validator'

// Re-export commonly used validators
import {
  validateRequest,
  formatValidationError,
  validateBody,
  validateQuery,
  validateParams,
} from './base.validator'
import {
  validateCreateTenant,
  validateUpdateTenant,
  validateGetTenants,
  validateGetTenant,
  validateSearchTenants,
} from './tenant.validator'
import {
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
  validateUserProfile,
} from './user.validator'
import {
  validateCreateCustomer,
  validateUpdateCustomer,
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
} from './billing.validator'

// Export validation middleware collections
export const tenantValidators = {
  create: validateCreateTenant,
  update: validateUpdateTenant,
  list: validateGetTenants,
  get: validateGetTenant,
  search: validateSearchTenants,
}

export const userValidators = {
  create: validateCreateUser,
  update: validateUpdateUser,
  list: validateGetUsers,
  get: validateGetUser,
  search: validateSearchUsers,
  login: validateUserLogin,
  register: validateUserRegistration,
  changePassword: validateChangePassword,
  passwordResetRequest: validatePasswordResetRequest,
  passwordReset: validatePasswordReset,
  emailVerification: validateEmailVerification,
  profile: validateUserProfile,
}

export const billingValidators = {
  createCustomer: validateCreateCustomer,
  updateCustomer: validateUpdateCustomer,
  createCheckoutSession: validateCreateCheckoutSession,
  createPortalSession: validateCreatePortalSession,
  createSubscription: validateCreateSubscription,
  updateSubscription: validateUpdateSubscription,
  cancelSubscription: validateCancelSubscription,
  resumeSubscription: validateResumeSubscription,
  createInvoice: validateCreateInvoice,
  usage: validateUsage,
  list: validateGetBilling,
  get: validateGetBillingItem,
}

// Utility exports
export {
  validateRequest,
  formatValidationError,
  validateBody,
  validateQuery,
  validateParams,
}

// Default export with all validators
export default {
  tenant: tenantValidators,
  user: userValidators,
  billing: billingValidators,
  utils: {
    validateRequest,
    formatValidationError,
    validateBody,
    validateQuery,
    validateParams,
  },
}
