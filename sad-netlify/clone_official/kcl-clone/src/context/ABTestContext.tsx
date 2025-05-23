import type React from 'react';
import { createContext, useState, useContext, type ReactNode } from 'react';

// Define test variations and context types
export interface ABTest {
  id: string;
  name: string;
  variants: string[];
  activeVariant?: string;
  isActive: boolean;
}

interface ABTestContextType {
  tests: Record<string, ABTest>;
  getVariant: (testId: string) => string | null;
  trackConversion: (testId: string, action: string) => void;
  isInTest: (testId: string) => boolean;
}

// Create the context with a default value
const ABTestContext = createContext<ABTestContextType>({
  tests: {},
  getVariant: () => null,
  trackConversion: () => {},
  isInTest: () => false,
});

// Provider component with simplified implementation
export const ABTestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Simplified tests state with preset values
  const [tests] = useState<Record<string, ABTest>>({
    homepage_hero: {
      id: 'homepage_hero',
      name: 'Homepage Hero Layout',
      variants: ['default', 'variant_a', 'variant_b'],
      activeVariant: 'default',
      isActive: true,
    },
    cta_button_color: {
      id: 'cta_button_color',
      name: 'CTA Button Color',
      variants: ['blue', 'green', 'orange'],
      activeVariant: 'blue',
      isActive: true,
    },
    deal_card_layout: {
      id: 'deal_card_layout',
      name: 'Deal Card Layout',
      variants: ['standard', 'compact', 'image_focused'],
      activeVariant: 'standard',
      isActive: true,
    },
    email_signup_copy: {
      id: 'email_signup_copy',
      name: 'Email Signup Copy',
      variants: ['version_a', 'version_b', 'version_c'],
      activeVariant: 'version_a',
      isActive: true,
    },
  });

  // Get the active variant for a test
  const getVariant = (testId: string): string | null => {
    try {
      const test = tests[testId];
      return test?.activeVariant || null;
    } catch (error) {
      console.error('Error in getVariant:', error);
      return null;
    }
  };

  // Track a conversion for a test - simplified to just log
  const trackConversion = (testId: string, action: string): void => {
    try {
      const test = tests[testId];
      if (test && test.activeVariant) {
        console.log(`[ABTest] Conversion: ${testId}:${test.activeVariant}:${action}`);
      }
    } catch (error) {
      console.error('Error in trackConversion:', error);
    }
  };

  // Check if a user is in a specific test
  const isInTest = (testId: string): boolean => {
    try {
      return !!tests[testId]?.activeVariant;
    } catch (error) {
      console.error('Error in isInTest:', error);
      return false;
    }
  };

  const contextValue: ABTestContextType = {
    tests,
    getVariant,
    trackConversion,
    isInTest,
  };

  return (
    <ABTestContext.Provider value={contextValue}>
      {children}
    </ABTestContext.Provider>
  );
};

// Custom hook for using the AB testing context
export const useABTest = () => {
  try {
    return useContext(ABTestContext);
  } catch (error) {
    console.error('Error in useABTest hook:', error);
    return {
      tests: {},
      getVariant: () => null,
      trackConversion: () => {},
      isInTest: () => false,
    };
  }
};

export default ABTestContext;
