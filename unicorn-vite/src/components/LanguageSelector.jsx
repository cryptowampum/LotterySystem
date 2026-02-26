import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { themeConfig } from '../config/theme.config';

export default function LanguageSelector() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
  ];

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  if (!themeConfig.features.languageSelectorEnabled) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-muted border border-default hover:border-accent transition-colors text-base"
        aria-label={t('language.select')}
      >
        <span>{currentLang.flag}</span>
        <span className="text-sm">{currentLang.label}</span>
        <span className="text-xs">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 py-2 w-40 bg-surface-muted border border-default rounded-lg shadow-lg z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-surface transition-colors text-base ${
                i18n.language === lang.code ? 'bg-surface' : ''
              }`}
            >
              <span>{lang.flag}</span>
              <span className="text-sm">{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
