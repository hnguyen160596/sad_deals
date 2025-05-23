/**
 * Error tracking and monitoring system
 *
 * This module provides a centralized error tracking system with:
 * - Console logging with detailed information
 * - Browser localStorage storage for offline error collection
 * - Network reporting capabilities (currently mocked)
 * - Performance monitoring
 * - User interaction tracking for error context
 */

// Types
export interface ErrorEvent {
  message: string;
  source?: string;
  lineno?: number;
  colno?: number;
  error?: Error;
  componentStack?: string;
  timestamp: number;
  url: string;
  userAgent: string;
  severity: 'error' | 'warning' | 'info';
  tags?: Record<string, string>;
  extras?: Record<string, unknown>;
}

export interface PerformanceEvent {
  name: string;
  duration: number;
  startTime: number;
  entryType: string;
  timestamp: number;
  tags?: Record<string, string>;
}

// Configuration with defaults
export interface ErrorTrackingConfig {
  appName: string;
  appVersion: string;
  environment: 'development' | 'staging' | 'production';
  sampleRate: number; // 0-1, percentage of errors to track
  endpoint?: string; // API endpoint for sending errors
  maxStoredErrors: number; // Maximum number of errors to store locally
  enableConsoleCapture: boolean;
  ignorePatterns: RegExp[];
  tags?: Record<string, string>;
}

// Default configuration
const defaultConfig: ErrorTrackingConfig = {
  appName: 'sales-aholics-deals',
  appVersion: '1.0.0',
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1, // 10% in prod, 100% in dev
  maxStoredErrors: 50,
  enableConsoleCapture: true,
  ignorePatterns: [
    /ResizeObserver loop limit exceeded/i,
    /Loading chunk \d+ failed/i,
    /Network request failed/i,
    /Script error/i,
  ],
};

// Singleton instance
let instance: ErrorTracking | null = null;

/**
 * ErrorTracking class
 */
class ErrorTracking {
  private config: ErrorTrackingConfig;
  private initialized: boolean = false;
  private originalConsoleError: typeof console.error;
  private originalConsoleWarn: typeof console.warn;
  private userInteractions: {action: string, element: string, timestamp: number}[] = [];
  private isReportingError: boolean = false; // Prevent infinite loops

  constructor(config: Partial<ErrorTrackingConfig> = {}) {
    // Merge provided config with defaults
    this.config = {
      ...defaultConfig,
      ...config,
    };

    // Store original console methods
    this.originalConsoleError = console.error;
    this.originalConsoleWarn = console.warn;
  }

  /**
   * Initialize error tracking
   */
  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Set up global error handler
    window.addEventListener('error', this.handleWindowError);

    // Set up unhandled promise rejection handler
    window.addEventListener('unhandledrejection', this.handlePromiseRejection);

    // Set up console capture if enabled
    if (this.config.enableConsoleCapture) {
      this.setupConsoleCapture();
    }

    // Set up performance monitoring
    this.setupPerformanceMonitoring();

    // Set up user interaction tracking
    this.setupUserInteractionTracking();

    // Log successful initialization
    console.log(
      `Error tracking initialized: ${this.config.appName} v${this.config.appVersion} (${this.config.environment})`
    );
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    if (!this.initialized) return;

    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Remove event listeners
    window.removeEventListener('error', this.handleWindowError);
    window.removeEventListener('unhandledrejection', this.handlePromiseRejection);

    // Restore original console methods
    if (this.config.enableConsoleCapture) {
      console.error = this.originalConsoleError;
      console.warn = this.originalConsoleWarn;
    }

