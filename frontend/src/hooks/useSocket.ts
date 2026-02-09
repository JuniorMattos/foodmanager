import { useEffect } from 'react'
import { useSocketStore } from '../stores/socketStore'

export function useSocket() {
  const { connect, disconnect, isConnected, connectionError } = useSocketStore()

  useEffect(() => {
    connect()
    
    // Cleanup ao desmontar
    return () => {
      disconnect()
    }
  }, [])

  return { isConnected, connectionError }
}

// Hook específico para pedidos
export function useOrderSocket(orderId?: string) {
  const { socket, joinOrderRoom, leaveOrderRoom } = useSocketStore()
  
  useEffect(() => {
    if (orderId && socket) {
      joinOrderRoom(orderId)
      return () => leaveOrderRoom(orderId)
    }
  }, [orderId, socket])
}
