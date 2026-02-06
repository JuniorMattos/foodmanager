import React, { useState } from 'react'
import { Upload, Palette, Globe, Settings, Save, Eye } from 'lucide-react'
import { useTenantStore } from '@/stores/tenantStore'
import { TenantTheme, TenantBranding, TenantSettings } from '@/types/tenant'

export default function TenantSetupPage() {
  const { currentTenant, updateTheme, updateBranding, updateSettings } = useTenantStore()
  
  const [activeTab, setActiveTab] = useState<'branding' | 'theme' | 'settings'>('branding')
  const [previewMode, setPreviewMode] = useState(false)

  // Estado local para formulários
  const [branding, setBranding] = useState<Partial<TenantBranding>>({
    brand_name: currentTenant?.branding?.brand_name || '',
    logo_url: currentTenant?.branding?.logo_url || '',
    tagline: currentTenant?.branding?.tagline || '',
    favicon_url: currentTenant?.branding?.favicon_url || '',
    hero_image: currentTenant?.branding?.hero_image || '',
    social_links: currentTenant?.branding?.social_links || {}
  })

  const [theme, setTheme] = useState<Partial<TenantTheme>>({
    primary_color: currentTenant?.theme?.primary_color || '#ea580c',
    secondary_color: currentTenant?.theme?.secondary_color || '#f97316',
    accent_color: currentTenant?.theme?.accent_color || '#fed7aa',
    background_color: currentTenant?.theme?.background_color || '#ffffff',
    text_color: currentTenant?.theme?.text_color || '#1f2937',
    button_style: currentTenant?.theme?.button_style || 'rounded',
    font_family: currentTenant?.theme?.font_family || 'Inter, sans-serif'
  })

  const [settings, setSettings] = useState<Partial<TenantSettings>>({
    currency: currentTenant?.settings?.currency || 'BRL',
    currency_symbol: currentTenant?.settings?.currency_symbol || 'R$',
    timezone: currentTenant?.settings?.timezone || 'America/Sao_Paulo',
    language: currentTenant?.settings?.language || 'pt-BR',
    delivery_enabled: currentTenant?.settings?.delivery_enabled ?? true,
    pickup_enabled: currentTenant?.settings?.pickup_enabled ?? true,
    min_order_amount: currentTenant?.settings?.min_order_amount || 0,
    delivery_radius: currentTenant?.settings?.delivery_radius || 10,
    payment_methods: currentTenant?.settings?.payment_methods || ['credit_card', 'debit_card', 'pix', 'cash']
  })

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setBranding(prev => ({ ...prev, logo_url: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    updateTheme(theme)
    updateBranding(branding)
    updateSettings(settings)
    alert('Configurações salvas com sucesso!')
  }

  const handlePreview = () => {
    setPreviewMode(!previewMode)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configurações do Tenant</h1>
        <p className="text-gray-600 mt-1">Personalize sua aplicação para sua marca</p>
      </div>

      {/* Preview Toggle */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={handlePreview}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            previewMode 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>{previewMode ? 'Modo Preview Ativo' : 'Ver Preview'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar de Navegação */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('branding')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                  activeTab === 'branding' 
                    ? 'bg-orange-500 text-white' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Branding</span>
              </button>
              <button
                onClick={() => setActiveTab('theme')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                  activeTab === 'theme' 
                    ? 'bg-orange-500 text-white' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>Tema</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                  activeTab === 'settings' 
                    ? 'bg-orange-500 text-white' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Configurações</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Tab Branding */}
            {activeTab === 'branding' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-orange-500" />
                  <span>Branding</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo da Empresa</label>
                    <div className="flex items-center space-x-4">
                      {branding.logo_url && (
                        <img 
                          src={branding.logo_url} 
                          alt="Logo" 
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                        />
                      )}
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <div className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                          <Upload className="w-4 h-4" />
                          <span>Upload Logo</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Marca</label>
                      <input
                        type="text"
                        value={branding.brand_name}
                        onChange={(e) => setBranding(prev => ({ ...prev, brand_name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="Nome da sua empresa"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Slogan</label>
                      <input
                        type="text"
                        value={branding.tagline}
                        onChange={(e) => setBranding(prev => ({ ...prev, tagline: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="Seu slogan"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Theme */}
            {activeTab === 'theme' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <Palette className="w-5 h-5 text-orange-500" />
                  <span>Tema Visual</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cor Primária</label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={theme.primary_color}
                          onChange={(e) => setTheme(prev => ({ ...prev, primary_color: e.target.value }))}
                          className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={theme.primary_color}
                          onChange={(e) => setTheme(prev => ({ ...prev, primary_color: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="#ea580c"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cor Secundária</label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={theme.secondary_color}
                          onChange={(e) => setTheme(prev => ({ ...prev, secondary_color: e.target.value }))}
                          className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={theme.secondary_color}
                          onChange={(e) => setTheme(prev => ({ ...prev, secondary_color: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="#f97316"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cor de Destaque</label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={theme.accent_color}
                          onChange={(e) => setTheme(prev => ({ ...prev, accent_color: e.target.value }))}
                          className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={theme.accent_color}
                          onChange={(e) => setTheme(prev => ({ ...prev, accent_color: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="#fed7aa"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estilo de Botão</label>
                      <select
                        value={theme.button_style}
                        onChange={(e) => setTheme(prev => ({ ...prev, button_style: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="rounded">Arredondado</option>
                        <option value="square">Quadrado</option>
                        <option value="pill">Pílula</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fonte</label>
                      <select
                        value={theme.font_family}
                        onChange={(e) => setTheme(prev => ({ ...prev, font_family: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="Inter, sans-serif">Inter</option>
                        <option value="Roboto, sans-serif">Roboto</option>
                        <option value="Open Sans, sans-serif">Open Sans</option>
                        <option value="Poppins, sans-serif">Poppins</option>
                        <option value="Montserrat, sans-serif">Montserrat</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Settings */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-orange-500" />
                  <span>Configurações Gerais</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Moeda</label>
                      <select
                        value={settings.currency}
                        onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="BRL">Real (BRL)</option>
                        <option value="USD">Dólar (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Idioma</label>
                      <select
                        value={settings.language}
                        onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="pt-BR">Português (Brasil)</option>
                        <option value="en-US">English (US)</option>
                        <option value="es-ES">Español</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fuso Horário</label>
                      <select
                        value={settings.timezone}
                        onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="America/Sao_Paulo">São Paulo</option>
                        <option value="America/New_York">Nova York</option>
                        <option value="Europe/London">Londres</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="delivery_enabled"
                        checked={settings.delivery_enabled}
                        onChange={(e) => setSettings(prev => ({ ...prev, delivery_enabled: e.target.checked }))}
                        className="w-4 h-4 text-orange-500 rounded"
                      />
                      <label htmlFor="delivery_enabled" className="text-sm text-gray-700">
                        Habilitar Entrega
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="pickup_enabled"
                        checked={settings.pickup_enabled}
                        onChange={(e) => setSettings(prev => ({ ...prev, pickup_enabled: e.target.checked }))}
                        className="w-4 h-4 text-orange-500 rounded"
                      />
                      <label htmlFor="pickup_enabled" className="text-sm text-gray-700">
                        Habilitar Retirada
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Valor Mínimo do Pedido</label>
                      <input
                        type="number"
                        value={settings.min_order_amount}
                        onChange={(e) => setSettings(prev => ({ ...prev, min_order_amount: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Configurações</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
