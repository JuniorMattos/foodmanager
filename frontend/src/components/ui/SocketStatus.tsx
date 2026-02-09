import { useSocketStore } from '../../stores/socketStore'
import { Wifi, WifiOff, AlertCircle } from 'lucide-react'

export function SocketStatus() {
  const { isConnected, connectionError, reconnectAttempts, reconnect } = useSocketStore()

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm">
        <Wifi size={16} />
        <span>Em tempo real</span>
      </div>
    )
  }

  if (reconnectAttempts > 0 && reconnectAttempts < 5) {
    return (
      <div className="flex items-center gap-2 text-yellow-600 text-sm">
        <AlertCircle size={16} />
        <span>Reconectando... ({reconnectAttempts}/5)</span>
      </div>
    )
  }

  return (
    <div 
      className="flex items-center gap-2 text-red-600 text-sm cursor-pointer hover:underline"
      onClick={reconnect}
    >
      <WifiOff size={16} />
      <span>Desconectado - Clique para reconectar</span>
    </div>
  )
}
