import React, { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
  Clock,
  Globe
} from 'lucide-react'
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard'

interface AnalyticsPageProps {}

export default function AnalyticsPage({}: AnalyticsPageProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [selectedTenant, setSelectedTenant] = useState<string>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simular refresh
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const tenants = [
    { id: 'all', name: 'Todos os Tenants' },
    { id: '1', name: 'Burger Express' },
    { id: '2', name: 'Pizza Palace' },
    { id: '3', name: 'Sushi Master' },
    { id: '4', name: 'Taco House' }
  ]

  const quickStats = [
    {
      title: 'Receita Hoje',
      value: 'R$ 12.450',
      change: 8.5,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Pedidos Hoje',
      value: '234',
      change: 12.3,
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Usuários Ativos',
      value: '1.234',
      change: -2.1,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Taxa de Conversão',
      value: '3.45%',
      change: 0.8,
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Análise detalhada de métricas e performance</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          
          {/* Export Button */}
          <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Period Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
                <option value="1y">Último ano</option>
              </select>
            </div>
            
            {/* Tenant Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tenant
              </label>
              <select
                value={selectedTenant}
                onChange={(e) => setSelectedTenant(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                {tenants.map(tenant => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Comparison */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comparar com
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                <option value="previous">Período anterior</option>
                <option value="last_year">Ano anterior</option>
                <option value="none">Sem comparação</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {stat.change > 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.change > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stat.change > 0 ? '+' : ''}{stat.change}%
                  </span>
                  <span className="text-sm text-gray-500">vs. período anterior</span>
                </div>
              </div>
              <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Analytics Dashboard */}
      <AnalyticsDashboard 
        period={selectedPeriod} 
        tenantId={selectedTenant === 'all' ? undefined : selectedTenant}
      />

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
          <div className="space-y-4">
            {[
              { name: 'Burger Express', revenue: 'R$ 45.230', growth: 12.5, orders: 678 },
              { name: 'Pizza Palace', revenue: 'R$ 38.920', growth: 8.3, orders: 523 },
              { name: 'Sushi Master', revenue: 'R$ 28.150', growth: -2.1, orders: 412 },
              { name: 'Taco House', revenue: 'R$ 22.780', growth: 15.7, orders: 389 }
            ].map((tenant, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{tenant.name}</p>
                  <p className="text-sm text-gray-600">{tenant.orders} pedidos</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{tenant.revenue}</p>
                  <p className={`text-sm ${tenant.growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {tenant.growth > 0 ? '+' : ''}{tenant.growth}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
          <div className="space-y-4">
            {[
              { action: 'Novo tenant criado', tenant: 'Café Express', time: 'há 2 minutos', type: 'success' },
              { action: 'Pico de pedidos', tenant: 'Pizza Palace', time: 'há 15 minutos', type: 'info' },
              { action: 'Integração concluída', tenant: 'Sushi Master', time: 'há 1 hora', type: 'success' },
              { action: 'Alerta de performance', tenant: 'Taco House', time: 'há 2 horas', type: 'warning' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.tenant}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Opções de Exportação</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">Relatório Completo</span>
            </div>
            <p className="text-sm text-gray-600">Exporte todas as métricas em formato CSV</p>
          </button>
          
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">Análise de Tendências</span>
            </div>
            <p className="text-sm text-gray-600">Relatório focado em crescimento e tendências</p>
          </button>
          
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900">Relatório de Usuários</span>
            </div>
            <p className="text-sm text-gray-600">Análise detalhada do comportamento dos usuários</p>
          </button>
        </div>
      </div>
    </div>
  )
}
