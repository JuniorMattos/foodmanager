import { z } from 'zod'

/**
 * Base validation schemas and utilities
 */

// Common field validations
export const commonValidations = {
  id: z.string().cuid('Invalid ID format'),
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
  url: z.string().url('Invalid URL format').optional(),
  currency: z.enum(['USD', 'BRL', 'EUR'], { errorMap: () => ({ message: 'Invalid currency' }) }),
  timezone: z.string().min(1, 'Timezone is required'),
  language: z.enum(['pt-BR', 'en-US', 'es-ES'], { errorMap: () => ({ message: 'Invalid language' }) }),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'TRIAL', 'CANCELLED'], { 
    errorMap: () => ({ message: 'Invalid status' }) 
  }),
  role: z.enum(['ADMIN', 'MANAGER', 'VENDOR', 'CUSTOMER', 'STAFF'], { 
    errorMap: () => ({ message: 'Invalid role' }) 
  }),
  boolean: z.boolean(),
  date: z.string().datetime('Invalid date format'),
  positiveNumber: z.number().min(0, 'Number must be positive'),
  positiveInteger: z.number().int().min(0, 'Number must be a positive integer'),
  nonEmptyString: z.string().min(1, 'Field cannot be empty'),
  optionalString: z.string().optional(),
  jsonArray: z.array(z.any()).optional(),
  jsonMetadata: z.record(z.any()).optional(),
}

// Pagination schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
})

// Search schemas
export const searchSchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  filters: z.record(z.any()).optional(),
})

// Response schemas
export const responseSchema = {
  success: z.object({
    success: z.literal(true),
    data: z.any(),
    message: z.string().optional(),
    meta: z.any().optional(),
  }),
  error: z.object({
    success: z.literal(false),
    error: z.string(),
    message: z.string(),
    code: z.string(),
    details: z.any().optional(),
    timestamp: z.string(),
  }),
  paginated: z.object({
    success: z.literal(true),
    data: z.array(z.any()),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
  }),
}

// Validation error formatter
export const formatValidationError = (error: z.ZodError) => {
  return {
    success: false,
    error: 'Validation Error',
    message: 'Invalid input data',
    code: 'VALIDATION_ERROR',
    details: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    })),
    timestamp: new Date().toISOString(),
  }
}

// Validation middleware factory
export const validateBody = (schema: z.ZodSchema) => {
  return async (request: any, reply: any) => {
    try {
      request.body = schema.parse(request.body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send(formatValidationError(error))
      }
      throw error
    }
  }
}

export const validateQuery = (schema: z.ZodSchema) => {
  return async (request: any, reply: any) => {
    try {
      request.query = schema.parse(request.query)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send(formatValidationError(error))
      }
      throw error
    }
  }
}

export const validateParams = (schema: z.ZodSchema) => {
  return async (request: any, reply: any) => {
    try {
      request.params = schema.parse(request.params)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send(formatValidationError(error))
      }
      throw error
    }
  }
}

// Combined validation middleware
export const validateRequest = (schemas: {
  body?: z.ZodSchema
  query?: z.ZodSchema
  params?: z.ZodSchema
}) => {
  return async (request: any, reply: any) => {
    try {
      if (schemas.body) {
        request.body = schemas.body.parse(request.body)
      }
      if (schemas.query) {
        request.query = schemas.query.parse(request.query)
      }
      if (schemas.params) {
        request.params = schemas.params.parse(request.params)
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send(formatValidationError(error))
      }
      throw error
    }
  }
}

// Sanitization utilities
export const sanitizeString = (value: string): string => {
  return value.trim().replace(/\s+/g, ' ')
}

export const sanitizeEmail = (value: string): string => {
  return value.toLowerCase().trim()
}

export const sanitizeSlug = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Custom refinements
export const uniqueField = async (
  value: string,
  field: string,
  model: any,
  excludeId?: string
): Promise<boolean> => {
  const where: any = { [field]: value }
  if (excludeId) {
    where.id = { not: excludeId }
  }
  
  const existing = await model.findFirst({ where })
  return !existing
}

export const validatePasswordStrength = (password: string): boolean => {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  return password.length >= minLength && 
         hasUpperCase && 
         hasLowerCase && 
         hasNumbers && 
         hasSpecialChar
}

// Password schema with custom validation
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')

// File upload validation
export const fileUploadSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  mimetype: z.enum(['image/jpeg', 'image/png', 'image/gif', 'application/pdf']),
  size: z.number().max(5 * 1024 * 1024, 'File size must be less than 5MB'),
  buffer: z.instanceof(Buffer),
})

// Date range validation
export const dateRangeSchema = z.object({
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
}).refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
})

// Address validation
export const addressSchema = z.object({
  line1: z.string().min(5, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(5, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
})

// Metadata validation
export const metadataSchema = z.record(z.any()).optional()

// Array validation helpers
export const nonEmptyArray = <T extends z.ZodType>(schema: T) => 
  z.array(schema).min(1, 'Array cannot be empty')

export const uniqueArray = <T extends z.ZodType>(schema: T) => 
  z.array(schema).refine((arr) => new Set(arr).size === arr.length, {
    message: 'Array items must be unique',
  })

// Conditional validation
export const conditionalSchema = <T extends z.ZodType>(
  condition: (data: any) => boolean,
  schema: T
) => z.any().refine(condition).transform(schema.parse)

// Async validation helper
export const asyncValidation = <T>(
  schema: z.ZodSchema<T>,
  validator: (data: T) => Promise<boolean>,
  message: string
) => schema.refine(validator, { message })

export default {
  commonValidations,
  paginationSchema,
  searchSchema,
  responseSchema,
  formatValidationError,
  validateBody,
  validateQuery,
  validateParams,
  validateRequest,
  sanitizeString,
  sanitizeEmail,
  sanitizeSlug,
  uniqueField,
  validatePasswordStrength,
  passwordSchema,
  fileUploadSchema,
  dateRangeSchema,
  addressSchema,
  metadataSchema,
  nonEmptyArray,
  uniqueArray,
  conditionalSchema,
  asyncValidation,
}
