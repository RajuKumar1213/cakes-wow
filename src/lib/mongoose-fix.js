// Global fix for Mongoose emitWarning errors in Vercel/client environments
// This must be imported before any Mongoose models

// Polyfill process object if it doesn't exist (browser environment)
if (typeof global === 'undefined') {
  globalThis.global = globalThis;
}

if (typeof process === 'undefined') {
  globalThis.process = {
    env: {},
    emitWarning: () => {},
    nextTick: (cb) => setTimeout(cb, 0),
    version: 'v18.0.0',
    versions: { node: '18.0.0' },
    platform: 'browser',
    browser: true,
  };
} else if (process && typeof process.emitWarning !== 'function') {
  process.emitWarning = () => {};
}

// Additional protection for globalThis
if (typeof globalThis.process === 'undefined') {
  globalThis.process = process || {
    env: {},
    emitWarning: () => {},
    nextTick: (cb) => setTimeout(cb, 0),
    version: 'v18.0.0',
  };
} else if (globalThis.process && typeof globalThis.process.emitWarning !== 'function') {
  globalThis.process.emitWarning = () => {};
}

// Export a function to apply the fix
export const applyMongooseFix = () => {
  try {
    if (typeof window !== 'undefined') {
      // Browser environment - completely disable mongoose warnings
      if (window.process && typeof window.process.emitWarning !== 'function') {
        window.process.emitWarning = () => {};
      }
    }
  } catch (error) {
    // Silently catch any errors
  }
};

// Apply the fix immediately
applyMongooseFix();

export default applyMongooseFix;
