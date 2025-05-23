import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ThemeSwitcher from './ThemeSwitcher';
import { ThemeProvider } from '../context/ThemeContext';
import { renderWithProviders } from '../test/utils';

// Mock the localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    // Clear document class list
    document.documentElement.classList.remove('dark');
  });

  it('renders the theme switcher with system theme by default', () => {
    renderWithProviders(<ThemeSwitcher />);

    // Check that the system theme icon is visible
    const buttonElement = screen.getByRole('button', { name: /toggle theme/i });
    expect(buttonElement).toBeInTheDocument();
  });

  it('opens the theme dropdown when clicked', async () => {
    renderWithProviders(<ThemeSwitcher />);

    const buttonElement = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(buttonElement);

    // Check that all theme options are now visible
    await waitFor(() => {
      expect(screen.getByText(/light/i)).toBeInTheDocument();
      expect(screen.getByText(/dark/i)).toBeInTheDocument();
      expect(screen.getByText(/system/i)).toBeInTheDocument();
    });
  });

  it('changes theme when a theme option is selected', async () => {
    renderWithProviders(<ThemeSwitcher />);

    // Open dropdown
    const buttonElement = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(buttonElement);

    // Click dark theme
    const darkButton = screen.getByText(/dark/i);
    fireEvent.click(darkButton);

    // Check that localStorage has been updated
    expect(localStorage.getItem('theme')).toBe('dark');

    // Check that document has dark class
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('respects the user\'s saved theme preference', () => {
    // Set a theme preference in localStorage
    localStorage.setItem('theme', 'dark');

    // Create a custom wrapper to provide the correct theme context
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    render(<ThemeSwitcher />, { wrapper: Wrapper });

    // Verify that the dark mode icon is shown
    const buttonElement = screen.getByRole('button', { name: /toggle theme/i });
    expect(buttonElement).toBeInTheDocument();

    // Check that document has dark class
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
