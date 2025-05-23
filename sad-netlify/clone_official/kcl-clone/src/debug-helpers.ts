/**
 * Debug helpers to identify Function.prototype.apply issues
 */

// Save original Function.prototype.apply
const originalApply = Function.prototype.apply;

// Create a custom wrapper that logs errors
Function.prototype.apply = function(thisArg, argsArray) {
  try {
    // Try to use the original apply method
    return originalApply.call(this, thisArg, argsArray);
  } catch (error) {
    // Log detailed error information
    console.error('Error in Function.prototype.apply:', {
      function: this.name || 'anonymous',
      thisValue: thisArg,
      hasThisValue: thisArg !== undefined && thisArg !== null,
      argsProvided: argsArray !== undefined && argsArray !== null,
      error: error
    });
    
    // Re-throw the error to maintain original behavior
    throw error;
  }
};

// Log when this file loads
console.log('Debug helpers loaded for Function.prototype.apply');

export const debugPWA = () => {
  console.log('PWA Debug Info:', {
    hasNavigator: typeof navigator !== 'undefined',
    hasServiceWorker: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
    hasBeforeInstallPrompt: typeof window !== 'undefined' && 'BeforeInstallPromptEvent' in window,
    registeredSW: navigator?.serviceWorker?.controller ? true : false
  });
};