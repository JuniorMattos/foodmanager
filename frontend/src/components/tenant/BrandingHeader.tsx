import React from 'react'
import { useTenantTheme } from '@/hooks/useTenantTheme'

export function BrandingHeader() {
  const { branding, currentTenant } = useTenantTheme()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Logo */}
            {branding?.logo_url ? (
              <img 
                src={branding.logo_url} 
                alt={branding.brand_name || 'Logo'} 
                className="w-10 h-10 object-cover rounded-lg"
              />
            ) : (
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                {branding?.brand_name?.charAt(0) || '🍔'}
              </div>
            )}
            
            <div>
              <h1 
                className="text-lg font-bold"
                style={{ color: 'var(--text-color)' }}
              >
                {branding?.brand_name || currentTenant?.name || 'FoodManager'}
              </h1>
              {branding?.tagline && (
                <p 
                  className="text-xs"
                  style={{ color: 'var(--text-color)', opacity: 0.7 }}
                >
                  {branding.tagline}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
