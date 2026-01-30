import React, { useState, useEffect } from 'react'
import { ShoppingCart, Utensils, Settings, Users, BarChart3, Package, DollarSign } from 'lucide-react'
import ProductGrid from '@/components/pdv/ProductGrid'
import Cart from '@/components/pdv/Cart'
import { Product, Category, CartItem, CustomerInfo } from '@/types'

export default function PDVPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ name: '', phone: '' })
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup')
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>('VENDOR')

  // Mock data for development
  useEffect(() => {
    const mockCategories: Category[] = [
      { id: '1', tenant_id: '1', name: 'Hambúrgueres', description: 'Nossos hambúrgueres artesanais', order_index: 1, is_active: true, created_at: '', updated_at: '' },
      { id: '2', tenant_id: '1', name: 'Bebidas', description: 'Refrigerantes e sucos', order_index: 2, is_active: true, created_at: '', updated_at: '' },
      { id: '3', tenant_id: '1', name: 'Acompanhamentos', description: 'Batatas e saladas', order_index: 3, is_active: true, created_at: '', updated_at: '' },
    ]

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
        is_available: true,
        order_index: 1,
        preparation_time: 2,
        created_at: '',
        updated_at: '',
      },
      {
        id: '4',
        tenant_id: '1',
        category_id: '3',
        name: 'Batata Frita',
        description: 'Porção média (200g)',
        price: 12.00,
        image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3901d8c?w=400',
        is_available: true,
        order_index: 1,
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

  const handleAddToCart = (product: Product, quantity: number) => {
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

  const handleClearCart = () => {
    setCart([])
    setCustomerInfo({ name: '', phone: '' })
  }

  const handleCheckout = (paymentMethod: string) => {
    const orderData = {
      items: cart,
      customerInfo,
      deliveryType,
      paymentMethod,
      total: cart.reduce((sum, item) => sum + item.totalPrice, 0) + (deliveryType === 'delivery' ? 5 : 0)
    }

    console.log('Processing order:', orderData)
    alert(`Pedido processado com ${cart.length} itens! Método: ${paymentMethod}`)
    handleClearCart()
  }

  const handleEditProduct = (product: Product) => {
    console.log('Edit product:', product)
    alert(`Editar produto: ${product.name}`)
  }

  const handleToggleAvailability = (productId: string) => {
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === productId
          ? { ...product, is_available: !product.is_available }
          : product
      )
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando PDV...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Utensils className="w-8 h-8 text-orange-500" />
                <h1 className="text-2xl font-bold text-gray-900">FoodManager PDV</h1>
              </div>
              <span className="text-sm text-gray-500">Burger Express</span>
            </div>
            
            <nav className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <BarChart3 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Package className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <DollarSign className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Users className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex h-[calc(100vh-64px)]">
        {/* Products Section */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Cardápio</h2>
              <p className="text-gray-600">Selecione os produtos para adicionar ao carrinho</p>
            </div>

            <ProductGrid
              products={products}
              categories={categories}
              onAddToCart={handleAddToCart}
              onEditProduct={handleEditProduct}
              onToggleAvailability={handleToggleAvailability}
              userRole={userRole}
            />
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-96 border-l border-gray-200 bg-white">
          <Cart
            items={cart}
            onRemoveItem={handleRemoveFromCart}
            onUpdateQuantity={handleUpdateQuantity}
            onClearCart={handleClearCart}
            onCheckout={handleCheckout}
            total={cart.reduce((sum, item) => sum + item.totalPrice, 0)}
            deliveryFee={5}
            deliveryType={deliveryType}
            onDeliveryTypeChange={setDeliveryType}
            customerInfo={customerInfo}
            onCustomerInfoChange={setCustomerInfo}
          />
        </div>
      </main>
    </div>
  )
}
