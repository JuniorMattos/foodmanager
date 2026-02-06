export interface AuditLogEntry {
  id: string
  action: string
  entity_type: 'tenant' | 'user' | 'order' | 'product' | 'system' | 'admin'
  entity_id: string
  entity_name: string
  old_values: Record<string, any>
  new_values: Record<string, any>
  user_id: string
  user_name: string
  user_email: string
  user_role: string
  ip_address: string
  user_agent: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'system' | 'security'
  description: string
  metadata: Record<string, any>
}

export interface AuditLogStats {
  total: number
  today: number
  thisWeek: number
  thisMonth: number
  byCategory: Record<string, number>
  bySeverity: Record<string, number>
  byEntity: Record<string, number>
  recentActivity: Array<{
    timestamp: string
    action: string
    entity: string
    user: string
    severity: string
  }>
}

export interface AuditLogFilters {
  search: string
  category: string
  severity: string
  entity: string
  dateRange: {
    start: string
    end: string
  }
  userId?: string
  tenantId?: string
}

export interface AuditLogConfig {
  retention: number
  alertOnCritical: boolean
  alertOnMassDelete: boolean
  alertOnConfigChanges: boolean
  autoExportCritical: boolean
  autoArchiveOld: boolean
}
