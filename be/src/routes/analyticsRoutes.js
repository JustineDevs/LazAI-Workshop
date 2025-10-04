const express = require('express');
const AnalyticsController = require('../controllers/AnalyticsController');
const { authenticateToken } = require('../middleware/AuthMiddleware');
const { rateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
const analyticsController = new AnalyticsController();

// Initialize controller
analyticsController.initialize().catch(console.error);

// Apply rate limiting to all routes
router.use(rateLimiter);

/**
 * @route GET /api/analytics/platform
 * @desc Get platform-wide analytics
 * @access Public
 */
router.get('/platform', async (req, res) => {
    await analyticsController.getPlatformAnalytics(req, res);
});

/**
 * @route GET /api/analytics/creator/:address
 * @desc Get analytics for a specific creator
 * @access Public
 */
router.get('/creator/:address', async (req, res) => {
    await analyticsController.getCreatorAnalytics(req, res);
});

/**
 * @route GET /api/analytics/token/:tokenId
 * @desc Get analytics for a specific token
 * @access Public
 */
router.get('/token/:tokenId', async (req, res) => {
    await analyticsController.getTokenAnalytics(req, res);
});

/**
 * @route GET /api/analytics/marketplace
 * @desc Get marketplace analytics (top performers, trending)
 * @access Public
 */
router.get('/marketplace', async (req, res) => {
    await analyticsController.getMarketplaceAnalytics(req, res);
});

/**
 * @route GET /api/analytics/queries
 * @desc Get query analytics and patterns
 * @access Public
 */
router.get('/queries', async (req, res) => {
    await analyticsController.getQueryAnalytics(req, res);
});

/**
 * @route GET /api/analytics/privacy
 * @desc Get privacy and security analytics
 * @access Public
 */
router.get('/privacy', async (req, res) => {
    await analyticsController.getPrivacyAnalytics(req, res);
});

/**
 * @route GET /api/analytics/dashboard/:address
 * @desc Get comprehensive dashboard data for a user
 * @access Private
 */
router.get('/dashboard/:address', authenticateToken, async (req, res) => {
    await analyticsController.getDashboardData(req, res);
});

module.exports = router;
