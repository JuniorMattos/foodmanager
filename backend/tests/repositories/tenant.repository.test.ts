import { PrismaClient } from '@prisma/client'
import { TenantRepository } from '../../src/services/repositories/tenant.repository'
import { TenantStatus } from '../../src/services/domain/tenant.domain'

describe('TenantRepository', () => {
  let tenantRepository: TenantRepository
  let mockPrisma: jest.Mocked<PrismaClient>
  let mockTenantModel: jest.Mocked<any>

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>
    mockTenantModel = {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    }
    
    Object.defineProperty(mockPrisma, 'tenant', {
      value: mockTenantModel,
      writable: true
    })
    tenantRepository = new TenantRepository(mockPrisma)
  })

  describe('findBySlug', () => {
    it('should find tenant by slug with users', async () => {
      const expectedTenant = createMockTenant({ 
        slug: 'test-tenant',
        users: [createMockUser()]
      })
      
      mockTenantModel.findUnique.mockResolvedValue(expectedTenant)

      const result = await tenantRepository.findBySlug('test-tenant')

      expect(result).toEqual(expectedTenant)
      expect(mockTenantModel.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-tenant' },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              isActive: true,
            },
          },
        },
      })
    })

    it('should return null when tenant not found by slug', async () => {
      mockTenantModel.findUnique.mockResolvedValue(null)

      const result = await tenantRepository.findBySlug('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('findByDomain', () => {
    it('should find tenant by domain with users', async () => {
      const expectedTenant = createMockTenant({ 
        domain: 'test.foodmanager.com',
        users: [createMockUser()]
      })
      
      mockTenantModel.findUnique.mockResolvedValue(expectedTenant)

      const result = await tenantRepository.findByDomain('test.foodmanager.com')

      expect(result).toEqual(expectedTenant)
      expect(mockTenantModel.findUnique).toHaveBeenCalledWith({
        where: { domain: 'test.foodmanager.com' },
        include: {
          users: true,
        },
      })
    })

    it('should return null when tenant not found by domain', async () => {
      mockTenantModel.findUnique.mockResolvedValue(null)

      const result = await tenantRepository.findByDomain('nonexistent.com')

      expect(result).toBeNull()
    })
  })

  describe('findByStatus', () => {
    it('should find tenants by status', async () => {
      const expectedTenants = [
        createMockTenant({ status: TenantStatus.ACTIVE }),
        createMockTenant({ status: TenantStatus.ACTIVE })
      ]
      
      mockTenantModel.findMany.mockResolvedValue(expectedTenants)

      const result = await tenantRepository.findByStatus(TenantStatus.ACTIVE)

      expect(result).toEqual(expectedTenants)
      expect(mockTenantModel.findMany).toHaveBeenCalledWith({
        where: { status: TenantStatus.ACTIVE },
        include: {
          users: {
            where: { isActive: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    })
  })

  describe('findActiveWithUsage', () => {
    it('should find active tenants with usage counts', async () => {
      const expectedTenants = [
        createMockTenant({ 
          status: TenantStatus.ACTIVE,
          _count: {
            users: 10,
            products: 100,
            orders: 500
          }
        })
      ]
      
      mockTenantModel.findMany.mockResolvedValue(expectedTenants)

      const result = await tenantRepository.findActiveWithUsage()

      expect(result).toEqual(expectedTenants)
      expect(mockTenantModel.findMany).toHaveBeenCalledWith({
        where: { status: TenantStatus.ACTIVE },
        include: {
          users: {
            where: { isActive: true },
          },
          _count: {
            select: {
              users: true,
              products: true,
              orders: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    })
  })

  describe('updateStatus', () => {
    it('should update tenant status', async () => {
      const expectedTenant = createMockTenant({ 
        id: 'tenant-1', 
        status: TenantStatus.SUSPENDED 
      })
      mockTenantModel.update.mockResolvedValue(expectedTenant)

      const result = await tenantRepository.updateStatus('tenant-1', TenantStatus.SUSPENDED)

      expect(result).toEqual(expectedTenant)
      expect(mockTenantModel.update).toHaveBeenCalledWith({
        where: { id: 'tenant-1' },
        data: {
          status: TenantStatus.SUSPENDED,
        },
      })
    })
  })

  describe('updateSubscription', () => {
    it('should update tenant subscription', async () => {
      const expectedTenant = createMockTenant({ 
        id: 'tenant-1', 
        subscriptionId: 'sub-123',
        planId: 'premium'
      })
      mockTenantModel.update.mockResolvedValue(expectedTenant)

      const result = await tenantRepository.updateSubscription('tenant-1', 'sub-123', 'premium')

      expect(result).toEqual(expectedTenant)
      expect(mockTenantModel.update).toHaveBeenCalledWith({
        where: { id: 'tenant-1' },
        data: {
          subscriptionId: 'sub-123',
          planId: 'premium',
        },
      })
    })
  })

  describe('getStatistics', () => {
    it('should return tenant statistics', async () => {
      const mockStats = { _count: { id: 100 } }
      const mockStatusCounts = [
        { status: 'ACTIVE', _count: { id: 80 } },
        { status: 'TRIAL', _count: { id: 15 } },
        { status: 'SUSPENDED', _count: { id: 3 } },
        { status: 'CANCELLED', _count: { id: 2 } }
      ]

      jest.spyOn(tenantRepository, 'aggregate').mockResolvedValue(mockStats)
      mockTenantModel.groupBy.mockResolvedValue(mockStatusCounts)

      const result = await tenantRepository.getStatistics()

      expect(result).toEqual({
        total: 100,
        active: 80,
        trial: 15,
        suspended: 3,
        cancelled: 2,
      })
    })

    it('should handle missing status counts', async () => {
      const mockStats = { _count: { id: 50 } }
      const mockStatusCounts = [
        { status: 'ACTIVE', _count: { id: 40 } },
        { status: 'TRIAL', _count: { id: 10 } }
      ]

      jest.spyOn(tenantRepository, 'aggregate').mockResolvedValue(mockStats)
      mockTenantModel.groupBy.mockResolvedValue(mockStatusCounts)

      const result = await tenantRepository.getStatistics()

      expect(result).toEqual({
        total: 50,
        active: 40,
        trial: 10,
        suspended: 0,
        cancelled: 0,
      })
    })
  })

  describe('isSlugAvailable', () => {
    it('should return true when slug is available', async () => {
      mockTenantModel.findUnique.mockResolvedValue(null)

      const result = await tenantRepository.isSlugAvailable('new-tenant')

      expect(result).toBe(true)
      expect(mockTenantModel.findUnique).toHaveBeenCalledWith({
        where: { slug: 'new-tenant' },
        select: { id: true },
      })
    })

    it('should return false when slug is taken', async () => {
      mockTenantModel.findUnique.mockResolvedValue({ id: 'existing-tenant' })

      const result = await tenantRepository.isSlugAvailable('taken-slug')

      expect(result).toBe(false)
    })

    it('should return true when slug belongs to same tenant (excludeId)', async () => {
      mockTenantModel.findUnique.mockResolvedValue({ id: 'tenant-1' })

      const result = await tenantRepository.isSlugAvailable('tenant-slug', 'tenant-1')

      expect(result).toBe(true)
    })

    it('should return false when slug belongs to different tenant', async () => {
      mockTenantModel.findUnique.mockResolvedValue({ id: 'tenant-2' })

      const result = await tenantRepository.isSlugAvailable('tenant-slug', 'tenant-1')

      expect(result).toBe(false)
    })
  })

  describe('findByPlan', () => {
    it('should find tenants by plan', async () => {
      const expectedTenants = [
        createMockTenant({ planId: 'standard' }),
        createMockTenant({ planId: 'standard' })
      ]
      
      mockTenantModel.findMany.mockResolvedValue(expectedTenants)

      const result = await tenantRepository.findByPlan('standard')

      expect(result).toEqual(expectedTenants)
      expect(mockTenantModel.findMany).toHaveBeenCalledWith({
        where: { planId: 'standard' },
        include: {
          users: {
            where: { isActive: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    })
  })

  describe('search', () => {
    it('should search tenants by name', async () => {
      const expectedTenants = [createMockTenant({ name: 'Test Restaurant' })]
      mockTenantModel.findMany.mockResolvedValue(expectedTenants)

      const result = await tenantRepository.search('Test')

      expect(result).toEqual(expectedTenants)
      expect(mockTenantModel.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'Test', mode: 'insensitive' } },
            { slug: { contains: 'Test', mode: 'insensitive' } },
            { domain: { contains: 'Test', mode: 'insensitive' } },
          ],
        },
        include: {
          users: {
            where: { isActive: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    })

    it('should search tenants with status filter', async () => {
      const expectedTenants = [createMockTenant({ status: TenantStatus.ACTIVE })]
      mockTenantModel.findMany.mockResolvedValue(expectedTenants)

      const result = await tenantRepository.search('Test', {
        status: TenantStatus.ACTIVE
      })

      expect(mockTenantModel.findMany).toHaveBeenCalledWith({
        where: {
          status: TenantStatus.ACTIVE,
          OR: [
            { name: { contains: 'Test', mode: 'insensitive' } },
            { slug: { contains: 'Test', mode: 'insensitive' } },
            { domain: { contains: 'Test', mode: 'insensitive' } },
          ],
        },
        include: {
          users: {
            where: { isActive: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    })

    it('should search tenants with plan filter', async () => {
      const expectedTenants = [createMockTenant({ planId: 'premium' })]
      mockTenantModel.findMany.mockResolvedValue(expectedTenants)

      const result = await tenantRepository.search('Test', {
        planId: 'premium'
      })

      expect(mockTenantModel.findMany).toHaveBeenCalledWith({
        where: {
          planId: 'premium',
          OR: [
            { name: { contains: 'Test', mode: 'insensitive' } },
            { slug: { contains: 'Test', mode: 'insensitive' } },
            { domain: { contains: 'Test', mode: 'insensitive' } },
          ],
        },
        include: {
          users: {
            where: { isActive: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    })

    it('should search tenants with multiple filters', async () => {
      const expectedTenants = [createMockTenant()]
      mockTenantModel.findMany.mockResolvedValue(expectedTenants)

      const result = await tenantRepository.search('Test', {
        status: TenantStatus.ACTIVE,
        planId: 'standard'
      })

      expect(mockTenantModel.findMany).toHaveBeenCalledWith({
        where: {
          status: TenantStatus.ACTIVE,
          planId: 'standard',
          OR: [
            { name: { contains: 'Test', mode: 'insensitive' } },
            { slug: { contains: 'Test', mode: 'insensitive' } },
            { domain: { contains: 'Test', mode: 'insensitive' } },
          ],
        },
        include: {
          users: {
            where: { isActive: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    })
  })

  describe('findWithFullDetails', () => {
    it('should find tenant with full details', async () => {
      const expectedTenant = createMockTenant({
        users: [createMockUser({ sessions: [createMockSession()] })],
        products: [createMockProduct()],
        categories: [createMockCategory()],
        orders: [createMockOrder()],
        _count: {
          users: 10,
          products: 100,
          categories: 20,
          orders: 500
        }
      })
      
      mockTenantModel.findUnique.mockResolvedValue(expectedTenant)

      const result = await tenantRepository.findWithFullDetails('tenant-1')

      expect(result).toEqual(expectedTenant)
      expect(mockTenantModel.findUnique).toHaveBeenCalledWith({
        where: { id: 'tenant-1' },
        include: {
          users: {
            include: {
              sessions: true,
            },
          },
          products: true,
          categories: true,
          orders: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 10,
          },
          _count: {
            select: {
              users: true,
              products: true,
              categories: true,
              orders: true,
            },
          },
        },
      })
    })

    it('should return null when tenant not found', async () => {
      mockTenantModel.findUnique.mockResolvedValue(null)

      const result = await tenantRepository.findWithFullDetails('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('softDelete', () => {
    it('should soft delete tenant (set to inactive)', async () => {
      const expectedTenant = createMockTenant({ 
        id: 'tenant-1', 
        status: TenantStatus.INACTIVE 
      })
      mockTenantModel.update.mockResolvedValue(expectedTenant)

      const result = await tenantRepository.softDelete('tenant-1')

      expect(result).toEqual(expectedTenant)
      expect(mockTenantModel.update).toHaveBeenCalledWith({
        where: { id: 'tenant-1' },
        data: {
          status: TenantStatus.INACTIVE,
        },
      })
    })
  })

  describe('reactivate', () => {
    it('should reactivate tenant', async () => {
      const expectedTenant = createMockTenant({ 
        id: 'tenant-1', 
        status: TenantStatus.ACTIVE 
      })
      mockTenantModel.update.mockResolvedValue(expectedTenant)

      const result = await tenantRepository.reactivate('tenant-1')

      expect(result).toEqual(expectedTenant)
      expect(mockTenantModel.update).toHaveBeenCalledWith({
        where: { id: 'tenant-1' },
        data: {
          status: TenantStatus.ACTIVE,
        },
      })
    })
  })
})

// Helper functions to create mock data
function createMockTenant(overrides: any = {}) {
  return {
    id: 'tenant-1',
    name: 'Test Tenant',
    slug: 'test-tenant',
    domain: 'test.foodmanager.com',
    logo: null,
    settings: {
      timezone: 'America/Sao_Paulo',
      currency: 'BRL',
      language: 'pt-BR',
      theme: {
        primaryColor: '#000000',
        secondaryColor: '#ffffff',
        logo: null,
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
    ...overrides,
  }
}

function createMockUser(overrides: any = {}) {
  return {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'ADMIN',
    isActive: true,
    createdAt: new Date(),
    ...overrides,
  }
}

function createMockSession(overrides: any = {}) {
  return {
    id: 'session-1',
    userId: 'user-1',
    isActive: true,
    createdAt: new Date(),
    ...overrides,
  }
}

function createMockProduct(overrides: any = {}) {
  return {
    id: 'product-1',
    name: 'Test Product',
    price: 10.99,
    createdAt: new Date(),
    ...overrides,
  }
}

function createMockCategory(overrides: any = {}) {
  return {
    id: 'category-1',
    name: 'Test Category',
    createdAt: new Date(),
    ...overrides,
  }
}

function createMockOrder(overrides: any = {}) {
  return {
    id: 'order-1',
    total: 25.99,
    status: 'COMPLETED',
    createdAt: new Date(),
    ...overrides,
  }
}
