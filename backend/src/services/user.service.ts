import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { UserRepository } from './repositories/user.repository'
import { TenantService } from './tenant.service'
import { 
  User, 
  UserRole, 
  UserProfile, 
  UserSession,
  UserActivity,
  UserMetrics 
} from './domain/user.domain'

export class UserService {
  private userRepository: UserRepository
  private tenantService: TenantService
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
    this.userRepository = new UserRepository(prisma)
    this.tenantService = new TenantService(prisma)
  }

  /**
   * Create new user
   */
  async createUser(data: {
    email: string
    name: string
    password: string
    role: UserRole
    tenantId: string
    phone?: string
  }): Promise<User> {
    // Validate tenant exists
    const tenant = await this.tenantService.getTenantById(data.tenantId)
    if (!tenant) {
      throw new Error('Tenant not found')
    }

    // Check tenant limits for user creation
    const canCreateUser = await this.tenantService.checkTenantLimits(data.tenantId, 'create_user')
    if (!canCreateUser) {
      throw new Error('Tenant user limit exceeded')
    }

    // Check email availability
    const isEmailAvailable = await this.userRepository.isEmailAvailable(data.email)
    if (!isEmailAvailable) {
      throw new Error('Email is already taken')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create user
    const user = await this.userRepository.create({
      email: data.email,
      name: data.name,
      password: hashedPassword,
      role: data.role,
      tenantId: data.tenantId,
      phone: data.phone,
      isActive: true,
      emailVerified: false,
      preferences: this.getDefaultUserPreferences(),
    })

    // Create activity log
    await this.logActivity(user.id, data.tenantId, 'user_created', 'user', user.id, {
      role: data.role,
    })

    return this.mapToUser(user)
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return await this.userRepository.findProfile(userId)
  }

  /**
   * Authenticate user
   */
  async authenticateUser(email: string, password: string): Promise<UserProfile | null> {
    const user = await this.userRepository.findByEmail(email)
    
    if (!user || !user.isActive) {
      return null
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return null
    }

    // Update last login
    await this.userRepository.updateLastLogin(user.id)

    // Log activity
    await this.logActivity(user.id, user.tenantId, 'user_login', 'user', user.id)

    return this.userRepository.findProfile(user.id)
  }

  /**
   * Update user
   */
  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    const user = await this.userRepository.update(userId, data)
    
    // Log activity
    await this.logActivity(userId, user.tenantId, 'user_updated', 'user', userId, data)

    return this.mapToUser(user)
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect')
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    await this.userRepository.update(userId, { password: hashedNewPassword })

    // Log activity
    await this.logActivity(userId, user.tenantId, 'password_changed', 'user', userId)
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    const user = await this.userRepository.updateRole(userId, role)
    
    // Log activity
    await this.logActivity(userId, user.tenantId, 'role_changed', 'user', userId, { newRole: role })

    return this.mapToUser(user)
  }

  /**
   * Activate user
   */
  async activateUser(userId: string): Promise<User> {
    const user = await this.userRepository.activate(userId)
    
    // Log activity
    await this.logActivity(userId, user.tenantId, 'user_activated', 'user', userId)

    return this.mapToUser(user)
  }

  /**
   * Deactivate user
   */
  async deactivateUser(userId: string): Promise<User> {
    const user = await this.userRepository.deactivate(userId)
    
    // Log activity
    await this.logActivity(userId, user.tenantId, 'user_deactivated', 'user', userId)

    return this.mapToUser(user)
  }

  /**
   * Get users by tenant
   */
  async getUsersByTenant(tenantId: string, filters?: {
    role?: UserRole
    isActive?: boolean
  }): Promise<User[]> {
    const users = await this.userRepository.findByTenant(tenantId, filters)
    return users.map(user => this.mapToUser(user))
  }

  /**
   * Search users
   */
  async searchUsers(query: string, tenantId?: string, filters?: {
    role?: UserRole
    isActive?: boolean
  }): Promise<User[]> {
    const users = await this.userRepository.search(query, tenantId, filters)
    return users.map(user => this.mapToUser(user))
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(tenantId?: string): Promise<UserMetrics> {
    const stats = await this.userRepository.getStatistics(tenantId)
    
    // Get top active users
    const topActiveUsers = await this.prisma.user.findMany({
      where: {
        ...(tenantId && { tenantId }),
        isActive: true,
        lastLoginAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            activities: true,
          },
        },
      },
      orderBy: {
        activities: {
          _count: 'desc',
        },
      },
      take: 5,
    })

    return {
      totalUsers: stats.total,
      activeUsers: stats.active,
      newUsersToday: stats.newToday,
      newUsersThisMonth: stats.newThisMonth,
      usersByRole: stats.byRole,
      loginActivity: {
        today: stats.newToday, // Simplified - would need actual login tracking
        thisWeek: Math.floor(stats.newToday * 7),
        thisMonth: stats.newThisMonth,
      },
      topActiveUsers: topActiveUsers.map(user => ({
        userId: user.id,
        name: user.name,
        email: user.email,
        activityCount: user._count.activities,
      })),
    }
  }

  /**
   * Create user session
   */
  async createSession(data: {
    userId: string
    tenantId: string
    token: string
    refreshToken: string
    expiresAt: Date
    ipAddress: string
    userAgent: string
  }): Promise<UserSession> {
    const session = await this.prisma.session.create({
      data: {
        userId: data.userId,
        tenantId: data.tenantId,
        token: data.token,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        isActive: true,
      },
    })

    return {
      id: session.id,
      userId: session.userId,
      tenantId: session.tenantId,
      token: session.token,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
      lastActivity: session.createdAt,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      isActive: session.isActive,
      createdAt: session.createdAt,
    }
  }

  /**
   * Invalidate user session
   */
  async invalidateSession(sessionId: string): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false },
    })
  }

  /**
   * Invalidate all user sessions
   */
  async invalidateAllUserSessions(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { userId },
      data: { isActive: false },
    })
  }

  /**
   * Log user activity
   */
  async logActivity(
    userId: string,
    tenantId: string,
    action: string,
    resource: string,
    resourceId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.prisma.activity.create({
      data: {
        userId,
        tenantId,
        action,
        resource,
        resourceId,
        metadata,
        ipAddress: '127.0.0.1', // Would be passed from request
        userAgent: 'FoodManager Client', // Would be passed from request
      },
    })
  }

  /**
   * Get user activities
   */
  async getUserActivities(userId: string, limit = 50): Promise<UserActivity[]> {
    const activities = await this.prisma.activity.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    })

    return activities.map(activity => ({
      id: activity.id,
      userId: activity.userId,
      tenantId: activity.tenantId,
      action: activity.action,
      resource: activity.resource,
      resourceId: activity.resourceId || undefined,
      metadata: activity.metadata as Record<string, any> || undefined,
      ipAddress: activity.ipAddress,
      userAgent: activity.userAgent,
      timestamp: activity.timestamp,
    }))
  }

  /**
   * Map Prisma user to domain user
   */
  private mapToUser(prismaUser: any): User {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      role: prismaUser.role as UserRole,
      tenantId: prismaUser.tenantId,
      avatar: prismaUser.avatar || undefined,
      phone: prismaUser.phone || undefined,
      lastLoginAt: prismaUser.lastLoginAt || undefined,
      isActive: prismaUser.isActive,
      emailVerified: prismaUser.emailVerified,
      phoneVerified: prismaUser.phoneVerified || false,
      preferences: prismaUser.preferences,
      permissions: this.getUserPermissions(prismaUser.role as UserRole),
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    }
  }

  /**
   * Get user permissions based on role
   */
  private getUserPermissions(role: UserRole): string[] {
    const permissions = {
      [UserRole.ADMIN]: [
        'read', 'write', 'delete',
        'manage_users', 'manage_billing', 'manage_tenant',
        'view_analytics', 'manage_settings'
      ],
      [UserRole.MANAGER]: [
        'read', 'write', 'delete',
        'manage_inventory', 'manage_orders', 'manage_staff',
        'view_analytics', 'manage_menu'
      ],
      [UserRole.VENDOR]: [
        'read', 'write',
        'manage_orders', 'manage_inventory', 'view_reports'
      ],
      [UserRole.STAFF]: [
        'read', 'write',
        'manage_orders', 'manage_inventory'
      ],
      [UserRole.CUSTOMER]: [
        'read', 'create_orders', 'view_menu'
      ],
    }

    return permissions[role] || []
  }

  /**
   * Get default user preferences
   */
  private getDefaultUserPreferences() {
    return {
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      theme: 'light' as const,
      notifications: {
        email: true,
        sms: false,
        push: true,
        desktop: false,
      },
      dashboard: {
        layout: 'default',
        widgets: ['orders', 'revenue', 'customers'],
        refreshInterval: 30000,
      },
      privacy: {
        shareData: false,
        analytics: true,
        marketing: false,
      },
    }
  }
}
