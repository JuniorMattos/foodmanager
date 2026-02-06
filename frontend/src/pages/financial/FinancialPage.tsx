import React, { useState } from 'react'
import { Plus, Search, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react'

export default function FinancialPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [periodFilter, setPeriodFilter] = useState('month')

  const financialRecords = [
    {
      id: '1',
      type: 'income',
      description: 'Vendas do dia',
      amount: 2450.00,
      category: 'vendas',
      date: '2024-01-30',
      orderId: 'ORD-001',
    },
    {
      id: '2',
      type: 'expense',
      description: 'Compra de insumos',
      amount: 450.00,
      category: 'compras',
      date: '2024-01-30',
    },
    {
      id: '3',
      type: 'expense',
      description: 'Aluguel mensal',
      amount: 800.00,
      category: 'aluguel',
      date: '2024-01-30',
    },
    {
      id: '4',
      type: 'income',
      description: 'Vendas delivery',
      amount: 1200.00,
      category: 'vendas',
      date: '2024-01-29',
      orderId: 'ORD-002',
    },
    {
      id: '5',
      type: 'expense',
      description: 'Salários funcionários',
      amount: 1500.00,
      category: 'salários',
      date: '2024-01-29',
    },
    {
      id: '6',
      type: 'income',
      description: 'Eventos catering',
      amount: 800.00,
      category: 'eventos',
      date: '2024-01-28',
    },
  ]

  const filteredRecords = financialRecords.filter(record => {
    const matchesSearch = record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || record.type === typeFilter
    return matchesSearch && matchesType
  })

  const totalIncome = financialRecords
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0)

  const totalExpense = financialRecords
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0)

  const balance = totalIncome - totalExpense

  const getTypeColor = (type: string) => {
    return type === 'income' ? 'text-green-600' : 'text-red-600'
  }

  const getTypeIcon = (type: string) => {
    return type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
  }

  const getTypeText = (type: string) => {
    return type === 'income' ? 'Receita' : 'Despesa'
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
            <p className="text-gray-600 mt-2">Gerencie receitas, despesas e fluxo de caixa</p>
          </div>
          <button className="btn btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-3">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Receitas</p>
              <p className="text-2xl font-semibold text-green-600">
                R$ {totalIncome.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-red-500 rounded-lg p-3">
              <TrendingDown className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Despesas</p>
              <p className="text-2xl font-semibold text-red-600">
                R$ {totalExpense.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`${balance >= 0 ? 'bg-blue-500' : 'bg-red-500'} rounded-lg p-3`}>
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Saldo</p>
              <p className={`text-2xl font-semibold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                R$ {balance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar transações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">Todos os Tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="today">Hoje</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
            <option value="year">Este Ano</option>
          </select>
          <button className="btn btn-outline">
            <Calendar className="w-4 h-4 mr-2" />
            Período Personalizado
          </button>
        </div>
      </div>

      {/* Financial Records Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pedido
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRecords.map((record) => (
              <tr key={record.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {record.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`inline-flex items-center ${getTypeColor(record.type)}`}>
                    {getTypeIcon(record.type)}
                    <span className="ml-1 text-sm font-medium">
                      {getTypeText(record.type)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${getTypeColor(record.type)}`}>
                    {record.type === 'income' ? '+' : '-'} R$ {record.amount.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.orderId || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
