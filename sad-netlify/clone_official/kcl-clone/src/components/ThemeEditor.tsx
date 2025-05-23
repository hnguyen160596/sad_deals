import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/Tabs';
import { useToast } from '../context/ToastContext';
import { useActivityLog } from '../context/ActivityLogContext';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  border: string;
  muted: string;
  mutedForeground: string;
}

interface ThemeFont {
  family: string;
  headingFamily: string;
  baseSize: number;
  lineHeight: number;
  weight: number;
  headingWeight: number;
}

interface ThemeSpacing {
  unit: number;
  containerWidth: number;
  sidebarWidth: number;
  headerHeight: number;
  footerHeight: number;
}

interface ThemeSettings {
  name: string;
  dark: boolean;
  colors: ThemeColors;
  font: ThemeFont;
  spacing: ThemeSpacing;
  borderRadius: number;
  customCSS: string;
}

interface ThemePreset {
  id: string;
  name: string;
  thumbnail: string;
  theme: ThemeSettings;
}

// Theme presets
const themePresets: ThemePreset[] = [
  {
    id: 'default',
    name: 'Sales Aholics Default',
    thumbnail: '/themes/default-thumbnail.jpg',
    theme: {
      name: 'Default',
      dark: false,
      colors: {
        primary: '#982a4a',
        secondary: '#6b7280',
        accent: '#0ea5e9',
        background: '#f9fafb',
        foreground: '#1f2937',
        card: '#ffffff',
        cardForeground: '#1f2937',
        border: '#e5e7eb',
        muted: '#f3f4f6',
        mutedForeground: '#6b7280',
      },
      font: {
        family: 'Inter, sans-serif',
        headingFamily: 'Inter, sans-serif',
        baseSize: 16,
        lineHeight: 1.5,
        weight: 400,
        headingWeight: 600,
      },
      spacing: {
        unit: 4,
        containerWidth: 1200,
        sidebarWidth: 280,
        headerHeight: 64,
        footerHeight: 80,
      },
      borderRadius: 8,
      customCSS: '',
    },
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    thumbnail: '/themes/dark-thumbnail.jpg',
    theme: {
      name: 'Dark Mode',
      dark: true,
      colors: {
        primary: '#e11d48',
        secondary: '#9ca3af',
        accent: '#0ea5e9',
        background: '#1f2937',
        foreground: '#f9fafb',
        card: '#111827',
        cardForeground: '#f9fafb',
        border: '#374151',
        muted: '#374151',
        mutedForeground: '#9ca3af',
      },
      font: {
        family: 'Inter, sans-serif',
        headingFamily: 'Inter, sans-serif',
        baseSize: 16,
        lineHeight: 1.5,
        weight: 400,
        headingWeight: 600,
      },
      spacing: {
        unit: 4,
        containerWidth: 1200,
        sidebarWidth: 280,
        headerHeight: 64,
        footerHeight: 80,
      },
      borderRadius: 8,
      customCSS: '',
    },
  },
  {
    id: 'modern',
    name: 'Modern Clean',
    thumbnail: '/themes/modern-thumbnail.jpg',
    theme: {
      name: 'Modern Clean',
      dark: false,
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#10b981',
        background: '#f8fafc',
        foreground: '#0f172a',
        card: '#ffffff',
        cardForeground: '#0f172a',
        border: '#e2e8f0',
        muted: '#f1f5f9',
        mutedForeground: '#64748b',
      },
      font: {
        family: 'Plus Jakarta Sans, sans-serif',
        headingFamily: 'Plus Jakarta Sans, sans-serif',
        baseSize: 16,
        lineHeight: 1.6,
        weight: 400,
        headingWeight: 700,
      },
      spacing: {
        unit: 4,
        containerWidth: 1280,
        sidebarWidth: 300,
        headerHeight: 72,
        footerHeight: 90,
      },
      borderRadius: 12,
      customCSS: '',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    thumbnail: '/themes/minimal-thumbnail.jpg',
    theme: {
      name: 'Minimal',
      dark: false,
      colors: {
        primary: '#18181b',
        secondary: '#71717a',
        accent: '#8b5cf6',
        background: '#fafafa',
        foreground: '#18181b',
        card: '#ffffff',
        cardForeground: '#18181b',
        border: '#e4e4e7',
        muted: '#f4f4f5',
        mutedForeground: '#71717a',
      },
      font: {
        family: 'DM Sans, sans-serif',
        headingFamily: 'DM Sans, sans-serif',
        baseSize: 15,
        lineHeight: 1.6,
        weight: 400,
        headingWeight: 500,
      },
      spacing: {
        unit: 4,
        containerWidth: 1140,
        sidebarWidth: 240,
        headerHeight: 60,
        footerHeight: 72,
      },
      borderRadius: 4,
      customCSS: '',
    },
  },
];

