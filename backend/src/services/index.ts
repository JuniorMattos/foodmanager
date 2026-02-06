import { PrismaClient } from '@prisma/client'
import { TenantService } from './tenant.service'
import { UserService } from './user.service'
import { TenantRepository } from './repositories/tenant.repository'
import { UserRepository } from './repositories/user.repository'
import prisma from '../lib/prisma'

export interface ServiceContainer {
  prisma: PrismaClient
  tenantService: TenantService
  userService: UserService
  tenantRepository: TenantRepository
  userRepository: UserRepository
}

class ServiceContainerImpl implements ServiceContainer {
  public readonly prisma: PrismaClient
  public readonly tenantService: TenantService
  public readonly userService: UserService
  public readonly tenantRepository: TenantRepository
  public readonly userRepository: UserRepository

  constructor() {
    this.prisma = prisma
    
    // Initialize repositories
    this.tenantRepository = new TenantRepository(this.prisma)
    this.userRepository = new UserRepository(this.prisma)
    
    // Initialize services
    this.tenantService = new TenantService(this.prisma)
    this.userService = new UserService(this.prisma)
  }

  /**
   * Graceful shutdown
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect()
  }
}

// Singleton instance
let serviceContainer: ServiceContainer | null = null

/**
 * Get service container instance
 */
export function getServiceContainer(): ServiceContainer {
  if (!serviceContainer) {
    serviceContainer = new ServiceContainerImpl()
  }
  return serviceContainer
}

/**
 * Initialize services
 */
export async function initializeServices(): Promise<ServiceContainer> {
  const container = getServiceContainer()
  
  // Test database connection
  try {
    await container.prisma.$connect()
    console.log('✅ Database connected successfully')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    throw error
  }
  
  return container
}

/**
 * Cleanup services
 */
export async function cleanupServices(): Promise<void> {
  if (serviceContainer) {
    await serviceContainer.disconnect()
    serviceContainer = null
  }
}
