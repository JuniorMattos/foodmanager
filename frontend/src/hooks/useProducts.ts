import { useState, useEffect } from 'react'
import { Product, ProductQuery } from '@/types'
import { productService } from '@/services/products'
import { socketService } from '@/services/socket'
import toast from 'react-hot-toast'

export function useProducts(query?: ProductQuery) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await productService.getProducts(query)
      setProducts(data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products')
      toast.error('Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }

  const toggleProductAvailability = async (productId: string) => {
    try {
      const updatedProduct = await productService.toggleAvailability(productId)
      setProducts(prev => 
        prev.map(product => 
          product.id === productId ? updatedProduct : product
        )
      )
      
      // Emit real-time update
      socketService.emitProductToggle(productId)
      
      toast.success('Disponibilidade atualizada')
    } catch (err: any) {
      toast.error('Erro ao atualizar disponibilidade')
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [JSON.stringify(query)])

  // Real-time updates
  useEffect(() => {
    const handleProductUpdate = (data: Product) => {
      setProducts(prev => 
        prev.map(product => 
          product.id === data.id ? data : product
        )
      )
    }

    const handleAvailabilityChange = (data: Product) => {
      setProducts(prev => 
        prev.map(product => 
          product.id === data.id ? data : product
        )
      )
    }

    socketService.onProductUpdated(handleProductUpdate)
    socketService.onProductAvailabilityChanged(handleAvailabilityChange)

    return () => {
      socketService.offProductUpdated(handleProductUpdate)
      socketService.offProductAvailabilityChanged(handleAvailabilityChange)
    }
  }, [])

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    toggleProductAvailability,
  }
}
