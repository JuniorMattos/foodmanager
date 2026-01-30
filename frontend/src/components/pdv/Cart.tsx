import React from 'react'
import { X, Plus, Minus, Trash2, CreditCard, Smartphone, DollarSign, Receipt } from 'lucide-react'
import { CartItem, Product } from '@/types'

interface CartProps {
  items: CartItem[]
  onRemoveItem: (productId: string) => void
  onUpdateQuantity: (productId: string, quantity: number) => void
  onClearCart: () => void
  onCheckout: (paymentMethod: string) => void
  total: number
  deliveryFee?: number
  deliveryType: 'pickup' | 'delivery'
  onDeliveryTypeChange: (type: 'pickup' | 'delivery') => void
  customerInfo?: {
    name: string
    phone: string
    address?: string
  }
  onCustomerInfoChange: (info: any) => void
}

export default function Cart({
  items,
  onRemoveItem,
  onUpdateQuantity,
  onClearCart,
  onCheckout,
  total,
  deliveryFee = 0,
  deliveryType,
  onDeliveryTypeChange,
  customerInfo,
  onCustomerInfoChange
}: CartProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<string>('cash')
  const [showPaymentModal, setShowPaymentModal] = React.useState(false)

  const subtotal = items.reduce((sum, item) => sum + (item.totalPrice), 0)
  const finalTotal = subtotal + (deliveryType === 'delivery' ? deliveryFee : 0)

  const paymentMethods = [
    { id: 'cash', name: 'Dinheiro', icon: DollarSign, color: 'bg-green-500' },
    { id: 'credit_card', name: 'Cartão de Crédito', icon: CreditCard, color: 'bg-blue-500' },
    { id: 'debit_card', name: 'Cartão de Débito', icon: CreditCard, color: 'bg-purple-500' },
    { id: 'pix', name: 'PIX', icon: Smartphone, color: 'bg-teal-500' },
    { id: 'meal_voucher', name: 'Vale-Alimentação', icon: Receipt, color: 'bg-orange-500' },
  ]

  const handleCheckout = () => {
    onCheckout(selectedPaymentMethod)
    setShowPaymentModal(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Carrinho</h2>
          {items.length > 0 && (
            <button
              onClick={onClearCart}
              className="text-red-500 hover:text-red-600 p-1"
              title="Limpar carrinho"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-lg">Carrinho vazio</div>
            <p className="text-gray-500 mt-2">Adicione produtos para começar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <CartItemComponent
                key={item.productId}
                item={item}
                onRemove={() => onRemoveItem(item.productId)}
                onUpdateQuantity={(quantity) => onUpdateQuantity(item.productId, quantity)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delivery Options */}
      {items.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Tipo de Entrega</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onDeliveryTypeChange('pickup')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    deliveryType === 'pickup'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">Retirada</div>
                  <div className="text-xs text-gray-500">Buscar no local</div>
                </button>
                <button
                  onClick={() => onDeliveryTypeChange('delivery')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    deliveryType === 'delivery'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">Entrega</div>
                  <div className="text-xs text-gray-500">Receber em casa</div>
                </button>
              </div>
            </div>

            {/* Customer Info */}
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Nome do cliente"
                value={customerInfo?.name || ''}
                onChange={(e) => onCustomerInfoChange({ ...customerInfo, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <input
                type="tel"
                placeholder="Telefone"
                value={customerInfo?.phone || ''}
                onChange={(e) => onCustomerInfoChange({ ...customerInfo, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              {deliveryType === 'delivery' && (
                <input
                  type="text"
                  placeholder="Endereço de entrega"
                  value={customerInfo?.address || ''}
                  onChange={(e) => onCustomerInfoChange({ ...customerInfo, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {items.length > 0 && (
        <div className="p-4 border-t border-gray-200 space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
            </div>
            {deliveryType === 'delivery' && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Taxa de Entrega</span>
                <span className="font-medium">R$ {deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
              <span>Total</span>
              <span className="text-orange-600">R$ {finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => setShowPaymentModal(true)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Finalizar Pedido
          </button>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Selecionar Forma de Pagamento</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {paymentMethods.map(method => {
                const Icon = method.icon
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedPaymentMethod === method.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 ${method.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-sm font-medium">{method.name}</div>
                  </button>
                )
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Confirmar Pagamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface CartItemComponentProps {
  item: CartItem
  onRemove: () => void
  onUpdateQuantity: (quantity: number) => void
}

function CartItemComponent({ item, onRemove, onUpdateQuantity }: CartItemComponentProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{item.product.name}</h4>
          <p className="text-sm text-gray-600">R$ {item.unitPrice.toFixed(2)} unidade</p>
        </div>
        <button
          onClick={onRemove}
          className="text-red-500 hover:text-red-600 p-1"
          title="Remover item"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
            className="p-1 rounded bg-white border border-gray-300 hover:bg-gray-50"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="w-8 text-center font-medium">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            className="p-1 rounded bg-white border border-gray-300 hover:bg-gray-50"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
        <div className="font-semibold text-gray-900">
          R$ {item.totalPrice.toFixed(2)}
        </div>
      </div>

      {/* Customizations */}
      {item.customizations && item.customizations.length > 0 && (
        <div className="mt-2 text-xs text-gray-600">
          {item.customizations.map(customization => (
            <div key={customization.id} className="flex justify-between">
              <span>{customization.name}</span>
              <span>R$ {customization.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
