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
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  FileSearch,
  Archive,
  Bell,
  Lock,
  Unlock
} from 'lucide-react'
import { AuditLog } from '@/components/admin/AuditLog'

interface AuditLogStats {
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

export default function AuditLogPage() {
  const [stats, setStats] = useState<AuditLogStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d' | '90d'>('7d')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [selectedPeriod])

  const fetchStats = async () => {
    setLoading(true)
    try {
      // Mock stats - substituir com API real
      const mockStats: AuditLogStats = {
        total: 15420,
        today: 342,
        thisWeek: 2156,
        thisMonth: 8934,
        byCategory: {
          create: 4520,
          update: 6780,
          delete: 1230,
          login: 1890,
          logout: 1870,
          system: 890,
          security: 240
        },
        bySeverity: {
          low: 8900,
          medium: 4520,
          high: 1890,
          critical: 110
        },
        byEntity: {
          tenant: 3450,
          user: 5670,
          order: 2340,
          product: 1230,
          system: 1890,
          admin: 840
        },
        recentActivity: [
          {
            timestamp: '2024-01-15T16:45:00Z',
            action: 'user_login',
            entity: 'john.doe@example.com',
            user: 'John Doe',
            severity: 'low'
          },
          {
            timestamp: '2024-01-15T16:30:00Z',
            action: 'tenant_updated',
            entity: 'Burger Express',
            user: 'Admin User',
            severity: 'medium'
          },
          {
            timestamp: '2024-01-15T16:15:00Z',
            action: 'order_created',
            entity: 'Pedido #12346',
            user: 'Jane Smith',
            severity: 'low'
          },
          {
            timestamp: '2024-01-15T15:45:00Z',
            action: 'security_breach_attempt',
            entity: 'Authentication System',
            user: 'System',
            severity: 'critical'
          },
          {
            timestamp: '2024-01-15T15:30:00Z',
            action: 'product_deleted',
            entity: 'Hambúguer Clássico',
            user: 'Admin User',
            severity: 'high'
          }
        ]
      }

      setStats(mockStats)
    } catch (error) {
      console.error('Error fetching audit stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-blue-600 bg-blue-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'create': return <Plus className="w-4 h-4" />
      case 'update': return <Edit className="w-4 h-4" />
      case 'delete': return <Trash2 className="w-4 h-4" />
      case 'login': return <LogIn className="w-4 h-4" />
      case 'logout': return <LogOut className="w-4 h-4" />
      case 'system': return <Settings className="w-4 h-4" />
      case 'security': return <Shield className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'tenant': return <Building2 className="w-4 h-4" />
      case 'user': return <Users className="w-4 h-4" />
      case 'order': return <Package className="w-4 h-4" />
      case 'product': return <Database className="w-4 h-4" />
      case 'system': return <Settings className="w-4 h-4" />
      case 'admin': return <Shield className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-gray-600">Monitoramento completo de atividades e alterações do sistema</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          
          <button
            onClick={fetchStats}
            disabled={loading}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Logs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Últimos 90 dias</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileSearch className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hoje</p>
              <p className="text-2xl font-bold text-gray-900">{stats.today.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">+12.5% vs ontem</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Esta Semana</p>
              <p className="text-2xl font-bold text-gray-900">{stats.thisWeek.toLocaleString()}</p>
              <p className="text-sm text-blue-600 mt-1">+8.3% vs semana anterior</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Este Mês</p>
              <p className="text-2xl font-bold text-gray-900">{stats.thisMonth.toLocaleString()}</p>
              <p className="text-sm text-orange-600 mt-1">+15.7% vs mês anterior</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <LineChart className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* By Category */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Logs por Categoria</h3>
          <div className="space-y-3">
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getSeverityColor('medium')}`}>
                    {getCategoryIcon(category)}
                  </div>
                  <span className="text-sm font-medium text-gray-900 capitalize">{category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(count / Math.max(...Object.values(stats.byCategory))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Severity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Logs por Severidade</h3>
          <div className="space-y-3">
            {Object.entries(stats.bySeverity).map(([severity, count]) => (
              <div key={severity} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getSeverityColor(severity)}`}>
                    {severity === 'critical' && <AlertTriangle className="w-4 h-4" />}
                    {severity === 'high' && <XCircle className="w-4 h-4" />}
                    {severity === 'medium' && <Info className="w-4 h-4" />}
                    {severity === 'low' && <CheckCircle className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-medium text-gray-900 capitalize">{severity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        severity === 'critical' ? 'bg-red-500' :
                        severity === 'high' ? 'bg-orange-500' :
                        severity === 'medium' ? 'bg-blue-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${(count / Math.max(...Object.values(stats.bySeverity))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Entity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Logs por Entidade</h3>
          <div className="space-y-3">
            {Object.entries(stats.byEntity).map(([entity, count]) => (
              <div key={entity} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getEntityIcon(entity)}
                  </div>
                  <span className="text-sm font-medium text-gray-900 capitalize">{entity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${(count / Math.max(...Object.values(stats.byEntity))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
        <div className="space-y-3">
          {stats.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${getSeverityColor(activity.severity)}`}>
                  {activity.action.includes('login') && <LogIn className="w-4 h-4" />}
                  {activity.action.includes('update') && <Edit className="w-4 h-4" />}
                  {activity.action.includes('create') && <Plus className="w-4 h-4" />}
                  {activity.action.includes('delete') && <Trash2 className="w-4 h-4" />}
                  {activity.action.includes('security') && <Shield className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-600">{activity.entity}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-900">{activity.user}</p>
                <p className="text-xs text-gray-600">{formatTimestamp(activity.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Audit Log */}
      <AuditLog />

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações de Monitoramento</h3>
          
          <div className="space-y-6">
            {/* Period Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Período de Análise</label>
              <div className="flex items-center gap-2">
                {[
                  { value: '24h', label: 'Últimas 24 horas' },
                  { value: '7d', label: 'Últimos 7 dias' },
                  { value: '30d', label: 'Últimos 30 dias' },
                  { value: '90d', label: 'Últimos 90 dias' }
                ].map((period) => (
                  <button
                    key={period.value}
                    onClick={() => setSelectedPeriod(period.value as any)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedPeriod === period.value
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Alert Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alertas de Segurança</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                  <span className="text-sm text-gray-700">Notificar tentativas de acesso não autorizado</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                  <span className="text-sm text-gray-700">Alertar sobre exclusões em massa</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700">Monitorar alterações de configuração</span>
                </label>
              </div>
            </div>

            {/* Retention Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Retenção de Logs</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                <option value="90">90 dias</option>
                <option value="180">180 dias</option>
                <option value="365">1 ano</option>
                <option value="730">2 anos</option>
                <option value="infinite">Manter permanentemente</option>
              </select>
            </div>

            {/* Export Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Exportação Automática</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700">Exportar logs críticos diariamente</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700">Arquivivar logs antigos automaticamente</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
