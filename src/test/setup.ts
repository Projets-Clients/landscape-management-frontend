import '@testing-library/jest-dom'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr from '@/i18n/locales/fr.json'

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: { fr: { translation: fr } },
    lng: 'fr',
    fallbackLng: 'fr',
    interpolation: { escapeValue: false },
  })
}
