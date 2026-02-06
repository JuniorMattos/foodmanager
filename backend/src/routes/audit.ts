import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import { authenticateAdmin } from '../middleware/adminAuth'

// Schemas para validação
const auditLogFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.enum(['create', 'update', 'delete', 'login', 'logout', 'system', 'security']).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  entity: z.enum(['tenant', 'user', 'order', 'product', 'system', 'admin']).optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  userId: z.string().optional(),
  tenantId: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50)
})

const createAuditLogSchema = z.object({
  action: z.string(),
  entity_type: z.enum(['tenant', 'user', 'order', 'product', 'system', 'admin']),
  entity_id: z.string(),
  entity_name: z.string(),
  old_values: z.record(z.any()).optional(),
  new_values: z.record(z.any()).optional(),
  description: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  category: z.enum(['create', 'update', 'delete', 'login', 'logout', 'system', 'security']).default('system'),
  metadata: z.record(z.any()).optional()
})

const auditConfigSchema = z.object({
  retention: z.number().min(30).max(3650).default(90),
  alertOnCritical: z.boolean().default(true),
  alertOnMassDelete: z.boolean().default(true),
  alertOnConfigChanges: z.boolean().default(false),
  autoExportCritical: z.boolean().default(false),
  autoArchiveOld: z.boolean().default(true)
})

