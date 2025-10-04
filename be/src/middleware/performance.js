const performance = require('perf_hooks');

/**
 * Performance monitoring middleware
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.startTimes = new Map();
  }

  /**
   * Start timing a request
   */
  startTiming(req, res, next) {
    const requestId = `${req.method}-${req.path}-${Date.now()}`;
    const startTime = performance.now();
    
    this.startTimes.set(requestId, startTime);
    req.requestId = requestId;
    
    next();
  }

  /**
   * End timing and record metrics
   */
  endTiming(req, res, next) {
    const requestId = req.requestId;
    if (!requestId) return next();

    const startTime = this.startTimes.get(requestId);
    if (!startTime) return next();

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Record metrics
    this.recordMetric('response_time', duration);
    this.recordMetric(`${req.method}_${req.path}`, duration);
    this.recordMetric('total_requests', 1);

    // Log slow requests
    if (duration > 1000) { // > 1 second
      console.warn(`Slow request detected: ${req.method} ${req.path} took ${duration.toFixed(2)}ms`);
    }

    // Add performance headers
    res.set('X-Response-Time', `${duration.toFixed(2)}ms`);
    res.set('X-Request-ID', requestId);

    this.startTimes.delete(requestId);
    next();
  }

  /**
   * Record a metric
   */
  recordMetric(name, value) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name).push({
      value,
      timestamp: Date.now()
    });

    // Keep only last 1000 entries per metric
    const entries = this.metrics.get(name);
    if (entries.length > 1000) {
      entries.splice(0, entries.length - 1000);
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    const result = {};
    
    for (const [name, entries] of this.metrics.entries()) {
      if (entries.length === 0) continue;

      const values = entries.map(entry => entry.value);
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);

      result[name] = {
        count: entries.length,
        average: avg,
        min,
        max,
        sum,
        lastUpdated: Math.max(...entries.map(entry => entry.timestamp))
      };
    }

    return result;
  }

  /**
   * Get health status
   */
  getHealthStatus() {
    const metrics = this.getMetrics();
    const responseTime = metrics.response_time;
    
    if (!responseTime) {
      return { status: 'unknown', message: 'No metrics available' };
    }

    if (responseTime.average < 200) {
      return { status: 'excellent', message: 'Performance is excellent' };
    } else if (responseTime.average < 500) {
      return { status: 'good', message: 'Performance is good' };
    } else if (responseTime.average < 1000) {
      return { status: 'fair', message: 'Performance is fair' };
    } else {
      return { status: 'poor', message: 'Performance needs attention' };
    }
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

module.exports = {
  performanceMonitor,
  startTiming: performanceMonitor.startTiming.bind(performanceMonitor),
  endTiming: performanceMonitor.endTiming.bind(performanceMonitor),
  getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
  getHealthStatus: performanceMonitor.getHealthStatus.bind(performanceMonitor)
};
