import { PrismaClient } from '@prisma/client'
import { TenantService } from '../../src/services/tenant.service'
import { TenantStatus } from '../../src/services/domain/tenant.domain'

// Mock the dependencies
jest.mock('../../src/services/stripe', () => ({
  BILLING_PLANS: [
    {
      id: 'basic',
      name: 'Basic',
      price: 4900,
      limits: { users: 5, products: 50, orders: 500, apiCalls: 10000, storage: 1000000 }
    },
    {
      id: 'standard',
      name: 'Standard', 
      price: 9900,
      limits: { users: 10, products: 200, orders: 1000, apiCalls: 20000, storage: 2000000 }
    }
  ]
}))

describe('TenantService', () => {
  let tenantService: TenantService
  let mockPrisma: jest.Mocked<PrismaClient>

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>
    
    // Setup Prisma model mocks
    const mockTenantModel = {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    }
    const mockUserModel = {
      create: jest.fn(),
    }
    const mockProductModel = {
      count: jest.fn(),
    }
    const mockOrderModel = {
      count: jest.fn(),
    }
    
    Object.defineProperty(mockPrisma, 'tenant', {
      value: mockTenantModel,
      writable: true
    })
    Object.defineProperty(mockPrisma, 'user', {
      value: mockUserModel,
      writable: true
    })
    Object.defineProperty(mockPrisma, 'product', {
      value: mockProductModel,
      writable: true
    })
    Object.defineProperty(mockPrisma, 'order', {
      value: mockOrderModel,
      writable: true
    })
    
    tenantService = new TenantService(mockPrisma)
  })

  describe('getTenantById', () => {
    it('should return tenant by ID', async () => {
      const expectedTenant = createMockTenant()
      mockPrisma.tenant.findUnique.mockResolvedValue(expectedTenant)

      const result = await tenantService.getTenantById('tenant-1')

      expect(result).toBeDefined()
      expect(result?.id).toBe('tenant-1')
      expect(mockPrisma.tenant.findUnique).toHaveBeenCalledWith({
        where: { id: 'tenant-1' },
        include: {
          _count: {
            select: {
              categories: true,
              orders: true,
              products: true,
              users: true,
            },
          },
          categories: true,
          orders: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 10,
          },
          products: true,
          users: {
            include: {
              sessions: true,
            },
          },
        },
      })
    })

    it('should return null when tenant not found', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(null)

      const result = await tenantService.getTenantById('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('getTenantBySlug', () => {
    it('should return tenant by slug', async () => {
      const expectedTenant = createMockTenant({ slug: 'test-tenant' })
      mockPrisma.tenant.findUnique.mockResolvedValue(expectedTenant)

      const result = await tenantService.getTenantBySlug('test-tenant')

      expect(result).toBeDefined()
      expect(result?.slug).toBe('test-tenant')
    })
  })

  describe('getTenantByDomain', () => {
    it('should return tenant by domain', async () => {
      const expectedTenant = createMockTenant({ domain: 'test.foodmanager.com' })
      mockPrisma.tenant.findUnique.mockResolvedValue(expectedTenant)

      const result = await tenantService.getTenantByDomain('test.foodmanager.com')

      expect(result).toBeDefined()
      expect(result?.domain).toBe('test.foodmanager.com')
    })
  })

  describe('updateTenant', () => {
    it('should update tenant successfully', async () => {
      const updateData = { name: 'Updated Restaurant' }
      const expectedTenant = createMockTenant(updateData)
      
      mockPrisma.tenant.update.mockResolvedValue(expectedTenant)

      const result = await tenantService.updateTenant('tenant-1', updateData)

      expect(result).toBeDefined()
      expect(result.name).toBe(updateData.name)
    })
  })

  describe('activateTenant', () => {
    it('should activate tenant successfully', async () => {
      const expectedTenant = createMockTenant({ status: TenantStatus.ACTIVE })
      mockPrisma.tenant.update.mockResolvedValue(expectedTenant)

      const result = await tenantService.activateTenant('tenant-1')

      expect(result).toBeDefined()
      expect(result.status).toBe(TenantStatus.ACTIVE)
    })
  })

  describe('suspendTenant', () => {
    it('should suspend tenant successfully', async () => {
      const expectedTenant = createMockTenant({ status: TenantStatus.SUSPENDED })
      mockPrisma.tenant.update.mockResolvedValue(expectedTenant)

      const result = await tenantService.suspendTenant('tenant-1')

      expect(result).toBeDefined()
      expect(result.status).toBe(TenantStatus.SUSPENDED)
    })
  })

  describe('cancelTenant', () => {
    it('should cancel tenant successfully', async () => {
      const expectedTenant = createMockTenant({ status: TenantStatus.CANCELLED })
      mockPrisma.tenant.update.mockResolvedValue(expectedTenant)

      const result = await tenantService.cancelTenant('tenant-1')

      expect(result).toBeDefined()
      expect(result.status).toBe(TenantStatus.CANCELLED)
    })
  })
})

// Helper function to create mock data
function createMockTenant(overrides: any = {}) {
  return {
    id: 'tenant-1',
    name: 'Test Restaurant',
    slug: 'test-restaurant',
    domain: 'test.foodmanager.com',
    logo: null,
    settings: {
      timezone: 'America/Sao_Paulo',
      currency: 'BRL',
      language: 'pt-BR',
      theme: {
        primaryColor: '#3b82f6',
        secondaryColor: '#10b981',
      },
      features: {
        onlineOrders: true,
        delivery: true,
        pickup: true,
        reservations: false,
        loyalty: false,
        analytics: true,
      },
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      integrations: {
        stripe: true,
        pos: false,
        inventory: true,
        accounting: false,
      },
    },
    status: TenantStatus.ACTIVE,
    subscriptionId: 'sub-123',
    planId: 'standard',
    createdAt: new Date(),
    updatedAt: new Date(),
    users: [],
    ...overrides,
  }
}
