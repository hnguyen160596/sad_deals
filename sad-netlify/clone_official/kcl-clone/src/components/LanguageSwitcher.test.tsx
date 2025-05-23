import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../test/utils';
import LanguageSwitcher from './LanguageSwitcher';
import i18n from '../i18n';

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset language to English before each test
    i18n.changeLanguage('en');
  });

  it('renders correctly', () => {
    render(<LanguageSwitcher />);

    // Check if the English flag is displayed
    expect(screen.getByText('🇺🇸')).toBeInTheDocument();

    // The component should be collapsed initially
    expect(screen.queryByText('Español')).not.toBeInTheDocument();
  });

  it('opens language options when clicked', () => {
    render(<LanguageSwitcher />);

    // Click on the language switcher
    fireEvent.click(screen.getByText('🇺🇸'));

    // Language options should now be visible
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Español')).toBeInTheDocument();
  });

  it('changes language when a different language is selected', async () => {
    // Spy on i18n.changeLanguage
    const changeLanguageSpy = vi.spyOn(i18n, 'changeLanguage');

    render(<LanguageSwitcher />);

    // Click on the language switcher to open options
    fireEvent.click(screen.getByText('🇺🇸'));

    // Select Spanish
    fireEvent.click(screen.getByText('Español'));

    // Check if i18n.changeLanguage was called with 'es'
    expect(changeLanguageSpy).toHaveBeenCalledWith('es');
  });
});
