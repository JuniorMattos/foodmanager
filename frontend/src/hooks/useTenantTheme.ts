import { useEffect } from 'react'
import { useTenantStore } from '@/stores/tenantStore'

export function useTenantTheme() {
  const { currentTenant, theme, branding, applyTheme } = useTenantStore()

  useEffect(() => {
    if (currentTenant) {
      applyTheme()
      
      // Atualizar favicon se existir
      if (branding?.favicon_url) {
        const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
        if (favicon) {
          favicon.href = branding.favicon_url
        }
      }

      // Atualizar título da página
      if (branding?.brand_name) {
        document.title = `${branding.brand_name} - FoodManager`
      }
    }
  }, [currentTenant, branding, applyTheme])

  const getCSSVariable = (variable: string) => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(`--${variable}`)
      .trim()
  }

  const getButtonClasses = () => {
    if (!theme) return ''
    
    const baseClasses = 'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
    
    switch (theme.button_style) {
      case 'rounded':
        return `${baseClasses} rounded-lg`
      case 'square':
        return `${baseClasses} rounded-none`
      case 'pill':
        return `${baseClasses} rounded-full`
      default:
        return `${baseClasses} rounded-lg`
    }
  }

  return {
    theme,
    branding,
    currentTenant,
    getCSSVariable,
    getButtonClasses,
    primaryColor: theme?.primary_color || '#ea580c',
    secondaryColor: theme?.secondary_color || '#f97316',
    accentColor: theme?.accent_color || '#fed7aa',
    backgroundColor: theme?.background_color || '#ffffff',
    textColor: theme?.text_color || '#1f2937',
    fontFamily: theme?.font_family || 'Inter, sans-serif'
  }
}
