import { PrismaClient } from '@prisma/client'
import { UserRepository } from '../../src/services/repositories/user.repository'
import { UserRole } from '../../src/services/domain/user.domain'

describe('UserRepository', () => {
  let userRepository: UserRepository
  let mockPrisma: jest.Mocked<PrismaClient>
  let mockUserModel: jest.Mocked<any>

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>
    mockUserModel = {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    }
    
    Object.defineProperty(mockPrisma, 'user', {
      value: mockUserModel,
      writable: true
    })
    userRepository = new UserRepository(mockPrisma)
  })

  describe('findByEmail', () => {
    it('should find user by email with tenant and active sessions', async () => {
      const expectedUser = createMockUser({ 
        email: 'test@example.com',
        tenant: createMockTenant(),
        sessions: [createMockSession()]
      })
      
      mockUserModel.findUnique.mockResolvedValue(expectedUser)

      const result = await userRepository.findByEmail('test@example.com')

      expect(result).toEqual(expectedUser)
      expect(mockUserModel.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: {
          tenant: true,
          sessions: {
            where: { isActive: true },
          },
        },
      })
    })

    it('should return null when user not found by email', async () => {
      mockUserModel.findUnique.mockResolvedValue(null)

      const result = await userRepository.findByEmail('nonexistent@example.com')

      expect(result).toBeNull()
    })
  })

  describe('findByTenant', () => {
    it('should find users by tenant ID', async () => {
      const expectedUsers = [
        createMockUser({ tenantId: 'tenant-1' }),
        createMockUser({ tenantId: 'tenant-1' })
      ]
      
      mockUserModel.findMany.mockResolvedValue(expectedUsers)

      const result = await userRepository.findByTenant('tenant-1')

      expect(result).toEqual(expectedUsers)
      expect(mockUserModel.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        include: {
          sessions: {
            where: { isActive: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    })

    it('should find users by tenant with role filter', async () => {
      const expectedUsers = [createMockUser({ 
        tenantId: 'tenant-1', 
        role: UserRole.ADMIN 
      })]
      
      mockUserModel.findMany.mockResolvedValue(expectedUsers)

      const result = await userRepository.findByTenant('tenant-1', { 
        role: UserRole.ADMIN 
      })

      expect(result).toEqual(expectedUsers)
      expect(mockUserModel.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1', role: UserRole.ADMIN },
        include: {
          sessions: {
            where: { isActive: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    })
  })

  describe('findProfile', () => {
    it('should return user profile with tenant info', async () => {
      const mockUser = createMockUser({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.ADMIN,
        tenantId: 'tenant-1',
        tenant: {
          id: 'tenant-1',
          name: 'Test Tenant',
          slug: 'test-tenant',
          planId: 'standard'
        }
      })
      
      mockUserModel.findUnique.mockResolvedValue(mockUser)

      const result = await userRepository.findProfile('user-1')

      expect(result).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.ADMIN,
        tenantId: 'tenant-1',
        avatar: undefined,
        phone: undefined,
        lastLoginAt: undefined,
        isActive: true,
        emailVerified: true,
        tenant: {
          id: 'tenant-1',
          name: 'Test Tenant',
          slug: 'test-tenant',
          planId: 'standard'
        },
        permissions: [
          'read', 'write', 'delete',
          'manage_users', 'manage_billing', 'manage_tenant',
          'view_analytics', 'manage_settings'
        ],
        createdAt: expect.any(Date)
      })
    })

    it('should return null when user not found', async () => {
      mockUserModel.findUnique.mockResolvedValue(null)

      const result = await userRepository.findProfile('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('updateLastLogin', () => {
    it('should update user last login timestamp', async () => {
      const expectedUser = createMockUser({ id: 'user-1' })
      mockUserModel.update.mockResolvedValue(expectedUser)

      const result = await userRepository.updateLastLogin('user-1')

      expect(result).toEqual(expectedUser)
      expect(mockUserModel.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          lastLoginAt: expect.any(Date),
        },
      })
    })
  })

  describe('activate', () => {
    it('should activate user and verify email', async () => {
      const expectedUser = createMockUser({ 
        id: 'user-1', 
        isActive: true, 
        emailVerified: true 
      })
      mockUserModel.update.mockResolvedValue(expectedUser)

      const result = await userRepository.activate('user-1')

      expect(result).toEqual(expectedUser)
      expect(mockUserModel.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          isActive: true,
          emailVerified: true,
        },
      })
    })
  })

  describe('deactivate', () => {
    it('should deactivate user', async () => {
      const expectedUser = createMockUser({ 
        id: 'user-1', 
        isActive: false 
      })
      mockUserModel.update.mockResolvedValue(expectedUser)

      const result = await userRepository.deactivate('user-1')

      expect(result).toEqual(expectedUser)
      expect(mockUserModel.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          isActive: false,
        },
      })
    })
  })

  describe('updateRole', () => {
    it('should update user role', async () => {
      const expectedUser = createMockUser({ 
        id: 'user-1', 
        role: UserRole.MANAGER 
      })
      mockUserModel.update.mockResolvedValue(expectedUser)

      const result = await userRepository.updateRole('user-1', UserRole.MANAGER)

      expect(result).toEqual(expectedUser)
      expect(mockUserModel.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          role: UserRole.MANAGER,
        },
      })
    })
  })

  describe('isEmailAvailable', () => {
    it('should return true when email is available', async () => {
      mockUserModel.findUnique.mockResolvedValue(null)

      const result = await userRepository.isEmailAvailable('new@example.com')

      expect(result).toBe(true)
      expect(mockUserModel.findUnique).toHaveBeenCalledWith({
        where: { email: 'new@example.com' },
        select: { id: true },
      })
    })

    it('should return false when email is taken', async () => {
      mockUserModel.findUnique.mockResolvedValue({ id: 'existing-user' })

      const result = await userRepository.isEmailAvailable('taken@example.com')

      expect(result).toBe(false)
    })

    it('should return true when email belongs to same user (excludeId)', async () => {
      mockUserModel.findUnique.mockResolvedValue({ id: 'user-1' })

      const result = await userRepository.isEmailAvailable('user@example.com', 'user-1')

      expect(result).toBe(true)
    })

    it('should return false when email belongs to different user', async () => {
      mockUserModel.findUnique.mockResolvedValue({ id: 'user-2' })

      const result = await userRepository.isEmailAvailable('user@example.com', 'user-1')

      expect(result).toBe(false)
    })
  })

  describe('updatePreferences', () => {
    it('should update user preferences', async () => {
      const preferences = { theme: 'dark', language: 'pt-BR' }
      const expectedUser = createMockUser({ id: 'user-1', preferences })
      mockUserModel.update.mockResolvedValue(expectedUser)

      const result = await userRepository.updatePreferences('user-1', preferences)

      expect(result).toEqual(expectedUser)
      expect(mockUserModel.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          preferences,
        },
      })
    })
  })

  describe('findActiveWithActivity', () => {
    it('should find active users with recent activity', async () => {
      const expectedUsers = [createMockUser({ 
        tenantId: 'tenant-1',
        isActive: true,
        lastLoginAt: new Date()
      })]
      mockUserModel.findMany.mockResolvedValue(expectedUsers)

      const result = await userRepository.findActiveWithActivity('tenant-1', 30)

      expect(result).toEqual(expectedUsers)
      expect(mockUserModel.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: 'tenant-1',
          isActive: true,
          lastLoginAt: {
            gte: expect.any(Date),
          },
        },
        include: {
          sessions: {
            where: { isActive: true },
          },
        },
        orderBy: {
          lastLoginAt: 'desc',
        },
      })
    })
  })

  describe('getUserPermissions', () => {
    it('should return correct permissions for ADMIN role', () => {
      const repository = new UserRepository(mockPrisma)
      const permissions = (repository as any).getUserPermissions(UserRole.ADMIN)

      expect(permissions).toEqual([
        'read', 'write', 'delete',
        'manage_users', 'manage_billing', 'manage_tenant',
        'view_analytics', 'manage_settings'
      ])
    })

    it('should return correct permissions for MANAGER role', () => {
      const repository = new UserRepository(mockPrisma)
      const permissions = (repository as any).getUserPermissions(UserRole.MANAGER)

      expect(permissions).toEqual([
        'read', 'write', 'delete',
        'manage_inventory', 'manage_orders', 'manage_staff',
        'view_analytics', 'manage_menu'
      ])
    })

    it('should return correct permissions for VENDOR role', () => {
      const repository = new UserRepository(mockPrisma)
      const permissions = (repository as any).getUserPermissions(UserRole.VENDOR)

      expect(permissions).toEqual([
        'read', 'write',
        'manage_orders', 'manage_inventory', 'view_reports'
      ])
    })

    it('should return correct permissions for STAFF role', () => {
      const repository = new UserRepository(mockPrisma)
      const permissions = (repository as any).getUserPermissions(UserRole.STAFF)

      expect(permissions).toEqual([
        'read', 'write',
        'manage_orders', 'manage_inventory'
      ])
    })

    it('should return correct permissions for CUSTOMER role', () => {
      const repository = new UserRepository(mockPrisma)
      const permissions = (repository as any).getUserPermissions(UserRole.CUSTOMER)

      expect(permissions).toEqual([
        'read', 'create_orders', 'view_menu'
      ])
    })

    it('should return empty array for unknown role', () => {
      const repository = new UserRepository(mockPrisma)
      const permissions = (repository as any).getUserPermissions('UNKNOWN' as UserRole)

      expect(permissions).toEqual([])
    })
  })
})

// Helper functions to create mock data
function createMockUser(overrides: any = {}) {
  return {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.ADMIN,
    tenantId: 'tenant-1',
    avatar: null,
    phone: null,
    lastLoginAt: null,
    isActive: true,
    emailVerified: true,
    phoneVerified: false,
    preferences: {},
    permissions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

function createMockTenant(overrides: any = {}) {
  return {
    id: 'tenant-1',
    name: 'Test Tenant',
    slug: 'test-tenant',
    planId: 'standard',
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
