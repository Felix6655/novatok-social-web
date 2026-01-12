'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { SUPPORTED_LANGUAGES, changeLanguage, getCurrentLanguage } from '@/src/i18n'

/**
 * Language Switcher Component
 * 
 * A dropdown to switch between supported languages.
 * Can be used in settings page or header/sidebar.
 */
export function LanguageSwitcher({ 
  variant = 'dropdown', // 'dropdown' | 'list' | 'minimal'
  showFlag = true,
  showNativeName = true,
  className = '',
}) {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  
  const currentLang = getCurrentLanguage()
  const currentLangInfo = SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectLanguage = async (langCode) => {
    await changeLanguage(langCode)
    setIsOpen(false)
  }

  // Minimal variant - just icon and current language
  if (variant === 'minimal') {
    return (
      <div ref={dropdownRef} className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-sm"
        >
          <Globe className="w-4 h-4" />
          <span>{currentLangInfo.flag}</span>
        </button>
        
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-[hsl(0,0%,9%)] border border-gray-800 rounded-xl shadow-xl z-50 py-2 max-h-64 overflow-y-auto">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelectLanguage(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-800 transition-colors ${
                  lang.code === currentLang ? 'text-violet-400' : 'text-gray-300'
                }`}
              >
                {showFlag && <span className="text-lg">{lang.flag}</span>}
                <span className="flex-1 text-sm">{showNativeName ? lang.nativeName : lang.name}</span>
                {lang.code === currentLang && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // List variant - for settings page
  if (variant === 'list') {
    return (
      <div className={`space-y-2 ${className}`}>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleSelectLanguage(lang.code)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
              lang.code === currentLang 
                ? 'bg-violet-500/20 border border-violet-500/40 text-violet-400' 
                : 'bg-gray-800/50 border border-gray-800 text-gray-300 hover:bg-gray-800'
            }`}
          >
            {showFlag && <span className="text-xl">{lang.flag}</span>}
            <div className="flex-1 text-left">
              <p className="font-medium">{showNativeName ? lang.nativeName : lang.name}</p>
              {showNativeName && <p className="text-xs text-gray-500">{lang.name}</p>}
            </div>
            {lang.code === currentLang && <Check className="w-5 h-5" />}
          </button>
        ))}
      </div>
    )
  }

  // Default dropdown variant
  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800/50 border border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
      >
        <Globe className="w-4 h-4" />
        {showFlag && <span>{currentLangInfo.flag}</span>}
        <span className="text-sm">{showNativeName ? currentLangInfo.nativeName : currentLangInfo.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 bg-[hsl(0,0%,9%)] border border-gray-800 rounded-xl shadow-xl z-50 py-2 max-h-80 overflow-y-auto">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelectLanguage(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-800 transition-colors ${
                lang.code === currentLang ? 'text-violet-400 bg-violet-500/10' : 'text-gray-300'
              }`}
            >
              {showFlag && <span className="text-lg">{lang.flag}</span>}
              <div className="flex-1">
                <span className="text-sm font-medium">{showNativeName ? lang.nativeName : lang.name}</span>
                {showNativeName && lang.name !== lang.nativeName && (
                  <span className="text-xs text-gray-500 ml-2">({lang.name})</span>
                )}
              </div>
              {lang.code === currentLang && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSwitcher
