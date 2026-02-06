import React from 'react'
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Package,
  Clock,
  AlertCircle
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

export default function DashboardPage() {
  const { user } = useAuthStore()

  const stats = [
    {
      name: 'Vendas do Dia',
      value: 'R$ 2.450,00',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      name: 'Pedidos',
      value: '47',
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      name: 'Clientes',
      value: '234',
      change: '+3.1%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      name: 'Produtos',
      value: '89',
      change: '+2',
      changeType: 'positive' as const,
      icon: Package,
      color: 'bg-orange-500',
    },
  ]

  const recentOrders = [
    { id: 'ORD-001', customer: 'João Silva', total: 'R$ 89,90', status: 'Entregue', time: '10 min' },
    { id: 'ORD-002', customer: 'Maria Santos', total: 'R$ 45,50', status: 'Preparando', time: '5 min' },
    { id: 'ORD-003', customer: 'Pedro Costa', total: 'R$ 120,00', status: 'Pendente', time: '2 min' },
    { id: 'ORD-004', customer: 'Ana Silva', total: 'R$ 67,80', status: 'Entregue', time: '15 min' },
  ]

  const lowStockItems = [
    { name: 'Pão de Hambúrguer', current: 15, min: 20, unit: 'un' },
    { name: 'Queijo Cheddar', current: 8, min: 10, unit: 'un' },
    { name: 'Tomate', current: 3, min: 5, unit: 'kg' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Bem-vindo(a) de volta, {user?.name}! Aqui está um resumo do seu negócio.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">{stat.change}</span>
              <span className="text-gray-500 ml-1">vs. ontem</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Pedidos Recentes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pedido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tempo
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'Entregue' 
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'Preparando'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {order.time}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Estoque Baixo</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {lowStockItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      Mínimo: {item.min} {item.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${
                      item.current < item.min / 2 ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {item.current} {item.unit}
                    </p>
                    <p className="text-xs text-gray-500">Atual</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors text-sm font-medium">
                Reabastecer Estoque
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
