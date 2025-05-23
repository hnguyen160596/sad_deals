import React, { useEffect, useRef } from 'react';

interface AdPlacementProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: { [key: string]: unknown }[];
  }
}

const AdPlacement: React.FC<AdPlacementProps> = ({
  adSlot,
  adFormat = 'auto',
  className = ''
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    // Initialize adsbygoogle if not already initialized
    if (!window.adsbygoogle) {
      window.adsbygoogle = window.adsbygoogle || [];
    }

    if (adRef.current && !isLoaded.current) {
      try {
        // Push the ad configuration
        window.adsbygoogle.push({});
        isLoaded.current = true;
      } catch (error) {
        console.error('Error loading ad:', error);
      }
    }

    // Cleanup function
    return () => {
      isLoaded.current = false;
    };
  }, []);

  // Determine ad size based on format
  const getAdSizeClasses = () => {
    switch (adFormat) {
      case 'rectangle':
        return 'min-h-[250px] min-w-[300px]';
      case 'horizontal':
        return 'min-h-[90px] min-w-[728px]';
      case 'vertical':
        return 'min-h-[600px] min-w-[160px]';
      default:
        return 'min-h-[100px]';
    }
  };

  return (
    <div
      className={`ad-container overflow-hidden ${getAdSizeClasses()} ${className}`}
      data-testid="ad-placement"
    >
      <div
        ref={adRef}
        className="adsbygoogle w-full h-full"
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with actual ad client ID in production
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
      <div className="text-xs text-gray-400 text-center mt-1">Advertisement</div>
    </div>
  );
};

// Higher order component for error boundary around ads
export const withAdErrorBoundary = (WrappedComponent: React.ComponentType<AdPlacementProps>) => {
  return class AdErrorBoundary extends React.Component<AdPlacementProps, { hasError: boolean }> {
    constructor(props: AdPlacementProps) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
      return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      console.error('Ad Error:', error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        // Fallback UI when ad fails to load
        return (
          <div className={`ad-fallback ${this.props.className || ''}`}>
            <div className="p-4 border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Advertisement</span>
            </div>
          </div>
        );
      }

      return <WrappedComponent {...this.props} />;
    }
  };
};

// Pre-wrapped component with error boundary
const SafeAdPlacement = withAdErrorBoundary(AdPlacement);

export { AdPlacement };
export default SafeAdPlacement;
