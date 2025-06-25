/**
 * Utility functions for managing localStorage efficiently
 */

// Calculate approximate size of localStorage
export const getLocalStorageSize = (): number => {
  let total = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
};

// Convert bytes to human readable format
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Clean up old or unnecessary localStorage items
export const cleanupLocalStorage = (): void => {
  console.log('🧹 Starting localStorage cleanup...');
  const initialSize = getLocalStorageSize();
  
  // Remove old pending orders
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('pending-order') || 
        key.startsWith('order-') || 
        key.startsWith('checkout-') ||
        key.startsWith('temp-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove old addon data
  localStorage.removeItem('bakingo-selected-addons');
  localStorage.removeItem('bakingo-addon-quantities');
  
  const finalSize = getLocalStorageSize();
  console.log(`🧹 Cleanup complete: ${formatBytes(initialSize)} → ${formatBytes(finalSize)} (saved ${formatBytes(initialSize - finalSize)})`);
};

// Safe localStorage setItem with automatic cleanup on quota exceeded
export const safeLocalStorageSetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('⚠️ localStorage quota exceeded, attempting cleanup...');
      
      // Clean up and try again
      cleanupLocalStorage();
      
      try {
        localStorage.setItem(key, value);
        console.log('✅ Successfully stored after cleanup');
        return true;
      } catch (retryError) {
        console.error('❌ Failed to store even after cleanup:', retryError);
        return false;
      }
    } else {
      console.error('❌ Error storing in localStorage:', error);
      return false;
    }
  }
};

// Get localStorage usage statistics
export const getLocalStorageStats = (): { size: number, formattedSize: string, itemCount: number } => {
  const size = getLocalStorageSize();
  return {
    size,
    formattedSize: formatBytes(size),
    itemCount: Object.keys(localStorage).length
  };
};
