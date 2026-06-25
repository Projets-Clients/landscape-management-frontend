import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr from './locales/fr.json'
import en from './locales/en.json'
import es from './locales/es.json'
import it from './locales/it.json'
import de from './locales/de.json'

void i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
    es: { translation: es },
    it: { translation: it },
    de: { translation: de },
  },
  lng: localStorage.getItem('landscape-lang') ?? 'fr',
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
})

export default i18n
