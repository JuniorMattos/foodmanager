import { api } from './api'
import { TenantWithStats, AdminUser, CreateTenantData, TenantStats, TenantFilters } from '@/types/admin'
import { ExportHistory, ImportHistory, ExportConfig, ImportResult } from '@/types/exportImport'

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
  totalPages: number
}

export const adminApi = {
  // Dashboard Stats
  async getStats(): Promise<TenantStats> {
    const response = await api.get<ApiResponse<TenantStats>>('/admin/stats')
    return response.data.data
  },

  // Tenants Management
  async getTenants(filters?: TenantFilters): Promise<TenantWithStats[]> {
    const params = new URLSearchParams()
    
    if (filters) {
      if (filters.search) params.append('search', filters.search)
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.plan !== 'all') params.append('plan', filters.plan)
      if (filters.sort_by) params.append('sort_by', filters.sort_by)
      if (filters.sort_order) params.append('sort_order', filters.sort_order)
      if (filters.created_at) params.append('created_at', filters.created_at)
    }

    const response = await api.get<ApiResponse<TenantWithStats[]>>(`/admin/tenants?${params.toString()}`)
    return response.data.data
  },

  async getTenant(id: string): Promise<TenantWithStats> {
    const response = await api.get<ApiResponse<TenantWithStats>>(`/admin/tenants/${id}`)
    return response.data.data
  },

  async createTenant(data: CreateTenantData): Promise<TenantWithStats> {
    const response = await api.post<ApiResponse<TenantWithStats>>('/admin/tenants', data)
    return response.data.data
  },

  async updateTenant(id: string, data: Partial<TenantWithStats>): Promise<TenantWithStats> {
    const response = await api.put<ApiResponse<TenantWithStats>>(`/admin/tenants/${id}`, data)
    return response.data.data
  },

  async deleteTenant(id: string): Promise<void> {
    await api.delete(`/admin/tenants/${id}`)
  },

  async toggleTenantStatus(id: string): Promise<TenantWithStats> {
    const response = await api.patch<ApiResponse<TenantWithStats>>(`/admin/tenants/${id}/toggle-status`)
    return response.data.data
  },

  // Tenant Users Management
  async getTenantUsers(tenantId: string): Promise<AdminUser[]> {
    const response = await api.get<ApiResponse<AdminUser[]>>(`/admin/tenants/${tenantId}/users`)
    return response.data.data
  },

  async createTenantUser(tenantId: string, userData: Omit<AdminUser, 'id' | 'created_at' | 'updated_at'>): Promise<AdminUser> {
    const response = await api.post<ApiResponse<AdminUser>>(`/admin/tenants/${tenantId}/users`, userData)
    return response.data.data
  },

  async updateTenantUser(tenantId: string, userId: string, userData: Partial<AdminUser>): Promise<AdminUser> {
    const response = await api.put<ApiResponse<AdminUser>>(`/admin/tenants/${tenantId}/users/${userId}`, userData)
    return response.data.data
  },

  async deleteTenantUser(tenantId: string, userId: string): Promise<void> {
    await api.delete(`/admin/tenants/${tenantId}/users/${userId}`)
  },

  // Tenant Analytics
  async getTenantAnalytics(tenantId: string, period?: '7d' | '30d' | '90d'): Promise<any> {
    const params = period ? `?period=${period}` : ''
    const response = await api.get(`/admin/tenants/${tenantId}/analytics${params}`)
    return response.data
  },

  // Tenant Export/Import Operations
  async exportTenants(config: {
    format: 'csv' | 'xlsx' | 'json' | 'sql'
    include: {
      basic: boolean
      users: boolean
      orders: boolean
      settings: boolean
      branding: boolean
    }
    filters: {
      status: 'all' | 'active' | 'inactive'
      plan: 'all' | 'basic' | 'premium' | 'enterprise'
      dateRange: {
        start: string
        end: string
      }
    }
  }): Promise<Blob> {
    const params = new URLSearchParams()
    params.append('format', config.format)
    params.append('include', JSON.stringify(config.include))
    params.append('filters', JSON.stringify(config.filters))

    const response = await api.get<Blob>(`/admin/tenants/export?${params.toString()}`, {
      responseType: 'blob'
    })
    return response.data
  },

  async importTenants(file: File): Promise<{
    success: boolean
    processed: number
    created: number
    updated: number
    errors: string[]
    warnings: string[]
    preview?: any[]
  }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post<ApiResponse<ImportResult>>('/admin/tenants/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      } as any
    })
    return response.data.data
  },

  async getExportHistory(): Promise<ExportHistory[]> {
    const response = await api.get<ApiResponse<ExportHistory[]>>('/admin/tenants/export/history')
    return response.data.data
  },

  async getImportHistory(): Promise<ImportHistory[]> {
    const response = await api.get<ApiResponse<ImportHistory[]>>('/admin/tenants/import/history')
    return response.data.data
  },

  async deleteExportFile(fileId: string): Promise<void> {
    await api.delete(`/admin/tenants/export/${fileId}`)
  },

  async deleteImportFile(fileId: string): Promise<void> {
    await api.delete(`/admin/tenants/import/${fileId}`)
  },

  // Bulk Operations
  async bulkToggleTenantStatus(tenantIds: string[], active: boolean): Promise<TenantWithStats[]> {
    const response = await api.put<ApiResponse<TenantWithStats[]>>('/admin/tenants/bulk-toggle', {
      tenantIds,
      active
    })
    return response.data.data
  },

  async bulkDeleteTenants(tenantIds: string[]): Promise<void> {
    await api.post('/admin/tenants/bulk-delete', {
      tenant_ids: tenantIds
    })
  },

  // Audit Log
  async getAuditLog(tenantId?: string, page = 1, limit = 50): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    
    if (tenantId) {
      params.append('tenant_id', tenantId)
    }

    const response = await api.get(`/admin/audit-log?${params.toString()}`)
    return response.data
  },

  // System Health
  async getSystemHealth(): Promise<any> {
    const response = await api.get('/admin/system-health')
    return response.data
  }
}
