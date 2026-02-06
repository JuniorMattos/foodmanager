import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign, 
  Settings,
  Store,
  ClipboardList
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/utils/cn'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'PDV', href: '/pdv', icon: ShoppingCart },
  { name: 'Cardápio', href: '/menu', icon: Store },
  { name: 'Pedidos', href: '/orders', icon: ClipboardList },
  { name: 'Produtos', href: '/products', icon: Package },
  { name: 'Estoque', href: '/inventory', icon: Users },
  { name: 'Financeiro', href: '/financial', icon: DollarSign },
  { name: 'Configurações', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const location = useLocation()
  const { user } = useAuthStore()

  const filteredNavigation = navigation.filter(item => {
    if (user?.role === 'CUSTOMER') {
      return ['/menu', '/orders'].includes(item.href)
    }
    if (user?.role === 'VENDOR') {
      return ['/pdv', '/menu', '/orders'].includes(item.href)
    }
    return true
  })

  return (
    <div className="w-64 bg-white shadow-lg h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">🍔</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">FoodManager</h1>
            <p className="text-xs text-gray-500">{user?.tenant?.name}</p>
          </div>
        </div>
      </div>

      <nav className="px-4 pb-6">
        <ul className="space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || 'Usuário'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
