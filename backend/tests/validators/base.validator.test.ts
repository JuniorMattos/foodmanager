import { z } from 'zod'
import {
  commonValidations,
  paginationSchema,
  searchSchema,
  formatValidationError,
  validateRequest,
  validateBody,
  validateQuery,
  validateParams,
  sanitizeString,
  sanitizeEmail,
  sanitizeSlug,
  passwordSchema,
  dateRangeSchema,
  addressSchema,
  metadataSchema,
} from '../../src/services/validators/base.validator'

describe('Base Validators', () => {
  describe('Common Validations', () => {
    describe('ID validation', () => {
      it('should validate valid CUID', () => {
        const result = commonValidations.id.safeParse('cl1234567890abcdef123456')
        expect(result.success).toBe(true)
      })

      it('should reject invalid CUID', () => {
        const result = commonValidations.id.safeParse('invalid-id')
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Invalid ID format')
        }
      })
    })

    describe('Email validation', () => {
      it('should validate valid email', () => {
        const result = commonValidations.email.safeParse('test@example.com')
        expect(result.success).toBe(true)
      })

      it('should reject invalid email', () => {
        const result = commonValidations.email.safeParse('invalid-email')
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Invalid email format')
        }
      })
    })

    describe('Name validation', () => {
      it('should validate valid name', () => {
        const result = commonValidations.name.safeParse('John Doe')
        expect(result.success).toBe(true)
      })

      it('should reject name that is too short', () => {
        const result = commonValidations.name.safeParse('J')
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Name must be at least 2 characters')
        }
      })

      it('should reject name that is too long', () => {
        const result = commonValidations.name.safeParse('A'.repeat(101))
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Name too long')
        }
      })
    })

    describe('Slug validation', () => {
      it('should validate valid slug', () => {
        const result = commonValidations.slug.safeParse('my-cool-app')
        expect(result.success).toBe(true)
      })

      it('should reject slug with invalid characters', () => {
        const result = commonValidations.slug.safeParse('My Cool App!')
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Slug can only contain lowercase letters, numbers, and hyphens')
        }
      })

      it('should reject slug that is too short', () => {
        const result = commonValidations.slug.safeParse('ab')
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Slug must be at least 3 characters')
        }
      })
    })

    describe('Phone validation', () => {
      it('should validate valid phone number', () => {
        const result = commonValidations.phone.safeParse('+1234567890')
        expect(result.success).toBe(true)
      })

      it('should reject invalid phone number', () => {
        const result = commonValidations.phone.safeParse('invalid-phone')
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Invalid phone number format')
        }
      })
    })

    describe('URL validation', () => {
      it('should validate valid URL', () => {
        const result = commonValidations.url.safeParse('https://example.com')
        expect(result.success).toBe(true)
      })

      it('should reject invalid URL', () => {
        const result = commonValidations.url.safeParse('invalid-url')
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Invalid URL format')
        }
      })
    })

    describe('Currency validation', () => {
      it('should validate valid currencies', () => {
        const currencies = ['USD', 'BRL', 'EUR']
        currencies.forEach(currency => {
          const result = commonValidations.currency.safeParse(currency)
          expect(result.success).toBe(true)
        })
      })

      it('should reject invalid currency', () => {
        const result = commonValidations.currency.safeParse('INVALID')
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Invalid currency')
        }
      })
    })

    describe('Status validation', () => {
      it('should validate valid statuses', () => {
        const statuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'TRIAL', 'CANCELLED']
        statuses.forEach(status => {
          const result = commonValidations.status.safeParse(status)
          expect(result.success).toBe(true)
        })
      })

      it('should reject invalid status', () => {
        const result = commonValidations.status.safeParse('INVALID')
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Invalid status')
        }
      })
    })

    describe('Role validation', () => {
      it('should validate valid roles', () => {
        const roles = ['ADMIN', 'MANAGER', 'VENDOR', 'CUSTOMER', 'STAFF']
        roles.forEach(role => {
          const result = commonValidations.role.safeParse(role)
          expect(result.success).toBe(true)
        })
      })

      it('should reject invalid role', () => {
        const result = commonValidations.role.safeParse('INVALID')
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Invalid role')
        }
      })
    })
  })

  describe('Pagination Schema', () => {
    it('should validate pagination with defaults', () => {
      const result = paginationSchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
        expect(result.data.limit).toBe(20)
        expect(result.data.order).toBe('desc')
      }
    })

    it('should validate custom pagination', () => {
      const result = paginationSchema.safeParse({
        page: 2,
        limit: 10,
        sort: 'name',
        order: 'asc'
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(2)
        expect(result.data.limit).toBe(10)
        expect(result.data.sort).toBe('name')
        expect(result.data.order).toBe('asc')
      }
    })

    it('should reject invalid page', () => {
      const result = paginationSchema.safeParse({ page: 0 })
      expect(result.success).toBe(false)
    })

    it('should reject limit too high', () => {
      const result = paginationSchema.safeParse({ limit: 101 })
      expect(result.success).toBe(false)
    })
  })

  describe('Search Schema', () => {
    it('should validate search query', () => {
      const result = searchSchema.safeParse({
        q: 'test query',
        filters: { status: 'ACTIVE' }
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty search query', () => {
      const result = searchSchema.safeParse({ q: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Search query is required')
      }
    })
  })

  describe('Password Schema', () => {
    it('should validate strong password', () => {
      const result = passwordSchema.safeParse('StrongP@ssw0rd!')
      expect(result.success).toBe(true)
    })

    it('should reject password that is too short', () => {
      const result = passwordSchema.safeParse('Short1!')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must be at least 8 characters')
      }
    })

    it('should reject password without uppercase', () => {
      const result = passwordSchema.safeParse('lowercase1!')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must contain at least one uppercase letter')
      }
    })

    it('should reject password without lowercase', () => {
      const result = passwordSchema.safeParse('UPPERCASE1!')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must contain at least one lowercase letter')
      }
    })

    it('should reject password without numbers', () => {
      const result = passwordSchema.safeParse('NoNumbers!')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must contain at least one number')
      }
    })

    it('should reject password without special characters', () => {
      const result = passwordSchema.safeParse('NoSpecialChars1')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must contain at least one special character')
      }
    })
  })

  describe('Date Range Schema', () => {
    it('should validate valid date range', () => {
      const result = dateRangeSchema.safeParse({
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z'
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid start date', () => {
      const result = dateRangeSchema.safeParse({
        startDate: 'invalid-date',
        endDate: '2024-01-31T23:59:59.999Z'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid start date')
      }
    })

    it('should reject end date before start date', () => {
      const result = dateRangeSchema.safeParse({
        startDate: '2024-01-31T23:59:59.999Z',
        endDate: '2024-01-01T00:00:00.000Z'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('End date must be after start date')
      }
    })
  })

  describe('Address Schema', () => {
    it('should validate complete address', () => {
      const result = addressSchema.safeParse({
        line1: '123 Main St',
        line2: 'Apt 4B',
        city: 'São Paulo',
        state: 'SP',
        postalCode: '01310-100',
        country: 'BR'
      })
      expect(result.success).toBe(true)
    })

    it('should validate minimal address', () => {
      const result = addressSchema.safeParse({
        line1: '123 Main St',
        city: 'São Paulo',
        state: 'SP',
        postalCode: '01310-100',
        country: 'BR'
      })
      expect(result.success).toBe(true)
    })

    it('should reject address with missing required fields', () => {
      const result = addressSchema.safeParse({
        line1: '123 Main St',
        city: 'São Paulo'
      })
      expect(result.success).toBe(false)
    })
  })

  describe('Sanitization Functions', () => {
    describe('sanitizeString', () => {
      it('should trim and normalize whitespace', () => {
        const result = sanitizeString('  Hello   World  ')
        expect(result).toBe('Hello World')
      })

      it('should handle empty string', () => {
        const result = sanitizeString('   ')
        expect(result).toBe('')
      })
    })

    describe('sanitizeEmail', () => {
      it('should lowercase and trim email', () => {
        const result = sanitizeEmail('  TEST@EXAMPLE.COM  ')
        expect(result).toBe('test@example.com')
      })
    })

    describe('sanitizeSlug', () => {
      it('should convert to slug format', () => {
        const result = sanitizeSlug('My Cool App!')
        expect(result).toBe('my-cool-app')
      })

      it('should handle multiple special characters', () => {
        const result = sanitizeSlug('Hello!!! World???')
        expect(result).toBe('hello-world')
      })

      it('should handle leading/trailing hyphens', () => {
        const result = sanitizeSlug('--test--')
        expect(result).toBe('test')
      })
    })
  })

  describe('Error Formatting', () => {
    it('should format validation error correctly', () => {
      const schema = z.object({
        email: commonValidations.email,
        name: commonValidations.name,
      })

      const result = schema.safeParse({
        email: 'invalid-email',
        name: 'J'
      })

      if (!result.success) {
        const formatted = formatValidationError(result.error)
        
        expect(formatted.success).toBe(false)
        expect(formatted.error).toBe('Validation Error')
        expect(formatted.message).toBe('Invalid input data')
        expect(formatted.code).toBe('VALIDATION_ERROR')
        expect(formatted.details).toHaveLength(2)
        expect(formatted.details[0].field).toBe('email')
        expect(formatted.details[0].message).toBe('Invalid email format')
        expect(formatted.details[1].field).toBe('name')
        expect(formatted.details[1].message).toBe('Name must be at least 2 characters')
        expect(formatted.timestamp).toBeDefined()
      }
    })
  })

  describe('Validation Middleware', () => {
    describe('validateRequest', () => {
      it('should validate request with body, query, and params', async () => {
        const schema = {
          body: z.object({ name: z.string() }),
          query: z.object({ page: z.string() }),
          params: z.object({ id: z.string() })
        }

        const middleware = validateRequest(schema)
        const request = {
          body: { name: 'test' },
          query: { page: '1' },
          params: { id: '123' }
        }
        const reply = createMockReply()

        await middleware(request, reply)
        expect(request.body.name).toBe('test')
        expect(request.query.page).toBe('1')
        expect(request.params.id).toBe('123')
      })

      it('should return error for invalid request', async () => {
        const schema = {
          body: z.object({ name: z.string() })
        }

        const middleware = validateRequest(schema)
        const request = {
          body: { name: 123 }
        }
        const reply = createMockReply()

        await middleware(request, reply)
        expect(reply.status).toHaveBeenCalledWith(400)
        expect(reply.send).toHaveBeenCalled()
      })
    })

    describe('validateBody', () => {
      it('should validate request body', async () => {
        const schema = z.object({ name: z.string() })
        const middleware = validateBody(schema)
        const request = { body: { name: 'test' } }
        const reply = createMockReply()

        await middleware(request, reply)
        expect(request.body.name).toBe('test')
      })
    })

    describe('validateQuery', () => {
      it('should validate request query', async () => {
        const schema = z.object({ page: z.string() })
        const middleware = validateQuery(schema)
        const request = { query: { page: '1' } }
        const reply = createMockReply()

        await middleware(request, reply)
        expect(request.query.page).toBe('1')
      })
    })

    describe('validateParams', () => {
      it('should validate request params', async () => {
        const schema = z.object({ id: z.string() })
        const middleware = validateParams(schema)
        const request = { params: { id: '123' } }
        const reply = createMockReply()

        await middleware(request, reply)
        expect(request.params.id).toBe('123')
      })
    })
  })

  describe('Metadata Schema', () => {
    it('should validate metadata object', () => {
      const result = metadataSchema.safeParse({
        customField: 'value',
        anotherField: 123,
        nested: { key: 'value' }
      })
      expect(result.success).toBe(true)
    })

    it('should accept undefined metadata', () => {
      const result = metadataSchema.safeParse(undefined)
      expect(result.success).toBe(true)
    })
  })
})
