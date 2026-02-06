import React from 'react'
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Globe, HelpCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function SettingsPage() {
  const { t, i18n } = useTranslation()

  const currentLanguage = i18n.resolvedLanguage === 'en' ? 'en' : 'pt-BR'

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('settingsPage.title')}</h1>
        <p className="text-gray-600 mt-1">{t('settingsPage.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Perfil */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <User className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">{t('settingsPage.sections.profile')}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('settingsPage.profile.name')}</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder={t('settingsPage.profile.namePlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('settingsPage.profile.email')}</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder={t('settingsPage.profile.emailPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('settingsPage.profile.phone')}</label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder={t('settingsPage.profile.phonePlaceholder')}
              />
            </div>
          </div>
        </div>

        {/* Notificações */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">{t('settingsPage.sections.notifications')}</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{t('settingsPage.notifications.email')}</span>
              <input type="checkbox" className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{t('settingsPage.notifications.orders')}</span>
              <input type="checkbox" className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{t('settingsPage.notifications.newsletter')}</span>
              <input type="checkbox" className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500" />
            </label>
          </div>
        </div>

        {/* Segurança */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">{t('settingsPage.sections.security')}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('settingsPage.security.currentPassword')}</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('settingsPage.security.newPassword')}</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder={t('settingsPage.security.newPasswordPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('settingsPage.security.confirmNewPassword')}</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder={t('settingsPage.security.confirmNewPasswordPlaceholder')}
              />
            </div>
          </div>
        </div>

        {/* Preferências */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Palette className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">{t('settingsPage.sections.preferences')}</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('settingsPage.preferences.language')}</label>
              <select
                value={currentLanguage}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="pt-BR">{t('settingsPage.preferences.languagePt')}</option>
                <option value="en">{t('settingsPage.preferences.languageEn')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('settingsPage.preferences.timezone')}</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                <option>America/Sao_Paulo (GMT-3)</option>
                <option>America/New_York (GMT-5)</option>
                <option>Europe/London (GMT+0)</option>
              </select>
            </div>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{t('settingsPage.preferences.darkMode')}</span>
              <input type="checkbox" className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500" />
            </label>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-3 mt-8">
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          {t('settingsPage.actions.cancel')}
        </button>
        <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
          {t('settingsPage.actions.save')}
        </button>
      </div>
    </div>
  )
}
