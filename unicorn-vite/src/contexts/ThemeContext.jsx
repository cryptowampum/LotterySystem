import { createContext, useContext, useState, useEffect } from 'react';
import { themeConfig } from '../config/theme.config';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    if (!themeConfig.features.darkModeEnabled) return false;

    // Check localStorage first
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';

    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const colors = isDark ? themeConfig.colors.dark : themeConfig.colors.light;
    const root = document.documentElement;

    // Set CSS custom properties for all colors
    Object.entries(colors).forEach(([key, value]) => {
      // Convert camelCase to kebab-case for CSS variables
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--color-${cssKey}`, value);
    });

    // Toggle dark class for Tailwind
    root.classList.toggle('dark', isDark);

    // Persist preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Listen for system preference changes
  useEffect(() => {
    if (!themeConfig.features.darkModeEnabled) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only auto-switch if user hasn't set a preference
      const saved = localStorage.getItem('theme');
      if (!saved) {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => setIsDark(prev => !prev);

  const value = {
    isDark,
    toggleTheme,
    colors: themeConfig.colors[isDark ? 'dark' : 'light'],
    config: themeConfig,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