    this.initialized = false;
  }

  /**
   * Handle window errors
   */
  private handleWindowError = (event: ErrorEvent): void => {
    // Don't track errors if we're already reporting an error (prevent loops)
    if (this.isReportingError) return;

    try {
      this.isReportingError = true;

      // Check if we should ignore this error
      if (this.shouldIgnoreError(event.message)) {
        return;
      }

      // Check sampling rate
      if (Math.random() > this.config.sampleRate) {
        return;
      }

      // Create error object
      const errorEvent: ErrorEvent = {
        message: event.message || 'Unknown error',
        source: event.filename || event.source,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        severity: 'error',
        tags: {
          ...this.config.tags,
          type: 'window',
        },
        extras: {
          recentInteractions: this.getUserInteractions(),
        },
      };

      // Track error
      this.trackError(errorEvent);
    } finally {
      this.isReportingError = false;
    }
  };

  /**
   * Handle unhandled promise rejections
   */
  private handlePromiseRejection = (event: PromiseRejectionEvent): void => {
    // Don't track errors if we're already reporting an error (prevent loops)
    if (this.isReportingError) return;

    try {
      this.isReportingError = true;

      // Extract error message
      let message = 'Unhandled Promise Rejection';
      let error = null;

      if (event.reason instanceof Error) {
        message = event.reason.message;
        error = event.reason;
      } else if (typeof event.reason === 'string') {
        message = event.reason;
      } else if (event.reason) {
        try {
          message = JSON.stringify(event.reason);
        } catch (e) {
          message = 'Unserializable Promise Rejection';
        }
      }

      // Check if we should ignore this error
      if (this.shouldIgnoreError(message)) {
        return;
      }

      // Check sampling rate
      if (Math.random() > this.config.sampleRate) {
        return;
      }

      // Create error object
      const errorEvent: ErrorEvent = {
        message,
        error,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        severity: 'error',
        tags: {
          ...this.config.tags,
          type: 'promise',
        },
        extras: {
          recentInteractions: this.getUserInteractions(),
        },
      };

      // Track error
      this.trackError(errorEvent);
    } finally {
      this.isReportingError = false;
    }
  };

  /**
   * Set up console capture
   */
  private setupConsoleCapture(): void {
    // Override console.error
    console.error = (...args: unknown[]): void => {
      // Call original method
      this.originalConsoleError.apply(console, args);

      // Don't track errors if we're already reporting an error (prevent loops)
      if (this.isReportingError) return;

      try {
        this.isReportingError = true;

        // Extract message
        let message = 'Console error';
        let error = null;

        if (args.length > 0) {
          if (args[0] instanceof Error) {
            error = args[0];
            message = error.message;
          } else if (typeof args[0] === 'string') {
            message = args[0];
          }
        }

        // Check if we should ignore this error
        if (this.shouldIgnoreError(message)) {
          return;
        }

        // Check sampling rate
        if (Math.random() > this.config.sampleRate) {
          return;
        }

        // Create error object
        const errorEvent: ErrorEvent = {
          message,
          error,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          severity: 'error',
          tags: {
            ...this.config.tags,
            type: 'console.error',
          },
          extras: {
            arguments: args.map(arg => {
              try {
                return arg instanceof Error
                  ? { message: arg.message, stack: arg.stack }
                  : arg;
              } catch (e) {
                return 'Unserializable argument';
              }
            }),
            recentInteractions: this.getUserInteractions(),
          },
        };

        // Track error
        this.trackError(errorEvent);
      } finally {
        this.isReportingError = false;
      }
    };

    // Override console.warn
    console.warn = (...args: unknown[]): void => {
      // Call original method
      this.originalConsoleWarn.apply(console, args);

      // Don't track warns if we're already reporting an error (prevent loops)
      if (this.isReportingError) return;

      try {
        this.isReportingError = true;

        // Extract message
        let message = 'Console warning';

        if (args.length > 0 && typeof args[0] === 'string') {
          message = args[0];
        }

        // Check if we should ignore this warning
        if (this.shouldIgnoreError(message)) {
          return;
        }

        // Check sampling rate (lower for warnings)
        if (Math.random() > this.config.sampleRate * 0.1) {
          return;
        }

        // Create warning object
        const warningEvent: ErrorEvent = {
          message,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          severity: 'warning',
          tags: {
            ...this.config.tags,
            type: 'console.warn',
          },
          extras: {
            arguments: args.map(arg => {
              try {
                return arg instanceof Error
                  ? { message: arg.message, stack: arg.stack }
                  : arg;
              } catch (e) {
                return 'Unserializable argument';
              }
            }),
          },
        };

        // Track warning
        this.trackError(warningEvent);
      } finally {
        this.isReportingError = false;
      }
    };
  }

  /**
   * Set up performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    // Only run in browser environment with Performance API
    if (typeof window === 'undefined' || !window.performance || !window.PerformanceObserver) return;

    try {
      // Observe page load performance
      this.trackPageLoadPerformance();

      // Observe long tasks
      this.observeLongTasks();

      // Observe navigation timing
      this.observeNavigationTiming();
    } catch (e) {
      console.error('Failed to set up performance monitoring:', e);
    }
  }

  /**
   * Track page load performance
   */
  private trackPageLoadPerformance(): void {
    window.addEventListener('load', () => {
      setTimeout(() => {
        try {
          const perfEntries = performance.getEntriesByType('navigation');
          if (perfEntries.length > 0) {
            const navigationEntry = perfEntries[0] as PerformanceNavigationTiming;

            this.trackPerformance({
              name: 'page-load',
              duration: navigationEntry.loadEventEnd - navigationEntry.startTime,
              startTime: navigationEntry.startTime,
              entryType: 'navigation',
              timestamp: Date.now(),
              tags: {
                url: window.location.href,
                type: navigationEntry.type,
              },
            });
          }
        } catch (e) {
          console.error('Failed to track page load performance:', e);
        }
      }, 0);
    });
  }

  /**
   * Observe long tasks
   */
  private observeLongTasks(): void {
    try {
      const longTaskObserver = new PerformanceObserver((entries) => {
        entries.getEntries().forEach((entry) => {
          // Track tasks longer than 100ms
          if (entry.duration > 100) {
            this.trackPerformance({
              name: 'long-task',
              duration: entry.duration,
              startTime: entry.startTime,
              entryType: entry.entryType,
              timestamp: Date.now(),
            });
          }
        });
      });

      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Long task observation might not be supported in all browsers
    }
  }

  /**
   * Observe navigation timing
   */
  private observeNavigationTiming(): void {
    try {
      const navigationObserver = new PerformanceObserver((entries) => {
        entries.getEntries().forEach((entry) => {
          const navEntry = entry as PerformanceNavigationTiming;

          // Track key navigation metrics
          const metrics = {
            ttfb: navEntry.responseStart - navEntry.startTime,
            domLoad: navEntry.domContentLoadedEventEnd - navEntry.startTime,
            windowLoad: navEntry.loadEventEnd - navEntry.startTime,
          };

          this.trackPerformance({
            name: 'navigation-timing',
            duration: navEntry.loadEventEnd - navEntry.startTime,
            startTime: navEntry.startTime,
            entryType: navEntry.entryType,
            timestamp: Date.now(),
            tags: {
              url: window.location.href,
              type: navEntry.type,
            },
            ...metrics,
          });
        });
      });

      navigationObserver.observe({ entryTypes: ['navigation'] });
    } catch (e) {
      // Navigation timing observation might not be supported in all browsers
    }
  }

  /**
   * Set up user interaction tracking
   */
  private setupUserInteractionTracking(): void {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Track clicks
    document.addEventListener('click', (event) => {
      try {
        const target = event.target as HTMLElement;
        const tagName = target.tagName.toLowerCase();
        const id = target.id ? `#${target.id}` : '';
        const classes = target.className && typeof target.className === 'string'
          ? `.${target.className.split(' ').join('.')}`
          : '';
        const text = target.textContent ? target.textContent.slice(0, 20).trim() : '';

        // Create a selector for the element
        let selector = tagName + id + classes;
        if (text) {
          selector += ` (${text}${text.length >= 20 ? '...' : ''})`;
        }

        // Add to interactions queue (max 10 items)
        this.userInteractions.push({
          action: 'click',
          element: selector,
          timestamp: Date.now(),
        });

        if (this.userInteractions.length > 10) {
          this.userInteractions.shift();
        }
      } catch (e) {
        // Ignore errors in interaction tracking
      }
    }, { passive: true });
  }

  /**
   * Get recent user interactions
   */
  private getUserInteractions(): {action: string, element: string, timestamp: number}[] {
    // Return a copy of the interactions array
    return [...this.userInteractions];
  }

  /**
   * Check if an error should be ignored
   */
  private shouldIgnoreError(message: string): boolean {
    if (!message) return false;

    // Check against ignore patterns
    return this.config.ignorePatterns.some(pattern => pattern.test(message));
  }

  /**
   * Track an error
   */
  trackError(errorEvent: ErrorEvent): void {
    try {
      // Store error locally
      this.storeErrorLocally(errorEvent);

      // Report error to API (mock for now)
      this.reportErrorToAPI(errorEvent);
    } catch (e) {
      // Use original console to avoid loops
      this.originalConsoleError.call(console, 'Error tracking failed:', e);
    }
  }

  /**
   * Store error in localStorage for offline collection
   */
  private storeErrorLocally(errorEvent: ErrorEvent): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;

      // Get existing errors
      const storedErrorsJson = localStorage.getItem('sad_tracked_errors') || '[]';
      const storedErrors = JSON.parse(storedErrorsJson) as ErrorEvent[];

      // Add new error
      storedErrors.push({
        ...errorEvent,
        // Remove circular references and functions
        error: errorEvent.error ? {
          message: errorEvent.error.message,
          name: errorEvent.error.name,
          stack: errorEvent.error.stack,
        } : undefined,
      });

      // Limit number of stored errors
      if (storedErrors.length > this.config.maxStoredErrors) {
        storedErrors.splice(0, storedErrors.length - this.config.maxStoredErrors);
      }

      // Store errors
      localStorage.setItem('sad_tracked_errors', JSON.stringify(storedErrors));
    } catch (e) {
      // Use original console to avoid loops
      this.originalConsoleError.call(console, 'Failed to store error locally:', e);
    }
  }

  /**
   * Report error to API
   * This is mocked for now but would send to a real endpoint in production
   */
  private reportErrorToAPI(errorEvent: ErrorEvent): void {
    // In a real implementation, this would send to an API
    if (this.config.endpoint && this.config.environment === 'production') {
      // Mock implementation
      if (this.config.environment === 'development') {
        this.originalConsoleError.call(
          console,
          '[ERROR TRACKING] Would report to API:',
          errorEvent
        );
      }

      // In production, this would be an actual fetch:
      /*
      fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorEvent),
      }).catch(e => {
        // Silently fail, don't cause more errors
      });
      */
    }
  }

  /**
   * Track a performance event
   */
  trackPerformance(performanceEvent: PerformanceEvent): void {
    try {
      // In development, log to console
      if (this.config.environment === 'development') {
        this.originalConsoleWarn.call(
          console,
          `[PERFORMANCE] ${performanceEvent.name}: ${performanceEvent.duration.toFixed(2)}ms`
        );
      }

      // In a real implementation, this would send to an API
      if (this.config.endpoint && this.config.environment === 'production') {
        // Would send performance data to API
      }
    } catch (e) {
      // Use original console to avoid loops
      this.originalConsoleError.call(console, 'Performance tracking failed:', e);
    }
  }

  /**
   * Public API to manually track an error
   */
  captureError(error: Error | string, extras: Record<string, unknown> = {}): void {
    if (!this.initialized) return;

    try {
      // Don't track errors if we're already reporting an error (prevent loops)
      if (this.isReportingError) return;

      this.isReportingError = true;

      // Create error object
      const errorEvent: ErrorEvent = {
        message: error instanceof Error ? error.message : String(error),
        error: error instanceof Error ? error : undefined,
        timestamp: Date.now(),
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        severity: 'error',
        tags: {
          ...this.config.tags,
          type: 'manual',
        },
        extras: {
          ...extras,
          recentInteractions: this.getUserInteractions(),
        },
      };

      // Track error
      this.trackError(errorEvent);
    } finally {
      this.isReportingError = false;
    }
  }

  /**
   * Public API to manually track a warning
   */
  captureWarning(message: string, extras: Record<string, unknown> = {}): void {
    if (!this.initialized) return;

    try {
      // Create warning object
      const warningEvent: ErrorEvent = {
        message,
        timestamp: Date.now(),
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        severity: 'warning',
        tags: {
          ...this.config.tags,
          type: 'manual',
        },
        extras,
      };

      // Track warning
      this.trackError(warningEvent);
    } catch (e) {
      // Silently fail
    }
  }

  /**
   * Public API to manually track an info event
   */
  captureInfo(message: string, extras: Record<string, unknown> = {}): void {
    if (!this.initialized) return;

    try {
      // Create info object
      const infoEvent: ErrorEvent = {
        message,
        timestamp: Date.now(),
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        severity: 'info',
        tags: {
          ...this.config.tags,
          type: 'manual',
        },
        extras,
      };

      // Track info
      this.trackError(infoEvent);
    } catch (e) {
      // Silently fail
    }
  }
}

