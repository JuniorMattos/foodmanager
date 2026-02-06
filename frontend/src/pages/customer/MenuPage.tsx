import React, { useState, useEffect } from 'react'
import { Search, Filter, ArrowUpDown, Plus, Minus, ShoppingCart, MapPin, Clock, Star, ArrowLeft, Home } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useTenantTheme } from '@/hooks/useTenantTheme'
import { BrandingHeader } from '@/components/tenant/BrandingHeader'
import { Product, Category, CartItem, CustomerInfo } from '@/types'

export default function MenuPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const { branding } = useTenantTheme()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ name: '', phone: '', address: '' })
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [loading, setLoading] = useState(true)

  // Função para navegação segura
  const handleGoBack = () => {
    if (isAuthenticated && user) {
      // Se estiver autenticado, voltar para o dashboard
      navigate('/')
    } else {
      // Se não estiver autenticado, voltar para o login
      navigate('/login')
    }
  }

  const handleGoHome = () => {
    if (isAuthenticated && user) {
      // Se estiver autenticado, ir para o dashboard
      navigate('/')
    } else {
      // Se não estiver autenticado, ir para o login
      navigate('/login')
    }
  }

  // Mock data
  useEffect(() => {
    const mockCategories: Category[] = [
      { id: '1', tenant_id: '1', name: 'Hambúrgueres', description: 'Nossos hambúrgueres artesanais', order_index: 1, is_active: true, created_at: '', updated_at: '' },
      { id: '2', tenant_id: '1', name: 'Bebidas', description: 'Refrigerantes e sucos naturais', order_index: 2, is_active: true, created_at: '', updated_at: '' },
      { id: '3', tenant_id: '1', name: 'Acompanhamentos', description: 'Batatas fritas e saladas', order_index: 3, is_active: true, created_at: '', updated_at: '' },
      { id: '4', tenant_id: '1', name: 'Sobremesas', description: 'Doces e sobremesas', order_index: 4, is_active: true, created_at: '', updated_at: '' },
    ]

    const mockProducts: Product[] = [
      {
        id: '1',
        tenant_id: '1',
        category_id: '1',
        name: 'X-Burger',
        description: 'Pão brioche, hambúrguer 180g, queijo cheddar, alface, tomate, molho especial',
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
        description: 'Pão brioche, hambúrguer 180g, bacon crocante, queijo cheddar, alface, tomate',
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
        category_id: '1',
        name: 'X-Egg',
        description: 'Pão brioche, hambúrguer 180g, ovo frito, queijo cheddar, alface, tomate',
        price: 27.90,
        image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        is_available: true,
        order_index: 3,
        preparation_time: 16,
        created_at: '',
        updated_at: '',
      },
      {
        id: '4',
        tenant_id: '1',
        category_id: '1',
        name: 'X-Tudo',
        description: 'Pão brioche, 2 hambúrgueres 180g, bacon, ovo, queijo, calabresa, alface, tomate',
        price: 35.90,
        image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        is_available: true,
        order_index: 4,
        preparation_time: 20,
        created_at: '',
        updated_at: '',
      },
      {
        id: '5',
        tenant_id: '1',
        category_id: '2',
        name: 'Refrigerante Lata',
        description: 'Coca-Cola, Guaraná, Fanta, Sprite (350ml)',
        price: 6.00,
        image_url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
        is_available: true,
        order_index: 1,
        preparation_time: 2,
        created_at: '',
        updated_at: '',
      },
      {
        id: '6',
        tenant_id: '1',
        category_id: '2',
        name: 'Suco Natural',
        description: 'Laranja, Limão, Maracujá, Morango (500ml)',
        price: 8.00,
        image_url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
        is_available: true,
        order_index: 2,
        preparation_time: 5,
        created_at: '',
        updated_at: '',
      },
      {
        id: '7',
        tenant_id: '1',
        category_id: '3',
        name: 'Batata Frita',
        description: 'Porção média (200g) com molho especial',
        price: 12.00,
        image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3901d8c?w=400',
        is_available: true,
        order_index: 1,
        preparation_time: 8,
        created_at: '',
        updated_at: '',
      },
      {
        id: '8',
        tenant_id: '1',
        category_id: '3',
        name: 'Onion Rings',
        description: 'Anéis de cebola empanados (150g)',
        price: 15.00,
        image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3901d8c?w=400',
        is_available: true,
        order_index: 2,
        preparation_time: 10,
        created_at: '',
        updated_at: '',
      },
      {
        id: '9',
        tenant_id: '1',
        category_id: '4',
        name: 'Sundae',
        description: 'Sorvete de baunilha com calda de chocolate',
        price: 12.00,
        image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        is_available: true,
        order_index: 1,
        preparation_time: 3,
        created_at: '',
        updated_at: '',
      },
      {
        id: '10',
        tenant_id: '1',
        category_id: '4',
        name: 'Petit Gateau',
        description: 'Bolo de chocolate quente com sorvete',
        price: 18.00,
        image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        is_available: true,
        order_index: 2,
        preparation_time: 8,
        created_at: '',
        updated_at: '',
      },
    ]

    setTimeout(() => {
      setCategories(mockCategories)
      setProducts(mockProducts)
      setLoading(false)
    }, 1000)
  }, [])

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory
      const matchesAvailability = product.is_available
      return matchesSearch && matchesCategory && matchesAvailability
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

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === product.id)
      
      if (existingItem) {
        return prevCart.map(item =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                totalPrice: (item.quantity + quantity) * product.price
              }
            : item
        )
      } else {
        return [...prevCart, {
          productId: product.id,
          product,
          quantity,
          unitPrice: product.price,
          totalPrice: quantity * product.price
        }]
      }
    })
  }

  const handleRemoveFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId))
  }

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveFromCart(productId)
      return
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.productId === productId
          ? {
              ...item,
              quantity,
              totalPrice: quantity * item.unitPrice
            }
          : item
      )
    )
  }

  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0)
  const getTotalPrice = () => cart.reduce((sum, item) => sum + item.totalPrice, 0)
  const getFinalTotal = () => getTotalPrice() + (deliveryType === 'delivery' ? 5 : 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando cardápio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background-color)' }}>
      {/* Header com Branding */}
      <BrandingHeader />

      {/* Search and Filter Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex flex-col sm:flex-row gap-3">
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

      {/* Categories */}
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => handleAddToCart(product)}
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

      {/* Cart Sidebar */}
      {showCart && (
        <CartSidebar
          cart={cart}
          customerInfo={customerInfo}
          deliveryType={deliveryType}
          onRemoveItem={handleRemoveFromCart}
          onUpdateQuantity={handleUpdateQuantity}
          onCustomerInfoChange={setCustomerInfo}
          onDeliveryTypeChange={setDeliveryType}
          onClose={() => setShowCart(false)}
          onCheckout={() => {
            setShowCart(false)
            setShowCheckout(true)
          }}
          totalPrice={getTotalPrice()}
          finalTotal={getFinalTotal()}
        />
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          cart={cart}
          customerInfo={customerInfo}
          deliveryType={deliveryType}
          totalPrice={getTotalPrice()}
          finalTotal={getFinalTotal()}
          onClose={() => setShowCheckout(false)}
          onConfirm={() => {
            alert('Pedido confirmado! 🎉')
            setCart([])
            setCustomerInfo({ name: '', phone: '', address: '' })
            setShowCheckout(false)
          }}
        />
      )}
    </div>
  )
}

