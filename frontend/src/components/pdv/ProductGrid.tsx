import React, { useState, useEffect } from 'react'
import { Search, Filter, ArrowUpDown, Plus, Minus, Edit2, Power } from 'lucide-react'
import { Product, Category } from '@/types'

interface ProductGridProps {
  products: Product[]
  categories: Category[]
  onAddToCart: (product: Product, quantity: number) => void
  onEditProduct: (product: Product) => void
  onToggleAvailability: (productId: string) => void
  userRole: string
}

export default function ProductGrid({ 
  products, 
  categories, 
  onAddToCart, 
  onEditProduct, 
  onToggleAvailability,
  userRole 
}: ProductGridProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      const aValue = sortBy === 'name' ? a.name.toLowerCase() : a.price
      const bValue = sortBy === 'name' ? b.name.toLowerCase() : b.price
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta)
    }))
  }

  const handleAddToCart = (product: Product) => {
    const quantity = quantities[product.id] || 1
    onAddToCart(product, quantity)
    setQuantities(prev => ({ ...prev, [product.id]: 1 }))
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
            >
              <option value="all">Todas Categorias</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split('-')
                setSortBy(sort as 'name' | 'price')
                setSortOrder(order as 'asc' | 'desc')
              }}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
            >
              <option value="name-asc">Nome (A-Z)</option>
              <option value="name-desc">Nome (Z-A)</option>
              <option value="price-asc">Preço (Menor)</option>
              <option value="price-desc">Preço (Maior)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            quantity={quantities[product.id] || 1}
            onQuantityChange={(delta) => handleQuantityChange(product.id, delta)}
            onAddToCart={() => handleAddToCart(product)}
            onEdit={() => onEditProduct(product)}
            onToggleAvailability={() => onToggleAvailability(product.id)}
            userRole={userRole}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">Nenhum produto encontrado</div>
          <p className="text-gray-500 mt-2">Tente ajustar os filtros ou termos de busca</p>
        </div>
      )}
    </div>
  )
}

interface ProductCardProps {
  product: Product
  quantity: number
  onQuantityChange: (delta: number) => void
  onAddToCart: () => void
  onEdit: () => void
  onToggleAvailability: () => void
  userRole: string
}

function ProductCard({ 
  product, 
  quantity, 
  onQuantityChange, 
  onAddToCart, 
  onEdit, 
  onToggleAvailability,
  userRole 
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${product.is_available ? 'border-gray-200' : 'border-red-200'} overflow-hidden hover:shadow-md transition-shadow`}>
      {/* Product Image */}
      <div className="relative h-48 bg-gray-100">
        {product.image_url && !imageError ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🍔</span>
              </div>
              <span className="text-sm">Sem imagem</span>
            </div>
          </div>
        )}
        
        {/* Availability Badge */}
        {!product.is_available && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            Indisponível
          </div>
        )}

        {/* Admin Actions */}
        {userRole !== 'CUSTOMER' && (
          <div className="absolute top-2 left-2 flex gap-1">
            <button
              onClick={onEdit}
              className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
              title="Editar produto"
            >
              <Edit2 className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={onToggleAvailability}
              className={`p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors ${
                product.is_available ? 'text-green-600' : 'text-red-600'
              }`}
              title={product.is_available ? 'Desativar' : 'Ativar'}
            >
              <Power className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
        )}
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-orange-600">
            R$ {product.price.toFixed(2)}
          </span>
          {product.preparation_time && (
            <span className="text-xs text-gray-500">
              ⏱️ {product.preparation_time}min
            </span>
          )}
        </div>

        {/* Quantity and Add to Cart */}
        {product.is_available && userRole !== 'CUSTOMER' && (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => onQuantityChange(-1)}
                className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => onQuantityChange(1)}
                className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={onAddToCart}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar ao Carrinho
            </button>
          </div>
        )}

        {/* Customer View - Simple Add to Cart */}
        {product.is_available && userRole === 'CUSTOMER' && (
          <button
            onClick={onAddToCart}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Adicionar
          </button>
        )}

        {/* Unavailable Message */}
        {!product.is_available && (
          <div className="text-center text-sm text-red-600 font-medium">
            Produto indisponível no momento
          </div>
        )}
      </div>
    </div>
  )
}
