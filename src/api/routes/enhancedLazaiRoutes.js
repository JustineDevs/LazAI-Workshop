const express = require('express');
const EnhancedLazAIController = require('../controllers/EnhancedLazAIController');
const { authenticateToken } = require('../middleware/AuthMiddleware');
const { rateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
const lazaiController = new EnhancedLazAIController();

// Initialize controller
lazaiController.initialize().catch(console.error);

// Apply rate limiting to all routes
router.use(rateLimiter);

/**
 * @route POST /api/lazai/inference
 * @desc Run inference with active provider
 * @access Private
 */
router.post('/inference', authenticateToken, async (req, res) => {
    await lazaiController.runInference(req, res);
});

/**
 * @route POST /api/lazai/switch-provider
 * @desc Switch LLM provider
 * @access Private
 */
router.post('/switch-provider', authenticateToken, async (req, res) => {
    await lazaiController.switchProvider(req, res);
});

/**
 * @route GET /api/lazai/providers
 * @desc Get available providers and models
 * @access Public
 */
router.get('/providers', async (req, res) => {
    await lazaiController.getProviders(req, res);
});

/**
 * @route POST /api/lazai/inference/:provider
 * @desc Run inference with specific provider
 * @access Private
 */
router.post('/inference/:provider', authenticateToken, async (req, res) => {
    await lazaiController.runInferenceWithProvider(req, res);
});

/**
 * @route POST /api/lazai/chain-queries
 * @desc Chain multiple queries across different NFTs/DATs
 * @access Private
 */
router.post('/chain-queries', authenticateToken, async (req, res) => {
    await lazaiController.chainQueries(req, res);
});

/**
 * @route GET /api/lazai/analytics
 * @desc Get query analytics and performance metrics
 * @access Public
 */
router.get('/analytics', async (req, res) => {
    await lazaiController.getQueryAnalytics(req, res);
});

/**
 * @route POST /api/lazai/upload-encrypted
 * @desc Upload encrypted data with wallet signature verification
 * @access Private
 */
router.post('/upload-encrypted', authenticateToken, async (req, res) => {
    await lazaiController.uploadEncryptedData(req, res);
});

/**
 * @route GET /api/lazai/performance
 * @desc Get inference performance metrics
 * @access Public
 */
router.get('/performance', async (req, res) => {
    await lazaiController.getPerformanceMetrics(req, res);
});

/**
 * @route GET /api/lazai/test/:provider
 * @desc Test provider connectivity
 * @access Public
 */
router.get('/test/:provider', async (req, res) => {
    await lazaiController.testProvider(req, res);
});

module.exports = router;
