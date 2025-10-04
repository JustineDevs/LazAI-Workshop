const AnalyticsService = require('../services/AnalyticsService');
const BlockchainService = require('../services/BlockchainService');

/**
 * Analytics Controller
 * Handles analytics endpoints for platform, creator, and token performance
 */
class AnalyticsController {
    constructor() {
        this.blockchainService = new BlockchainService();
        this.analyticsService = new AnalyticsService(this.blockchainService);
    }

    /**
     * Initialize the controller
     */
    async initialize() {
        await this.blockchainService.initialize();
    }

    /**
     * Get platform analytics
     */
    async getPlatformAnalytics(req, res) {
        try {
            const result = await this.analyticsService.getPlatformAnalytics();
            
            if (result.success) {
                res.json({
                    success: true,
                    data: result.analytics,
                    timestamp: new Date().toISOString()
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Platform analytics error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch platform analytics'
            });
        }
    }

    /**
     * Get creator analytics
     */
    async getCreatorAnalytics(req, res) {
        try {
            const { address } = req.params;
            
            if (!address) {
                return res.status(400).json({
                    success: false,
                    error: 'Creator address is required'
                });
            }

            const result = await this.analyticsService.getCreatorAnalytics(address);
            
            if (result.success) {
                res.json({
                    success: true,
                    data: result.analytics,
                    timestamp: new Date().toISOString()
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Creator analytics error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch creator analytics'
            });
        }
    }

    /**
     * Get token analytics
     */
    async getTokenAnalytics(req, res) {
        try {
            const { tokenId } = req.params;
            
            if (!tokenId) {
                return res.status(400).json({
                    success: false,
                    error: 'Token ID is required'
                });
            }

            const result = await this.analyticsService.getTokenAnalytics(tokenId);
            
            if (result.success) {
                res.json({
                    success: true,
                    data: result.analytics,
                    timestamp: new Date().toISOString()
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Token analytics error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch token analytics'
            });
        }
    }

    /**
     * Get marketplace analytics
     */
    async getMarketplaceAnalytics(req, res) {
        try {
            const { limit = 10 } = req.query;
            
            const result = await this.analyticsService.getMarketplaceAnalytics(parseInt(limit));
            
            if (result.success) {
                res.json({
                    success: true,
                    data: result.analytics,
                    timestamp: new Date().toISOString()
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Marketplace analytics error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch marketplace analytics'
            });
        }
    }

    /**
     * Get query analytics
     */
    async getQueryAnalytics(req, res) {
        try {
            const { queryType } = req.query;
            
            const result = await this.analyticsService.getQueryAnalytics(queryType);
            
            if (result.success) {
                res.json({
                    success: true,
                    data: result.analytics,
                    timestamp: new Date().toISOString()
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Query analytics error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch query analytics'
            });
        }
    }

    /**
     * Get privacy analytics
     */
    async getPrivacyAnalytics(req, res) {
        try {
            const result = await this.analyticsService.getPrivacyAnalytics();
            
            if (result.success) {
                res.json({
                    success: true,
                    data: result.analytics,
                    timestamp: new Date().toISOString()
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Privacy analytics error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch privacy analytics'
            });
        }
    }

    /**
     * Get dashboard data for a user
     */
    async getDashboardData(req, res) {
        try {
            const { address } = req.params;
            
            if (!address) {
                return res.status(400).json({
                    success: false,
                    error: 'User address is required'
                });
            }

            // Get creator analytics
            const creatorResult = await this.analyticsService.getCreatorAnalytics(address);
            
            // Get platform analytics for comparison
            const platformResult = await this.analyticsService.getPlatformAnalytics();
            
            // Get privacy analytics
            const privacyResult = await this.analyticsService.getPrivacyAnalytics();

            if (creatorResult.success && platformResult.success && privacyResult.success) {
                res.json({
                    success: true,
                    data: {
                        creator: creatorResult.analytics,
                        platform: platformResult.analytics,
                        privacy: privacyResult.analytics,
                        summary: {
                            totalEarnings: creatorResult.analytics.totalEarnings,
                            totalQueries: creatorResult.analytics.totalQueries,
                            totalTokens: creatorResult.analytics.totalTokens,
                            averageQueryValue: creatorResult.analytics.averageQueryValue,
                            performanceScore: this._calculateOverallPerformance(creatorResult.analytics)
                        }
                    },
                    timestamp: new Date().toISOString()
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: 'Failed to fetch dashboard data'
                });
            }
        } catch (error) {
            console.error('Dashboard data error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch dashboard data'
            });
        }
    }

    /**
     * Calculate overall performance score
     */
    _calculateOverallPerformance(analytics) {
        const totalQueries = parseInt(analytics.totalQueries);
        const totalEarnings = parseFloat(analytics.totalEarnings);
        const totalTokens = parseInt(analytics.totalTokens);
        
        if (totalTokens === 0) return 0;
        
        // Calculate performance based on queries per token and earnings
        const queriesPerToken = totalQueries / totalTokens;
        const earningsPerQuery = totalQueries > 0 ? totalEarnings / totalQueries : 0;
        
        // Simple scoring algorithm (0-100)
        let score = 0;
        score += Math.min(queriesPerToken * 20, 40); // Up to 40 points for query frequency
        score += Math.min(earningsPerQuery * 1000, 40); // Up to 40 points for earnings per query
        score += Math.min(totalTokens * 2, 20); // Up to 20 points for token count
        
        return Math.min(Math.round(score), 100);
    }
}

module.exports = AnalyticsController;
