/**
 * Performance monitoring utilities
 */

export class PerformanceMonitor {
  static marks = new Map();

  static startTimer(name) {
    this.marks.set(name, performance.now());
  }

  static endTimer(name) {
    const startTime = this.marks.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.marks.delete(name);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    }
    return 0;
  }

  static measureAPI(apiName, promise) {
    this.startTimer(apiName);
    return promise
      .then(result => {
        this.endTimer(apiName);
        return result;
      })
      .catch(error => {
        this.endTimer(apiName);
        throw error;
      });
  }
}

export function logDatabaseQueryTime(queryName, startTime) {
  const duration = Date.now() - startTime;
  if (process.env.NODE_ENV === 'development' && duration > 100) {
    console.warn(`🐌 Slow DB Query - ${queryName}: ${duration}ms`);
  }
}
