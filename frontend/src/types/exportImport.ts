export interface ExportHistory {
  id: string
  filename: string
  format: string
  size: number
  records: number
  created_at: string
  created_by: string
  filters: any
  status: 'completed' | 'processing' | 'failed'
  download_url?: string
}

export interface ImportHistory {
  id: string
  filename: string
  format: string
  size: number
  records: number
  processed: number
  created: number
  updated: number
  errors: string[]
  created_at: string
  created_by: string
  status: 'completed' | 'processing' | 'failed'
}

export interface ExportConfig {
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
}

export interface ImportResult {
  success: boolean
  processed: number
  created: number
  updated: number
  errors: string[]
  warnings: string[]
  preview?: any[]
}
