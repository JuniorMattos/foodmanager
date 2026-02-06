import {
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
  validateCreateTenant,
  validateUpdateTenant,
  validateGetTenants,
  validateGetTenant,
  validateSearchTenants,
  validateUpdateTenantStatus,
  validateUpdateTenantSubscription,
  validateTenantUsage,
  validateTenantLimits,
} from '../../src/services/validators/tenant.validator'

describe('Tenant Validators', () => {
  describe('Create Tenant Schema', () => {
    it('should validate valid tenant creation data', () => {
      const data = {
        name: 'Test Restaurant',
        slug: 'test-restaurant',
        domain: 'https://test.foodmanager.com',
        adminEmail: 'admin@test.com',
        adminName: 'Admin User',
        planId: 'standard',
        settings: {
          timezone: 'America/Sao_Paulo',
          currency: 'BRL',
          language: 'pt-BR',
          theme: {
            primaryColor: '#000000',
            secondaryColor: '#ffffff',
            logo: 'https://example.com/logo.png'
          },
          features: {
            onlineOrders: true,
            delivery: true,
            pickup: true,
            reservations: false,
            loyalty: false,
            analytics: true
          },
          notifications: {
            email: true,
            sms: false,
            push: true
          },
          integrations: {
            stripe: true,
            pos: false,
            inventory: true,
            accounting: false
          }
        }
      }

      const result = createTenantSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should validate tenant creation without optional fields', () => {
      const data = {
        name: 'Test Restaurant',
        slug: 'test-restaurant',
        adminEmail: 'admin@test.com',
        adminName: 'Admin User',
        planId: 'standard'
      }

      const result = createTenantSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const data = {
        name: 'Test Restaurant',
        slug: 'test-restaurant',
        adminEmail: 'invalid-email',
        adminName: 'Admin User',
        planId: 'standard'
      }

      const result = createTenantSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject invalid plan ID', () => {
      const data = {
        name: 'Test Restaurant',
        slug: 'test-restaurant',
        adminEmail: 'admin@test.com',
        adminName: 'Admin User',
        planId: 'invalid-plan'
      }

      const result = createTenantSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject name that is too short', () => {
      const data = {
        name: 'A',
        slug: 'test-restaurant',
        adminEmail: 'admin@test.com',
        adminName: 'Admin User',
        planId: 'standard'
      }

      const result = createTenantSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject slug with invalid characters', () => {
      const data = {
        name: 'Test Restaurant',
        slug: 'Test Restaurant!',
        adminEmail: 'admin@test.com',
        adminName: 'Admin User',
        planId: 'standard'
      }

      const result = createTenantSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('Update Tenant Schema', () => {
    it('should validate partial update data', () => {
      const data = {
        name: 'Updated Restaurant',
        domain: 'https://updated.foodmanager.com'
      }

      const result = updateTenantSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should validate empty update data', () => {
      const result = updateTenantSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should validate status update', () => {
      const data = {
        status: 'SUSPENDED',
        reason: 'Payment overdue'
      }

      const result = updateTenantSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject invalid status', () => {
      const data = {
        status: 'INVALID_STATUS'
      }

      const result = updateTenantSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('Tenant Query Schema', () => {
    it('should validate query with defaults', () => {
      const query = {}

      const result = tenantQuerySchema.safeParse(query)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
        expect(result.data.limit).toBe(20)
        expect(result.data.order).toBe('desc')
      }
    })

    it('should validate query with filters', () => {
      const query = {
        page: 2,
        limit: 10,
        status: 'ACTIVE',
        planId: 'standard',
        search: 'test',
        sortBy: 'name',
        order: 'asc'
      }

      const result = tenantQuerySchema.safeParse(query)
      expect(result.success).toBe(true)
    })

    it('should reject invalid sort field', () => {
      const query = {
        sortBy: 'invalid_field'
      }

      const result = tenantQuerySchema.safeParse(query)
      expect(result.success).toBe(false)
    })
  })

  describe('Tenant Params Schema', () => {
    it('should validate valid tenant ID', () => {
      const params = {
        id: 'cl1234567890abcdef123456'
      }

      const result = tenantParamsSchema.safeParse(params)
      expect(result.success).toBe(true)
    })

    it('should reject invalid tenant ID', () => {
      const params = {
        id: 'invalid-id'
      }

      const result = tenantParamsSchema.safeParse(params)
      expect(result.success).toBe(false)
    })
  })

  describe('Search Tenants Schema', () => {
    it('should validate search with filters', () => {
      const query = {
        q: 'test restaurant',
        status: 'ACTIVE',
        planId: 'standard'
      }

      const result = searchTenantsSchema.safeParse(query)
      expect(result.success).toBe(true)
    })

    it('should reject empty search query', () => {
      const query = {
        q: ''
      }

      const result = searchTenantsSchema.safeParse(query)
      expect(result.success).toBe(false)
    })

    it('should reject missing search query', () => {
      const query = {}

      const result = searchTenantsSchema.safeParse(query)
      expect(result.success).toBe(false)
    })
  })

  describe('Update Tenant Status Schema', () => {
    it('should validate status update with reason', () => {
      const data = {
        status: 'SUSPENDED',
        reason: 'Payment overdue for 30 days'
      }

      const result = updateTenantStatusSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should validate status update without reason', () => {
      const data = {
        status: 'ACTIVE'
      }

      const result = updateTenantStatusSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject invalid status', () => {
      const data = {
        status: 'INVALID'
      }

      const result = updateTenantStatusSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject reason that is too long', () => {
      const data = {
        status: 'SUSPENDED',
        reason: 'A'.repeat(501)
      }

      const result = updateTenantStatusSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('Update Tenant Subscription Schema', () => {
    it('should validate subscription update', () => {
      const data = {
        subscriptionId: 'cl1234567890abcdef123456',
        planId: 'premium'
      }

      const result = updateTenantSubscriptionSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject invalid subscription ID', () => {
      const data = {
        subscriptionId: 'invalid-id',
        planId: 'premium'
      }

      const result = updateTenantSubscriptionSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject invalid plan ID', () => {
      const data = {
        subscriptionId: 'cl1234567890abcdef123456',
        planId: 'invalid-plan'
      }

      const result = updateTenantSubscriptionSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('Tenant Usage Schema', () => {
    it('should validate usage data', () => {
      const data = {
        tenantId: 'cl1234567890abcdef123456',
        period: '2024-01',
        metrics: {
          users: 5,
          products: 100,
          orders: 500,
          apiCalls: 10000,
          storage: 1000000
        }
      }

      const result = tenantUsageSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject invalid period format', () => {
      const data = {
        tenantId: 'cl1234567890abcdef123456',
        period: '2024/01',
        metrics: {
          users: 5,
          products: 100,
          orders: 500,
          apiCalls: 10000,
          storage: 1000000
        }
      }

      const result = tenantUsageSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject negative metrics', () => {
      const data = {
        tenantId: 'cl1234567890abcdef123456',
        period: '2024-01',
        metrics: {
          users: -1,
          products: 100,
          orders: 500,
          apiCalls: 10000,
          storage: 1000000
        }
      }

      const result = tenantUsageSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('Tenant Limits Schema', () => {
    it('should validate limits data', () => {
      const data = {
        users: 10,
        products: 200,
        orders: 1000,
        apiCalls: 20000,
        storage: 2000000,
        features: ['online_orders', 'delivery', 'analytics']
      }

      const result = tenantLimitsSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should validate unlimited limits (-1)', () => {
      const data = {
        users: -1,
        products: -1,
        orders: -1,
        apiCalls: -1,
        storage: -1,
        features: ['online_orders']
      }

      const result = tenantLimitsSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject empty features array', () => {
      const data = {
        users: 10,
        products: 200,
        orders: 1000,
        apiCalls: 20000,
        storage: 2000000,
        features: []
      }

      const result = tenantLimitsSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject negative limits (except -1)', () => {
      const data = {
        users: -2,
        products: 200,
        orders: 1000,
        apiCalls: 20000,
        storage: 2000000,
        features: ['online_orders']
      }

      const result = tenantLimitsSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('Tenant Settings Schema', () => {
    it('should validate complete settings', () => {
      const settings = {
        timezone: 'America/Sao_Paulo',
        currency: 'BRL',
        language: 'pt-BR',
        theme: {
          primaryColor: '#000000',
          secondaryColor: '#ffffff',
          logo: 'https://example.com/logo.png'
        },
        features: {
          onlineOrders: true,
          delivery: true,
          pickup: true,
          reservations: false,
          loyalty: false,
          analytics: true
        },
        notifications: {
          email: true,
          sms: false,
          push: true
        },
        integrations: {
          stripe: true,
          pos: false,
          inventory: true,
          accounting: false
        }
      }

      const result = tenantSettingsSchema.safeParse(settings)
      expect(result.success).toBe(true)
    })

    it('should reject invalid timezone', () => {
      const settings = {
        timezone: '',
        currency: 'BRL',
        language: 'pt-BR'
      }

      const result = tenantSettingsSchema.safeParse(settings)
      expect(result.success).toBe(false)
    })

    it('should reject invalid color format', () => {
      const settings = {
        timezone: 'America/Sao_Paulo',
        currency: 'BRL',
        language: 'pt-BR',
        theme: {
          primaryColor: 'invalid-color',
          secondaryColor: '#ffffff'
        }
      }

      const result = tenantSettingsSchema.safeParse(settings)
      expect(result.success).toBe(false)
    })

    it('should reject invalid URL for logo', () => {
      const settings = {
        timezone: 'America/Sao_Paulo',
        currency: 'BRL',
        language: 'pt-BR',
        theme: {
          primaryColor: '#000000',
          secondaryColor: '#ffffff',
          logo: 'invalid-url'
        }
      }

      const result = tenantSettingsSchema.safeParse(settings)
      expect(result.success).toBe(false)
    })
  })

  describe('Validation Middleware', () => {
    describe('validateCreateTenant', () => {
      it('should be a function', () => {
        expect(typeof validateCreateTenant).toBe('function')
      })
    })

    describe('validateUpdateTenant', () => {
      it('should be a function', () => {
        expect(typeof validateUpdateTenant).toBe('function')
      })
    })

    describe('validateGetTenants', () => {
      it('should be a function', () => {
        expect(typeof validateGetTenants).toBe('function')
      })
    })

    describe('validateGetTenant', () => {
      it('should be a function', () => {
        expect(typeof validateGetTenant).toBe('function')
      })
    })

    describe('validateSearchTenants', () => {
      it('should be a function', () => {
        expect(typeof validateSearchTenants).toBe('function')
      })
    })

    describe('validateUpdateTenantStatus', () => {
      it('should be a function', () => {
        expect(typeof validateUpdateTenantStatus).toBe('function')
      })
    })

    describe('validateUpdateTenantSubscription', () => {
      it('should be a function', () => {
        expect(typeof validateUpdateTenantSubscription).toBe('function')
      })
    })

    describe('validateTenantUsage', () => {
      it('should be a function', () => {
        expect(typeof validateTenantUsage).toBe('function')
      })
    })

    describe('validateTenantLimits', () => {
      it('should be a function', () => {
        expect(typeof validateTenantLimits).toBe('function')
      })
    })
  })
})
