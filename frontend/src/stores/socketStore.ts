import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from './authStore'

interface SocketState {
  socket: Socket | null
  isConnected: boolean
  reconnectAttempts: number
  connectionError: string | null
  
  // Ações
  connect: () => void
  disconnect: () => void
  reconnect: () => void
  
  // Eventos específicos
  joinOrderRoom: (orderId: string) => void
  leaveOrderRoom: (orderId: string) => void
}

const MAX_RECONNECT_ATTEMPTS = 5

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  reconnectAttempts: 0,
  connectionError: null,

  connect: () => {
    const { accessToken: token, user } = useAuthStore.getState()
    
    if (!token || !user) {
      set({ connectionError: 'Usuário não autenticado' })
      return
    }

    // Evitar conexões duplicadas
    if (get().socket?.connected) return

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      console.log('🔌 Socket conectado:', socket.id)
      set({ 
        isConnected: true, 
        connectionError: null,
        reconnectAttempts: 0 
      })
    })

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket desconectado:', reason)
      set({ isConnected: false })
      
      // Reconectar manualmente se não for reconexão automática
      if (reason === 'io server disconnect') {
        setTimeout(() => get().reconnect(), 1000)
      }
    })

    socket.on('connect_error', (error) => {
      console.error('Erro de conexão:', error)
      set({ 
        connectionError: error.message,
        reconnectAttempts: get().reconnectAttempts + 1
      })
    })

    // Eventos de negócio
    socket.on('order:new', (data) => {
      // Disparar notificação ou atualizar store de pedidos
      console.log('📦 Novo pedido recebido:', data)
      // Ex: useOrderStore.getState().addOrder(data)
    })

    socket.on('order:status', (data) => {
      console.log('📊 Status do pedido atualizado:', data)
      // Ex: useOrderStore.getState().updateOrderStatus(data.orderId, data.status)
    })

    socket.on('sale:new', (data) => {
      console.log('💰 Nova venda:', data)
      // Atualizar dashboard em tempo real
    })

    set({ socket })
  },

  disconnect: () => {
    const { socket } = get()
    if (socket) {
      socket.disconnect()
      set({ socket: null, isConnected: false })
    }
  },

  reconnect: () => {
    get().disconnect()
    set({ reconnectAttempts: 0, connectionError: null })
    get().connect()
  },

  joinOrderRoom: (orderId: string) => {
    const { socket, isConnected } = get()
    if (socket && isConnected) {
      socket.emit('room:join', `order:${orderId}`)
    }
  },

  leaveOrderRoom: (orderId: string) => {
    const { socket } = get()
    if (socket) {
      socket.emit('room:leave', `order:${orderId}`)
    }
  },
}))
