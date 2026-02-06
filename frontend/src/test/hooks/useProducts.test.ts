import { renderHook, waitFor } from '@testing-library/react'
import { useProducts } from '@/hooks/useProducts'
import { server } from '../mocks/server'
import { http } from 'msw'

describe('useProducts', () => {
  it('fetches products successfully', async () => {
    const { result } = renderHook(() => useProducts())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.products).toHaveLength(1)
    expect(result.current.products[0].name).toBe('X-Burger')
  })

  it('handles API errors', async () => {
    server.use(
      http.get(
        'http://localhost:3001/api/products',
        () => {
          return new Response(JSON.stringify({ error: 'Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          })
        }
      )
    )

    const { result } = renderHook(() => useProducts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.products).toHaveLength(0)
  })

  it('toggles product availability', async () => {
    const { result } = renderHook(() => useProducts())

    await waitFor(() => {
      expect(result.current.products).toHaveLength(1)
    })

    const productId = result.current.products[0].id
    await result.current.toggleProductAvailability(productId)

    expect(result.current.products[0].is_available).toBe(true)
  })
})
