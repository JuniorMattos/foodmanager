import { PrismaClient } from '@prisma/client'
import { TenantService } from '../../src/services/tenant.service'
import { UserService } from '../../src/services/user.service'
import { TenantRepository } from '../../src/services/repositories/tenant.repository'
import { UserRepository } from '../../src/services/repositories/user.repository'

// Mock the dependencies
jest.mock('../../src/services/repositories/tenant.repository')
jest.mock('../../src/services/repositories/user.repository')
jest.mock('bcryptjs')

describe('UserService', () => {
  let userService: UserService
  let mockPrisma: jest.Mocked<PrismaClient>
  let mockTenantService: jest.Mocked<TenantService>
  let mockTenantRepository: jest.Mocked<TenantRepository>
  let mockUserRepository: jest.Mocked<UserRepository>

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>
    mockTenantRepository = new TenantRepository(mockPrisma) as jest.Mocked<TenantRepository>
    mockUserRepository = new UserRepository(mockPrisma) as jest.Mocked<UserRepository>
    mockTenantService = new TenantService(mockPrisma) as jest.Mocked<TenantService>
    
    userService = new UserService(mockPrisma)
  })

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'StrongP@ssw0rd!',
        role: 'ADMIN',
        tenantId: 'test-tenant-id',
        phone: '+1234567890'
      }

      const expectedTenant = createMockTenant({ id: userData.tenantId })
      const expectedUser = createMockUser(userData)

      mockTenantService.getTenantById.mockResolvedValue(expectedTenant)
      mockTenantService.checkTenantLimits.mockResolvedValue(true)
      mockUserRepository.isEmailAvailable.mockResolvedValue(true)
      mockPrisma.user.create.mockResolvedValue(expectedUser)
      mockPrisma.activity.create.mockResolvedValue({})

      const result = await userService.createUser(userData)

      expect(result).toBeDefined()
      expect(result.email).toBe(userData.email)
      expect(result.name).toBe(userData.name)
      expect(result.role).toBe(userData.role)
      expect(mockTenantService.getTenantById).toHaveBeenCalledWith(userData.tenantId)
      expect(mockTenantService.checkTenantLimits).toHaveBeenCalledWith(userData.tenantId, 'create_user')
      expect(mockUserRepository.isEmailAvailable).toHaveBeenCalledWith(userData.email)
      expect(mockPrisma.user.create).toHaveBeenCalled()
      expect(mockPrisma.activity.create).toHaveBeenCalled()
    })

    it('should throw error if tenant not found', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'StrongP@ssw0rd!',
        role: 'ADMIN',
        tenantId: 'non-existent-tenant-id',
        phone: '+1234567890'
      }

      mockTenantService.getTenantById.mockResolvedValue(null)

      await expect(userService.createUser(userData)).rejects.toThrow('Tenant not found')
      expect(mockTenantService.getTenantById).toHaveBeenCalledWith(userData.tenantId)
    })

    it('should throw error if tenant limits exceeded', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'StrongP@ssw0rd!',
        role: 'ADMIN',
        tenantId: 'test-tenant-id',
        phone: '+1234567890'
      }

      const expectedTenant = createMockTenant({ id: userData.tenantId })

      mockTenantService.getTenantById.mockResolvedValue(expectedTenant)
      mockTenantService.checkTenantLimits.mockResolvedValue(false)

      await expect(userService.createUser(userData)).rejects.toThrow('Tenant user limit exceeded')
      expect(mockTenantService.checkTenantLimits).toHaveBeenCalledWith(userData.tenantId, 'create_user')
    })

    it('should throw error if email not available', async () => {
      const userData = {
        email: 'existing@example.com',
        name: 'Test User',
        password: 'StrongP@ssw0rd!',
        role: 'ADMIN',
        tenantId: 'test-tenant-id',
        phone: '+1234567890'
      }

      const expectedTenant = createMockTenant({ id: userData.tenantId })

      mockTenantService.getTenantById.mockResolvedValue(expectedTenant)
      mockTenantService.checkTenantLimits.mockResolvedValue(true)
      mockUserRepository.isEmailAvailable.mockResolvedValue(false)

      await expect(userService.createUser(userData)).rejects.toThrow('Email is already taken')
      expect(mockUserRepository.isEmailAvailable).toHaveBeenCalledWith(userData.email)
    })
  })

  describe('getUserProfile', () => {
    it('should return user profile', async () => {
      const userId = 'test-user-id'
      const expectedProfile = createMockUser({ id: userId })

      mockUserRepository.findProfile.mockResolvedValue(expectedProfile)

      const result = await userService.getUserProfile(userId)

      expect(result).toEqual(expectedProfile)
      expect(mockUserRepository.findProfile).toHaveBeenCalledWith(userId)
    })

    it('should return null if profile not found', async () => {
      const userId = 'non-existent-id'

      mockUserRepository.findProfile.mockResolvedValue(null)

      const result = await userService.getUserProfile(userId)

      expect(result).toBeNull()
      expect(mockUserRepository.findProfile).toHaveBeenCalledWith(userId)
    })
  })

  describe('authenticateUser', () => {
    it('should authenticate user successfully', async () => {
      const email = 'test@example.com'
      const password = 'StrongP@ssw0rd!'
      const expectedUser = createMockUser({ email })
      const expectedProfile = createMockUser({ email })

      mockUserRepository.findByEmail.mockResolvedValue(expectedUser)
      const bcrypt = require('bcryptjs')
      bcrypt.compare.mockResolvedValue(true)
      mockUserRepository.updateLastLogin.mockResolvedValue(expectedUser)
      mockUserRepository.findProfile.mockResolvedValue(expectedProfile)
      mockPrisma.activity.create.mockResolvedValue({})

      const result = await userService.authenticateUser(email, password)

      expect(result).toEqual(expectedProfile)
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email)
      expect(bcrypt.compare).toHaveBeenCalledWith(password, expectedUser.password)
      expect(mockUserRepository.updateLastLogin).toHaveBeenCalledWith(expectedUser.id)
      expect(mockPrisma.activity.create).toHaveBeenCalled()
    })

    it('should return null if user not found', async () => {
      const email = 'nonexistent@example.com'
      const password = 'StrongP@ssw0rd!'

      mockUserRepository.findByEmail.mockResolvedValue(null)

      const result = await userService.authenticateUser(email, password)

      expect(result).toBeNull()
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email)
    })

    it('should return null if user is inactive', async () => {
      const email = 'inactive@example.com'
      const password = 'StrongP@ssw0rd!'
      const expectedUser = createMockUser({ email, isActive: false })

      mockUserRepository.findByEmail.mockResolvedValue(expectedUser)

      const result = await userService.authenticateUser(email, password)

      expect(result).toBeNull()
    })

    it('should return null if password is invalid', async () => {
      const email = 'test@example.com'
      const password = 'wrong-password'
      const expectedUser = createMockUser({ email })

      mockUserRepository.findByEmail.mockResolvedValue(expectedUser)
      const bcrypt = require('bcryptjs')
      bcrypt.compare.mockResolvedValue(false)

      const result = await userService.authenticateUser(email, password)

      expect(result).toBeNull()
      expect(bcrypt.compare).toHaveBeenCalledWith(password, expectedUser.password)
    })
  })

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = 'test-user-id'
      const updateData = {
        name: 'Updated Name',
        phone: '+9876543210'
      }
      const expectedUser = createMockUser({ id: userId, ...updateData })

      mockUserRepository.update.mockResolvedValue(expectedUser)
      mockPrisma.activity.create.mockResolvedValue({})

      const result = await userService.updateUser(userId, updateData)

      expect(result).toEqual(expectedUser)
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, updateData)
      expect(mockPrisma.activity.create).toHaveBeenCalled()
    })
  })

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      const userId = 'test-user-id'
      const currentPassword = 'OldP@ssw0rd!'
      const newPassword = 'NewP@ssw0rd!'
      const expectedUser = createMockUser({ id: userId })

      mockUserRepository.findById.mockResolvedValue(expectedUser)
      const bcrypt = require('bcryptjs')
      bcrypt.compare.mockResolvedValue(true)
      bcrypt.hash.mockResolvedValue('hashed-new-password')
      mockUserRepository.update.mockResolvedValue(expectedUser)
      mockPrisma.activity.create.mockResolvedValue({})

      await userService.updatePassword(userId, currentPassword, newPassword)

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId)
      expect(bcrypt.compare).toHaveBeenCalledWith(currentPassword, expectedUser.password)
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10)
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, { password: 'hashed-new-password' })
      expect(mockPrisma.activity.create).toHaveBeenCalled()
    })

    it('should throw error if user not found', async () => {
      const userId = 'non-existent-id'
      const currentPassword = 'OldP@ssw0rd!'
      const newPassword = 'NewP@ssw0rd!'

      mockUserRepository.findById.mockResolvedValue(null)

      await expect(userService.updatePassword(userId, currentPassword, newPassword))
        .rejects.toThrow('User not found')
    })

    it('should throw error if current password is incorrect', async () => {
      const userId = 'test-user-id'
      const currentPassword = 'wrong-password'
      const newPassword = 'NewP@ssw0rd!'
      const expectedUser = createMockUser({ id: userId })

      mockUserRepository.findById.mockResolvedValue(expectedUser)
      const bcrypt = require('bcryptjs')
      bcrypt.compare.mockResolvedValue(false)

      await expect(userService.updatePassword(userId, currentPassword, newPassword))
        .rejects.toThrow('Current password is incorrect')
    })
  })

  describe('updateUserRole', () => {
    it('should update user role successfully', async () => {
      const userId = 'test-user-id'
      const newRole = 'MANAGER'
      const expectedUser = createMockUser({ id: userId, role: newRole })

      mockUserRepository.updateRole.mockResolvedValue(expectedUser)
      mockPrisma.activity.create.mockResolvedValue({})

      const result = await userService.updateUserRole(userId, newRole)

      expect(result).toEqual(expectedUser)
      expect(mockUserRepository.updateRole).toHaveBeenCalledWith(userId, newRole)
      expect(mockPrisma.activity.create).toHaveBeenCalled()
    })
  })

  describe('activateUser', () => {
    it('should activate user successfully', async () => {
      const userId = 'test-user-id'
      const expectedUser = createMockUser({ id: userId, isActive: true })

      mockUserRepository.activate.mockResolvedValue(expectedUser)
      mockPrisma.activity.create.mockResolvedValue({})

      const result = await userService.activateUser(userId)

      expect(result).toEqual(expectedUser)
      expect(mockUserRepository.activate).toHaveBeenCalledWith(userId)
      expect(mockPrisma.activity.create).toHaveBeenCalled()
    })
  })

  describe('deactivateUser', () => {
    it('should deactivate user successfully', async () => {
      const userId = 'test-user-id'
      const expectedUser = createMockUser({ id: userId, isActive: false })

      mockUserRepository.deactivate.mockResolvedValue(expectedUser)
      mockPrisma.activity.create.mockResolvedValue({})

      const result = await userService.deactivateUser(userId)

      expect(result).toEqual(expectedUser)
      expect(mockUserRepository.deactivate).toHaveBeenCalledWith(userId)
      expect(mockPrisma.activity.create).toHaveBeenCalled()
    })
  })

  describe('getUsersByTenant', () => {
    it('should return users by tenant', async () => {
      const tenantId = 'test-tenant-id'
      const filters = {
        role: 'ADMIN',
        isActive: true
      }
      const expectedUsers = [
        createMockUser({ tenantId, role: 'ADMIN' }),
        createMockUser({ tenantId, role: 'ADMIN' })
      ]

      mockUserRepository.findByTenant.mockResolvedValue(expectedUsers)

      const result = await userService.getUsersByTenant(tenantId, filters)

      expect(result).toEqual(expectedUsers)
      expect(mockUserRepository.findByTenant).toHaveBeenCalledWith(tenantId, filters)
    })

    it('should return users by tenant without filters', async () => {
      const tenantId = 'test-tenant-id'
      const expectedUsers = [
        createMockUser({ tenantId })
      ]

      mockUserRepository.findByTenant.mockResolvedValue(expectedUsers)

      const result = await userService.getUsersByTenant(tenantId)

      expect(result).toEqual(expectedUsers)
      expect(mockUserRepository.findByTenant).toHaveBeenCalledWith(tenantId, {})
    })
  })

  describe('searchUsers', () => {
    it('should search users successfully', async () => {
      const query = 'test'
      const tenantId = 'test-tenant-id'
      const filters = {
        role: 'ADMIN',
        isActive: true
      }
      const expectedUsers = [
        createMockUser({ name: 'Test User 1' }),
        createMockUser({ name: 'Test User 2' })
      ]

      mockUserRepository.search.mockResolvedValue(expectedUsers)

      const result = await userService.searchUsers(query, tenantId, filters)

      expect(result).toEqual(expectedUsers)
      expect(mockUserRepository.search).toHaveBeenCalledWith(query, tenantId, filters)
    })

    it('should search users without tenant and filters', async () => {
      const query = 'test'
      const expectedUsers = [
        createMockUser({ name: 'Test User' })
      ]

      mockUserRepository.search.mockResolvedValue(expectedUsers)

      const result = await userService.searchUsers(query)

      expect(result).toEqual(expectedUsers)
      expect(mockUserRepository.search).toHaveBeenCalledWith(query, undefined, {})
    })
  })

  describe('getUserStatistics', () => {
    it('should return user statistics', async () => {
      const tenantId = 'test-tenant-id'
      const expectedStats = {
        total: 100,
        active: 80,
        newToday: 5,
        newThisMonth: 25,
        byRole: {
          ADMIN: 10,
          MANAGER: 20,
          VENDOR: 30,
          CUSTOMER: 40
        }
      }

      mockUserRepository.getStatistics.mockResolvedValue(expectedStats)
      mockPrisma.user.findMany.mockResolvedValue([])

      const result = await userService.getUserStatistics(tenantId)

      expect(result).toBeDefined()
      expect(result.totalUsers).toBe(expectedStats.total)
      expect(result.activeUsers).toBe(expectedStats.active)
      expect(result.newUsersToday).toBe(expectedStats.newToday)
      expect(result.newUsersThisMonth).toBe(expectedStats.newThisMonth)
      expect(result.usersByRole).toEqual(expectedStats.byRole)
      expect(mockUserRepository.getStatistics).toHaveBeenCalledWith(tenantId)
    })
  })

  describe('createSession', () => {
    it('should create user session successfully', async () => {
      const sessionData = {
        userId: 'test-user-id',
        tenantId: 'test-tenant-id',
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        expiresAt: new Date(),
        ipAddress: '127.0.0.1',
        userAgent: 'Test Browser'
      }

      const expectedSession = {
        id: 'session-id',
        ...sessionData,
        lastActivity: new Date(),
        isActive: true,
        createdAt: new Date()
      }

      mockPrisma.session.create.mockResolvedValue(expectedSession)

      const result = await userService.createSession(sessionData)

      expect(result).toEqual(expectedSession)
      expect(mockPrisma.session.create).toHaveBeenCalledWith({
        data: sessionData
      })
    })
  })

  describe('invalidateSession', () => {
    it('should invalidate session successfully', async () => {
      const sessionId = 'test-session-id'

      mockPrisma.session.update.mockResolvedValue({})

      await userService.invalidateSession(sessionId)

      expect(mockPrisma.session.update).toHaveBeenCalledWith({
        where: { id: sessionId },
        data: { isActive: false }
      })
    })
  })

  describe('invalidateAllUserSessions', () => {
    it('should invalidate all user sessions successfully', async () => {
      const userId = 'test-user-id'

      mockPrisma.session.updateMany.mockResolvedValue({})

      await userService.invalidateAllUserSessions(userId)

      expect(mockPrisma.session.updateMany).toHaveBeenCalledWith({
        where: { userId },
        data: { isActive: false }
      })
    })
  })

  describe('logActivity', () => {
    it('should log user activity successfully', async () => {
      const activityData = {
        userId: 'test-user-id',
        tenantId: 'test-tenant-id',
        action: 'user_login',
        resource: 'user',
        resourceId: 'test-user-id',
        metadata: { role: 'ADMIN' }
      }

      mockPrisma.activity.create.mockResolvedValue({})

      await userService.logActivity(
        activityData.userId,
        activityData.tenantId,
        activityData.action,
        activityData.resource,
        activityData.resourceId,
        activityData.metadata
      )

      expect(mockPrisma.activity.create).toHaveBeenCalledWith({
        data: activityData
      })
    })
  })

  describe('getUserActivities', () => {
    it('should return user activities', async () => {
      const userId = 'test-user-id'
      const limit = 50
      const expectedActivities = [
        {
          id: 'activity-1',
          userId,
          tenantId: 'test-tenant-id',
          action: 'user_login',
          resource: 'user',
          resourceId: 'test-user-id',
          metadata: {},
          ipAddress: '127.0.0.1',
          userAgent: 'Test Browser',
          timestamp: new Date()
        }
      ]

      mockPrisma.activity.findMany.mockResolvedValue(expectedActivities)

      const result = await userService.getUserActivities(userId, limit)

      expect(result).toHaveLength(1)
      expect(result[0].userId).toBe(userId)
      expect(result[0].action).toBe('user_login')
      expect(mockPrisma.activity.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit
      })
    })
  })

  describe('mapToUser', () => {
    it('should map Prisma user to domain user', () => {
      const prismaUser = {
        id: 'test-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN',
        tenantId: 'test-tenant-id',
        avatar: 'https://example.com/avatar.png',
        phone: '+1234567890',
        lastLoginAt: new Date(),
        isActive: true,
        emailVerified: true,
        phoneVerified: false,
        preferences: {},
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const result = (userService as any).mapToUser(prismaUser)

      expect(result.id).toBe(prismaUser.id)
      expect(result.email).toBe(prismaUser.email)
      expect(result.name).toBe(prismaUser.name)
      expect(result.role).toBe(prismaUser.role)
      expect(result.permissions).toContain('read')
      expect(result.permissions).toContain('write')
    })
  })

  describe('getUserPermissions', () => {
    it('should return correct permissions for ADMIN role', () => {
      const result = (userService as any).getUserPermissions('ADMIN')

      expect(result).toContain('read')
      expect(result).toContain('write')
      expect(result).toContain('delete')
      expect(result).toContain('manage_users')
      expect(result).toContain('manage_billing')
      expect(result).toContain('manage_tenant')
      expect(result).toContain('view_analytics')
      expect(result).toContain('manage_settings')
    })

    it('should return correct permissions for MANAGER role', () => {
      const result = (userService as any).getUserPermissions('MANAGER')

      expect(result).toContain('read')
      expect(result).toContain('write')
      expect(result).toContain('delete')
      expect(result).toContain('manage_inventory')
      expect(result).toContain('manage_orders')
      expect(result).toContain('manage_staff')
      expect(result).toContain('view_analytics')
      expect(result).toContain('manage_menu')
    })

    it('should return empty array for unknown role', () => {
      const result = (userService as any).getUserPermissions('UNKNOWN')

      expect(result).toEqual([])
    })
  })

  describe('getDefaultUserPreferences', () => {
    it('should return default user preferences', () => {
      const result = (userService as any).getDefaultUserPreferences()

      expect(result.language).toBe('pt-BR')
      expect(result.timezone).toBe('America/Sao_Paulo')
      expect(result.theme).toBe('light')
      expect(result.notifications).toBeDefined()
      expect(result.dashboard).toBeDefined()
      expect(result.privacy).toBeDefined()
    })
  })
})
