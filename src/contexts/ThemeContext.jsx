import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const ThemeContext = createContext();

// Available themes
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || THEMES.SYSTEM;
    }
    return THEMES.SYSTEM;
  });

  // Get system theme preference
  const getSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? THEMES.DARK 
        : THEMES.LIGHT;
    }
    return THEMES.LIGHT;
  };

  // Get effective theme (resolves 'system' to actual theme)
  const effectiveTheme = useMemo(() => {
    return theme === THEMES.SYSTEM ? getSystemTheme() : theme;
  }, [theme]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove(THEMES.LIGHT, THEMES.DARK);
    
    // Add current theme class
    root.classList.add(effectiveTheme);
    
    // Set data-theme attribute for CSS variables
    root.setAttribute('data-theme', effectiveTheme);
    
    // Store in localStorage
    localStorage.setItem('theme', theme);
  }, [theme, effectiveTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== THEMES.SYSTEM) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      // Force re-render by updating state
      setTheme(prev => prev);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === THEMES.LIGHT) return THEMES.DARK;
      if (prev === THEMES.DARK) return THEMES.SYSTEM;
      return THEMES.LIGHT;
    });
  };

  const setThemeDirect = (newTheme) => {
    if (Object.values(THEMES).includes(newTheme)) {
      setTheme(newTheme);
    } else {
      console.warn(`Invalid theme: ${newTheme}`);
    }
  };

  const isDark = effectiveTheme === THEMES.DARK;
  const isLight = effectiveTheme === THEMES.LIGHT;
  const isSystem = theme === THEMES.SYSTEM;

  const value = {
    // Current theme settings
    theme,
    effectiveTheme,
    
    // Theme states
    isDark,
    isLight,
    isSystem,
    
    // Actions
    toggleTheme,
    setTheme: setThemeDirect,
    
    // Constants
    availableThemes: THEMES
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;