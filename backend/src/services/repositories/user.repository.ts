import { PrismaClient, User as PrismaUser } from '@prisma/client'
import { BaseRepository } from './base.repository'
import { User, UserRole, UserProfile } from '../domain/user.domain'

export class UserRepository extends BaseRepository<
  PrismaUser,
  Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'user')
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<PrismaUser | null> {
    return await this.findUnique({
      where: { email },
      include: {
        tenant: true,
        sessions: {
          where: { isActive: true },
        },
      },
    })
  }

  /**
   * Find users by tenant
   */
  async findByTenant(tenantId: string, filters?: {
    role?: UserRole
    isActive?: boolean
  }): Promise<PrismaUser[]> {
    const where: any = { tenantId }
    
    if (filters?.role) {
      where.role = filters.role
    }
    
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    return await this.findMany({
      where,
      include: {
        sessions: {
          where: { isActive: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  /**
   * Find user with profile data
   */
  async findProfile(userId: string): Promise<UserProfile | null> {
    const user = await this.findById(userId, {
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            planId: true,
          },
        },
      },
    })

    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      tenantId: user.tenantId,
      avatar: user.avatar || undefined,
      phone: user.phone || undefined,
      lastLoginAt: user.lastLoginAt || undefined,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      tenant: user.tenant,
      permissions: this.getUserPermissions(user.role as UserRole),
      createdAt: user.createdAt,
    }
  }

  /**
   * Update last login
   */
  async updateLastLogin(userId: string): Promise<PrismaUser> {
    return await this.update(userId, {
      lastLoginAt: new Date(),
    })
  }

  /**
   * Activate user
   */
  async activate(userId: string): Promise<PrismaUser> {
    return await this.update(userId, {
      isActive: true,
      emailVerified: true,
    })
  }

  /**
   * Deactivate user
   */
  async deactivate(userId: string): Promise<PrismaUser> {
    return await this.update(userId, {
      isActive: false,
    })
  }

  /**
   * Update user role
   */
  async updateRole(userId: string, role: UserRole): Promise<PrismaUser> {
    return await this.update(userId, {
      role,
    })
  }

  /**
   * Get user statistics
   */
  async getStatistics(tenantId?: string): Promise<{
    total: number
    active: number
    inactive: number
    byRole: Record<UserRole, number>
    newToday: number
    newThisMonth: number
  }> {
    const where = tenantId ? { tenantId } : {}

    const stats = await this.aggregate({
      where,
      _count: {
        id: true,
      },
    })

    const activeStats = await this.aggregate({
      where: { ...where, isActive: true },
      _count: {
        id: true,
      },
    })

    const roleCounts = await this.prisma.user.groupBy({
      by: ['role'],
      where,
      _count: {
        id: true,
      },
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    const newToday = await this.count({
      where: {
        ...where,
        createdAt: {
          gte: today,
        },
      },
    })

    const newThisMonth = await this.count({
      where: {
        ...where,
        createdAt: {
          gte: thisMonth,
        },
      },
    })

    return {
      total: stats._count.id,
      active: activeStats._count.id,
      inactive: stats._count.id - activeStats._count.id,
      byRole: roleCounts.reduce((acc, c) => {
        acc[c.role as UserRole] = c._count.id
        return acc
      }, {} as Record<UserRole, number>),
      newToday,
      newThisMonth,
    }
  }

  /**
   * Search users
   */
  async search(query: string, tenantId?: string, filters?: {
    role?: UserRole
    isActive?: boolean
  }): Promise<PrismaUser[]> {
    const where: any = {
      ...(tenantId && { tenantId }),
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
      ],
    }

    if (filters?.role) {
      where.role = filters.role
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    return await this.findMany({
      where,
      include: {
        tenant: true,
        sessions: {
          where: { isActive: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  /**
   * Get users by role
   */
  async findByRole(role: UserRole, tenantId?: string): Promise<PrismaUser[]> {
    return await this.findMany({
      where: {
        role,
        ...(tenantId && { tenantId }),
      },
      include: {
        tenant: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  /**
   * Check if email is available
   */
  async isEmailAvailable(email: string, excludeId?: string): Promise<boolean> {
    const existing = await this.findUnique({
      where: { email },
      select: { id: true },
    })

    if (!existing) return true
    if (excludeId && existing.id === excludeId) return true
    return false
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
   * Update user preferences
   */
  async updatePreferences(userId: string, preferences: any): Promise<PrismaUser> {
    return await this.update(userId, {
      preferences,
    })
  }

  /**
   * Get active users with recent activity
   */
  async findActiveWithActivity(tenantId: string, days = 30): Promise<PrismaUser[]> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return await this.findMany({
      where: {
        tenantId,
        isActive: true,
        lastLoginAt: {
          gte: cutoffDate,
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
  }
}