export async function auditRoutes(fastify: FastifyInstance) {
  // Middleware de autenticação
  fastify.addHook('preHandler', authenticateAdmin)

  // Get audit logs with pagination and filters
  fastify.get('/admin/audit/logs', { schema: { querystring: auditLogFiltersSchema } }, async (request, reply) => {
    try {
      const filters = request.query as any
      const { page = 1, limit = 50, ...filterOptions } = filters
      
      // Build where clause
      let whereClause: any = {}
      
      if (filterOptions.search) {
        whereClause.OR = [
          { action: { contains: filterOptions.search, mode: 'insensitive' } },
          { entity_name: { contains: filterOptions.search, mode: 'insensitive' } },
          { description: { contains: filterOptions.search, mode: 'insensitive' } },
          { user_name: { contains: filterOptions.search, mode: 'insensitive' } }
        ]
      }
      
      if (filterOptions.category) {
        whereClause.category = filterOptions.category
      }
      
      if (filterOptions.severity) {
        whereClause.severity = filterOptions.severity
      }
      
      if (filterOptions.entity) {
        whereClause.entity_type = filterOptions.entity
      }
      
      if (filterOptions.userId) {
        whereClause.user_id = filterOptions.userId
      }
      
      if (filterOptions.tenantId) {
        whereClause.tenant_id = filterOptions.tenantId
      }
      
      // Date range filter
      if (filterOptions.start || filterOptions.end) {
        whereClause.timestamp = {}
        if (filterOptions.start) {
          whereClause.timestamp.gte = new Date(filterOptions.start)
        }
        if (filterOptions.end) {
          whereClause.timestamp.lte = new Date(filterOptions.end + 'T23:59:59.999Z')
        }
      }
      
      // Get total count
      const total = await prisma.auditLog.count({ where: whereClause })
      
      // Get logs with pagination
      const logs = await prisma.auditLog.findMany({
        where: whereClause,
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      })
      
      return reply.send({
        data: logs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao buscar logs de auditoria' })
    }
  })

  // Get audit statistics
  fastify.get('/admin/audit/stats', { 
    schema: { 
      querystring: z.object({
        period: z.enum(['24h', '7d', '30d', '90d']).default('7d')
      })
    } 
  }, async (request, reply) => {
    try {
      const { period } = request.query as any
      
      // Calculate date range
      const now = new Date()
      let startDate: Date
      
      switch (period) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          break
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      }
      
      // Get stats
      const [total, today, thisWeek, thisMonth, byCategory, bySeverity, byEntity] = await Promise.all([
        prisma.auditLog.count({
          where: { timestamp: { gte: startDate } }
        }),
        prisma.auditLog.count({
          where: {
            timestamp: {
              gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
            }
          }
        }),
        prisma.auditLog.count({
          where: {
            timestamp: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
          }
        }),
        prisma.auditLog.count({
          where: {
            timestamp: { gte: new Date(now.getFullYear(), now.getMonth(), 1) }
          }
        }),
        prisma.auditLog.groupBy({
          by: ['category'],
          where: { timestamp: { gte: startDate } },
          _count: { id: true }
        }),
        prisma.auditLog.groupBy({
          by: ['severity'],
          where: { timestamp: { gte: startDate } },
          _count: { id: true }
        }),
        prisma.auditLog.groupBy({
          by: ['entity_type'],
          where: { timestamp: { gte: startDate } },
          _count: { id: true }
        })
      ])
      
      // Get recent activity
      const recentActivity = await prisma.auditLog.findMany({
        where: { timestamp: { gte: startDate } },
        orderBy: { timestamp: 'desc' },
        take: 5,
        select: {
          timestamp: true,
          action: true,
          entity_name: true,
          user_name: true,
          severity: true
        }
      })
      
      // Format stats
      const stats = {
        total,
        today,
        thisWeek,
        thisMonth,
        byCategory: Object.fromEntries(byCategory.map(item => [item.category, item._count.id])),
        bySeverity: Object.fromEntries(bySeverity.map(item => [item.severity, item._count.id])),
        byEntity: Object.fromEntries(byEntity.map(item => [item.entity_type, item._count.id])),
        recentActivity: recentActivity.map(item => ({
          timestamp: item.timestamp.toISOString(),
          action: item.action,
          entity: item.entity_name,
          user: item.user_name,
          severity: item.severity
        }))
      }
      
      return reply.send({ data: stats })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao buscar estatísticas de auditoria' })
    }
  })

  // Get log details by ID
  fastify.get('/admin/audit/logs/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      
      const log = await prisma.auditLog.findUnique({
        where: { id }
      })
      
      if (!log) {
        return reply.status(404).send({ error: 'Log não encontrado' })
      }
      
      return reply.send({ data: log })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao buscar detalhes do log' })
    }
  })

  // Export audit logs
  fastify.get('/admin/audit/export', { schema: { querystring: auditLogFiltersSchema } }, async (request, reply) => {
    try {
      const filters = request.query as any
      
      // Build where clause (same as get logs)
      let whereClause: any = {}
      
      if (filters.search) {
        whereClause.OR = [
          { action: { contains: filters.search, mode: 'insensitive' } },
          { entity_name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { user_name: { contains: filters.search, mode: 'insensitive' } }
        ]
      }
      
      if (filters.category) whereClause.category = filters.category
      if (filters.severity) whereClause.severity = filters.severity
      if (filters.entity) whereClause.entity_type = filters.entity
      if (filters.userId) whereClause.user_id = filters.userId
      if (filters.tenantId) whereClause.tenant_id = filters.tenantId
      
      if (filters.start || filters.end) {
        whereClause.timestamp = {}
        if (filters.start) whereClause.timestamp.gte = new Date(filters.start)
        if (filters.end) whereClause.timestamp.lte = new Date(filters.end + 'T23:59:59.999Z')
      }
      
      // Get all logs (no pagination for export)
      const logs = await prisma.auditLog.findMany({
        where: whereClause,
        orderBy: { timestamp: 'desc' }
      })
      
      // Generate CSV
      const csv = [
        'Timestamp,Ação,Entidade,Entidade ID,Usuário,Email,IP Address,User Agent,Severidade,Categoria,Descrição,Old Values,New Values,Metadata',
        ...logs.map(log => [
          log.timestamp.toISOString(),
          log.action,
          log.entity_name,
          log.entity_id,
          log.user_name,
          log.user_email,
          log.ip_address,
          log.user_agent,
          log.severity,
          log.category,
          log.description,
          JSON.stringify(log.old_values),
          JSON.stringify(log.new_values),
          JSON.stringify(log.metadata)
        ].map(value => `"${value}"`).join(','))
      ].join('\n')
      
      reply.header('Content-Type', 'text/csv')
      reply.header('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`)
      return reply.send(csv)
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao exportar logs de auditoria' })
    }
  })

  // Create manual audit log entry
  fastify.post('/admin/audit/logs', { schema: { body: createAuditLogSchema } }, async (request, reply) => {
    try {
      const logData = request.body as any
      
      // Get user info from request (assuming it's available from auth middleware)
      const user = (request as any).user
      
      const auditLog = await prisma.auditLog.create({
        data: {
          ...logData,
          user_id: user.id,
          user_name: user.name,
          user_email: user.email,
          user_role: user.role,
          ip_address: request.ip,
          user_agent: request.headers['user-agent'] || 'Unknown',
          timestamp: new Date()
        }
      })
      
      return reply.send({ data: auditLog })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao criar log de auditoria' })
    }
  })

  // Search audit logs
  fastify.get('/admin/audit/search', { schema: { querystring: auditLogFiltersSchema } }, async (request, reply) => {
    try {
      const { search, limit = 50, offset = 0, ...filters } = request.query as any
      
      let whereClause: any = {}
      
      if (search) {
        whereClause.OR = [
          { action: { contains: search, mode: 'insensitive' } },
          { entity_name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { user_name: { contains: search, mode: 'insensitive' } }
        ]
      }
      
      // Apply other filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          if (key === 'dateRange' && typeof value === 'object') {
            whereClause.timestamp = {}
            if (value.start) whereClause.timestamp.gte = new Date(value.start)
            if (value.end) whereClause.timestamp.lte = new Date(value.end + 'T23:59:59.999Z')
          } else {
            whereClause[key] = value
          }
        }
      })
      
      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where: whereClause,
          orderBy: { timestamp: 'desc' },
          take: limit,
          skip: offset
        }),
        prisma.auditLog.count({ where: whereClause })
      ])
      
      return reply.send({
        data: logs,
        total,
        page: Math.floor(offset / limit) + 1,
        limit,
        totalPages: Math.ceil(total / limit)
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao pesquisar logs de auditoria' })
    }
  })

  // Get recent activity
  fastify.get('/admin/audit/recent', { 
    schema: { 
      querystring: z.object({
        limit: z.number().min(1).max(50).default(10)
      })
    } 
  }, async (request, reply) => {
    try {
      const { limit } = request.query as { limit: number }
      
      const logs = await prisma.auditLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: limit,
        select: {
          id: true,
          timestamp: true,
          action: true,
          entity_name: true,
          user_name: true,
          severity: true,
          description: true
        }
      })
      
      return reply.send({ data: logs })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao buscar atividade recente' })
    }
  })

  // Get security events
  fastify.get('/admin/audit/security', { 
    schema: { 
      querystring: z.object({
        period: z.enum(['24h', '7d', '30d']).default('7d')
      })
    } 
  }, async (request, reply) => {
    try {
      const { period } = request.query as { period: string }
      
      // Calculate date range
      const now = new Date()
      let startDate: Date
      
      switch (period) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          break
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      }
      
      const logs = await prisma.auditLog.findMany({
        where: {
          timestamp: { gte: startDate },
          category: 'security'
        },
        orderBy: { timestamp: 'desc' }
      })
      
      return reply.send({ data: logs })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao buscar eventos de segurança' })
    }
  })

  // Archive old logs
  fastify.post('/admin/audit/archive', { 
    schema: { 
      body: z.object({
        beforeDate: z.string()
      })
    } 
  }, async (request, reply) => {
    try {
      const { beforeDate } = request.body as { beforeDate: string }
      
      // Move logs to archive table (implementar se necessário)
      const archivedCount = await prisma.auditLog.deleteMany({
        where: {
          timestamp: {
            lt: new Date(beforeDate)
          }
        }
      })
      
      return reply.send({ data: { archived: archivedCount.count } })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao arquivivar logs antigos' })
    }
  })

  // Helper function to create audit logs (can be used by other routes)
  fastify.decorate('createAuditLog', async (data: {
    action: string
    entity_type: string
    entity_id: string
    entity_name: string
    old_values?: Record<string, any>
    new_values?: Record<string, any>
    description: string
    severity?: 'low' | 'medium' | 'high' | 'critical'
    category?: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'system' | 'security'
    metadata?: Record<string, any>
    user?: any
    request?: any
  }) => {
    try {
      const user = data.user || (data.request as any)?.user
      
      await prisma.auditLog.create({
        data: {
          action: data.action,
          entity_type: data.entity_type,
          entity_id: data.entity_id,
          entity_name: data.entity_name,
          old_values: data.old_values || {},
          new_values: data.new_values || {},
          user_id: user?.id || 'system',
          user_name: user?.name || 'System',
          user_email: user?.email || 'system@foodmanager.com',
          user_role: user?.role || 'system',
          ip_address: data.request?.ip || '127.0.0.1',
          user_agent: data.request?.headers?.['user-agent'] || 'Unknown',
          timestamp: new Date(),
          severity: data.severity || 'medium',
          category: data.category || 'system',
          description: data.description,
          metadata: data.metadata || {}
        }
      })
    } catch (error) {
      fastify.log.error('Error creating audit log:', error)
    }
  })
}
