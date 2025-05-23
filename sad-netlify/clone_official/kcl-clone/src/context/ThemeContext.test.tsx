import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, renderHook, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';
import type React from 'react';

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

// Mock the analytics
vi.mock('../components/Analytics', () => ({
  trackEvent: vi.fn(),
}));

// Mock matchMedia for system preference tests
const createMatchMedia = (matches: boolean) => (query: string) => ({
  matches,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

describe('ThemeContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    // Clear document class list
    document.documentElement.classList.remove('dark');
    // Reset matchMedia mock
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: createMatchMedia(false),
    });
  });

  it('uses system theme by default', () => {
    // Set up a dark system preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: createMatchMedia(true), // simulate dark mode preference
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe('system');
    expect(result.current.isDarkMode).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('loads theme from localStorage if available', () => {
    // Set a theme preference in localStorage
    localStorage.setItem('theme', 'dark');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe('dark');
    expect(result.current.isDarkMode).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('changes theme when setTheme is called', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    // Initial state is system theme (light in our mock)
    expect(result.current.theme).toBe('system');
    expect(result.current.isDarkMode).toBe(false);

    // Change to dark theme
    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
    expect(result.current.isDarkMode).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Change back to light theme
    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');
    expect(result.current.isDarkMode).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('respects system preference changes', () => {
    // Initial system preference is light
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: createMatchMedia(false), // simulate light mode preference
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    // Ensure we're using system theme
    act(() => {
      result.current.setTheme('system');
    });

    expect(result.current.theme).toBe('system');
    expect(result.current.isDarkMode).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Simulate system preference change to dark
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: createMatchMedia(true), // simulate dark mode preference
    });

    // Trigger the matchMedia change event
    const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
    act(() => {
      mediaQueryList.addEventListener.mock.calls[0][1]();
    });

    // Since we're using system theme, isDarkMode should now be true
    expect(result.current.theme).toBe('system');
    expect(result.current.isDarkMode).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
