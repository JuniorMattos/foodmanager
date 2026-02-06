import { PrismaClient, Prisma } from '@prisma/client'

export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  protected prisma: PrismaClient
  protected modelName: string

  constructor(prisma: PrismaClient, modelName: string) {
    this.prisma = prisma
    this.modelName = modelName
  }

  /**
   * Find many records with optional filters
   */
  async findMany(params?: {
    where?: any
    orderBy?: any
    skip?: number
    take?: number
    include?: any
    select?: any
  }): Promise<T[]> {
    try {
      const model = (this.prisma as any)[this.modelName]
      return await model.findMany(params)
    } catch (error) {
      console.error(`Error finding many ${this.modelName}:`, error)
      throw new Error(`Failed to find ${this.modelName} records`)
    }
  }

  /**
   * Find single record by ID
   */
  async findById(id: string, params?: {
    include?: any
    select?: any
  }): Promise<T | null> {
    try {
      const model = (this.prisma as any)[this.modelName]
      return await model.findUnique({
        where: { id },
        ...params,
      })
    } catch (error) {
      console.error(`Error finding ${this.modelName} by ID:`, error)
      throw new Error(`Failed to find ${this.modelName} by ID`)
    }
  }

  /**
   * Find single record by unique field
   */
  async findUnique(params: {
    where: any
    include?: any
    select?: any
  }): Promise<T | null> {
    try {
      const model = (this.prisma as any)[this.modelName]
      return await model.findUnique(params)
    } catch (error) {
      console.error(`Error finding unique ${this.modelName}:`, error)
      throw new Error(`Failed to find unique ${this.modelName}`)
    }
  }

  /**
   * Find first record matching criteria
   */
  async findFirst(params: {
    where: any
    include?: any
    select?: any
    orderBy?: any
  }): Promise<T | null> {
    try {
      const model = (this.prisma as any)[this.modelName]
      return await model.findFirst(params)
    } catch (error) {
      console.error(`Error finding first ${this.modelName}:`, error)
      throw new Error(`Failed to find first ${this.modelName}`)
    }
  }

  /**
   * Create new record
   */
  async create(data: CreateInput, params?: {
    include?: any
    select?: any
  }): Promise<T> {
    try {
      const model = (this.prisma as any)[this.modelName]
      return await model.create({
        data,
        ...params,
      })
    } catch (error) {
      console.error(`Error creating ${this.modelName}:`, error)
      throw new Error(`Failed to create ${this.modelName}`)
    }
  }

  /**
   * Create multiple records
   */
  async createMany(data: CreateInput[]): Promise<{ count: number }> {
    try {
      const model = (this.prisma as any)[this.modelName]
      return await model.createMany({
        data,
      })
    } catch (error) {
      console.error(`Error creating many ${this.modelName}:`, error)
      throw new Error(`Failed to create many ${this.modelName}`)
    }
  }

  /**
   * Update record by ID
   */
  async update(id: string, data: UpdateInput, params?: {
    include?: any
    select?: any
  }): Promise<T> {
    try {
      const model = (this.prisma as any)[this.modelName]
      return await model.update({
        where: { id },
        data,
        ...params,
      })
    } catch (error) {
      console.error(`Error updating ${this.modelName}:`, error)
      throw new Error(`Failed to update ${this.modelName}`)
    }
  }

  /**
   * Update multiple records
   */
  async updateMany(params: {
    where: any
    data: UpdateInput
  }): Promise<{ count: number }> {
    try {
      const model = (this.prisma as any)[this.modelName]
      return await model.updateMany(params)
    } catch (error) {
      console.error(`Error updating many ${this.modelName}:`, error)
      throw new Error(`Failed to update many ${this.modelName}`)
    }
  }

  /**
   * Delete record by ID
   */
  async delete(id: string, params?: {
    include?: any
    select?: any
  }): Promise<T> {
    try {
      const model = (this.prisma as any)[this.modelName]
      return await model.delete({
        where: { id },
        ...params,
      })
    } catch (error) {
      console.error(`Error deleting ${this.modelName}:`, error)
      throw new Error(`Failed to delete ${this.modelName}`)
    }
  }

  /**
   * Delete multiple records
   */
  async deleteMany(params: {
    where: any
  }): Promise<{ count: number }> {
    try {
      const model = (this.prisma as any)[this.modelName]
      return await model.deleteMany(params)
    } catch (error) {
      console.error(`Error deleting many ${this.modelName}:`, error)
      throw new Error(`Failed to delete many ${this.modelName}`)
    }
  }

  /**
   * Count records
   */
  async count(params?: {
    where?: any
  }): Promise<number> {
    try {
      const model = (this.prisma as any)[this.modelName]
      return await model.count(params)
    } catch (error) {
      console.error(`Error counting ${this.modelName}:`, error)
      throw new Error(`Failed to count ${this.modelName}`)
    }
  }

  /**
   * Aggregate records
   */
  async aggregate(params: {
    where?: any
    orderBy?: any
    _count?: any
    _sum?: any
    _avg?: any
    _min?: any
    _max?: any
  }): Promise<any> {
    try {
      const model = (this.prisma as any)[this.modelName]
      return await model.aggregate(params)
    } catch (error) {
      console.error(`Error aggregating ${this.modelName}:`, error)
      throw new Error(`Failed to aggregate ${this.modelName}`)
    }
  }

  /**
   * Group by records
   */
  async groupBy(params: {
    by: string[]
    where?: any
    _count?: any
    _sum?: any
    _avg?: any
    _min?: any
    _max?: any
    having?: any
  }): Promise<any[]> {
    try {
      const model = (this.prisma as any)[this.modelName]
      return await model.groupBy(params)
    } catch (error) {
      console.error(`Error grouping ${this.modelName}:`, error)
      throw new Error(`Failed to group ${this.modelName}`)
    }
  }

  /**
   * Raw query execution
   */
  async rawQuery(query: string, params?: any[]): Promise<any> {
    try {
      return await this.prisma.$queryRaw`${query}`
    } catch (error) {
      console.error(`Error executing raw query:`, error)
      throw new Error(`Failed to execute raw query`)
    }
  }

  /**
   * Transaction wrapper
   */
  async transaction<R>(
    callback: (tx: PrismaClient) => Promise<R>
  ): Promise<R> {
    try {
      return await this.prisma.$transaction(callback)
    } catch (error) {
      console.error(`Error in transaction:`, error)
      throw new Error(`Transaction failed`)
    }
  }
}
