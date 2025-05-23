import type React from 'react';
import { createContext, useState, useContext, useEffect } from 'react';

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
  toggleTheme: () => void;
  getThemeClasses: (options?: {
    dark?: string;
    light?: string;
    system?: string;
  }) => string;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  isDarkMode: false,
  toggleDarkMode: () => {},
  setDarkMode: () => {},
  toggleTheme: () => {},
  getThemeClasses: () => '',
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<string>(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  const [isDarkMode, setIsDarkModeState] = useState<boolean>(() => {
    const savedDarkMode = localStorage.getItem('adminDarkMode');
    return savedDarkMode === 'true';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    // Apply theme to html element
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('adminDarkMode', isDarkMode.toString());

    // Only apply admin dark mode styles when on admin pages
    if (window.location.pathname.startsWith('/admin')) {
      if (isDarkMode) {
        document.documentElement.classList.add('admin-dark-mode');
      } else {
        document.documentElement.classList.remove('admin-dark-mode');
      }
    }
  }, [isDarkMode]);

  // Check if we're on an admin page and apply dark mode accordingly
  useEffect(() => {
    const isAdminPage = window.location.pathname.startsWith('/admin');
    if (isAdminPage && isDarkMode) {
      document.documentElement.classList.add('admin-dark-mode');
    }
  }, [isDarkMode]);

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const toggleDarkMode = () => {
    setIsDarkModeState(prev => !prev);
  };

  const setDarkMode = (isDark: boolean) => {
    setIsDarkModeState(isDark);
  };

  // Helper function to get theme classes
  const getThemeClasses = (options: {
    dark?: string;
    light?: string;
    system?: string;
  } = {}) => {
    const { dark = '', light = '', system = '' } = options;

    // For website theme
    if (theme === 'dark') return dark;
    if (theme === 'system') return system;
    return light;
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        isDarkMode,
        toggleDarkMode,
        setDarkMode,
        toggleTheme,
        getThemeClasses,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
