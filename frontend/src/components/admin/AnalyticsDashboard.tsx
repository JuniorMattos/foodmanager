import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  Activity,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Zap,
  Clock,
  Globe
} from 'lucide-react'
import { 
  LineChart as RechartsLineChart, 
  Line, 
  AreaChart,
  Area, 
  BarChart as RechartsBarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

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

interface AnalyticsDashboardProps {
  period?: '7d' | '30d' | '90d' | '1y'
  tenantId?: string
}

export function AnalyticsDashboard({ period = '30d', tenantId }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState(period)
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'users' | 'orders'>('revenue')

  useEffect(() => {
    fetchAnalytics()
  }, [selectedPeriod, tenantId])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      // Mock data - substituir com API real
      const mockData: AnalyticsData = {
        revenue: {
          daily: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
            revenue: Math.floor(Math.random() * 5000) + 2000,
            orders: Math.floor(Math.random() * 100) + 50
          })),
          monthly: Array.from({ length: 12 }, (_, i) => ({
            month: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i],
            revenue: Math.floor(Math.random() * 50000) + 30000,
            orders: Math.floor(Math.random() * 1000) + 500
          })),
          total: 1250000,
          growth: 15.7
        },
        tenants: {
          total: 156,
          active: 142,
          new: 12,
          churned: 3,
          growth: 8.3,
          byPlan: [
            { plan: 'Basic', count: 89, revenue: 267000 },
            { plan: 'Premium', count: 52, revenue: 468000 },
            { plan: 'Enterprise', count: 15, revenue: 515000 }
          ]
        },
        users: {
          total: 45678,
          active: 32156,
          new: 2341,
          retention: 87.3,
          byTenant: [
            { tenant: 'Burger Express', users: 2341, growth: 12.5 },
            { tenant: 'Pizza Palace', users: 1876, growth: 8.3 },
            { tenant: 'Sushi Master', users: 1234, growth: -2.1 },
            { tenant: 'Taco House', users: 987, growth: 15.7 }
          ]
        },
        orders: {
          total: 156789,
          daily: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
            orders: Math.floor(Math.random() * 500) + 200,
            value: Math.floor(Math.random() * 10000) + 5000
          })),
          averageValue: 67.50,
          completionRate: 94.7,
          byStatus: [
            { status: 'Completed', count: 148456 },
            { status: 'Pending', count: 5678 },
            { status: 'Cancelled', count: 2655 }
          ]
        },
        performance: {
          apiResponseTime: 127,
          uptime: 99.97,
          errorRate: 0.03,
          databaseQueries: 156789,
          storageUsed: 2.3
        }
      }
      
      setData(mockData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportData = () => {
    if (!data) return
    
    const csvContent = [
      ['Métrica', 'Valor', 'Crescimento'],
      ['Receita Total', data.revenue.total.toLocaleString(), `${data.revenue.growth}%`],
      ['Tenants Ativos', data.tenants.active, `${data.tenants.growth}%`],
      ['Usuários Ativos', data.users.active, `${data.users.retention}%`],
      ['Pedidos Totais', data.orders.total, `${data.orders.completionRate}%`]
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${selectedPeriod}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const COLORS = ['#ea580c', '#f97316', '#fed7aa', '#fff7ed', '#7c2d12']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <Activity className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Dados não disponíveis</h3>
        <p className="mt-1 text-sm text-gray-500">Não foi possível carregar os dados de analytics.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Métricas detalhadas do sistema</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>
          
          {/* Export Button */}
          <button
            onClick={exportData}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {data.revenue.total.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-2">
                {data.revenue.growth > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm ${data.revenue.growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {data.revenue.growth > 0 ? '+' : ''}{data.revenue.growth}%
                </span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tenants Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{data.tenants.active}</p>
              <div className="flex items-center gap-1 mt-2">
                {data.tenants.growth > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm ${data.tenants.growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {data.tenants.growth > 0 ? '+' : ''}{data.tenants.growth}%
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{data.users.active.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-2">
                <Target className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-purple-500">
                  {data.users.retention}% retenção
                </span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pedidos Totais</p>
              <p className="text-2xl font-bold text-gray-900">{data.orders.total.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-2">
                <ShoppingCart className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500">
                  {data.orders.completionRate}% conclusão
                </span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Receita ao Longo do Tempo</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedMetric('revenue')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  selectedMetric === 'revenue' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Receita
              </button>
              <button
                onClick={() => setSelectedMetric('orders')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  selectedMetric === 'orders' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Pedidos
              </button>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.revenue.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: any) => [
                  selectedMetric === 'revenue' ? `R$ ${value.toLocaleString()}` : value,
                  selectedMetric === 'revenue' ? 'Receita' : 'Pedidos'
                ]}
              />
              <Area 
                type="monotone" 
                dataKey={selectedMetric === 'revenue' ? 'revenue' : 'orders'} 
                stroke="#ea580c" 
                fill="#fed7aa" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Tenants by Plan */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Tenants por Plano</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={data.tenants.byPlan}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ plan, count, percent }) => `${plan}: ${count} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.tenants.byPlan.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        {/* User Growth */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Crescimento de Usuários</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={data.users.byTenant}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tenant" />
              <YAxis />
              <Tooltip formatter={(value: any) => [value.toLocaleString(), 'Usuários']} />
              <Bar dataKey="users" fill="#3b82f6" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Status dos Pedidos</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={data.orders.byStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, count, percent }) => `${status}: ${count} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.orders.byStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance do Sistema</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="w-5 h-5 text-yellow-500 mr-2" />
              <span className="text-sm text-gray-600">API Response</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{data.performance.apiResponseTime}ms</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm text-gray-600">Uptime</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{data.performance.uptime}%</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-sm text-gray-600">Error Rate</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{data.performance.errorRate}%</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <BarChart3 className="w-5 h-5 text-blue-500 mr-2" />
              <span className="text-sm text-gray-600">DB Queries</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{data.performance.databaseQueries.toLocaleString()}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Globe className="w-5 h-5 text-purple-500 mr-2" />
              <span className="text-sm text-gray-600">Storage</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{data.performance.storageUsed}TB</p>
          </div>
        </div>
      </div>
    </div>
  )
}
