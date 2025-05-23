import type React from 'react';

interface ABTestWrapperProps {
  testId: string;
  variants: Record<string, React.ReactNode>;
  fallback?: React.ReactNode;
  trackImpression?: boolean;
  trackAction?: string;
}

/**
 * Simplified A/B test wrapper that just renders the default variant
 * No tracking or context dependencies for simpler operation
 */
const ABTestWrapper: React.FC<ABTestWrapperProps> = ({
  variants,
  fallback,
}) => {
  // Always use default or first available variant
  const defaultVariant = variants.default || variants.variant_b || Object.values(variants)[0];
  return <>{defaultVariant || fallback || null}</>;
};

export default ABTestWrapper;
