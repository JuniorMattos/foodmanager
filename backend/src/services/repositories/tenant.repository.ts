import { PrismaClient, Tenant as PrismaTenant } from '@prisma/client'
import { BaseRepository } from './base.repository'
import { Tenant, TenantStatus, TenantUsage } from '../domain/tenant.domain'

export class TenantRepository extends BaseRepository<
  PrismaTenant,
  Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>,
  Partial<Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>>
> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'tenant')
  }

  /**
   * Find tenant by slug
   */
  async findBySlug(slug: string): Promise<PrismaTenant | null> {
    return await this.findUnique({
      where: { slug },
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
  }

  /**
   * Find tenant by domain
   */
  async findByDomain(domain: string): Promise<PrismaTenant | null> {
    return await this.findUnique({
      where: { domain },
      include: {
        users: true,
      },
    })
  }

  /**
   * Get tenants by status
   */
  async findByStatus(status: TenantStatus): Promise<PrismaTenant[]> {
    return await this.findMany({
      where: { status },
      include: {
        users: {
          where: { isActive: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  /**
   * Get active tenants with usage
   */
  async findActiveWithUsage(): Promise<PrismaTenant[]> {
    return await this.findMany({
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
  }

  /**
   * Update tenant status
   */
  async updateStatus(id: string, status: TenantStatus): Promise<PrismaTenant> {
    return await this.update(id, { status })
  }

  /**
   * Update tenant subscription
   */
  async updateSubscription(id: string, subscriptionId: string, planId: string): Promise<PrismaTenant> {
    return await this.update(id, {
      subscriptionId,
      planId,
    })
  }

  /**
   * Get tenant statistics
   */
  async getStatistics(): Promise<{
    total: number
    active: number
    trial: number
    suspended: number
    cancelled: number
  }> {
    const stats = await this.aggregate({
      _count: {
        id: true,
      },
    })

    const statusCounts = await this.prisma.tenant.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    })

    return {
      total: stats._count.id,
      active: statusCounts.find(c => c.status === 'ACTIVE')?._count.id || 0,
      trial: statusCounts.find(c => c.status === 'TRIAL')?._count.id || 0,
      suspended: statusCounts.find(c => c.status === 'SUSPENDED')?._count.id || 0,
      cancelled: statusCounts.find(c => c.status === 'CANCELLED')?._count.id || 0,
    }
  }

  /**
   * Check if slug is available
   */
  async isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
    const existing = await this.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!existing) return true
    if (excludeId && existing.id === excludeId) return true
    return false
  }

  /**
   * Get tenants by plan
   */
  async findByPlan(planId: string): Promise<PrismaTenant[]> {
    return await this.findMany({
      where: { planId },
      include: {
        users: {
          where: { isActive: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  /**
   * Search tenants
   */
  async search(query: string, filters?: {
    status?: TenantStatus
    planId?: string
  }): Promise<PrismaTenant[]> {
    const where: any = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { slug: { contains: query, mode: 'insensitive' } },
        { domain: { contains: query, mode: 'insensitive' } },
      ],
    }

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.planId) {
      where.planId = filters.planId
    }

    return await this.findMany({
      where,
      include: {
        users: {
          where: { isActive: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  /**
   * Get tenant with full details
   */
  async findWithFullDetails(id: string): Promise<PrismaTenant | null> {
    return await this.findById(id, {
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
  }

  /**
   * Soft delete tenant (deactivate)
   */
  async softDelete(id: string): Promise<PrismaTenant> {
    return await this.update(id, {
      status: TenantStatus.INACTIVE,
    })
  }

  /**
   * Reactivate tenant
   */
  async reactivate(id: string): Promise<PrismaTenant> {
    return await this.update(id, {
      status: TenantStatus.ACTIVE,
    })
  }
}
