const express = require('express');
const CommunityService = require('../services/CommunityService');
const { authenticateToken } = require('../middleware/AuthMiddleware');
const { rateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
const communityService = new CommunityService();

// Initialize service
communityService.initialize().catch(console.error);

// Apply rate limiting to all routes
router.use(rateLimiter);

/**
 * @route GET /api/community/faq
 * @desc Get FAQ data
 * @access Public
 */
router.get('/faq', async (req, res) => {
    try {
        const { category } = req.query;
        const faqData = communityService.getFAQData(category);
        
        res.json({
            success: true,
            data: faqData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('FAQ fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch FAQ data'
        });
    }
});

/**
 * @route GET /api/community/faq/search
 * @desc Search FAQ
 * @access Public
 */
router.get('/faq/search', async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                error: 'Search query is required'
            });
        }
        
        const searchResults = communityService.searchFAQ(q);
        
        res.json({
            success: true,
            data: searchResults,
            query: q,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('FAQ search error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search FAQ'
        });
    }
});

/**
 * @route GET /api/community/leaderboard
 * @desc Get leaderboard data
 * @access Public
 */
router.get('/leaderboard', async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const leaderboard = communityService.getLeaderboard(parseInt(limit));
        
        res.json({
            success: true,
            data: leaderboard,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Leaderboard fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch leaderboard data'
        });
    }
});

/**
 * @route GET /api/community/stats
 * @desc Get community statistics
 * @access Public
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = communityService.getCommunityStats();
        
        res.json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Community stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch community stats'
        });
    }
});

/**
 * @route GET /api/community/links
 * @desc Get community links
 * @access Public
 */
router.get('/links', async (req, res) => {
    try {
        const links = communityService.getCommunityLinks();
        
        res.json({
            success: true,
            data: links,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Community links error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch community links'
        });
    }
});

/**
 * @route GET /api/community/achievements
 * @desc Get available achievements
 * @access Public
 */
router.get('/achievements', async (req, res) => {
    try {
        const achievements = communityService.getCommunityAchievements();
        
        res.json({
            success: true,
            data: achievements,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Achievements fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch achievements'
        });
    }
});

/**
 * @route GET /api/community/user/:address/rank
 * @desc Get user's community rank
 * @access Public
 */
router.get('/user/:address/rank', async (req, res) => {
    try {
        const { address } = req.params;
        
        if (!address) {
            return res.status(400).json({
                success: false,
                error: 'User address is required'
            });
        }
        
        const rank = communityService.getUserRank(address);
        
        res.json({
            success: true,
            data: rank,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('User rank error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user rank'
        });
    }
});

/**
 * @route POST /api/community/notify/upload
 * @desc Send upload notification to Discord
 * @access Private
 */
router.post('/notify/upload', authenticateToken, async (req, res) => {
    try {
        const { title, creator, dataClass, dataValue, queryPrice } = req.body;
        
        if (!title || !creator) {
            return res.status(400).json({
                success: false,
                error: 'Title and creator are required'
            });
        }
        
        const result = await communityService.sendUploadNotification({
            title,
            creator,
            dataClass,
            dataValue,
            queryPrice
        });
        
        res.json({
            success: result.success,
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Upload notification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send upload notification'
        });
    }
});

/**
 * @route POST /api/community/notify/query
 * @desc Send query notification to Discord
 * @access Private
 */
router.post('/notify/query', authenticateToken, async (req, res) => {
    try {
        const { title, query, tokenId, payment, provider } = req.body;
        
        if (!title || !query || !tokenId) {
            return res.status(400).json({
                success: false,
                error: 'Title, query, and tokenId are required'
            });
        }
        
        const result = await communityService.sendQueryNotification({
            title,
            query,
            tokenId,
            payment,
            provider
        });
        
        res.json({
            success: result.success,
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Query notification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send query notification'
        });
    }
});

/**
 * @route POST /api/community/notify/welcome
 * @desc Send welcome notification to Discord
 * @access Private
 */
router.post('/notify/welcome', authenticateToken, async (req, res) => {
    try {
        const { address } = req.body;
        
        if (!address) {
            return res.status(400).json({
                success: false,
                error: 'Address is required'
            });
        }
        
        const result = await communityService.sendWelcomeMessage(address);
        
        res.json({
            success: result.success,
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Welcome notification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send welcome notification'
        });
    }
});

/**
 * @route PUT /api/community/leaderboard/update
 * @desc Update user leaderboard position
 * @access Private
 */
router.put('/leaderboard/update', authenticateToken, async (req, res) => {
    try {
        const { address, earnings, queries, performanceScore } = req.body;
        
        if (!address || !earnings || !queries || !performanceScore) {
            return res.status(400).json({
                success: false,
                error: 'Address, earnings, queries, and performanceScore are required'
            });
        }
        
        await communityService.updateUserLeaderboard(address, earnings, queries, performanceScore);
        
        res.json({
            success: true,
            message: 'Leaderboard updated successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Leaderboard update error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update leaderboard'
        });
    }
});

module.exports = router;
