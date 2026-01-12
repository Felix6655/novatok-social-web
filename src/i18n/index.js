/**
 * i18n Configuration for NovaTok
 * 
 * Cross-platform internationalization setup:
 * - Web: uses browser language detection
 * - Native: would use expo-localization
 * 
 * Supports: en, es, pt-BR, fr, de, it, ja, zh-CN
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation files
import en from './locales/en.json'
import es from './locales/es.json'
import ptBR from './locales/pt-BR.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import it from './locales/it.json'
import ja from './locales/ja.json'
import zhCN from './locales/zh-CN.json'

// Language configuration
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
]

export const DEFAULT_LANGUAGE = 'en'

// Storage key for persisting language choice
export const LANGUAGE_STORAGE_KEY = 'novatok_language'

// Resources object for i18next
const resources = {
  en: { translation: en },
  es: { translation: es },
  'pt-BR': { translation: ptBR },
  fr: { translation: fr },
  de: { translation: de },
  it: { translation: it },
  ja: { translation: ja },
  'zh-CN': { translation: zhCN },
}

// Check if we're on the server
const isServer = typeof window === 'undefined'

// Initialize i18next
if (!i18n.isInitialized) {
  const i18nConfig = {
    resources,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES.map(l => l.code),
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: false, // Disable suspense for SSR compatibility
    },
  }

  // Only use language detector on client side
  if (!isServer) {
    i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        ...i18nConfig,
        detection: {
          order: ['localStorage', 'navigator', 'htmlTag'],
          lookupLocalStorage: LANGUAGE_STORAGE_KEY,
          caches: ['localStorage'],
        },
      })
  } else {
    i18n
      .use(initReactI18next)
      .init(i18nConfig)
  }
}

/**
 * Change the current language
 * @param {string} languageCode - Language code (e.g., 'en', 'es', 'ja')
 */
export async function changeLanguage(languageCode) {
  if (!SUPPORTED_LANGUAGES.find(l => l.code === languageCode)) {
    console.warn(`[i18n] Unsupported language: ${languageCode}`)
    return
  }
  
  await i18n.changeLanguage(languageCode)
  
  // Persist to localStorage (on web)
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode)
    } catch (e) {
      console.warn('[i18n] Failed to persist language:', e)
    }
  }
}

/**
 * Get the current language code
 * @returns {string}
 */
export function getCurrentLanguage() {
  return i18n.language || DEFAULT_LANGUAGE
}

/**
 * Get language info by code
 * @param {string} code 
 * @returns {Object|undefined}
 */
export function getLanguageInfo(code) {
  return SUPPORTED_LANGUAGES.find(l => l.code === code)
}

export default i18n
