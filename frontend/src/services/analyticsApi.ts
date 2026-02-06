import { api } from './api'

// Tipos para analytics
interface AnalyticsData {
  revenue: {
    daily: Array<{ date: string; revenue: number; orders: number }>
    monthly: Array<{ month: string; revenue: number; orders: number }>
    total: number
    growth: number
  }
  tenants: {
    total: number
    active: number
    new: number
    churned: number
    growth: number
    byPlan: Array<{ plan: string; count: number; revenue: number }>
  }
  users: {
    total: number
    active: number
    new: number
    retention: number
    byTenant: Array<{ tenant: string; users: number; growth: number }>
  }
  orders: {
    total: number
    daily: Array<{ date: string; orders: number; value: number }>
    averageValue: number
    completionRate: number
    byStatus: Array<{ status: string; count: number }>
  }
  performance: {
    apiResponseTime: number
    uptime: number
    errorRate: number
    databaseQueries: number
    storageUsed: number
  }
}

interface AnalyticsFilters {
  period: '7d' | '30d' | '90d' | '1y'
  tenantId?: string
  compareWith?: 'previous' | 'last_year' | 'none'
  metrics?: string[]
}

interface ApiResponse<T> {
  data: T
  message?: string
}

export const analyticsApi = {
  // Dashboard Analytics
  async getDashboardAnalytics(filters: AnalyticsFilters): Promise<AnalyticsData> {
    const params = new URLSearchParams()
    params.append('period', filters.period)
    
    if (filters.tenantId) params.append('tenantId', filters.tenantId)
    if (filters.compareWith) params.append('compareWith', filters.compareWith)
    if (filters.metrics) params.append('metrics', filters.metrics.join(','))

    const response = await api.get<ApiResponse<AnalyticsData>>(`/admin/analytics/dashboard?${params.toString()}`)
    return response.data.data
  },

  // Revenue Analytics
  async getRevenueAnalytics(filters: AnalyticsFilters): Promise<any> {
    const params = new URLSearchParams()
    params.append('period', filters.period)
    
    if (filters.tenantId) params.append('tenantId', filters.tenantId)

    const response = await api.get(`/admin/analytics/revenue?${params.toString()}`)
    return response.data
  },

  // Tenant Analytics
  async getTenantAnalytics(filters: AnalyticsFilters): Promise<any> {
    const params = new URLSearchParams()
    params.append('period', filters.period)
    
    if (filters.tenantId) params.append('tenantId', filters.tenantId)

    const response = await api.get(`/admin/analytics/tenants?${params.toString()}`)
    return response.data
  },

  // User Analytics
  async getUserAnalytics(filters: AnalyticsFilters): Promise<any> {
    const params = new URLSearchParams()
    params.append('period', filters.period)
    
    if (filters.tenantId) params.append('tenantId', filters.tenantId)

    const response = await api.get(`/admin/analytics/users?${params.toString()}`)
    return response.data
  },

  // Order Analytics
  async getOrderAnalytics(filters: AnalyticsFilters): Promise<any> {
    const params = new URLSearchParams()
    params.append('period', filters.period)
    
    if (filters.tenantId) params.append('tenantId', filters.tenantId)

    const response = await api.get(`/admin/analytics/orders?${params.toString()}`)
    return response.data
  },

  // Performance Analytics
  async getPerformanceAnalytics(filters: AnalyticsFilters): Promise<any> {
    const params = new URLSearchParams()
    params.append('period', filters.period)
    
    if (filters.tenantId) params.append('tenantId', filters.tenantId)

    const response = await api.get(`/admin/analytics/performance?${params.toString()}`)
    return response.data
  },

  // Top Performers
  async getTopPerformers(filters: AnalyticsFilters): Promise<any> {
    const params = new URLSearchParams()
    params.append('period', filters.period)
    params.append('limit', '10')
    
    if (filters.tenantId) params.append('tenantId', filters.tenantId)

    const response = await api.get(`/admin/analytics/top-performers?${params.toString()}`)
    return response.data
  },

  // Real-time Analytics
  async getRealTimeAnalytics(): Promise<any> {
    const response = await api.get('/admin/analytics/realtime')
    return response.data
  },

  // Export Analytics
  async exportAnalytics(filters: AnalyticsFilters, format: 'csv' | 'xlsx' | 'pdf' = 'csv'): Promise<Blob> {
    const params = new URLSearchParams()
    params.append('period', filters.period)
    params.append('format', format)
    
    if (filters.tenantId) params.append('tenantId', filters.tenantId)
    if (filters.compareWith) params.append('compareWith', filters.compareWith)
    if (filters.metrics) params.append('metrics', filters.metrics.join(','))

    const response = await api.get<Blob>(`/admin/analytics/export?${params.toString()}`, {
      responseType: 'blob'
    })
    return response.data
  },

  // Custom Reports
  async generateCustomReport(config: {
    name: string
    description: string
    metrics: string[]
    filters: AnalyticsFilters
    schedule?: {
      frequency: 'daily' | 'weekly' | 'monthly'
      email: string[]
    }
  }): Promise<any> {
    const response = await api.post('/admin/analytics/custom-reports', config)
    return response.data
  },

  // Get Custom Reports
  async getCustomReports(): Promise<any> {
    const response = await api.get('/admin/analytics/custom-reports')
    return response.data
  },

  // Delete Custom Report
  async deleteCustomReport(reportId: string): Promise<void> {
    await api.delete(`/admin/analytics/custom-reports/${reportId}`)
  },

  // Analytics Events (for tracking)
  async trackEvent(event: {
    type: string
    data: any
    tenantId?: string
    userId?: string
  }): Promise<void> {
    await api.post('/admin/analytics/events', event)
  },

  // Get Event History
  async getEventHistory(filters: {
    type?: string
    tenantId?: string
    startDate?: string
    endDate?: string
    limit?: number
  }): Promise<any> {
    const params = new URLSearchParams()
    
    if (filters.type) params.append('type', filters.type)
    if (filters.tenantId) params.append('tenantId', filters.tenantId)
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)
    if (filters.limit) params.append('limit', filters.limit.toString())

    const response = await api.get(`/admin/analytics/events?${params.toString()}`)
    return response.data
  },

  // Funnel Analytics
  async getFunnelAnalytics(funnelId: string, filters: AnalyticsFilters): Promise<any> {
    const params = new URLSearchParams()
    params.append('period', filters.period)
    
    if (filters.tenantId) params.append('tenantId', filters.tenantId)

    const response = await api.get(`/admin/analytics/funnels/${funnelId}?${params.toString()}`)
    return response.data
  },

  // Cohort Analytics
  async getCohortAnalytics(filters: AnalyticsFilters): Promise<any> {
    const params = new URLSearchParams()
    params.append('period', filters.period)
    
    if (filters.tenantId) params.append('tenantId', filters.tenantId)

    const response = await api.get(`/admin/analytics/cohorts?${params.toString()}`)
    return response.data
  },

  // Heatmap Analytics
  async getHeatmapAnalytics(type: 'user_activity' | 'orders' | 'revenue', filters: AnalyticsFilters): Promise<any> {
    const params = new URLSearchParams()
    params.append('type', type)
    params.append('period', filters.period)
    
    if (filters.tenantId) params.append('tenantId', filters.tenantId)

    const response = await api.get(`/admin/analytics/heatmap?${params.toString()}`)
    return response.data
  }
}
