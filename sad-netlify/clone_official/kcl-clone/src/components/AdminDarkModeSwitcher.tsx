import type React from 'react';
import { useTheme } from '../context/ThemeContext';

interface AdminDarkModeSwitcherProps {
  className?: string;
  variant?: 'toggle' | 'buttons' | 'icon';
}

const AdminDarkModeSwitcher: React.FC<AdminDarkModeSwitcherProps> = ({
  className = '',
  variant = 'toggle'
}) => {
  const { isDarkMode, toggleDarkMode, setDarkMode } = useTheme();

  if (variant === 'buttons') {
    return (
      <div className={`inline-flex rounded-md shadow-sm ${className}`}>
        <button
          type="button"
          onClick={() => setDarkMode(false)}
          className={`px-3 py-2 text-sm font-medium rounded-l-md ${
            !isDarkMode
              ? 'bg-white text-gray-900 ring-1 ring-inset ring-gray-300'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          aria-current={isDarkMode ? undefined : 'page'}
        >
          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Light
        </button>
        <button
          type="button"
          onClick={() => setDarkMode(true)}
          className={`px-3 py-2 text-sm font-medium rounded-r-md ${
            isDarkMode
              ? 'bg-gray-900 text-white ring-1 ring-inset ring-gray-700'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          aria-current={isDarkMode ? 'page' : undefined}
        >
          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          Dark
        </button>
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={toggleDarkMode}
        className={`p-2 rounded-full ${className} ${
          isDarkMode
            ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }`}
        aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      >
        {isDarkMode ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>
    );
  }

  // Default toggle switch
  return (
    <div className={`flex items-center ${className}`}>
      <span className={`mr-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
        <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </span>
      <button
        type="button"
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isDarkMode ? 'bg-indigo-600 focus:ring-indigo-500' : 'bg-gray-300 focus:ring-gray-500'
        } focus:ring-offset-white dark:focus:ring-offset-gray-900`}
        role="switch"
        aria-checked={isDarkMode}
        onClick={toggleDarkMode}
      >
        <span className="sr-only">Use dark mode</span>
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isDarkMode ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      <span className={`ml-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
        <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </span>
    </div>
  );
};

export default AdminDarkModeSwitcher;
