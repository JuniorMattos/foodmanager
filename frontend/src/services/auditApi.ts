import { api } from './api'
import { AuditLogEntry, AuditLogStats, AuditLogFilters, AuditLogConfig } from '@/types/audit'
import type { AxiosRequestConfig } from 'axios'

// Tipos para respostas da API
interface ApiResponse<T> {
  data: T
  message?: string
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export const auditApi = {
  // Get audit logs with filters
  async getAuditLogs(filters: Partial<AuditLogFilters> = {}): Promise<PaginatedResponse<AuditLogEntry>> {
    const params = new URLSearchParams()
    
    if (filters.search) params.append('search', filters.search)
    if (filters.category) params.append('category', filters.category)
    if (filters.severity) params.append('severity', filters.severity)
    if (filters.entity) params.append('entity', filters.entity)
    if (filters.dateRange) {
      params.append('start', filters.dateRange.start)
      params.append('end', filters.dateRange.end)
    }
    if (filters.userId) params.append('userId', filters.userId)
    if (filters.tenantId) params.append('tenantId', filters.tenantId)

    const response = await api.get<ApiResponse<PaginatedResponse<AuditLogEntry>>>(`/admin/audit/logs?${params.toString()}`)
    return response.data.data
  },

  // Get audit statistics
  async getAuditStats(period: '24h' | '7d' | '30d' | '90d' = '7d'): Promise<AuditLogStats> {
    const response = await api.get<ApiResponse<AuditLogStats>>(`/admin/audit/stats?period=${period}`)
    return response.data.data
  },

  // Get log details by ID
  async getLogById(id: string): Promise<AuditLogEntry> {
    const response = await api.get<ApiResponse<AuditLogEntry>>(`/admin/audit/logs/${id}`)
    return response.data.data
  },

  // Export audit logs
  async exportAuditLogs(filters: Partial<AuditLogFilters> = {}): Promise<Blob> {
    const params = new URLSearchParams()
    
    if (filters.search) params.append('search', filters.search)
    if (filters.category) params.append('category', filters.category)
    if (filters.severity) params.append('severity', filters.severity)
    if (filters.entity) params.append('entity', filters.entity)
    if (filters.dateRange) {
      params.append('start', filters.dateRange.start)
      params.append('end', filters.dateRange.end)
    }

    const response = await api.get<Blob>(`/admin/audit/export?${params.toString()}`, {
      responseType: 'blob'
    })
    return response.data
  },

  // Get audit configuration
  async getAuditConfig(): Promise<AuditLogConfig> {
    const response = await api.get<ApiResponse<AuditLogConfig>>('/admin/audit/config')
    return response.data.data
  },

  // Update audit configuration
  async updateAuditConfig(config: Partial<AuditLogConfig>): Promise<AuditLogConfig> {
    const response = await api.put<ApiResponse<AuditLogConfig>>('/admin/audit/config', config)
    return response.data.data
  },

  // Create manual audit log entry
  async createAuditLog(entry: {
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
  }): Promise<AuditLogEntry> {
    const response = await api.post<ApiResponse<AuditLogEntry>>('/admin/audit/logs', entry)
    return response.data.data
  },

  // Search audit logs
  async searchAuditLogs(query: {
    search: string
    filters?: Partial<AuditLogFilters>
    limit?: number
    offset?: number
  }): Promise<PaginatedResponse<AuditLogEntry>> {
    const params = new URLSearchParams()
    params.append('search', query.search)
    params.append('limit', (query.limit || 50).toString())
    params.append('offset', (query.offset || 0).toString())
    
    if (query.filters) {
      Object.entries(query.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          if (key === 'dateRange' && typeof value === 'object') {
            params.append('start', value.start)
            params.append('end', value.end)
          } else {
            params.append(key, String(value))
          }
        }
      })
    }

    const response = await api.get<ApiResponse<PaginatedResponse<AuditLogEntry>>>(`/admin/audit/search?${params.toString()}`)
    return response.data.data
  },

  // Get recent activity
  async getRecentActivity(limit: number = 10): Promise<AuditLogEntry[]> {
    const response = await api.get<ApiResponse<AuditLogEntry[]>>(`/admin/audit/recent?limit=${limit}`)
    return response.data.data
  },

  // Get security events
  async getSecurityEvents(period: '24h' | '7d' | '30d' = '7d'): Promise<AuditLogEntry[]> {
    const response = await api.get<ApiResponse<AuditLogEntry[]>>(`/admin/audit/security?period=${period}`)
    return response.data.data
  },

  // Get user activity
  async getUserActivity(userId: string, period: '24h' | '7d' | '30d' = '7d'): Promise<AuditLogEntry[]> {
    const response = await api.get<ApiResponse<AuditLogEntry[]>>(`/admin/audit/users/${userId}?period=${period}`)
    return response.data.data
  },

  // Get tenant activity
  async getTenantActivity(tenantId: string, period: '24h' | '7d' | '30d' = '7d'): Promise<AuditLogEntry[]> {
    const response = await api.get<ApiResponse<AuditLogEntry[]>>(`/admin/audit/tenants/${tenantId}?period=${period}`)
    return response.data.data
  },

  // Archive old logs
  async archiveOldLogs(beforeDate: string): Promise<{ archived: number }> {
    const response = await api.post<ApiResponse<{ archived: number }>>('/admin/audit/archive', { beforeDate })
    return response.data.data
  },

  // Delete logs by criteria
  async deleteLogs(criteria: {
    beforeDate?: string
    category?: string
    severity?: string
    entity_type?: string
  }): Promise<{ deleted: number }> {
    const response = await api.delete<ApiResponse<{ deleted: number }>>('/admin/audit/logs', { data: criteria } as AxiosRequestConfig)
    return response.data.data
  },

  // Get audit metrics
  async getAuditMetrics(period: '24h' | '7d' | '30d' | '90d' = '7d'): Promise<{
    totalLogs: number
    logsPerHour: Array<{ hour: string; count: number }>
    topUsers: Array<{ userId: string; userName: string; count: number }>
    topEntities: Array<{ entityType: string; entityId: string; entityName: string; count: number }>
    securityEvents: Array<{
      timestamp: string
      type: string
      description: string
      severity: string
    }>
  }> {
    const response = await api.get<ApiResponse<any>>(`/admin/audit/metrics?period=${period}`)
    return response.data.data
  },

  // Generate audit report
  async generateAuditReport(config: {
    period: '24h' | '7d' | '30d' | '90d'
    format: 'pdf' | 'csv' | 'json'
    includeCharts?: boolean
    includeMetrics?: boolean
    includeSecurity?: boolean
  }): Promise<Blob> {
    const params = new URLSearchParams()
    params.append('period', config.period)
    params.append('format', config.format)
    if (config.includeCharts) params.append('includeCharts', 'true')
    if (config.includeMetrics) params.append('includeMetrics', 'true')
    if (config.includeSecurity) params.append('includeSecurity', 'true')

    const response = await api.get<Blob>(`/admin/audit/report?${params.toString()}`, {
      responseType: 'blob'
    })
    return response.data
  }
}
