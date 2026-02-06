import { http } from 'msw'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export const handlers = [
  // Auth endpoints
  http.post(`${API_URL}/auth/login`, () => {
    return new Response(JSON.stringify({
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'ADMIN',
        tenant: {
          id: '1',
          name: 'Test Restaurant',
          slug: 'test-restaurant',
        },
      },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 3600,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }),

  http.get(`${API_URL}/auth/me`, () => {
    return new Response(JSON.stringify({
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN',
      tenant: {
        id: '1',
        name: 'Test Restaurant',
        slug: 'test-restaurant',
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }),

  // Products endpoints
  http.get(`${API_URL}/products`, () => {
    return new Response(JSON.stringify({
      data: [
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
          created_at: '2024-01-30T12:00:00Z',
          updated_at: '2024-01-30T12:00:00Z',
        },
      ],
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }),

  http.patch(`${API_URL}/products/:id/toggle-availability`, ({ params }) => {
    const { id } = params
    return new Response(JSON.stringify({
      id,
      is_available: true,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }),

  // Orders endpoints
  http.get(`${API_URL}/orders`, () => {
    return new Response(JSON.stringify({
      data: [
        {
          id: 'ORD-001',
          customer: 'João Silva',
          phone: '+55 11 98765-4321',
          total: 89.90,
          status: 'delivered',
          items: 3,
          time: '10 min',
          createdAt: '2024-01-30 12:30',
        },
      ],
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }),
]
