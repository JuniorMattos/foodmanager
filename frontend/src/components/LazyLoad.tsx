import React, { Suspense } from 'react'
import { LoadingSpinner } from './ui/LoadingSpinner'

interface LazyLoadProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function LazyLoad({ children, fallback }: LazyLoadProps) {
  return (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      {children}
    </Suspense>
  )
}

// Lazy loaded components
export const LazyDashboardPage = React.lazy(() => import('@/pages/dashboard/DashboardPage'))
export const LazyProductsPage = React.lazy(() => import('@/pages/products/ProductsPage'))
export const LazyOrdersPage = React.lazy(() => import('@/pages/orders/OrdersPage'))
export const LazyInventoryPage = React.lazy(() => import('@/pages/inventory/InventoryPage'))
export const LazyFinancialPage = React.lazy(() => import('@/pages/financial/FinancialPage'))
export const LazySettingsPage = React.lazy(() => import('@/pages/settings/SettingsPage'))
export const LazyAdminDashboardPage = React.lazy(() => import('@/pages/admin/AdminDashboardPage'))
export const LazyAnalyticsPage = React.lazy(() => import('@/pages/admin/AnalyticsPage'))
export const LazyBulkOperationsPage = React.lazy(() => import('@/pages/admin/BulkOperationsPage'))
export const LazyExportImportPage = React.lazy(() => import('@/pages/admin/ExportImportPage'))
export const LazyAuditLogPage = React.lazy(() => import('@/pages/admin/AuditLogPage'))
export const LazyRoleManagementPage = React.lazy(() => import('@/pages/admin/RoleManagementPage'))
export const LazyPDVPage = React.lazy(() => import('@/pages/pdv/PDVPage'))
export const LazyMenuPage = React.lazy(() => import('@/pages/customer/MenuPage'))
export const LazyLoginPage = React.lazy(() => import('@/pages/auth/LoginPage'))
export const LazyRegisterPage = React.lazy(() => import('@/pages/auth/RegisterPage'))