// Font families options
const fontFamilies = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Plus Jakarta Sans, sans-serif', label: 'Plus Jakarta Sans' },
  { value: 'DM Sans, sans-serif', label: 'DM Sans' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
  { value: 'Lato, sans-serif', label: 'Lato' },
  { value: 'Raleway, sans-serif', label: 'Raleway' },
  { value: 'Playfair Display, serif', label: 'Playfair Display (Serif)' },
  { value: 'Merriweather, serif', label: 'Merriweather (Serif)' },
  { value: 'Georgia, serif', label: 'Georgia (Serif)' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
];

const fontWeights = [
  { value: 300, label: 'Light (300)' },
  { value: 400, label: 'Regular (400)' },
  { value: 500, label: 'Medium (500)' },
  { value: 600, label: 'Semi-Bold (600)' },
  { value: 700, label: 'Bold (700)' },
  { value: 800, label: 'Extra Bold (800)' },
];

const ThemeEditor: React.FC = () => {
  const { showToast } = useToast();
  const { addLogEntry } = useActivityLog();
  const [activeTab, setActiveTab] = useState('colors');
  const [currentTheme, setCurrentTheme] = useState<ThemeSettings>(themePresets[0].theme);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [savedThemes, setSavedThemes] = useState<ThemeSettings[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const savedThemesData = localStorage.getItem('saved_themes');
      if (savedThemesData) {
        setSavedThemes(JSON.parse(savedThemesData));
      }

      const activeThemeData = localStorage.getItem('active_theme');
      if (activeThemeData) {
        setCurrentTheme(JSON.parse(activeThemeData));
      }
    } catch (error) {
      console.error('Failed to load themes from localStorage:', error);
    }
  }, []);

  // Update localStorage when themes change
  useEffect(() => {
    try {
      localStorage.setItem('saved_themes', JSON.stringify(savedThemes));
    } catch (error) {
      console.error('Failed to save themes to localStorage:', error);
    }
  }, [savedThemes]);

  // Update theme CSS variables
  useEffect(() => {
    const root = document.documentElement;

    // Set colors
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Set typography
    root.style.setProperty('--font-family', currentTheme.font.family);
    root.style.setProperty('--heading-font-family', currentTheme.font.headingFamily);
    root.style.setProperty('--font-size-base', `${currentTheme.font.baseSize}px`);
    root.style.setProperty('--line-height', currentTheme.font.lineHeight.toString());
    root.style.setProperty('--font-weight', currentTheme.font.weight.toString());
    root.style.setProperty('--heading-font-weight', currentTheme.font.headingWeight.toString());

    // Set spacing
    root.style.setProperty('--spacing-unit', `${currentTheme.spacing.unit}px`);
    root.style.setProperty('--container-width', `${currentTheme.spacing.containerWidth}px`);
    root.style.setProperty('--sidebar-width', `${currentTheme.spacing.sidebarWidth}px`);
    root.style.setProperty('--header-height', `${currentTheme.spacing.headerHeight}px`);
    root.style.setProperty('--footer-height', `${currentTheme.spacing.footerHeight}px`);

    // Set border radius
    root.style.setProperty('--border-radius', `${currentTheme.borderRadius}px`);

    // Set theme mode
    document.body.classList.toggle('dark-theme', currentTheme.dark);

    // Apply custom CSS if any
    let styleElement = document.getElementById('custom-theme-css');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'custom-theme-css';
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = currentTheme.customCSS;

    // Save active theme to localStorage
    localStorage.setItem('active_theme', JSON.stringify(currentTheme));
  }, [currentTheme]);

  const handleColorChange = (colorKey: keyof ThemeColors, value: string) => {
    setCurrentTheme((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value,
      },
    }));
    setIsDirty(true);
  };

  const handleFontChange = (key: keyof ThemeFont, value: string | number) => {
    setCurrentTheme((prev) => ({
      ...prev,
      font: {
        ...prev.font,
        [key]: value,
      },
    }));
    setIsDirty(true);
  };

  const handleSpacingChange = (key: keyof ThemeSpacing, value: number) => {
    setCurrentTheme((prev) => ({
      ...prev,
      spacing: {
        ...prev.spacing,
        [key]: value,
      },
    }));
    setIsDirty(true);
  };

  const handleToggleDarkMode = () => {
    setCurrentTheme((prev) => ({
      ...prev,
      dark: !prev.dark,
    }));
    setIsDirty(true);
  };

  const handleBorderRadiusChange = (value: number) => {
    setCurrentTheme((prev) => ({
      ...prev,
      borderRadius: value,
    }));
    setIsDirty(true);
  };

  const handleCustomCSSChange = (value: string) => {
    setCurrentTheme((prev) => ({
      ...prev,
      customCSS: value,
    }));
    setIsDirty(true);
  };

  const handleThemeNameChange = (value: string) => {
    setCurrentTheme((prev) => ({
      ...prev,
      name: value,
    }));
    setIsDirty(true);
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = themePresets.find((p) => p.id === presetId);
    if (preset) {
      if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to apply a new theme preset?')) {
        return;
      }

      setCurrentTheme(preset.theme);
      setIsDirty(true);
      showToast(`Applied theme preset: ${preset.name}`, 'info');
      addLogEntry({
        action: 'Update',
        targetType: 'Theme',
        targetName: preset.name,
        details: `Applied theme preset`,
      });
    }
  };

  const handleSaveTheme = () => {
    // Ask for theme name if it's "Default" or already exists
    let themeName = currentTheme.name;
    if (themeName === 'Default' || savedThemes.some((t) => t.name === themeName)) {
      const newName = window.prompt('Enter a name for this theme:', `${themeName} - Copy`);
      if (!newName) return; // User canceled
      themeName = newName;
    }

    const themeToSave = {
      ...currentTheme,
      name: themeName,
    };

    setSavedThemes((prev) => [...prev, themeToSave]);
    setCurrentTheme(themeToSave);
    setIsDirty(false);

    showToast(`Theme "${themeName}" saved successfully`, 'success');
    addLogEntry({
      action: 'Create',
      targetType: 'Theme',
      targetName: themeName,
      details: `Saved new theme`,
    });
  };

  const handleDeleteTheme = (themeName: string) => {
    if (window.confirm(`Are you sure you want to delete the theme "${themeName}"?`)) {
      setSavedThemes((prev) => prev.filter((t) => t.name !== themeName));
      showToast(`Theme "${themeName}" deleted`, 'info');
      addLogEntry({
        action: 'Delete',
        targetType: 'Theme',
        targetName: themeName,
        details: `Deleted theme`,
      });
    }
  };

  const handleApplySavedTheme = (theme: ThemeSettings) => {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to apply a saved theme?')) {
      return;
    }

    setCurrentTheme(theme);
    setIsDirty(false);
    showToast(`Applied theme: ${theme.name}`, 'info');
    addLogEntry({
      action: 'Update',
      targetType: 'Theme',
      targetName: theme.name,
      details: `Applied saved theme`,
    });
  };

  const handleExportTheme = () => {
    const themeData = JSON.stringify(currentTheme, null, 2);
    const blob = new Blob([themeData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTheme.name.toLowerCase().replace(/\s+/g, '_')}_theme.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Theme exported successfully', 'success');
    addLogEntry({
      action: 'Export',
      targetType: 'Theme',
      targetName: currentTheme.name,
      details: `Exported theme configuration`,
    });
  };

  const handleImportTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTheme = JSON.parse(e.target?.result as string) as ThemeSettings;
        setCurrentTheme(importedTheme);
        setIsDirty(true);
        showToast(`Theme "${importedTheme.name}" imported successfully`, 'success');
        addLogEntry({
          action: 'Import',
          targetType: 'Theme',
          targetName: importedTheme.name,
          details: `Imported theme configuration`,
        });
      } catch (error) {
        showToast('Failed to import theme. Invalid file format.', 'error');
      }
    };
    reader.readAsText(file);

    // Reset the input
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Theme Editor</h1>
          <p className="text-gray-500">Customize your site's appearance and design</p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportTheme}>
            Export Theme
          </Button>

          <label className="relative">
            <Button variant="outline">Import Theme</Button>
            <input
              type="file"
              accept=".json"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleImportTheme}
            />
          </label>

          <Button
            variant="primary"
            disabled={!isDirty}
            onClick={handleSaveTheme}
          >
            Save Theme
          </Button>
        </div>
      </div>

      {/* Theme Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`p-6 rounded-lg ${currentTheme.dark ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="flex flex-col space-y-6">
              {/* Theme name input */}
              <div>
                <label className={`block text-sm font-medium ${currentTheme.dark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Theme Name
                </label>
                <input
                  type="text"
                  className={`border-gray-300 rounded-md shadow-sm focus:border-${currentTheme.colors.primary} focus:ring-${currentTheme.colors.primary} w-full`}
                  value={currentTheme.name}
                  onChange={(e) => handleThemeNameChange(e.target.value)}
                />
              </div>

              {/* Sample UI Elements */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  style={{
                    backgroundColor: currentTheme.colors.card,
                    color: currentTheme.colors.cardForeground,
                    borderRadius: `${currentTheme.borderRadius}px`,
                    fontFamily: currentTheme.font.family,
                    fontSize: `${currentTheme.font.baseSize}px`,
                    lineHeight: currentTheme.font.lineHeight,
                    fontWeight: currentTheme.font.weight,
                    border: `1px solid ${currentTheme.colors.border}`,
                  }}
                  className="p-4 shadow-sm"
                >
                  <h3
                    style={{
                      fontFamily: currentTheme.font.headingFamily,
                      fontWeight: currentTheme.font.headingWeight,
                      marginBottom: `${currentTheme.spacing.unit * 2}px`,
                    }}
                  >
                    Card Title
                  </h3>
                  <p className="mb-4">This is a sample card showing your theme styling.</p>
                  <button
                    style={{
                      backgroundColor: currentTheme.colors.primary,
                      color: '#ffffff',
                      borderRadius: `${currentTheme.borderRadius / 2}px`,
                      padding: `${currentTheme.spacing.unit * 1.5}px ${currentTheme.spacing.unit * 3}px`,
                      fontWeight: 500,
                    }}
                  >
                    Primary Button
                  </button>
                </div>

                <div
                  style={{
                    backgroundColor: currentTheme.colors.muted,
                    color: currentTheme.colors.mutedForeground,
                    borderRadius: `${currentTheme.borderRadius}px`,
                    fontFamily: currentTheme.font.family,
                    fontSize: `${currentTheme.font.baseSize}px`,
                    lineHeight: currentTheme.font.lineHeight,
                    padding: `${currentTheme.spacing.unit * 4}px`,
                  }}
                >
                  <h3
                    style={{
                      fontFamily: currentTheme.font.headingFamily,
                      fontWeight: currentTheme.font.headingWeight,
                      color: currentTheme.colors.foreground,
                      marginBottom: `${currentTheme.spacing.unit * 2}px`,
                    }}
                  >
                    Muted Section
                  </h3>
                  <p>Secondary and muted content styling example.</p>

                  <div
                    style={{
                      display: 'flex',
                      marginTop: `${currentTheme.spacing.unit * 3}px`,
                      gap: `${currentTheme.spacing.unit * 2}px`,
                    }}
                  >
                    <button
                      style={{
                        backgroundColor: currentTheme.colors.secondary,
                        color: '#ffffff',
                        borderRadius: `${currentTheme.borderRadius / 2}px`,
                        padding: `${currentTheme.spacing.unit}px ${currentTheme.spacing.unit * 2}px`,
                        fontSize: `${currentTheme.font.baseSize - 2}px`,
                      }}
                    >
                      Secondary
                    </button>

                    <button
                      style={{
                        backgroundColor: 'transparent',
                        border: `1px solid ${currentTheme.colors.border}`,
                        color: currentTheme.colors.foreground,
                        borderRadius: `${currentTheme.borderRadius / 2}px`,
                        padding: `${currentTheme.spacing.unit}px ${currentTheme.spacing.unit * 2}px`,
                        fontSize: `${currentTheme.font.baseSize - 2}px`,
                      }}
                    >
                      Outline
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: currentTheme.colors.accent,
                    color: '#ffffff',
                    borderRadius: `${currentTheme.borderRadius}px`,
                    fontFamily: currentTheme.font.family,
                    fontSize: `${currentTheme.font.baseSize}px`,
                    lineHeight: currentTheme.font.lineHeight,
                    padding: `${currentTheme.spacing.unit * 4}px`,
                  }}
                >
                  <h3
                    style={{
                      fontFamily: currentTheme.font.headingFamily,
                      fontWeight: currentTheme.font.headingWeight,
                      marginBottom: `${currentTheme.spacing.unit * 2}px`,
                    }}
                  >
                    Accent Component
                  </h3>
                  <p>This shows your accent color with light text.</p>

                  <div
                    style={{
                      height: '4px',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      marginTop: `${currentTheme.spacing.unit * 2}px`,
                      marginBottom: `${currentTheme.spacing.unit * 2}px`,
                      borderRadius: '2px',
                    }}
                  >
                    <div
                      style={{
                        width: '65%',
                        height: '100%',
                        backgroundColor: '#ffffff',
                        borderRadius: '2px',
                      }}
                    ></div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: `${currentTheme.spacing.unit}px`,
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: `${currentTheme.spacing.unit * 4}px`,
                        height: `${currentTheme.spacing.unit * 4}px`,
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                      }}
                    ></div>
                    <span>Progress: 65%</span>
                  </div>
                </div>
              </div>

              {/* Text Sample */}
              <div
                style={{
                  fontFamily: currentTheme.font.family,
                  fontSize: `${currentTheme.font.baseSize}px`,
                  lineHeight: currentTheme.font.lineHeight,
                  fontWeight: currentTheme.font.weight,
                  color: currentTheme.colors.foreground,
                  maxWidth: '800px',
                }}
              >
                <h1
                  style={{
                    fontFamily: currentTheme.font.headingFamily,
                    fontWeight: currentTheme.font.headingWeight,
                    fontSize: `${currentTheme.font.baseSize * 2}px`,
                    marginBottom: `${currentTheme.spacing.unit * 2}px`,
                  }}
                >
                  Typography Example
                </h1>
                <h2
                  style={{
                    fontFamily: currentTheme.font.headingFamily,
                    fontWeight: currentTheme.font.headingWeight,
                    fontSize: `${currentTheme.font.baseSize * 1.5}px`,
                    marginBottom: `${currentTheme.spacing.unit * 1.5}px`,
                  }}
                >
                  Heading Two Sample
                </h2>
                <p style={{ marginBottom: `${currentTheme.spacing.unit * 2}px` }}>
                  This paragraph demonstrates the body text styling with the selected font family,
                  size, weight, and line height. It shows how readable your content will be with
                  the current settings.
                </p>
                <p style={{ marginBottom: `${currentTheme.spacing.unit * 2}px` }}>
                  <a
                    href="#"
                    style={{
                      color: currentTheme.colors.primary,
                      textDecoration: 'underline',
                    }}
                  >
                    This is a link
                  </a>{' '}
                  within a paragraph showing how linked text will appear on your website.
                </p>
                <div
                  style={{
                    borderLeft: `4px solid ${currentTheme.colors.primary}`,
                    paddingLeft: `${currentTheme.spacing.unit * 4}px`,
                    marginLeft: `${currentTheme.spacing.unit * 2}px`,
                    fontStyle: 'italic',
                    color: currentTheme.colors.mutedForeground,
                  }}
                >
                  This is a blockquote that demonstrates how quoted content will appear.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {themePresets.map((preset) => (
              <div
                key={preset.id}
                className="border rounded-lg overflow-hidden cursor-pointer hover:border-[#982a4a] transition-colors"
                onClick={() => handleApplyPreset(preset.id)}
              >
                <div
                  className="h-32 bg-gray-200 flex items-center justify-center"
                  style={{
                    backgroundColor: preset.theme.colors.background,
                    color: preset.theme.colors.foreground,
                  }}
                >
                  <div
                    className="w-5/6 h-16 rounded flex items-center justify-center"
                    style={{
                      backgroundColor: preset.theme.colors.primary,
                      color: '#ffffff',
                      fontFamily: preset.theme.font.family,
                    }}
                  >
                    {preset.name}
                  </div>
                </div>
                <div className="p-2 text-center border-t">
                  <h4 className="font-medium">{preset.name}</h4>
                </div>
              </div>
            ))}

            {/* Saved Themes */}
            {savedThemes.map((theme) => (
              <div
                key={theme.name}
                className="border rounded-lg overflow-hidden relative group"
              >
                <div
                  className="h-32 bg-gray-200 flex items-center justify-center cursor-pointer"
                  style={{
                    backgroundColor: theme.colors.background,
                    color: theme.colors.foreground,
                  }}
                  onClick={() => handleApplySavedTheme(theme)}
                >
                  <div
                    className="w-5/6 h-16 rounded flex items-center justify-center"
                    style={{
                      backgroundColor: theme.colors.primary,
                      color: '#ffffff',
                      fontFamily: theme.font.family,
                    }}
                  >
                    {theme.name}
                  </div>
                </div>
                <div className="p-2 text-center border-t flex justify-between items-center">
                  <h4 className="font-medium truncate">{theme.name}</h4>
                  <button
                    className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTheme(theme.name);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Theme Editor Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Customization</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="typography">Typography</TabsTrigger>
              <TabsTrigger value="spacing">Spacing & Layout</TabsTrigger>
              <TabsTrigger value="custom">Custom CSS</TabsTrigger>
            </TabsList>

            {/* Colors Tab */}
            <TabsContent value="colors">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Color Scheme</h3>
                  <div className="flex items-center">
                    <span className="mr-2 text-sm text-gray-500">{currentTheme.dark ? 'Dark Mode' : 'Light Mode'}</span>
                    <button
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#982a4a] focus:ring-offset-2 ${
                        currentTheme.dark ? 'bg-[#982a4a]' : 'bg-gray-200'
                      }`}
                      onClick={handleToggleDarkMode}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          currentTheme.dark ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Main Colors */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Main Colors</h4>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Primary Color
                      </label>
                      <div className="flex items-center">
                        <input
                          type="color"
                          value={currentTheme.colors.primary}
                          onChange={(e) => handleColorChange('primary', e.target.value)}
                          className="w-10 h-10 rounded border border-gray-300 p-1 mr-2"
                        />
                        <input
                          type="text"
                          value={currentTheme.colors.primary}
                          onChange={(e) => handleColorChange('primary', e.target.value)}
                          className="border-gray-300 rounded-md shadow-sm focus:border-[#982a4a] focus:ring-[#982a4a] flex-1"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Main brand color, used for buttons, links, and accents</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Secondary Color
                      </label>
                      <div className="flex items-center">
                        <input
                          type="color"
                          value={currentTheme.colors.secondary}
                          onChange={(e) => handleColorChange('secondary', e.target.value)}
                          className="w-10 h-10 rounded border border-gray-300 p-1 mr-2"
                        />
                        <input
                          type="text"
                          value={currentTheme.colors.secondary}
                          onChange={(e) => handleColorChange('secondary', e.target.value)}
                          className="border-gray-300 rounded-md shadow-sm focus:border-[#982a4a] focus:ring-[#982a4a] flex-1"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Used for secondary buttons and less prominent elements</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Accent Color
                      </label>
                      <div className="flex items-center">
                        <input
                          type="color"
                          value={currentTheme.colors.accent}
                          onChange={(e) => handleColorChange('accent', e.target.value)}
                          className="w-10 h-10 rounded border border-gray-300 p-1 mr-2"
                        />
                        <input
                          type="text"
                          value={currentTheme.colors.accent}
                          onChange={(e) => handleColorChange('accent', e.target.value)}
                          className="border-gray-300 rounded-md shadow-sm focus:border-[#982a4a] focus:ring-[#982a4a] flex-1"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Used for highlights and to create visual interest</p>
                    </div>
                  </div>

                  {/* Background & Text Colors */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Background & Text</h4>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Background Color
                      </label>
                      <div className="flex items-center">
                        <input
                          type="color"
                          value={currentTheme.colors.background}
                          onChange={(e) => handleColorChange('background', e.target.value)}
                          className="w-10 h-10 rounded border border-gray-300 p-1 mr-2"
                        />
                        <input
                          type="text"
                          value={currentTheme.colors.background}
                          onChange={(e) => handleColorChange('background', e.target.value)}
                          className="border-gray-300 rounded-md shadow-sm focus:border-[#982a4a] focus:ring-[#982a4a] flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Text Color
                      </label>
                      <div className="flex items-center">
                        <input
                          type="color"
                          value={currentTheme.colors.foreground}
                          onChange={(e) => handleColorChange('foreground', e.target.value)}
                          className="w-10 h-10 rounded border border-gray-300 p-1 mr-2"
                        />
                        <input
                          type="text"
                          value={currentTheme.colors.foreground}
                          onChange={(e) => handleColorChange('foreground', e.target.value)}
                          className="border-gray-300 rounded-md shadow-sm focus:border-[#982a4a] focus:ring-[#982a4a] flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Muted Background
                      </label>
                      <div className="flex items-center">
                        <input
                          type="color"
                          value={currentTheme.colors.muted}
                          onChange={(e) => handleColorChange('muted', e.target.value)}
                          className="w-10 h-10 rounded border border-gray-300 p-1 mr-2"
                        />
                        <input
                          type="text"
                          value={currentTheme.colors.muted}
                          onChange={(e) => handleColorChange('muted', e.target.value)}
                          className="border-gray-300 rounded-md shadow-sm focus:border-[#982a4a] focus:ring-[#982a4a] flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Muted Text
                      </label>
                      <div className="flex items-center">
                        <input
                          type="color"
                          value={currentTheme.colors.mutedForeground}
                          onChange={(e) => handleColorChange('mutedForeground', e.target.value)}
                          className="w-10 h-10 rounded border border-gray-300 p-1 mr-2"
                        />
                        <input
                          type="text"
                          value={currentTheme.colors.mutedForeground}
                          onChange={(e) => handleColorChange('mutedForeground', e.target.value)}
                          className="border-gray-300 rounded-md shadow-sm focus:border-[#982a4a] focus:ring-[#982a4a] flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Component Colors */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Component Colors</h4>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Background
                      </label>
                      <div className="flex items-center">
                        <input
                          type="color"
                          value={currentTheme.colors.card}
                          onChange={(e) => handleColorChange('card', e.target.value)}
                          className="w-10 h-10 rounded border border-gray-300 p-1 mr-2"
                        />
                        <input
                          type="text"
                          value={currentTheme.colors.card}
                          onChange={(e) => handleColorChange('card', e.target.value)}
                          className="border-gray-300 rounded-md shadow-sm focus:border-[#982a4a] focus:ring-[#982a4a] flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Text
                      </label>
                      <div className="flex items-center">
                        <input
                          type="color"
                          value={currentTheme.colors.cardForeground}
                          onChange={(e) => handleColorChange('cardForeground', e.target.value)}
                          className="w-10 h-10 rounded border border-gray-300 p-1 mr-2"
                        />
                        <input
                          type="text"
                          value={currentTheme.colors.cardForeground}
                          onChange={(e) => handleColorChange('cardForeground', e.target.value)}
                          className="border-gray-300 rounded-md shadow-sm focus:border-[#982a4a] focus:ring-[#982a4a] flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Border Colors */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Border & Decoration</h4>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Border Color
                      </label>
                      <div className="flex items-center">
                        <input
                          type="color"
                          value={currentTheme.colors.border}
                          onChange={(e) => handleColorChange('border', e.target.value)}
                          className="w-10 h-10 rounded border border-gray-300 p-1 mr-2"
                        />
                        <input
                          type="text"
                          value={currentTheme.colors.border}
                          onChange={(e) => handleColorChange('border', e.target.value)}
                          className="border-gray-300 rounded-md shadow-sm focus:border-[#982a4a] focus:ring-[#982a4a] flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Border Radius
                      </label>
                      <div className="flex items-center">
                        <input
                          type="range"
                          min="0"
                          max="24"
                          step="1"
                          value={currentTheme.borderRadius}
                          onChange={(e) => handleBorderRadiusChange(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="ml-2 min-w-[2rem] text-center">
                          {currentTheme.borderRadius}px
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Typography Tab */}
            <TabsContent value="typography">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Font Families */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Font Selection</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Body Font Family
                      </label>
                      <select
                        value={currentTheme.font.family}
                        onChange={(e) => handleFontChange('family', e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-[#982a4a] focus:ring-[#982a4a]"
                      >
                        {fontFamilies.map((font) => (
                          <option key={font.value} value={font.value}>
                            {font.label}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">Used for paragraphs and general text</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Heading Font Family
                      </label>
                      <select
                        value={currentTheme.font.headingFamily}
                        onChange={(e) => handleFontChange('headingFamily', e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-[#982a4a] focus:ring-[#982a4a]"
                      >
                        {fontFamilies.map((font) => (
                          <option key={font.value} value={font.value}>
                            {font.label}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">Used for headings and titles</p>
                    </div>
                  </div>

                  {/* Font Sizes */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Font Size & Spacing</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Base Font Size: {currentTheme.font.baseSize}px
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="20"
                        step="1"
                        value={currentTheme.font.baseSize}
                        onChange={(e) => handleFontChange('baseSize', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="mt-1 text-xs text-gray-500">Base size for body text</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Line Height: {currentTheme.font.lineHeight}
                      </label>
                      <input
                        type="range"
                        min="1.2"
                        max="2"
                        step="0.1"
                        value={currentTheme.font.lineHeight}
                        onChange={(e) => handleFontChange('lineHeight', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="mt-1 text-xs text-gray-500">Line height affects readability and text spacing</p>
                    </div>
                  </div>

                  {/* Font Weight */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Font Weight</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Body Font Weight
                      </label>
                      <select
                        value={currentTheme.font.weight}
                        onChange={(e) => handleFontChange('weight', parseInt(e.target.value))}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-[#982a4a] focus:ring-[#982a4a]"
                      >
                        {fontWeights.map((weight) => (
                          <option key={weight.value} value={weight.value}>
                            {weight.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Heading Font Weight
                      </label>
                      <select
                        value={currentTheme.font.headingWeight}
                        onChange={(e) => handleFontChange('headingWeight', parseInt(e.target.value))}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-[#982a4a] focus:ring-[#982a4a]"
                      >
                        {fontWeights.map((weight) => (
                          <option key={weight.value} value={weight.value}>
                            {weight.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Spacing Tab */}
            <TabsContent value="spacing">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Spacing Units */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Spacing & Layout</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Base Spacing Unit: {currentTheme.spacing.unit}px
                      </label>
                      <input
                        type="range"
                        min="2"
                        max="8"
                        step="1"
                        value={currentTheme.spacing.unit}
                        onChange={(e) => handleSpacingChange('unit', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="mt-1 text-xs text-gray-500">Base unit for calculating margins and paddings</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Container Width: {currentTheme.spacing.containerWidth}px
                      </label>
                      <input
                        type="range"
                        min="800"
                        max="1600"
                        step="40"
                        value={currentTheme.spacing.containerWidth}
                        onChange={(e) => handleSpacingChange('containerWidth', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="mt-1 text-xs text-gray-500">Maximum width of the main content container</p>
                    </div>
                  </div>

                  {/* Component Sizing */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Component Sizing</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sidebar Width: {currentTheme.spacing.sidebarWidth}px
                      </label>
                      <input
                        type="range"
                        min="200"
                        max="400"
                        step="20"
                        value={currentTheme.spacing.sidebarWidth}
                        onChange={(e) => handleSpacingChange('sidebarWidth', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Header Height: {currentTheme.spacing.headerHeight}px
                      </label>
                      <input
                        type="range"
                        min="48"
                        max="100"
                        step="4"
                        value={currentTheme.spacing.headerHeight}
                        onChange={(e) => handleSpacingChange('headerHeight', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Footer Height: {currentTheme.spacing.footerHeight}px
                      </label>
                      <input
                        type="range"
                        min="60"
                        max="200"
                        step="10"
                        value={currentTheme.spacing.footerHeight}
                        onChange={(e) => handleSpacingChange('footerHeight', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Custom CSS Tab */}
            <TabsContent value="custom">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Custom CSS</h3>
                <p className="text-sm text-gray-500">
                  Add custom CSS to further customize your theme. This code will be applied to all pages.
                </p>

                <div className="relative">
                  <textarea
                    value={currentTheme.customCSS}
                    onChange={(e) => handleCustomCSSChange(e.target.value)}
                    rows={15}
                    className="w-full font-mono text-sm p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a] bg-gray-50"
                    placeholder={`/* Custom CSS Example */\n\n.site-header {\n  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);\n}\n\n.hero-section h1 {\n  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n}`}
                  ></textarea>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Use custom CSS with caution. Improperly formatted CSS can break your site's layout.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThemeEditor;
