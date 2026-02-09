import React from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Layout } from '@/components/layout/Layout'
import { LazyLoad, 
  LazyLoginPage, 
  LazyRegisterPage, 
  LazyDashboardPage, 
  LazyPDVPage, 
  LazyMenuPage, 
  LazyOrdersPage, 
  LazyProductsPage, 
  LazyInventoryPage, 
  LazyFinancialPage,
  LazySettingsPage,
  LazyAdminDashboardPage,
  LazyAnalyticsPage,
  LazyBulkOperationsPage,
  LazyExportImportPage,
  LazyAuditLogPage,
  LazyRoleManagementPage
} from '@/components/LazyLoad'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useSocket } from '@/hooks/useSocket'

function App() {
  const { user, isLoading, checkAuth } = useAuthStore()
  
  // Initialize WebSocket connection
  useSocket()

  React.useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          <LazyLoad>
            <LazyLoginPage />
          </LazyLoad>
        } 
      />
      <Route 
        path="/register" 
        element={
          <LazyLoad>
            <LazyRegisterPage />
          </LazyLoad>
        } 
      />
      <Route 
        path="/menu" 
        element={
          <LazyLoad>
            <LazyMenuPage />
          </LazyLoad>
        } 
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          user ? (
            <Layout>
              <Outlet />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route 
          path="dashboard" 
          element={
            <LazyLoad>
              <LazyDashboardPage />
            </LazyLoad>
          } 
        />
        <Route 
          path="pdv" 
          element={
            <LazyLoad>
              <LazyPDVPage />
            </LazyLoad>
          } 
        />
        <Route 
          path="orders" 
          element={
            <LazyLoad>
              <LazyOrdersPage />
            </LazyLoad>
          } 
        />
        <Route 
          path="products" 
          element={
            <LazyLoad>
              <LazyProductsPage />
            </LazyLoad>
          } 
        />
        <Route 
          path="inventory" 
          element={
            <LazyLoad>
              <LazyInventoryPage />
            </LazyLoad>
          } 
        />
        <Route 
          path="financial" 
          element={
            <LazyLoad>
              <LazyFinancialPage />
            </LazyLoad>
          } 
        />
        <Route 
          path="settings" 
          element={
            <LazyLoad>
              <LazySettingsPage />
            </LazyLoad>
          } 
        />
        <Route 
          path="admin" 
          element={
            <LazyLoad>
              <LazyAdminDashboardPage />
            </LazyLoad>
          } 
        />
        <Route 
          path="analytics" 
          element={
            <LazyLoad>
              <LazyAnalyticsPage />
            </LazyLoad>
          } 
        />
        <Route 
          path="bulk-operations" 
          element={
            <LazyLoad>
              <LazyBulkOperationsPage />
            </LazyLoad>
          } 
        />
        <Route 
          path="export-import" 
          element={
            <LazyLoad>
              <LazyExportImportPage />
            </LazyLoad>
          } 
        />
        <Route 
          path="audit-log" 
          element={
            <LazyLoad>
              <LazyAuditLogPage />
            </LazyLoad>
          } 
        />
        <Route 
          path="role-management" 
          element={
            <LazyLoad>
              <LazyRoleManagementPage />
            </LazyLoad>
          } 
        />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
