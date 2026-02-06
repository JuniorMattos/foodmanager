import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Tenant, TenantTheme, TenantBranding, TenantSettings } from '@/types/tenant'

interface TenantState {
  currentTenant: Tenant | null
  isLoading: boolean
  theme: TenantTheme | null
  branding: TenantBranding | null
  
  // Actions
  setCurrentTenant: (tenant: Tenant) => void
  updateTheme: (theme: Partial<TenantTheme>) => void
  updateBranding: (branding: Partial<TenantBranding>) => void
  updateSettings: (settings: Partial<TenantSettings>) => void
  applyTheme: () => void
  resetTenant: () => void
}

const defaultTheme: TenantTheme = {
  primary_color: '#ea580c',
  secondary_color: '#f97316',
  accent_color: '#fed7aa',
  background_color: '#ffffff',
  text_color: '#1f2937',
  button_style: 'rounded',
  font_family: 'Inter, sans-serif'
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set, get) => ({
      currentTenant: null,
      isLoading: false,
      theme: defaultTheme,
      branding: null,

      setCurrentTenant: (tenant) => {
        set({ 
          currentTenant: tenant,
          theme: tenant.theme || defaultTheme,
          branding: tenant.branding || null
        })
        get().applyTheme()
      },

      updateTheme: (themeUpdates) => {
        const currentTheme = get().theme || defaultTheme
        const updatedTheme = { ...currentTheme, ...themeUpdates }
        set({ theme: updatedTheme })
        get().applyTheme()
      },

      updateBranding: (brandingUpdates) => {
        const currentBranding = get().branding || {
          logo_url: '',
          brand_name: ''
        }
        const updatedBranding = { ...currentBranding, ...brandingUpdates }
        set({ branding: updatedBranding })
      },

      updateSettings: (settingsUpdates) => {
        const currentTenant = get().currentTenant
        if (currentTenant) {
          const updatedSettings = {
            ...currentTenant.settings,
            ...settingsUpdates
          }
          const updatedTenant = {
            ...currentTenant,
            settings: updatedSettings
          }
          set({ currentTenant: updatedTenant })
        }
      },

      applyTheme: () => {
        const { theme } = get()
        if (!theme) return

        const root = document.documentElement
        root.style.setProperty('--primary-color', theme.primary_color)
        root.style.setProperty('--secondary-color', theme.secondary_color)
        root.style.setProperty('--accent-color', theme.accent_color)
        root.style.setProperty('--background-color', theme.background_color)
        root.style.setProperty('--text-color', theme.text_color)
        root.style.setProperty('--font-family', theme.font_family)

        // Aplicar classe de estilo de botão
        root.setAttribute('data-button-style', theme.button_style)
      },

      resetTenant: () => {
        set({ 
          currentTenant: null,
          theme: defaultTheme,
          branding: null 
        })
        get().applyTheme()
      }
    }),
    {
      name: 'tenant-storage',
      partialize: (state) => ({
        currentTenant: state.currentTenant,
        theme: state.theme,
        branding: state.branding
      })
    }
  )
)