/**
 * Get or create the ErrorTracking instance
 */
export const getErrorTracking = (config: Partial<ErrorTrackingConfig> = {}): ErrorTracking => {
  if (!instance) {
    instance = new ErrorTracking(config);
  }
  return instance;
};

/**
 * Initialize error tracking with the given configuration
 */
export const initErrorTracking = (config: Partial<ErrorTrackingConfig> = {}): ErrorTracking => {
  const errorTracking = getErrorTracking(config);
  errorTracking.init();
  return errorTracking;
};

// Simple error boundary component for React
import React from 'react';

export const withErrorBoundary = (Component: React.ComponentType<any>, fallback: React.ReactNode) => {
  return class ErrorBoundary extends React.Component<any, { hasError: boolean }> {
    constructor(props: any) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(): { hasError: boolean } {
      return { hasError: true };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo): void {
      // Report error to error tracking
      try {
        const errorTracking = getErrorTracking();
        errorTracking.captureError(error, { componentStack: info.componentStack });
      } catch (e) {
        console.error('Failed to report error to error tracking:', e);
      }
    }

    render(): React.ReactNode {
      if (this.state.hasError) {
        return fallback;
      }
      // @ts-ignore - Use JSX Element without complaining
      return React.createElement(Component, this.props);
    }
  };
};

// Default export
export default {
  init: initErrorTracking,
  get: getErrorTracking,
  withErrorBoundary,
};
