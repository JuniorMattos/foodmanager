import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket | null = null
  private tenantId: string | null = null

  connect(tenantId: string) {
    if (this.socket?.connected) {
      this.disconnect()
    }

    this.tenantId = tenantId
    this.socket = io((import.meta.env.VITE_WS_URL || 'http://localhost:3001'), {
      auth: {
        token: localStorage.getItem('auth-storage') 
          ? JSON.parse(localStorage.getItem('auth-storage')!).state.accessToken 
          : null
      }
    })

    this.setupEventListeners()
  }

  private setupEventListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('Connected to server')
      this.joinTenant()
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server')
    })

    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
    })
  }

  private joinTenant() {
    if (this.socket && this.tenantId) {
      this.socket.emit('join-tenant', this.tenantId)
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // Order events
  onOrderUpdate(callback: (data: any) => void) {
    this.socket?.on('order-updated', callback)
  }

  onOrderCreated(callback: (data: any) => void) {
    this.socket?.on('order-created', callback)
  }

  onOrderCancelled(callback: (data: any) => void) {
    this.socket?.on('order-cancelled', callback)
  }

  offOrderUpdate(callback: (data: any) => void) {
    this.socket?.off('order-updated', callback)
  }

  offOrderCreated(callback: (data: any) => void) {
    this.socket?.off('order-created', callback)
  }

  offOrderCancelled(callback: (data: any) => void) {
    this.socket?.off('order-cancelled', callback)
  }

  // Product events
  onProductUpdated(callback: (data: any) => void) {
    this.socket?.on('product-updated', callback)
  }

  onProductAvailabilityChanged(callback: (data: any) => void) {
    this.socket?.on('product-availability-changed', callback)
  }

  offProductUpdated(callback: (data: any) => void) {
    this.socket?.off('product-updated', callback)
  }

  offProductAvailabilityChanged(callback: (data: any) => void) {
    this.socket?.off('product-availability-changed', callback)
  }

  // Inventory events
  onInventoryLow(callback: (data: any) => void) {
    this.socket?.on('inventory-low', callback)
  }

  offInventoryLow(callback: (data: any) => void) {
    this.socket?.off('inventory-low', callback)
  }

  emitOrderUpdate(orderId: string, status: string) {
    this.socket?.emit('order-update', { orderId, status })
  }

  emitProductToggle(productId: string) {
    this.socket?.emit('product-toggle-availability', productId)
  }
}

export const socketService = new SocketService()
export default socketService
