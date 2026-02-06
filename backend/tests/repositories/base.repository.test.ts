import { PrismaClient } from '@prisma/client'
import { BaseRepository } from '../../src/services/repositories/base.repository'

// Test implementation of BaseRepository
interface TestEntity {
  id: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}

interface TestCreateInput {
  name: string
  email: string
}

interface TestUpdateInput {
  name?: string
  email?: string
}

class TestRepository extends BaseRepository<TestEntity, TestCreateInput, TestUpdateInput> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'testEntity')
  }
}

describe('BaseRepository', () => {
  let testRepository: TestRepository
  let mockPrisma: jest.Mocked<PrismaClient>
  let mockModel: jest.Mocked<any>

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>
    mockModel = {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    }
    
    Object.defineProperty(mockPrisma, 'testEntity', {
      value: mockModel,
      writable: true
    })
    testRepository = new TestRepository(mockPrisma)
  })

  describe('findMany', () => {
    it('should return multiple records with default parameters', async () => {
      const expectedRecords = [
        { id: '1', name: 'Test 1', email: 'test1@example.com', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'Test 2', email: 'test2@example.com', createdAt: new Date(), updatedAt: new Date() }
      ]
      
      mockModel.findMany.mockResolvedValue(expectedRecords)

      const result = await testRepository.findMany()

      expect(result).toEqual(expectedRecords)
      expect(mockModel.findMany).toHaveBeenCalledWith(undefined)
    })

    it('should return filtered records with parameters', async () => {
      const expectedRecords = [
        { id: '1', name: 'Test 1', email: 'test1@example.com', createdAt: new Date(), updatedAt: new Date() }
      ]
      
      const params = {
        where: { name: 'Test 1' },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
        include: { related: true },
        select: { id: true, name: true }
      }
      
      mockModel.findMany.mockResolvedValue(expectedRecords)

      const result = await testRepository.findMany(params)

      expect(result).toEqual(expectedRecords)
      expect(mockModel.findMany).toHaveBeenCalledWith(params)
    })

    it('should throw error when database operation fails', async () => {
      const dbError = new Error('Database connection failed')
      mockModel.findMany.mockRejectedValue(dbError)

      await expect(testRepository.findMany()).rejects.toThrow('Failed to find testEntity records')
    })
  })

  describe('findById', () => {
    it('should return record by ID', async () => {
      const expectedRecord = { 
        id: '1', 
        name: 'Test 1', 
        email: 'test1@example.com', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      }
      
      mockModel.findUnique.mockResolvedValue(expectedRecord)

      const result = await testRepository.findById('1')

      expect(result).toEqual(expectedRecord)
      expect(mockModel.findUnique).toHaveBeenCalledWith({
        where: { id: '1' }
      })
    })

    it('should return null when record not found', async () => {
      mockModel.findUnique.mockResolvedValue(null)

      const result = await testRepository.findById('non-existent')

      expect(result).toBeNull()
      expect(mockModel.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent' }
      })
    })

    it('should include additional parameters', async () => {
      const expectedRecord = { 
        id: '1', 
        name: 'Test 1', 
        email: 'test1@example.com', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      }
      
      const params = {
        include: { related: true },
        select: { id: true, name: true }
      }
      
      mockModel.findUnique.mockResolvedValue(expectedRecord)

      const result = await testRepository.findById('1', params)

      expect(result).toEqual(expectedRecord)
      expect(mockModel.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { related: true },
        select: { id: true, name: true }
      })
    })

    it('should throw error when database operation fails', async () => {
      const dbError = new Error('Database connection failed')
      mockModel.findUnique.mockRejectedValue(dbError)

      await expect(testRepository.findById('1')).rejects.toThrow('Failed to find testEntity by ID')
    })
  })

  describe('findFirst', () => {
    it('should return first matching record', async () => {
      const expectedRecord = { 
        id: '1', 
        name: 'Test 1', 
        email: 'test1@example.com', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      }
      
      mockModel.findFirst.mockResolvedValue(expectedRecord)

      const result = await testRepository.findFirst({
        where: { name: 'Test 1' }
      })

      expect(result).toEqual(expectedRecord)
      expect(mockModel.findFirst).toHaveBeenCalledWith({
        where: { name: 'Test 1' }
      })
    })

    it('should return null when no record found', async () => {
      mockModel.findFirst.mockResolvedValue(null)

      const result = await testRepository.findFirst({
        where: { name: 'Non-existent' }
      })

      expect(result).toBeNull()
    })

    it('should throw error when database operation fails', async () => {
      const dbError = new Error('Database connection failed')
      mockModel.findFirst.mockRejectedValue(dbError)

      await expect(testRepository.findFirst({ where: {} })).rejects.toThrow('Failed to find first testEntity')
    })
  })

  describe('create', () => {
    it('should create new record', async () => {
      const createData = { name: 'Test User', email: 'test@example.com' }
      const expectedRecord = { 
        id: '1', 
        ...createData, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      }
      
      mockModel.create.mockResolvedValue(expectedRecord)

      const result = await testRepository.create(createData)

      expect(result).toEqual(expectedRecord)
      expect(mockModel.create).toHaveBeenCalledWith({ 
        data: createData 
      })
    })

    it('should create record with additional options', async () => {
      const createData = { name: 'Test User', email: 'test@example.com' }
      const expectedRecord = { 
        id: '1', 
        ...createData, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      }
      
      const options = {
        include: { related: true },
        select: { id: true, name: true }
      }
      
      mockModel.create.mockResolvedValue(expectedRecord)

      const result = await testRepository.create(createData, options)

      expect(result).toEqual(expectedRecord)
      expect(mockModel.create).toHaveBeenCalledWith({ 
        data: createData, 
        include: { related: true },
        select: { id: true, name: true }
      })
    })

    it('should throw error when creation fails', async () => {
      const createData = { name: 'Test User', email: 'test@example.com' }
      const dbError = new Error('Validation failed')
      mockModel.create.mockRejectedValue(dbError)

      await expect(testRepository.create(createData)).rejects.toThrow('Failed to create testEntity')
    })
  })

  describe('update', () => {
    it('should update record by ID', async () => {
      const updateData = { name: 'Updated Name' }
      const expectedRecord = { 
        id: '1', 
        name: 'Updated Name', 
        email: 'test@example.com', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      }
      
      mockModel.update.mockResolvedValue(expectedRecord)

      const result = await testRepository.update('1', updateData)

      expect(result).toEqual(expectedRecord)
      expect(mockModel.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData
      })
    })

    it('should update record with additional options', async () => {
      const updateData = { name: 'Updated Name' }
      const expectedRecord = { 
        id: '1', 
        name: 'Updated Name', 
        email: 'test@example.com', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      }
      
      const options = {
        include: { related: true },
        select: { id: true, name: true }
      }
      
      mockModel.update.mockResolvedValue(expectedRecord)

      const result = await testRepository.update('1', updateData, options)

      expect(result).toEqual(expectedRecord)
      expect(mockModel.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
        include: { related: true },
        select: { id: true, name: true }
      })
    })

    it('should throw error when update fails', async () => {
      const updateData = { name: 'Updated Name' }
      const dbError = new Error('Record not found')
      mockModel.update.mockRejectedValue(dbError)

      await expect(testRepository.update('1', updateData)).rejects.toThrow('Failed to update testEntity')
    })
  })

  describe('delete', () => {
    it('should delete record by ID', async () => {
      const expectedRecord = { 
        id: '1', 
        name: 'Test 1', 
        email: 'test1@example.com', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      }
      
      mockModel.delete.mockResolvedValue(expectedRecord)

      const result = await testRepository.delete('1')

      expect(result).toEqual(expectedRecord)
      expect(mockModel.delete).toHaveBeenCalledWith({
        where: { id: '1' }
      })
    })

    it('should throw error when deletion fails', async () => {
      const dbError = new Error('Foreign key constraint')
      mockModel.delete.mockRejectedValue(dbError)

      await expect(testRepository.delete('1')).rejects.toThrow('Failed to delete testEntity')
    })
  })

  describe('count', () => {
    it('should return count of records', async () => {
      const expectedCount = 42
      mockModel.count.mockResolvedValue(expectedCount)

      const result = await testRepository.count()

      expect(result).toBe(expectedCount)
      expect(mockModel.count).toHaveBeenCalledWith(undefined)
    })

    it('should return count with filters', async () => {
      const expectedCount = 10
      const where = { name: 'Test' }
      
      mockModel.count.mockResolvedValue(expectedCount)

      const result = await testRepository.count({ where })

      expect(result).toBe(expectedCount)
      expect(mockModel.count).toHaveBeenCalledWith({ where })
    })

    it('should throw error when count fails', async () => {
      const dbError = new Error('Database error')
      mockModel.count.mockRejectedValue(dbError)

      await expect(testRepository.count()).rejects.toThrow('Failed to count testEntity')
    })
  })

  describe('aggregate', () => {
    it('should return aggregated data', async () => {
      const expectedAggregation = { _count: { id: 100 }, _avg: { rating: 4.5 } }
      const aggregationQuery = {
        _count: { id: true },
        _avg: { rating: true }
      }
      
      mockModel.aggregate.mockResolvedValue(expectedAggregation)

      const result = await testRepository.aggregate(aggregationQuery)

      expect(result).toEqual(expectedAggregation)
      expect(mockModel.aggregate).toHaveBeenCalledWith(aggregationQuery)
    })

    it('should throw error when aggregation fails', async () => {
      const aggregationQuery = { _count: { id: true } }
      const dbError = new Error('Aggregation failed')
      mockModel.aggregate.mockRejectedValue(dbError)

      await expect(testRepository.aggregate(aggregationQuery)).rejects.toThrow('Failed to aggregate testEntity')
    })
  })

  describe('groupBy', () => {
    it('should return grouped data', async () => {
      const expectedGrouped = [
        { name: 'Group1', _count: { id: 10 } },
        { name: 'Group2', _count: { id: 20 } }
      ]
      
      const groupByQuery = {
        by: ['name'],
        _count: { id: true }
      }
      
      mockModel.groupBy.mockResolvedValue(expectedGrouped)

      const result = await testRepository.groupBy(groupByQuery)

      expect(result).toEqual(expectedGrouped)
      expect(mockModel.groupBy).toHaveBeenCalledWith(groupByQuery)
    })

    it('should throw error when groupBy fails', async () => {
      const groupByQuery = { by: ['name'] }
      const dbError = new Error('Group by failed')
      mockModel.groupBy.mockRejectedValue(dbError)

      await expect(testRepository.groupBy(groupByQuery)).rejects.toThrow('Failed to group testEntity')
    })
  })
})
