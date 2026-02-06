import React, { useEffect } from 'react'
import { useTenantTheme } from '@/hooks/useTenantTheme'

interface TenantThemeProviderProps {
  children: React.ReactNode
}

export function TenantThemeProvider({ children }: TenantThemeProviderProps) {
  const { theme, branding, primaryColor, secondaryColor, accentColor, backgroundColor, textColor, fontFamily } = useTenantTheme()

  useEffect(() => {
    // Aplicar variáveis CSS globais
    const root = document.documentElement
    root.style.setProperty('--primary-color', primaryColor)
    root.style.setProperty('--secondary-color', secondaryColor)
    root.style.setProperty('--accent-color', accentColor)
    root.style.setProperty('--background-color', backgroundColor)
    root.style.setProperty('--text-color', textColor)
    root.style.setProperty('--font-family', fontFamily)

    // Aplicar fonte global
    root.style.fontFamily = fontFamily
  }, [theme, branding])

  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ 
        backgroundColor: backgroundColor,
        color: textColor,
        fontFamily: fontFamily
      }}
    >
      {children}
    </div>
  )
}
