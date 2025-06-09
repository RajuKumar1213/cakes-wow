// Fix for Mongoose emitWarning error in client-side environments like Vercel
// This prevents the "(intermediate value).emitWarning is not a function" error

if (typeof window !== 'undefined') {
  // We're in a browser environment - Mongoose should not be running here
  // But if it somehow gets loaded, we need to prevent the emitWarning error
  if (typeof global === 'undefined') {
    global = globalThis || window;
  }
  
  if (typeof process === 'undefined') {
    global.process = {
      env: {},
      emitWarning: () => {},
      nextTick: (cb) => setTimeout(cb, 0),
      version: 'v16.0.0',
      versions: { node: '16.0.0' }
    };
  } else if (!process.emitWarning) {
    process.emitWarning = () => {};
  }
}

// Server-side protection
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  if (!process.emitWarning) {
    process.emitWarning = () => {};
  }
}

export default function fixMongooseWarnings() {
  // This function can be called to ensure the fix is applied
  return true;
}
