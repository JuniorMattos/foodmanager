import { api } from './api'
import { Product, ProductQuery, ApiResponse } from '@/types'

export class ProductService {
  async getProducts(query?: ProductQuery): Promise<Product[]> {
    const params = new URLSearchParams()
    
    if (query?.page) params.append('page', query.page.toString())
    if (query?.limit) params.append('limit', query.limit.toString())
    if (query?.search) params.append('search', query.search)
    if (query?.categoryId) params.append('categoryId', query.categoryId)
    if (query?.isAvailable !== undefined) params.append('isAvailable', query.isAvailable.toString())
    if (query?.sortBy) params.append('sortBy', query.sortBy)
    if (query?.sortOrder) params.append('sortOrder', query.sortOrder)

    const response = await api.get<ApiResponse<Product[]>>(`/products?${params.toString()}`)
    return response.data.data || []
  }

  async getProduct(id: string): Promise<Product> {
    const response = await api.get<Product>(`/products/${id}`)
    return response.data
  }

  async createProduct(data: Omit<Product, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const response = await api.post<Product>('/products', data)
    return response.data
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const response = await api.put<Product>(`/products/${id}`, data)
    return response.data
  }

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`)
  }

  async toggleAvailability(id: string): Promise<Product> {
    const response = await api.patch<Product>(`/products/${id}/toggle-availability`)
    return response.data
  }

  async getCategoriesWithProducts(): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>('/products/categories/with-products')
    return response.data.data || []
  }
}

export const productService = new ProductService()
export default productService
