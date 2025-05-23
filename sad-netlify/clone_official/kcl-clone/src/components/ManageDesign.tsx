import type React from 'react';
import { useState } from 'react';

// Default design settings
const defaultDesignSettings = {
  colors: {
    primary: '#0366d6',
    secondary: '#f5f5f5',
    accent: '#ff4081',
    text: '#333333',
    background: '#ffffff',
  },
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    baseFontSize: '16px',
    headingWeight: '700',
    bodyWeight: '400',
  },
  layout: {
    containerWidth: '1200px',
    headerStyle: 'standard',
    footerStyle: 'standard',
    sidebarPosition: 'left',
  },
  components: {
    buttonStyle: 'rounded',
    cardStyle: 'shadow',
    imageStyle: 'rounded',
    enableAnimations: true,
  },
};

const ManageDesign: React.FC = () => {
  const [designSettings, setDesignSettings] = useState(defaultDesignSettings);
  const [activeSection, setActiveSection] = useState('colors');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [saved, setSaved] = useState(false);

  // Handle color change
  const handleColorChange = (colorKey: string, value: string) => {
    setDesignSettings({
      ...designSettings,
      colors: {
        ...designSettings.colors,
        [colorKey]: value,
      },
    });
    setSaved(false);
  };

  // Handle typography change
  const handleTypographyChange = (typographyKey: string, value: string) => {
    setDesignSettings({
      ...designSettings,
      typography: {
        ...designSettings.typography,
        [typographyKey]: value,
      },
    });
    setSaved(false);
  };

  // Handle layout change
  const handleLayoutChange = (layoutKey: string, value: string) => {
    setDesignSettings({
      ...designSettings,
      layout: {
        ...designSettings.layout,
        [layoutKey]: value,
      },
    });
    setSaved(false);
  };

  // Handle component setting change
  const handleComponentChange = (componentKey: string, value: any) => {
    setDesignSettings({
      ...designSettings,
      components: {
        ...designSettings.components,
        [componentKey]: value,
      },
    });
    setSaved(false);
  };

  // Handle save settings
  const handleSaveSettings = () => {
    // Here you would save settings to backend or localStorage
    console.log('Saving design settings:', designSettings);

    // For demo purposes, just show a success message
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Handle reset to defaults
  const handleResetDefaults = () => {
    if (window.confirm('Are you sure you want to reset all design settings to defaults?')) {
      setDesignSettings(defaultDesignSettings);
      setSaved(false);
    }
  };

  return (
    <div className="design-settings">
      {/* Success Message */}
      {saved && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          Design settings saved successfully!
        </div>
      )}

      {/* Settings Sections */}
      <div className="mb-6 flex border border-gray-200 rounded-lg overflow-hidden">
        <button
          className={`flex-1 py-3 px-4 ${
            activeSection === 'colors' ? 'bg-blue-50 text-blue-700' : 'bg-white'
          }`}
          onClick={() => setActiveSection('colors')}
        >
          Colors
        </button>
        <button
          className={`flex-1 py-3 px-4 ${
            activeSection === 'typography' ? 'bg-blue-50 text-blue-700' : 'bg-white'
          }`}
          onClick={() => setActiveSection('typography')}
        >
          Typography
        </button>
        <button
          className={`flex-1 py-3 px-4 ${
            activeSection === 'layout' ? 'bg-blue-50 text-blue-700' : 'bg-white'
          }`}
          onClick={() => setActiveSection('layout')}
        >
          Layout
        </button>
        <button
          className={`flex-1 py-3 px-4 ${
            activeSection === 'components' ? 'bg-blue-50 text-blue-700' : 'bg-white'
          }`}
          onClick={() => setActiveSection('components')}
        >
          Components
        </button>
      </div>

      {/* Preview Controls */}
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Preview your design changes in real-time
        </div>
        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          <button
            className={`py-2 px-3 ${
              previewMode === 'desktop' ? 'bg-gray-100' : 'bg-white'
            }`}
            onClick={() => setPreviewMode('desktop')}
            title="Desktop Preview"
          >
            🖥️
          </button>
          <button
            className={`py-2 px-3 ${
              previewMode === 'tablet' ? 'bg-gray-100' : 'bg-white'
            }`}
            onClick={() => setPreviewMode('tablet')}
            title="Tablet Preview"
          >
            📱
          </button>
          <button
            className={`py-2 px-3 ${
              previewMode === 'mobile' ? 'bg-gray-100' : 'bg-white'
            }`}
            onClick={() => setPreviewMode('mobile')}
            title="Mobile Preview"
          >
            📱
          </button>
        </div>
      </div>

      {/* Color Settings */}
      {activeSection === 'colors' && (
        <div className="settings-section">
          <h3 className="text-lg font-semibold mb-4">Color Scheme</h3>
          <p className="text-sm text-gray-600 mb-6">
            Customize your site's color palette to match your brand's identity.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(designSettings.colors).map(([key, value]) => (
              <div key={key} className="color-picker">
                <label className="block mb-2 capitalize">
                  {key} Color
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="w-10 h-10 rounded border border-gray-300 mr-3"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-3">Color Preview</h4>
            <div className="flex space-x-2">
              {Object.entries(designSettings.colors).map(([key, value]) => (
                <div
                  key={key}
                  className="w-12 h-12 rounded-lg shadow-sm flex items-center justify-center text-white text-xs"
                  style={{ backgroundColor: value }}
                  title={`${key}: ${value}`}
                >
                  {key.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Typography Settings */}
      {activeSection === 'typography' && (
        <div className="settings-section">
          <h3 className="text-lg font-semibold mb-4">Typography Settings</h3>
          <p className="text-sm text-gray-600 mb-6">
            Customize the fonts, sizes, and weights used throughout your site.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2">Heading Font</label>
              <select
                value={designSettings.typography.headingFont}
                onChange={(e) => handleTypographyChange('headingFont', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Poppins">Poppins</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">Body Font</label>
              <select
                value={designSettings.typography.bodyFont}
                onChange={(e) => handleTypographyChange('bodyFont', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
                <option value="Source Sans Pro">Source Sans Pro</option>
                <option value="Nunito">Nunito</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">Base Font Size</label>
              <select
                value={designSettings.typography.baseFontSize}
                onChange={(e) => handleTypographyChange('baseFontSize', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="14px">Small (14px)</option>
                <option value="16px">Medium (16px)</option>
                <option value="18px">Large (18px)</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">Heading Weight</label>
              <select
                value={designSettings.typography.headingWeight}
                onChange={(e) => handleTypographyChange('headingWeight', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="400">Regular (400)</option>
                <option value="500">Medium (500)</option>
                <option value="600">Semibold (600)</option>
                <option value="700">Bold (700)</option>
                <option value="800">Extrabold (800)</option>
              </select>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-3">Typography Preview</h4>
            <div
              style={{
                fontFamily: designSettings.typography.bodyFont,
                fontSize: designSettings.typography.baseFontSize
              }}
            >
              <h1
                style={{
                  fontFamily: designSettings.typography.headingFont,
                  fontWeight: designSettings.typography.headingWeight
                }}
                className="text-2xl mb-2"
              >
                This is a Heading
              </h1>
              <p className="mb-2">This is body text that shows your selected font settings.</p>
              <a href="#" style={{ color: designSettings.colors.primary }}>This is a link</a>
            </div>
          </div>
        </div>
      )}

      {/* Layout Settings */}
      {activeSection === 'layout' && (
        <div className="settings-section">
          <h3 className="text-lg font-semibold mb-4">Layout Settings</h3>
          <p className="text-sm text-gray-600 mb-6">
            Configure the structure and layout of your site pages.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2">Container Width</label>
              <select
                value={designSettings.layout.containerWidth}
                onChange={(e) => handleLayoutChange('containerWidth', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="1000px">Narrow (1000px)</option>
                <option value="1200px">Standard (1200px)</option>
                <option value="1400px">Wide (1400px)</option>
                <option value="100%">Full Width (100%)</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">Header Style</label>
              <select
                value={designSettings.layout.headerStyle}
                onChange={(e) => handleLayoutChange('headerStyle', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="standard">Standard</option>
                <option value="centered">Centered</option>
                <option value="minimal">Minimal</option>
                <option value="expanded">Expanded</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">Footer Style</label>
              <select
                value={designSettings.layout.footerStyle}
                onChange={(e) => handleLayoutChange('footerStyle', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="standard">Standard</option>
                <option value="minimal">Minimal</option>
                <option value="expanded">Expanded</option>
                <option value="multi-column">Multi-column</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">Sidebar Position</label>
              <select
                value={designSettings.layout.sidebarPosition}
                onChange={(e) => handleLayoutChange('sidebarPosition', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="left">Left</option>
                <option value="right">Right</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>

          <div className="mt-6 p-6 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-4">Layout Preview</h4>
            <div
              className="border border-dashed border-gray-300 rounded-lg p-2"
              style={{ maxWidth: designSettings.layout.containerWidth }}
            >
              <div
                className="bg-gray-200 p-2 mb-4 flex justify-center items-center text-sm font-medium"
                style={{ height: '40px' }}
              >
                {designSettings.layout.headerStyle} Header
              </div>

              <div className="flex">
                {designSettings.layout.sidebarPosition === 'left' && (
                  <div
                    className="bg-gray-100 p-2 mr-4 flex-shrink-0 text-sm font-medium"
                    style={{ width: '120px', height: '150px' }}
                  >
                    Left Sidebar
                  </div>
                )}

                <div className="flex-1 bg-white border border-gray-200 p-2 text-sm">
                  Main Content Area
                </div>

                {designSettings.layout.sidebarPosition === 'right' && (
                  <div
                    className="bg-gray-100 p-2 ml-4 flex-shrink-0 text-sm font-medium"
                    style={{ width: '120px', height: '150px' }}
                  >
                    Right Sidebar
                  </div>
                )}
              </div>

              <div
                className="bg-gray-300 p-2 mt-4 flex justify-center items-center text-sm font-medium"
                style={{ height: '40px' }}
              >
                {designSettings.layout.footerStyle} Footer
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Component Settings */}
      {activeSection === 'components' && (
        <div className="settings-section">
          <h3 className="text-lg font-semibold mb-4">Component Settings</h3>
          <p className="text-sm text-gray-600 mb-6">
            Customize the appearance of UI components throughout your site.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2">Button Style</label>
              <select
                value={designSettings.components.buttonStyle}
                onChange={(e) => handleComponentChange('buttonStyle', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="rounded">Rounded</option>
                <option value="square">Square</option>
                <option value="pill">Pill</option>
                <option value="underlined">Underlined</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">Card Style</label>
              <select
                value={designSettings.components.cardStyle}
                onChange={(e) => handleComponentChange('cardStyle', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="shadow">Shadow</option>
                <option value="bordered">Bordered</option>
                <option value="flat">Flat</option>
                <option value="raised">Raised</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">Image Style</label>
              <select
                value={designSettings.components.imageStyle}
                onChange={(e) => handleComponentChange('imageStyle', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="rounded">Rounded</option>
                <option value="circle">Circle</option>
                <option value="square">Square</option>
                <option value="polaroid">Polaroid</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">Enable Animations</label>
              <div className="flex items-center mt-2">
                <label className="inline-flex items-center mr-4">
                  <input
                    type="radio"
                    name="animations"
                    checked={designSettings.components.enableAnimations}
                    onChange={() => handleComponentChange('enableAnimations', true)}
                    className="mr-1"
                  />
                  <span>Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="animations"
                    checked={!designSettings.components.enableAnimations}
                    onChange={() => handleComponentChange('enableAnimations', false)}
                    className="mr-1"
                  />
                  <span>No</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 p-6 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-4">Component Preview</h4>
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Button Preview:</p>
                <button
                  className={`py-2 px-4 bg-blue-600 text-white ${
                    designSettings.components.buttonStyle === 'rounded'
                      ? 'rounded'
                      : designSettings.components.buttonStyle === 'square'
                      ? ''
                      : designSettings.components.buttonStyle === 'pill'
                      ? 'rounded-full'
                      : 'border-b-2 border-blue-700'
                  }`}
                  style={{ backgroundColor: designSettings.colors.primary }}
                >
                  Sample Button
                </button>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Card Preview:</p>
                <div
                  className={`w-40 h-32 p-3 ${
                    designSettings.components.cardStyle === 'shadow'
                      ? 'shadow'
                      : designSettings.components.cardStyle === 'bordered'
                      ? 'border border-gray-300'
                      : designSettings.components.cardStyle === 'flat'
                      ? 'bg-gray-100'
                      : 'shadow-lg'
                  }`}
                >
                  <div className="text-sm">Card Content</div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                <div
                  className={`w-24 h-24 bg-gray-300 ${
                    designSettings.components.imageStyle === 'rounded'
                      ? 'rounded-lg'
                      : designSettings.components.imageStyle === 'circle'
                      ? 'rounded-full'
                      : designSettings.components.imageStyle === 'square'
                      ? ''
                      : 'p-1 border border-gray-200 shadow-sm'
                  }`}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={handleResetDefaults}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Reset to Defaults
        </button>
        <button
          onClick={handleSaveSettings}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          style={{ backgroundColor: designSettings.colors.primary }}
        >
          Save Design Settings
        </button>
      </div>
    </div>
  );
};

export default ManageDesign;
