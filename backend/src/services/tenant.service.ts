import { PrismaClient } from '@prisma/client'
import { TenantRepository } from './repositories/tenant.repository'
import { UserRepository } from './repositories/user.repository'
import { 
  Tenant, 
  TenantStatus, 
  TenantUsage, 
  TenantMetrics,
  TenantSettings 
} from './domain/tenant.domain'
import { BILLING_PLANS } from './stripe'

export class TenantService {
  private tenantRepository: TenantRepository
  private userRepository: UserRepository
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
    this.tenantRepository = new TenantRepository(prisma)
    this.userRepository = new UserRepository(prisma)
  }

  /**
   * Create new tenant
   */
  async createTenant(data: {
    name: string
    slug: string
    domain?: string
    adminEmail: string
    adminName: string
    planId: string
  }): Promise<Tenant> {
    // Validate slug availability
    const isSlugAvailable = await this.tenantRepository.isSlugAvailable(data.slug)
    if (!isSlugAvailable) {
      throw new Error('Slug is already taken')
    }

    // Validate plan
    const plan = BILLING_PLANS.find(p => p.id === data.planId)
    if (!plan) {
      throw new Error('Invalid plan ID')
    }

    // Create tenant with transaction
    const tenant = await this.prisma.$transaction(async (tx) => {
      // Create tenant
      const newTenant = await tx.tenant.create({
        data: {
          name: data.name,
          slug: data.slug,
          domain: data.domain,
          settings: this.getDefaultSettings(),
          status: TenantStatus.TRIAL,
          planId: data.planId,
        },
        include: {
          users: true,
        },
      })

      // Create admin user
      await tx.user.create({
        data: {
          email: data.adminEmail,
          name: data.adminName,
          role: 'ADMIN',
          tenantId: newTenant.id,
          isActive: true,
          emailVerified: true,
          preferences: this.getDefaultUserPreferences(),
        },
      })

      return newTenant
    })

    return this.mapToTenant(tenant)
  }

  /**
   * Get tenant by ID
   */
  async getTenantById(id: string): Promise<Tenant | null> {
    const tenant = await this.tenantRepository.findWithFullDetails(id)
    return tenant ? this.mapToTenant(tenant) : null
  }

  /**
   * Get tenant by slug
   */
  async getTenantBySlug(slug: string): Promise<Tenant | null> {
    const tenant = await this.tenantRepository.findBySlug(slug)
    return tenant ? this.mapToTenant(tenant) : null
  }

  /**
   * Get tenant by domain
   */
  async getTenantByDomain(domain: string): Promise<Tenant | null> {
    const tenant = await this.tenantRepository.findByDomain(domain)
    return tenant ? this.mapToTenant(tenant) : null
  }

  /**
   * Update tenant
   */
  async updateTenant(id: string, data: Partial<Tenant>): Promise<Tenant> {
    const tenant = await this.tenantRepository.update(id, data)
    return this.mapToTenant(tenant)
  }

  /**
   * Update tenant status
   */
  async updateTenantStatus(id: string, status: TenantStatus): Promise<Tenant> {
    const tenant = await this.tenantRepository.updateStatus(id, status)
    return this.mapToTenant(tenant)
  }

  /**
   * Get tenant usage metrics
   */
  async getTenantUsage(tenantId: string, period?: string): Promise<TenantUsage> {
    const currentPeriod = period || this.getCurrentPeriod()
    
    // Get tenant and plan limits
    const tenant = await this.getTenantById(tenantId)
    if (!tenant) {
      throw new Error('Tenant not found')
    }

    const plan = BILLING_PLANS.find(p => p.id === tenant.planId)
    if (!plan) {
      throw new Error('Plan not found')
    }

    // Get current usage metrics
    const userCount = await this.userRepository.count({
      where: { tenantId, isActive: true }
    })

    const productCount = await this.prisma.product.count({
      where: { tenantId }
    })

    const orderCount = await this.prisma.order.count({
      where: {
        tenantId,
        createdAt: {
          gte: new Date(currentPeriod + '-01'),
          lt: new Date(currentPeriod + '-01').setMonth(new Date(currentPeriod + '-01').getMonth() + 1)
        }
      }
    })

    // Mock API calls - in real implementation, track from logs/middleware
    const apiCalls = Math.floor(Math.random() * 5000) + 100

    const usage: TenantUsage = {
      tenantId,
      period: currentPeriod,
      metrics: {
        users: userCount,
        products: productCount,
        orders: orderCount,
        apiCalls,
        storage: 0, // TODO: Implement storage tracking
      },
      limits: plan.limits,
      exceeded: [],
    }

    // Check for exceeded limits
    if (plan.limits.users > 0 && userCount > plan.limits.users) {
      usage.exceeded.push('users')
    }
    if (plan.limits.products > 0 && productCount > plan.limits.products) {
      usage.exceeded.push('products')
    }
    if (plan.limits.orders > 0 && orderCount > plan.limits.orders) {
      usage.exceeded.push('orders')
    }
    if (plan.limits.apiCalls > 0 && apiCalls > plan.limits.apiCalls) {
      usage.exceeded.push('apiCalls')
    }

    return usage
  }

  /**
   * Get tenant metrics
   */
  async getTenantMetrics(): Promise<TenantMetrics> {
    const stats = await this.tenantRepository.getStatistics()
    
    // Mock revenue calculations - in real implementation, get from billing service
    const totalRevenue = stats.active * 99 // Average $99/month
    const mrr = totalRevenue
    const arr = mrr * 12
    const churnRate = 0.05 // 5% monthly churn
    const growthRate = 0.15 // 15% monthly growth

    return {
      totalTenants: stats.total,
      activeTenants: stats.active,
      trialTenants: stats.trial,
      suspendedTenants: stats.suspended,
      totalRevenue,
      mrr,
      churnRate,
      averagePlan: 'standard',
      growthRate,
    }
  }

  /**
   * Search tenants
   */
  async searchTenants(query: string, filters?: {
    status?: TenantStatus
    planId?: string
  }): Promise<Tenant[]> {
    const tenants = await this.tenantRepository.search(query, filters)
    return tenants.map(tenant => this.mapToTenant(tenant))
  }

  /**
   * Get tenants by plan
   */
  async getTenantsByPlan(planId: string): Promise<Tenant[]> {
    const tenants = await this.tenantRepository.findByPlan(planId)
    return tenants.map(tenant => this.mapToTenant(tenant))
  }

  /**
   * Activate tenant
   */
  async activateTenant(id: string): Promise<Tenant> {
    return await this.updateTenantStatus(id, TenantStatus.ACTIVE)
  }

  /**
   * Suspend tenant
   */
  async suspendTenant(id: string): Promise<Tenant> {
    return await this.updateTenantStatus(id, TenantStatus.SUSPENDED)
  }

  /**
   * Cancel tenant
   */
  async cancelTenant(id: string): Promise<Tenant> {
    return await this.updateTenantStatus(id, TenantStatus.CANCELLED)
  }

  /**
   * Update tenant subscription
   */
  async updateTenantSubscription(id: string, subscriptionId: string, planId: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.updateSubscription(id, subscriptionId, planId)
    return this.mapToTenant(tenant)
  }

  /**
   * Check tenant limits
   */
  async checkTenantLimits(tenantId: string, action: string): Promise<boolean> {
    const usage = await this.getTenantUsage(tenantId)
    
    switch (action) {
      case 'create_user':
        return usage.limits.users <= 0 || usage.metrics.users < usage.limits.users
      case 'create_product':
        return usage.limits.products <= 0 || usage.metrics.products < usage.limits.products
      case 'create_order':
        return usage.limits.orders <= 0 || usage.metrics.orders < usage.limits.orders
      default:
        return true
    }
  }

  /**
   * Map Prisma tenant to domain tenant
   */
  private mapToTenant(prismaTenant: any): Tenant {
    return {
      id: prismaTenant.id,
      name: prismaTenant.name,
      slug: prismaTenant.slug,
      domain: prismaTenant.domain || undefined,
      logo: prismaTenant.logo || undefined,
      settings: prismaTenant.settings as TenantSettings,
      status: prismaTenant.status as TenantStatus,
      subscriptionId: prismaTenant.subscriptionId || undefined,
      planId: prismaTenant.planId,
      createdAt: prismaTenant.createdAt,
      updatedAt: prismaTenant.updatedAt,
    }
  }

  /**
   * Get default tenant settings
   */
  private getDefaultSettings(): TenantSettings {
    return {
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
    }
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

  /**
   * Get current period string
   */
  private getCurrentPeriod(): string {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }
}
