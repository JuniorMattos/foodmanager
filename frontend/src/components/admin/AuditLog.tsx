import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Settings, 
  Database, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Download, 
  RefreshCw,
  ChevronDown,
  Info,
  Activity,
  Users,
  Building2,
  FileText,
  Trash2,
  Edit,
  Plus,
  LogIn,
  LogOut,
  Key,
  Mail,
  CreditCard,
  Package,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface AuditLogEntry {
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

interface AuditLogProps {
  tenantId?: string
  userId?: string
  showFilters?: boolean
  maxHeight?: string
}

export function AuditLog({ tenantId, userId, showFilters = true, maxHeight = '600px' }: AuditLogProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [selectedEntity, setSelectedEntity] = useState<string>('all')
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [showDetails, setShowDetails] = useState<string | null>(null)
  const [expandedFilters, setExpandedFilters] = useState(false)

  useEffect(() => {
    fetchAuditLogs()
  }, [tenantId, userId, selectedCategory, selectedSeverity, selectedEntity, dateRange])

  const fetchAuditLogs = async () => {
    setLoading(true)
    try {
      // Mock data - substituir com API real
      const mockLogs: AuditLogEntry[] = [
        {
          id: '1',
          action: 'tenant_created',
          entity_type: 'tenant',
          entity_id: 'tenant-123',
          entity_name: 'Burger Express',
          old_values: {},
          new_values: {
            name: 'Burger Express',
            email: 'contact@burger.com',
            plan: 'premium',
            is_active: true
          },
          user_id: 'admin-1',
          user_name: 'Admin User',
          user_email: 'admin@foodmanager.com',
          user_role: 'super_admin',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: '2024-01-15T10:30:00Z',
          severity: 'medium',
          category: 'create',
          description: 'Tenant Burger Express criado com sucesso',
          metadata: {
            source: 'admin_panel',
            batch_id: null
          }
        },
        {
          id: '2',
          action: 'user_login',
          entity_type: 'user',
          entity_id: 'user-456',
          entity_name: 'john.doe@example.com',
          old_values: {},
          new_values: {
            last_login: '2024-01-15T09:15:00Z',
            login_count: 15
          },
          user_id: 'user-456',
          user_name: 'John Doe',
          user_email: 'john.doe@example.com',
          user_role: 'tenant_admin',
          ip_address: '192.168.1.105',
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          timestamp: '2024-01-15T09:15:00Z',
          severity: 'low',
          category: 'login',
          description: 'Login do usuário John Doe',
          metadata: {
            login_method: 'password',
            device_trusted: true
          }
        },
        {
          id: '3',
          action: 'tenant_updated',
          entity_type: 'tenant',
          entity_id: 'tenant-123',
          entity_name: 'Burger Express',
          old_values: {
            plan: 'basic',
            max_users: 50
          },
          new_values: {
            plan: 'premium',
            max_users: 200
          },
          user_id: 'admin-1',
          user_name: 'Admin User',
          user_email: 'admin@foodmanager.com',
          user_role: 'super_admin',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: '2024-01-15T11:45:00Z',
          severity: 'medium',
          category: 'update',
          description: 'Plano do tenant atualizado de Basic para Premium',
          metadata: {
            reason: 'upgrade_request',
            previous_plan: 'basic',
            new_plan: 'premium'
          }
        },
        {
          id: '4',
          action: 'order_deleted',
          entity_type: 'order',
          entity_id: 'order-789',
          entity_name: 'Pedido #12345',
          old_values: {
            status: 'pending',
            total_amount: 89.90
          },
          new_values: {
            status: 'cancelled',
            cancelled_at: '2024-01-15T14:30:00Z',
            cancellation_reason: 'customer_request'
          },
          user_id: 'user-456',
          user_name: 'John Doe',
          user_email: 'john.doe@example.com',
          user_role: 'tenant_admin',
          ip_address: '192.168.1.105',
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          timestamp: '2024-01-15T14:30:00Z',
          severity: 'high',
          category: 'delete',
          description: 'Pedido #12345 cancelado pelo cliente',
          metadata: {
            refund_processed: true,
            refund_amount: 89.90
          }
        },
        {
          id: '5',
          action: 'security_breach_attempt',
          entity_type: 'system',
          entity_id: 'system-1',
          entity_name: 'Authentication System',
          old_values: {},
          new_values: {
            failed_attempts: 5,
            ip_blocked: '192.168.1.200'
          },
          user_id: 'system',
          user_name: 'System',
          user_email: 'system@foodmanager.com',
          user_role: 'system',
          ip_address: '192.168.1.200',
          user_agent: 'Unknown',
          timestamp: '2024-01-15T16:20:00Z',
          severity: 'critical',
          category: 'security',
          description: 'Tentativa de acesso não autorizado detectada',
          metadata: {
            attack_type: 'brute_force',
            blocked_duration: 3600,
            user_agent: 'curl/7.68.0'
          }
        }
      ]

      // Filtrar logs
      let filteredLogs = mockLogs

      if (searchTerm) {
        filteredLogs = filteredLogs.filter(log => 
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      if (selectedCategory !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.category === selectedCategory)
      }

      if (selectedSeverity !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.severity === selectedSeverity)
      }

      if (selectedEntity !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.entity_type === selectedEntity)
      }

      // Filtrar por data
      filteredLogs = filteredLogs.filter(log => {
        const logDate = new Date(log.timestamp)
        const startDate = new Date(dateRange.start)
        const endDate = new Date(dateRange.end)
        endDate.setHours(23, 59, 59, 999)
        return logDate >= startDate && logDate <= endDate
      })

      // Ordenar por timestamp (mais recentes primeiro)
      filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      setLogs(filteredLogs)
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes('create') || action.includes('created')) return <Plus className="w-4 h-4 text-green-600" />
    if (action.includes('update') || action.includes('updated')) return <Edit className="w-4 h-4 text-blue-600" />
    if (action.includes('delete') || action.includes('deleted')) return <Trash2 className="w-4 h-4 text-red-600" />
    if (action.includes('login')) return <LogIn className="w-4 h-4 text-purple-600" />
    if (action.includes('logout')) return <LogOut className="w-4 h-4 text-orange-600" />
    if (action.includes('security')) return <Shield className="w-4 h-4 text-red-600" />
    if (action.includes('system')) return <Settings className="w-4 h-4 text-gray-600" />
    return <Activity className="w-4 h-4 text-gray-600" />
  }

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'tenant': return <Building2 className="w-4 h-4 text-blue-600" />
      case 'user': return <Users className="w-4 h-4 text-green-600" />
      case 'order': return <Package className="w-4 h-4 text-orange-600" />
      case 'product': return <Database className="w-4 h-4 text-purple-600" />
      case 'system': return <Settings className="w-4 h-4 text-gray-600" />
      case 'admin': return <Shield className="w-4 h-4 text-red-600" />
      default: return <FileText className="w-4 h-4 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-blue-100 text-blue-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'create': return 'bg-green-50 border-green-200'
      case 'update': return 'bg-blue-50 border-blue-200'
      case 'delete': return 'bg-red-50 border-red-200'
      case 'login': return 'bg-purple-50 border-purple-200'
      case 'logout': return 'bg-orange-50 border-orange-200'
      case 'system': return 'bg-gray-50 border-gray-200'
      case 'security': return 'bg-red-50 border-red-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const exportLogs = () => {
    const csv = [
      'Timestamp,Ação,Entidade,Usuário,Descrição,Severidade,Categoria,IP Address',
      ...logs.map(log => [
        formatTimestamp(log.timestamp),
        log.action,
        log.entity_name,
        log.user_name,
        log.description,
        log.severity,
        log.category,
        log.ip_address
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const renderValueChanges = (oldValues: Record<string, any>, newValues: Record<string, any>) => {
    const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)])
    const changes = Array.from(allKeys).map(key => ({
      key,
      old: oldValues[key],
      new: newValues[key]
    })).filter(change => change.old !== change.new)

    if (changes.length === 0) return null

    return (
      <div className="mt-2 space-y-1">
        {changes.map((change, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span className="font-medium text-gray-700">{change.key}:</span>
            <span className="text-red-600 line-through">
              {change.old !== undefined ? String(change.old) : 'N/A'}
            </span>
            <span className="text-green-600">→</span>
            <span className="text-green-600">
              {change.new !== undefined ? String(change.new) : 'N/A'}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Audit Log</h3>
          <p className="text-sm text-gray-600">Histórico completo de alterações do sistema</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={exportLogs}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
          
          <button
            onClick={fetchAuditLogs}
            disabled={loading}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar logs por ação, entidade, usuário ou descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <button
            onClick={() => setExpandedFilters(!expandedFilters)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="font-medium text-gray-900">Filtros Avançados</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedFilters ? 'rotate-180' : ''}`} />
          </button>
          
          {expandedFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">Todas</option>
                  <option value="create">Criação</option>
                  <option value="update">Atualização</option>
                  <option value="delete">Exclusão</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                  <option value="system">Sistema</option>
                  <option value="security">Segurança</option>
                </select>
              </div>

              {/* Severity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severidade</label>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">Todas</option>
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>

              {/* Entity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entidade</label>
                <select
                  value={selectedEntity}
                  onChange={(e) => setSelectedEntity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">Todas</option>
                  <option value="tenant">Tenant</option>
                  <option value="user">Usuário</option>
                  <option value="order">Pedido</option>
                  <option value="product">Produto</option>
                  <option value="system">Sistema</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Logs List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" style={{ maxHeight }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ação
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entidade
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severidade
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr className={`hover:bg-gray-50 ${getCategoryColor(log.category)}`}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className="text-sm font-medium text-gray-900">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getEntityIcon(log.entity_type)}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{log.entity_name}</div>
                          <div className="text-xs text-gray-500">{log.entity_type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{log.user_name}</div>
                        <div className="text-xs text-gray-500">{log.user_email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {log.description}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setShowDetails(showDetails === log.id ? null : log.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded Details */}
                  {showDetails === log.id && (
                    <tr>
                      <td colSpan={7} className="px-4 py-3 bg-gray-50">
                        <div className="space-y-4">
                          {/* User Info */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">IP Address:</span>
                              <span className="ml-2 text-gray-900">{log.ip_address}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">User Agent:</span>
                              <span className="ml-2 text-gray-900 text-xs">{log.user_agent}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Role:</span>
                              <span className="ml-2 text-gray-900">{log.user_role}</span>
                            </div>
                          </div>

                          {/* Value Changes */}
                          {Object.keys(log.old_values).length > 0 || Object.keys(log.new_values).length > 0 ? (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Alterações:</h4>
                              {renderValueChanges(log.old_values, log.new_values)}
                            </div>
                          ) : null}

                          {/* Metadata */}
                          {Object.keys(log.metadata).length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Metadados:</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                {Object.entries(log.metadata).map(([key, value]) => (
                                  <div key={key}>
                                    <span className="font-medium text-gray-700">{key}:</span>
                                    <span className="ml-2 text-gray-900">{String(value)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        
        {loading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
            <span className="ml-2 text-gray-600">Carregando logs...</span>
          </div>
        )}
        
        {!loading && logs.length === 0 && (
          <div className="text-center py-8">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum log encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCategory !== 'all' || selectedSeverity !== 'all' 
                ? 'Tente ajustar os filtros' 
                : 'Nenhuma atividade registrada no período'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
