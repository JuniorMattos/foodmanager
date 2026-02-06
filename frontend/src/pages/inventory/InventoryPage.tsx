import React, { useState } from 'react'
import { Plus, Search, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const inventory = [
    {
      id: '1',
      name: 'Pão de Hambúrguer',
      description: 'Pães brioche artesanais',
      quantity: 45,
      minQuantity: 20,
      unit: 'un',
      cost: 2.50,
      supplier: 'Padaria Local',
      lastUpdated: '2024-01-30 10:30',
    },
    {
      id: '2',
      name: 'Carne Bovina',
      description: 'Hambúrguer 180g bovino',
      quantity: 8,
      minQuantity: 10,
      unit: 'kg',
      cost: 25.00,
      supplier: 'Açougue Central',
      lastUpdated: '2024-01-30 09:15',
    },
    {
      id: '3',
      name: 'Queijo Cheddar',
      description: 'Fatias de queijo cheddar',
      quantity: 5,
      minQuantity: 10,
      unit: 'un',
      cost: 1.20,
      supplier: 'Laticínios SA',
      lastUpdated: '2024-01-30 11:00',
    },
    {
      id: '4',
      name: 'Alface',
      description: 'Folhas de alface fresca',
      quantity: 12,
      minQuantity: 5,
      unit: 'un',
      cost: 1.50,
      supplier: 'Hortifruti Orgânico',
      lastUpdated: '2024-01-30 08:45',
    },
    {
      id: '5',
      name: 'Tomate',
      description: 'Tomates frescos',
      quantity: 3,
      minQuantity: 5,
      unit: 'un',
      cost: 1.20,
      supplier: 'Hortifruti Orgânico',
      lastUpdated: '2024-01-30 08:45',
    },
  ]

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStockStatus = (current: number, min: number) => {
    if (current <= min / 2) return 'critical'
    if (current <= min) return 'low'
    return 'normal'
  }

  const getStockColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'low':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  const getStockText = (status: string) => {
    switch (status) {
      case 'critical':
        return 'Crítico'
      case 'low':
        return 'Baixo'
      default:
        return 'Normal'
    }
  }

  const getStockIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4" />
      case 'low':
        return <TrendingDown className="w-4 h-4" />
      default:
        return <TrendingUp className="w-4 h-4" />
    }
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Estoque</h1>
            <p className="text-gray-600 mt-2">Controle o estoque de ingredientes e insumos</p>
          </div>
          <button className="btn btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Item
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-3">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Itens em Estoque</p>
              <p className="text-2xl font-semibold text-gray-900">{inventory.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-yellow-500 rounded-lg p-3">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
              <p className="text-2xl font-semibold text-gray-900">
                {inventory.filter(item => item.quantity <= item.minQuantity).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-red-500 rounded-lg p-3">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Estoque Crítico</p>
              <p className="text-2xl font-semibold text-gray-900">
                {inventory.filter(item => item.quantity <= item.minQuantity / 2).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar itens no estoque..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantidade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Custo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fornecedor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Última Atualização
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInventory.map((item) => {
              const status = getStockStatus(item.quantity, item.minQuantity)
              return (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.quantity} {item.unit}
                    </div>
                    <div className="text-xs text-gray-500">
                      Mínimo: {item.minQuantity} {item.unit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStockColor(status)}`}>
                      {getStockIcon(status)}
                      <span className="ml-1">{getStockText(status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R$ {item.cost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.supplier}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.lastUpdated}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
