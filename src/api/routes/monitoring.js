const express = require('express');
const router = express.Router();
const { performanceMonitor } = require('../middleware/performance');
const { cacheManager } = require('../middleware/cache');

/**
 * @route GET /api/v1/monitoring/health
 * @desc Get system health status
 * @access Public
 */
router.get('/health', (req, res) => {
  try {
    const healthStatus = performanceMonitor.getHealthStatus();
    const metrics = performanceMonitor.getMetrics();
    const cacheStats = cacheManager.getStats();
    
    // Check database connection
    const dbStatus = req.app.locals.databaseService ? 'connected' : 'disconnected';
    
    // Check blockchain connection
    const blockchainStatus = req.app.locals.blockchainService ? 'connected' : 'disconnected';
    
    const systemHealth = {
      status: healthStatus.status,
      message: healthStatus.message,
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        blockchain: blockchainStatus,
        api: 'running'
      },
      performance: {
        responseTime: metrics.response_time?.average || 0,
        totalRequests: metrics.total_requests?.sum || 0,
        cacheHitRate: cacheStats.hitRate
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        external: Math.round(process.memoryUsage().external / 1024 / 1024) + ' MB'
      },
      uptime: Math.round(process.uptime()) + ' seconds'
    };

    res.status(200).json({
      success: true,
      data: systemHealth
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      message: error.message
    });
  }
});

/**
 * @route GET /api/v1/monitoring/metrics
 * @desc Get detailed performance metrics
 * @access Public
 */
router.get('/metrics', (req, res) => {
  try {
    const metrics = performanceMonitor.getMetrics();
    const cacheStats = cacheManager.getStats();
    
    res.status(200).json({
      success: true,
      data: {
        performance: metrics,
        cache: cacheStats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get metrics',
      message: error.message
    });
  }
});

/**
 * @route GET /api/v1/monitoring/cache
 * @desc Get cache statistics and management
 * @access Public
 */
router.get('/cache', (req, res) => {
  try {
    const stats = cacheManager.getStats();
    
    res.status(200).json({
      success: true,
      data: {
        ...stats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Cache stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cache statistics',
      message: error.message
    });
  }
});

/**
 * @route DELETE /api/v1/monitoring/cache
 * @desc Clear all cache
 * @access Public
 */
router.delete('/cache', (req, res) => {
  try {
    cacheManager.flush();
    
    res.status(200).json({
      success: true,
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
      message: error.message
    });
  }
});

/**
 * @route GET /api/v1/monitoring/status
 * @desc Get system status summary
 * @access Public
 */
router.get('/status', (req, res) => {
  try {
    const healthStatus = performanceMonitor.getHealthStatus();
    const metrics = performanceMonitor.getMetrics();
    const cacheStats = cacheManager.getStats();
    
    const status = {
      overall: healthStatus.status,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      requests: {
        total: metrics.total_requests?.sum || 0,
        averageResponseTime: metrics.response_time?.average || 0
      },
      cache: {
        hitRate: cacheStats.hitRate,
        keys: cacheStats.keys
      }
    };

    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get status',
      message: error.message
    });
  }
});

module.exports = router;
