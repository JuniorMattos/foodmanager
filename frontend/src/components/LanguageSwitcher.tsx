import React from 'react'
import { Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type SupportedLanguage = 'pt-BR' | 'en'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()

  const current = (i18n.resolvedLanguage || i18n.language) as SupportedLanguage

  const setLanguage = async (lng: SupportedLanguage) => {
    await i18n.changeLanguage(lng)
  }

  return (
    <div className="flex items-center space-x-2">
      <Globe className="w-4 h-4 text-gray-500" />
      <span className="text-xs text-gray-600">{t('common.language')}</span>
      <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setLanguage('pt-BR')}
          className={
            'px-2 py-1 text-xs transition-colors ' +
            (current === 'pt-BR' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-100')
          }
        >
          PT
        </button>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={
            'px-2 py-1 text-xs transition-colors ' +
            (current === 'en' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-100')
          }
        >
          EN
        </button>
      </div>
    </div>
  )
}
