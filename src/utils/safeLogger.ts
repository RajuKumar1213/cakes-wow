/**
 * Safe logging utility that prevents large data structures from being logged
 */

export const safeLog = (label: string, data: any) => {
  try {
    // If it's a simple string or number, log it directly
    if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
      console.log(label, data);
      return;
    }

    // If it's null or undefined
    if (data === null || data === undefined) {
      console.log(label, data);
      return;
    }

    // If it's an array, log the length and sample elements
    if (Array.isArray(data)) {
      console.log(`${label} (Array):`, {
        length: data.length,
        firstItem: data[0] ? getSafeObject(data[0]) : null,
      });
      return;
    }

    // If it's an object, create a safe version
    console.log(label, getSafeObject(data));
  } catch (error) {
    console.log(`${label} (Log Error):`, 'Unable to safely log this object');
  }
};

const getSafeObject = (obj: any, depth: number = 0): any => {
  if (depth > 3) return '[Max Depth Reached]';
  
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj !== 'object') return obj;
    if (obj instanceof File) {
    return {
      objectType: 'File',
      name: obj.name,
      size: obj.size,
      fileType: obj.type
    };
  }
  
  if (obj instanceof Date) return obj.toISOString();
  
  if (Array.isArray(obj)) {
    return obj.slice(0, 3).map(item => getSafeObject(item, depth + 1));
  }
  
  const safeObj: any = {};
  const keys = Object.keys(obj).slice(0, 10); // Limit to first 10 keys
  
  for (const key of keys) {
    try {
      const value = obj[key];
      
      // Skip very large strings (likely base64)
      if (typeof value === 'string' && value.length > 1000) {
        safeObj[key] = `[Large String: ${value.length} chars]`;
        continue;
      }
      
      safeObj[key] = getSafeObject(value, depth + 1);
    } catch (error) {
      safeObj[key] = '[Error accessing property]';
    }
  }
  
  return safeObj;
};

export default safeLog;
