import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { themeConfig } from '../config/theme.config';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();

  if (!themeConfig.features.darkModeEnabled) return null;

  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-2 rounded-lg bg-surface-muted border border-default hover:border-accent transition-colors"
      aria-label={isDark ? t('theme.toggleLight') : t('theme.toggleDark')}
      title={isDark ? t('theme.toggleLight') : t('theme.toggleDark')}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
