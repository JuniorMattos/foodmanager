import React, { useState } from 'react'
import { X, Upload, Eye, EyeOff } from 'lucide-react'
import { useAdminStore } from '@/stores/adminStore'
import { CreateTenantData } from '@/types/admin'
import { useTranslation } from 'react-i18next'

interface CreateTenantModalProps {
  onClose: () => void
}

export function CreateTenantModal({ onClose }: CreateTenantModalProps) {
  const { t } = useTranslation()
  const { createTenant, isLoading } = useAdminStore()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<CreateTenantData>({
    name: '',
    slug: '',
    email: '',
    phone: '',
    plan: 'basic',
    admin_user: {
      name: '',
      email: '',
      password: ''
    },
    branding: {
      brand_name: '',
      logo_url: '',
      tagline: ''
    },
    theme: {
      primary_color: '#ea580c',
      secondary_color: '#f97316',
      accent_color: '#fed7aa',
      background_color: '#ffffff',
      text_color: '#1f2937',
      button_style: 'rounded',
      font_family: 'Inter, sans-serif'
    },
    settings: {
      currency: 'BRL',
      currency_symbol: 'R$',
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      delivery_enabled: true,
      pickup_enabled: true,
      min_order_amount: 0,
      delivery_radius: 10,
      payment_methods: ['credit_card', 'debit_card', 'pix', 'cash'],
      working_hours: {
        monday: { open: '08:00', close: '22:00', enabled: true },
        tuesday: { open: '08:00', close: '22:00', enabled: true },
        wednesday: { open: '08:00', close: '22:00', enabled: true },
        thursday: { open: '08:00', close: '22:00', enabled: true },
        friday: { open: '08:00', close: '22:00', enabled: true },
        saturday: { open: '08:00', close: '22:00', enabled: true },
        sunday: { open: '08:00', close: '22:00', enabled: true }
      }
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createTenant(formData)
      onClose()
    } catch (error) {
      console.error('Error creating tenant:', error)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setFormData(prev => ({
          ...prev,
          branding: { ...prev.branding, logo_url: result }
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{t('createTenantModal.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('createTenantModal.sections.basicInfo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('createTenantModal.fields.tenantName')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value
                    setFormData(prev => ({
                      ...prev,
                      name,
                      slug: generateSlug(name),
                      branding: { ...prev.branding, brand_name: name }
                    }))
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder={t('createTenantModal.placeholders.companyName')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('createTenantModal.fields.slug')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder={t('createTenantModal.placeholders.slug')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('createTenantModal.fields.email')} *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder={t('createTenantModal.placeholders.email')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('createTenantModal.fields.phone')}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder={t('createTenantModal.placeholders.phone')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('createTenantModal.fields.plan')} *
                </label>
                <select
                  required
                  value={formData.plan}
                  onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="basic">{t('createTenantModal.plan.basic')}</option>
                  <option value="premium">{t('createTenantModal.plan.premium')}</option>
                  <option value="enterprise">{t('createTenantModal.plan.enterprise')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Usuário Administrador */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('createTenantModal.sections.adminUser')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('createTenantModal.fields.name')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.admin_user.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    admin_user: { ...prev.admin_user, name: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder={t('createTenantModal.placeholders.adminName')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('createTenantModal.fields.email')} *
                </label>
                <input
                  type="email"
                  required
                  value={formData.admin_user.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    admin_user: { ...prev.admin_user, email: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder={t('createTenantModal.placeholders.adminEmail')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('createTenantModal.fields.password')} *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.admin_user.password}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      admin_user: { ...prev.admin_user, password: e.target.value }
                    }))}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder={t('createTenantModal.placeholders.securePassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Branding */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Branding</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo
                </label>
                <div className="flex items-center space-x-4">
                  {formData.branding.logo_url && (
                    <img
                      src={formData.branding.logo_url}
                      alt="Logo preview"
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
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
                      <span>{t('createTenantModal.actions.uploadLogo')}</span>
                    </div>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('createTenantModal.fields.tagline')}
                </label>
                <input
                  type="text"
                  value={formData.branding.tagline}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    branding: { ...prev.branding, tagline: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder={t('createTenantModal.placeholders.tagline')}
                />
              </div>
            </div>
          </div>

          {/* Tema */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('createTenantModal.sections.visualTheme')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('createTenantModal.fields.primaryColor')}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formData.theme.primary_color}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      theme: { ...prev.theme, primary_color: e.target.value }
                    }))}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.theme.primary_color}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      theme: { ...prev.theme, primary_color: e.target.value }
                    }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('createTenantModal.fields.secondaryColor')}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formData.theme.secondary_color}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      theme: { ...prev.theme, secondary_color: e.target.value }
                    }))}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.theme.secondary_color}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      theme: { ...prev.theme, secondary_color: e.target.value }
                    }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('createTenantModal.fields.buttonStyle')}
                </label>
                <select
                  value={formData.theme.button_style}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    theme: { ...prev.theme, button_style: e.target.value as any }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="rounded">{t('createTenantModal.buttonStyle.rounded')}</option>
                  <option value="square">{t('createTenantModal.buttonStyle.square')}</option>
                  <option value="pill">{t('createTenantModal.buttonStyle.pill')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Configurações */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('createTenantModal.sections.settings')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('createTenantModal.fields.currency')}
                </label>
                <select
                  value={formData.settings.currency}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, currency: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="BRL">{t('createTenantModal.currency.brl')}</option>
                  <option value="USD">{t('createTenantModal.currency.usd')}</option>
                  <option value="EUR">{t('createTenantModal.currency.eur')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('createTenantModal.fields.language')}
                </label>
                <select
                  value={formData.settings.language}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, language: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="pt-BR">{t('createTenantModal.language.ptBR')}</option>
                  <option value="en-US">{t('createTenantModal.language.enUS')}</option>
                  <option value="es-ES">{t('createTenantModal.language.esES')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('createTenantModal.fields.minOrderAmount')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.settings.min_order_amount}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, min_order_amount: Number(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
              {isLoading ? t('createTenantModal.actions.creating') : t('createTenantModal.actions.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
