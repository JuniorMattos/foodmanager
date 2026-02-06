import React, { useState } from 'react'
import { Plus, Search, Filter, Edit2, Trash2, Power } from 'lucide-react'
import { Product } from '@/types'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const mockProducts: Product[] = [
    {
      id: '1',
      tenant_id: '1',
      category_id: '1',
      name: 'X-Burger',
      description: 'Pão, carne, queijo, alface, tomate',
      price: 25.90,
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      is_available: true,
      order_index: 1,
      preparation_time: 15,
      created_at: '',
      updated_at: '',
    },
    {
      id: '2',
      tenant_id: '1',
      category_id: '1',
      name: 'X-Bacon',
      description: 'Pão, carne, bacon, queijo, alface, tomate',
      price: 29.90,
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      is_available: true,
      order_index: 2,
      preparation_time: 18,
      created_at: '',
      updated_at: '',
    },
    {
      id: '3',
      tenant_id: '1',
      category_id: '2',
      name: 'Refrigerante Lata',
      description: 'Coca-Cola, Guaraná, Fanta',
      price: 6.00,
      image_url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
      is_available: false,
      order_index: 1,
      preparation_time: 2,
      created_at: '',
      updated_at: '',
    },
  ]

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleAvailability = (productId: string) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === productId
          ? { ...product, is_available: !product.is_available }
          : product
      )
    )
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
            <p className="text-gray-600 mt-2">Gerencie seu cardápio e produtos</p>
          </div>
          <button className="btn btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full"
            />
          </div>
          <button className="btn btn-outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preço
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={product.image_url || 'https://via.placeholder.com/40'}
                        alt={product.name}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Hambúrgueres
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  R$ {product.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.is_available
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.is_available ? 'Disponível' : 'Indisponível'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-gray-600">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleAvailability(product.id)}
                      className={`${
                        product.is_available
                          ? 'text-gray-400 hover:text-red-600'
                          : 'text-gray-400 hover:text-green-600'
                      }`}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
