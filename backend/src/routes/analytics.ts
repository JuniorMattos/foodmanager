import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import { authenticateAdmin } from '../middleware/adminAuth'

// Schemas para validação
const analyticsFiltersSchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y']),
  tenantId: z.string().optional(),
  compareWith: z.enum(['previous', 'last_year', 'none']).optional(),
  metrics: z.array(z.string()).optional()
})

const customReportSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  metrics: z.array(z.string()),
  filters: analyticsFiltersSchema,
  schedule: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    email: z.array(z.string().email())
  }).optional()
})

const eventSchema = z.object({
  type: z.string(),
  data: z.any(),
  tenantId: z.string().optional(),
  userId: z.string().optional()
})

export async function analyticsRoutes(fastify: FastifyInstance) {
  // Middleware de autenticação
  fastify.addHook('preHandler', authenticateAdmin)

  // Dashboard Analytics
  fastify.get('/admin/analytics/dashboard', { schema: { querystring: analyticsFiltersSchema } }, async (request, reply) => {
    try {
      const filters = request.query as any
      const period = parseInt(filters.period.replace('d', '').replace('y', '365'))
      
      // Calcular datas
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - period)

      // Revenue Analytics
      const revenueData = await prisma.order.groupBy({
        by: ['created_at'],
        where: {
          created_at: {
            gte: startDate,
            lte: endDate
          },
          ...(filters.tenantId && { tenant_id: filters.tenantId })
        },
        _sum: { total_amount: true },
        _count: { id: true }
      })

      // Tenant Analytics
      const tenantStats = await prisma.tenant.findMany({
        where: {
          ...(filters.tenantId && { id: filters.tenantId })
        },
        include: {
          _count: {
            select: {
              users: true,
              orders: true
            }
          }
        }
      })

      // User Analytics
      const userStats = await prisma.user.groupBy({
        by: ['tenant_id'],
        where: {
          created_at: {
            gte: startDate,
            lte: endDate
          },
          ...(filters.tenantId && { tenant_id: filters.tenantId })
        },
        _count: { id: true }
      })

      // Order Analytics
      const orderStats = await prisma.order.groupBy({
        by: ['status'],
        where: {
          created_at: {
            gte: startDate,
            lte: endDate
          },
          ...(filters.tenantId && { tenant_id: filters.tenantId })
        },
        _count: { id: true },
        _sum: { total_amount: true }
      })

      // Performance Metrics (mock para desenvolvimento)
      const performanceData = {
        apiResponseTime: Math.floor(Math.random() * 200) + 50,
        uptime: 99.9 + Math.random() * 0.09,
        errorRate: Math.random() * 0.1,
        databaseQueries: Math.floor(Math.random() * 100000) + 50000,
        storageUsed: (Math.random() * 5 + 1).toFixed(1)
      }

      const analyticsData = {
        revenue: {
          daily: Array.from({ length: Math.min(period, 30) }, (_, i) => ({
            date: new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000).toLocaleDateString(),
            revenue: Math.floor(Math.random() * 5000) + 2000,
            orders: Math.floor(Math.random() * 100) + 50
          })),
          monthly: Array.from({ length: 12 }, (_, i) => ({
            month: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i],
            revenue: Math.floor(Math.random() * 50000) + 30000,
            orders: Math.floor(Math.random() * 1000) + 500
          })),
          total: revenueData.reduce((sum, item) => sum + (item._sum.total_amount || 0), 0),
          growth: 15.7 // TODO: Calcular crescimento real
        },
        tenants: {
          total: tenantStats.length,
          active: tenantStats.filter(t => t.is_active).length,
          new: tenantStats.filter(t => t.created_at >= startDate).length,
          churned: 0, // TODO: Implementar churn calculation
          growth: 8.3, // TODO: Calcular crescimento real
          byPlan: [
            { plan: 'Basic', count: tenantStats.filter(t => t.plan === 'basic').length, revenue: 267000 },
            { plan: 'Premium', count: tenantStats.filter(t => t.plan === 'premium').length, revenue: 468000 },
            { plan: 'Enterprise', count: tenantStats.filter(t => t.plan === 'enterprise').length, revenue: 515000 }
          ]
        },
        users: {
          total: userStats.reduce((sum, item) => sum + item._count.id, 0),
          active: Math.floor(userStats.reduce((sum, item) => sum + item._count.id, 0) * 0.7),
          new: userStats.reduce((sum, item) => sum + item._count.id, 0),
          retention: 87.3, // TODO: Calcular retenção real
          byTenant: tenantStats.slice(0, 5).map(tenant => ({
            tenant: tenant.name,
            users: tenant._count.users,
            growth: Math.random() * 20 - 5
          }))
        },
        orders: {
          total: orderStats.reduce((sum, item) => sum + item._count.id, 0),
          daily: Array.from({ length: Math.min(period, 30) }, (_, i) => ({
            date: new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000).toLocaleDateString(),
            orders: Math.floor(Math.random() * 500) + 200,
            value: Math.floor(Math.random() * 10000) + 5000
          })),
          averageValue: 67.50, // TODO: Calcular valor médio real
          completionRate: 94.7, // TODO: Calcular taxa de conclusão real
          byStatus: orderStats.map(item => ({
            status: item.status,
            count: item._count.id
          }))
        },
        performance: performanceData
      }

      return reply.send({ data: analyticsData })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao buscar analytics do dashboard' })
    }
  })

  // Revenue Analytics
  fastify.get('/admin/analytics/revenue', { schema: { querystring: analyticsFiltersSchema } }, async (request, reply) => {
    try {
      const filters = request.query as any
      const period = parseInt(filters.period.replace('d', '').replace('y', '365'))
      
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - period)

      const revenueData = await prisma.order.groupBy({
        by: ['created_at'],
        where: {
          created_at: {
            gte: startDate,
            lte: endDate
          },
          ...(filters.tenantId && { tenant_id: filters.tenantId })
        },
        _sum: { total_amount: true },
        _count: { id: true }
      })

      const analytics = {
        total: revenueData.reduce((sum, item) => sum + (item._sum.total_amount || 0), 0),
        daily: revenueData.map(item => ({
          date: item.created_at.toISOString().split('T')[0],
          revenue: item._sum.total_amount || 0,
          orders: item._count.id
        })),
        growth: 15.7 // TODO: Calcular crescimento real
      }

      return reply.send({ data: analytics })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao buscar analytics de receita' })
    }
  })

  // Tenant Analytics
  fastify.get('/admin/analytics/tenants', { schema: { querystring: analyticsFiltersSchema } }, async (request, reply) => {
    try {
      const filters = request.query as any
      const period = parseInt(filters.period.replace('d', '').replace('y', '365'))
      
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - period)

      const tenantData = await prisma.tenant.findMany({
        where: {
          ...(filters.tenantId && { id: filters.tenantId })
        },
        include: {
          _count: {
            select: {
              users: true,
              orders: true
            }
          },
          orders: {
            where: {
              created_at: {
                gte: startDate,
                lte: endDate
              }
            },
            _sum: { total_amount: true }
          }
        }
      })

      const analytics = {
        total: tenantData.length,
        active: tenantData.filter(t => t.is_active).length,
        new: tenantData.filter(t => t.created_at >= startDate).length,
        byPlan: [
          { plan: 'Basic', count: tenantData.filter(t => t.plan === 'basic').length },
          { plan: 'Premium', count: tenantData.filter(t => t.plan === 'premium').length },
          { plan: 'Enterprise', count: tenantData.filter(t => t.plan === 'enterprise').length }
        ],
        topPerformers: tenantData
          .map(tenant => ({
            id: tenant.id,
            name: tenant.name,
            revenue: tenant.orders.reduce((sum, order) => sum + (order._sum.total_amount || 0), 0),
            orders: tenant._count.orders,
            users: tenant._count.users
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10)
      }

      return reply.send({ data: analytics })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao buscar analytics de tenants' })
    }
  })

  // User Analytics
  fastify.get('/admin/analytics/users', { schema: { querystring: analyticsFiltersSchema } }, async (request, reply) => {
    try {
      const filters = request.query as any
      const period = parseInt(filters.period.replace('d', '').replace('y', '365'))
      
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - period)

      const userData = await prisma.user.groupBy({
        by: ['tenant_id', 'created_at'],
        where: {
          created_at: {
            gte: startDate,
            lte: endDate
          },
          ...(filters.tenantId && { tenant_id: filters.tenantId })
        },
        _count: { id: true }
      })

      const analytics = {
        total: userData.reduce((sum, item) => sum + item._count.id, 0),
        new: userData.reduce((sum, item) => sum + item._count.id, 0),
        daily: userData.map(item => ({
          date: item.created_at.toISOString().split('T')[0],
          users: item._count.id
        })),
        byTenant: userData.map(item => ({
          tenantId: item.tenant_id,
          users: item._count.id
        }))
      }

      return reply.send({ data: analytics })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao buscar analytics de usuários' })
    }
  })

  // Order Analytics
  fastify.get('/admin/analytics/orders', { schema: { querystring: analyticsFiltersSchema } }, async (request, reply) => {
    try {
      const filters = request.query as any
      const period = parseInt(filters.period.replace('d', '').replace('y', '365'))
      
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - period)

      const orderData = await prisma.order.groupBy({
        by: ['status', 'created_at'],
        where: {
          created_at: {
            gte: startDate,
            lte: endDate
          },
          ...(filters.tenantId && { tenant_id: filters.tenantId })
        },
        _count: { id: true },
        _sum: { total_amount: true }
      })

      const analytics = {
        total: orderData.reduce((sum, item) => sum + item._count.id, 0),
        byStatus: orderData.map(item => ({
          status: item.status,
          count: item._count.id,
          revenue: item._sum.total_amount || 0
        })),
        daily: orderData.map(item => ({
          date: item.created_at.toISOString().split('T')[0],
          orders: item._count.id,
          revenue: item._sum.total_amount || 0
        })),
        averageValue: orderData.reduce((sum, item) => sum + (item._sum.total_amount || 0), 0) / orderData.reduce((sum, item) => sum + item._count.id, 0)
      }

      return reply.send({ data: analytics })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao buscar analytics de pedidos' })
    }
  })

  // Performance Analytics
  fastify.get('/admin/analytics/performance', { schema: { querystring: analyticsFiltersSchema } }, async (request, reply) => {
    try {
      // Mock data para performance metrics
      const performanceData = {
        apiResponseTime: Math.floor(Math.random() * 200) + 50,
        uptime: 99.9 + Math.random() * 0.09,
        errorRate: Math.random() * 0.1,
        databaseQueries: Math.floor(Math.random() * 100000) + 50000,
        storageUsed: (Math.random() * 5 + 1).toFixed(1),
        memoryUsage: process.memoryUsage(),
        cpuUsage: Math.random() * 100,
        activeConnections: Math.floor(Math.random() * 1000) + 100
      }

      return reply.send({ data: performanceData })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao buscar analytics de performance' })
    }
  })

  // Top Performers
  fastify.get('/admin/analytics/top-performers', { schema: { querystring: analyticsFiltersSchema } }, async (request, reply) => {
    try {
      const filters = request.query as any
      const limit = parseInt(request.query as any).limit || 10
      
      const topTenants = await prisma.tenant.findMany({
        where: {
          ...(filters.tenantId && { id: filters.tenantId })
        },
        include: {
          orders: {
            _sum: { total_amount: true },
            _count: { id: true }
          },
          _count: {
            select: {
              users: true
            }
          }
        },
        orderBy: {
          orders: {
            _sum: {
              total_amount: 'desc'
            }
          }
        },
        take: limit
      })

      const topPerformers = topTenants.map(tenant => ({
        id: tenant.id,
        name: tenant.name,
        revenue: tenant.orders._sum.total_amount || 0,
        orders: tenant.orders._count.id,
        users: tenant._count.users,
        growth: Math.random() * 20 - 5 // TODO: Calcular crescimento real
      }))

      return reply.send({ data: topPerformers })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao buscar top performers' })
    }
  })

  // Real-time Analytics
  fastify.get('/admin/analytics/realtime', async (request, reply) => {
    try {
      const realTimeData = {
        activeUsers: Math.floor(Math.random() * 1000) + 500,
        onlineTenants: Math.floor(Math.random() * 50) + 10,
        currentOrders: Math.floor(Math.random() * 100) + 20,
        serverLoad: Math.random() * 100,
        recentActivity: [
          { type: 'order', tenant: 'Burger Express', time: new Date() },
          { type: 'user_signup', tenant: 'Pizza Palace', time: new Date() },
          { type: 'payment', tenant: 'Sushi Master', time: new Date() }
        ]
      }

      return reply.send({ data: realTimeData })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao buscar analytics em tempo real' })
    }
  })

  // Export Analytics
  fastify.get('/admin/analytics/export', { schema: { querystring: analyticsFiltersSchema } }, async (request, reply) => {
    try {
      const filters = request.query as any
      const format = request.query.format || 'csv'
      
      // Buscar dados completos
      const analyticsData = await prisma.order.findMany({
        where: {
          ...(filters.tenantId && { tenant_id: filters.tenantId })
        },
        include: {
          tenant: true,
          user: true
        }
      })

      if (format === 'csv') {
        const csv = [
          'ID,Tenant,User,Status,Total Amount,Created At',
          ...analyticsData.map(order => 
            `${order.id},${order.tenant.name},${order.user.name},${order.status},${order.total_amount},${order.created_at}`
          )
        ].join('\n')

        reply.header('Content-Type', 'text/csv')
        reply.header('Content-Disposition', 'attachment; filename="analytics.csv"')
        return reply.send(csv)
      }

      // TODO: Implementar outros formatos (xlsx, pdf)
      return reply.send({ data: analyticsData })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao exportar analytics' })
    }
  })

  // Track Event
  fastify.post('/admin/analytics/events', { schema: { body: eventSchema } }, async (request, reply) => {
    try {
      const eventData = request.body as any
      
      // Salvar evento no banco (TODO: criar tabela analytics_events)
      console.log('Analytics event:', eventData)
      
      return reply.send({ success: true })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao registrar evento' })
    }
  })

  // Get Event History
  fastify.get('/admin/analytics/events', async (request, reply) => {
    try {
      const filters = request.query as any
      
      // Mock data para eventos
      const events = [
        { id: 1, type: 'order', data: { orderId: 123 }, tenantId: '1', userId: '1', createdAt: new Date() },
        { id: 2, type: 'user_signup', data: { userId: 456 }, tenantId: '2', userId: '2', createdAt: new Date() },
        { id: 3, type: 'payment', data: { amount: 100 }, tenantId: '3', userId: '3', createdAt: new Date() }
      ]

      return reply.send({ data: events })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao buscar histórico de eventos' })
    }
  })
}