interface ProductCardProps {
  product: Product
  onAddToCart: () => void
}

function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
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
        
        {product.preparation_time && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
            <Clock className="w-3 h-3 inline mr-1" />
            {product.preparation_time}min
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-orange-600">
            R$ {product.price.toFixed(2)}
          </span>
          <button
            onClick={onAddToCart}
            className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

interface CartSidebarProps {
  cart: CartItem[]
  customerInfo: CustomerInfo
  deliveryType: 'pickup' | 'delivery'
  onRemoveItem: (productId: string) => void
  onUpdateQuantity: (productId: string, quantity: number) => void
  onCustomerInfoChange: (info: CustomerInfo) => void
  onDeliveryTypeChange: (type: 'pickup' | 'delivery') => void
  onClose: () => void
  onCheckout: () => void
  totalPrice: number
  finalTotal: number
}

function CartSidebar({
  cart,
  customerInfo,
  deliveryType,
  onRemoveItem,
  onUpdateQuantity,
  onCustomerInfoChange,
  onDeliveryTypeChange,
  onClose,
  onCheckout,
  totalPrice,
  finalTotal
}: CartSidebarProps) {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()

  // Função para navegação segura
  const handleGoBack = () => {
    if (isAuthenticated && user) {
      // Se estiver autenticado, voltar para o dashboard
      navigate('/')
    } else {
      // Se não estiver autenticado, voltar para o login
      navigate('/login')
    }
  }

  const handleGoHome = () => {
    if (isAuthenticated && user) {
      // Se estiver autenticado, ir para o dashboard
      navigate('/')
    } else {
      // Se não estiver autenticado, ir para o login
      navigate('/login')
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md h-full overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Carrinho</h2>
            <div className="flex items-center gap-2">
              {/* Links de Navegação no Carrinho */}
              <button 
                onClick={handleGoBack}
                className="text-sm text-blue-600 hover:text-blue-500 flex items-center gap-1"
                title={isAuthenticated ? "Voltar ao Dashboard" : "Voltar ao Login"}
              >
                <ArrowLeft className="w-4 h-4" />
                {isAuthenticated ? 'Dashboard' : 'Login'}
              </button>
              <button 
                onClick={handleGoHome}
                className="text-sm text-blue-600 hover:text-blue-500 flex items-center gap-1"
                title={isAuthenticated ? "Dashboard" : "Login"}
              >
                <Home className="w-4 h-4" />
                {isAuthenticated ? 'Home' : 'Login'}
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {cart.map(item => (
            <div key={item.productId} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                  <p className="text-sm text-gray-600">R$ {item.unitPrice.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => onRemoveItem(item.productId)}
                  className="text-red-500 hover:text-red-600"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                    className="p-1 rounded bg-white border border-gray-300"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                    className="p-1 rounded bg-white border border-gray-300"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="font-semibold">
                  R$ {item.totalPrice.toFixed(2)}
                </div>
              </div>
            </div>
          ))}

          {/* Delivery Options */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Tipo de Entrega</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onDeliveryTypeChange('pickup')}
                  className={`p-3 rounded-lg border-2 ${
                    deliveryType === 'pickup'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="font-medium">Retirada</div>
                </button>
                <button
                  onClick={() => onDeliveryTypeChange('delivery')}
                  className={`p-3 rounded-lg border-2 ${
                    deliveryType === 'delivery'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="font-medium">Entrega</div>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Seu nome"
                value={customerInfo.name}
                onChange={(e) => onCustomerInfoChange({ ...customerInfo, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="tel"
                placeholder="Seu telefone"
                value={customerInfo.phone}
                onChange={(e) => onCustomerInfoChange({ ...customerInfo, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              {deliveryType === 'delivery' && (
                <input
                  type="text"
                  placeholder="Endereço de entrega"
                  value={customerInfo.address}
                  onChange={(e) => onCustomerInfoChange({ ...customerInfo, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="border-t pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>R$ {totalPrice.toFixed(2)}</span>
              </div>
              {deliveryType === 'delivery' && (
                <div className="flex justify-between text-sm">
                  <span>Taxa de entrega</span>
                  <span>R$ 5.00</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-orange-600">R$ {finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={onCheckout}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg mt-4"
            >
              Finalizar Pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface CheckoutModalProps {
  cart: CartItem[]
  customerInfo: CustomerInfo
  deliveryType: 'pickup' | 'delivery'
  totalPrice: number
  finalTotal: number
  onClose: () => void
  onConfirm: () => void
}

function CheckoutModal({
  cart,
  customerInfo,
  deliveryType,
  totalPrice,
  finalTotal,
  onClose,
  onConfirm
}: CheckoutModalProps) {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const [selectedPayment, setSelectedPayment] = useState('pix')

  // Função para navegação segura
  const handleGoBack = () => {
    if (isAuthenticated && user) {
      // Se estiver autenticado, voltar para o dashboard
      navigate('/')
    } else {
      // Se não estiver autenticado, voltar para o login
      navigate('/login')
    }
  }

  const handleGoHome = () => {
    if (isAuthenticated && user) {
      // Se estiver autenticado, ir para o dashboard
      navigate('/')
    } else {
      // Se não estiver autenticado, ir para o login
      navigate('/login')
    }
  }

  const paymentMethods = [
    { id: 'pix', name: 'PIX', icon: '📱' },
    { id: 'credit_card', name: 'Cartão de Crédito', icon: '💳' },
    { id: 'debit_card', name: 'Cartão de Débito', icon: '💳' },
    { id: 'cash', name: 'Dinheiro', icon: '💵' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Finalizar Pedido</h2>

          {/* Order Summary */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Resumo do Pedido</h3>
            <div className="space-y-2 text-sm">
              {cart.map(item => (
                <div key={item.productId} className="flex justify-between">
                  <span>{item.quantity}x {item.product.name}</span>
                  <span>R$ {item.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Dados do Cliente</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Nome:</strong> {customerInfo.name}</p>
              <p><strong>Telefone:</strong> {customerInfo.phone}</p>
              {deliveryType === 'delivery' && (
                <p><strong>Endereço:</strong> {customerInfo.address}</p>
              )}
              <p><strong>Tipo:</strong> {deliveryType === 'pickup' ? 'Retirada' : 'Entrega'}</p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Forma de Pagamento</h3>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map(method => (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`p-3 rounded-lg border-2 text-center ${
                    selectedPayment === method.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">{method.icon}</div>
                  <div className="text-sm font-medium">{method.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t pt-4 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>R$ {totalPrice.toFixed(2)}</span>
              </div>
              {deliveryType === 'delivery' && (
                <div className="flex justify-between text-sm">
                  <span>Taxa de entrega</span>
                  <span>R$ 5.00</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-orange-600">R$ {finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-lg"
            >
              Confirmar Pedido
            </button>
          </div>
          
          {/* Links de Navegação */}
          <div className="flex justify-center gap-4 mt-4 pt-4 border-t">
            <button 
              onClick={handleGoBack}
              className="text-sm text-blue-600 hover:text-blue-500 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              {isAuthenticated ? 'Voltar ao Dashboard' : 'Voltar ao Login'}
            </button>
            <button 
              onClick={handleGoHome}
              className="text-sm text-blue-600 hover:text-blue-500 flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              {isAuthenticated ? 'Dashboard' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
