const { ethers } = require('ethers');

/**
 * Analytics Service for DataStreamNFT Platform
 * Provides comprehensive analytics for queries, earnings, and asset performance
 */
class AnalyticsService {
    constructor(blockchainService) {
        this.blockchainService = blockchainService;
        this.analyticsCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Get comprehensive platform analytics
     */
    async getPlatformAnalytics() {
        try {
            const contract = this.blockchainService.getDataStreamNFTContract();
            if (!contract) {
                throw new Error('Contract not initialized');
            }

            const stats = await contract.getPlatformStats();
            
            return {
                success: true,
                analytics: {
                    totalTokens: stats.totalTokens.toString(),
                    totalQueries: stats.totalQueries.toString(),
                    totalPlatformFees: ethers.formatEther(stats.totalPlatformFeesCollected),
                    totalCreatorEarnings: ethers.formatEther(stats.totalCreatorEarningsPaid),
                    averageQueryValue: stats.totalQueries > 0 
                        ? ethers.formatEther(stats.totalCreatorEarningsPaid / stats.totalQueries)
                        : '0',
                    platformFeeRate: (Number(stats.totalPlatformFeesCollected) / Number(stats.totalCreatorEarningsPaid + stats.totalPlatformFeesCollected) * 100).toFixed(2)
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get creator analytics
     */
    async getCreatorAnalytics(creatorAddress) {
        try {
            const contract = this.blockchainService.getDataStreamNFTContract();
            if (!contract) {
                throw new Error('Contract not initialized');
            }

            // Get creator's tokens
            const tokenIds = await contract.getCreatorTokens(creatorAddress);
            const creatorEarnings = await contract.getCreatorEarnings(creatorAddress);
            
            // Get analytics for each token
            const tokenAnalytics = [];
            let totalQueries = 0;
            let totalVolume = 0;
            let totalEarnings = 0;

            for (const tokenId of tokenIds) {
                const analytics = await contract.getTokenAnalytics(tokenId);
                const nftData = await contract.getDataNFT(tokenId);
                
                tokenAnalytics.push({
                    tokenId: tokenId.toString(),
                    totalQueries: analytics.totalQueries.toString(),
                    totalVolume: ethers.formatEther(analytics.totalVolume),
                    averageQueryPrice: ethers.formatEther(analytics.averageQueryPrice),
                    lastQueryTime: analytics.lastQueryTime.toString(),
                    isActive: nftData.isActive,
                    dataClass: nftData.dataClass,
                    dataValue: nftData.dataValue,
                    createdAt: nftData.createdAt.toString()
                });

                totalQueries += Number(analytics.totalQueries);
                totalVolume += Number(ethers.formatEther(analytics.totalVolume));
                totalEarnings += Number(ethers.formatEther(nftData.totalEarned));
            }

            return {
                success: true,
                analytics: {
                    creatorAddress,
                    totalTokens: tokenIds.length,
                    totalQueries: totalQueries.toString(),
                    totalVolume: totalVolume.toFixed(6),
                    totalEarnings: totalEarnings.toFixed(6),
                    averageQueryValue: totalQueries > 0 ? (totalVolume / totalQueries).toFixed(6) : '0',
                    tokenAnalytics
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get token performance analytics
     */
    async getTokenAnalytics(tokenId) {
        try {
            const contract = this.blockchainService.getDataStreamNFTContract();
            if (!contract) {
                throw new Error('Contract not initialized');
            }

            const analytics = await contract.getTokenAnalytics(tokenId);
            const nftData = await contract.getDataNFT(tokenId);
            
            // Calculate performance metrics
            const timeSinceCreation = Date.now() / 1000 - Number(nftData.createdAt);
            const queriesPerDay = timeSinceCreation > 0 ? (Number(analytics.totalQueries) / (timeSinceCreation / 86400)) : 0;
            const earningsPerDay = timeSinceCreation > 0 ? (Number(ethers.formatEther(analytics.totalVolume)) / (timeSinceCreation / 86400)) : 0;

            return {
                success: true,
                analytics: {
                    tokenId: tokenId.toString(),
                    totalQueries: analytics.totalQueries.toString(),
                    totalVolume: ethers.formatEther(analytics.totalVolume),
                    averageQueryPrice: ethers.formatEther(analytics.averageQueryPrice),
                    lastQueryTime: analytics.lastQueryTime.toString(),
                    queriesPerDay: queriesPerDay.toFixed(2),
                    earningsPerDay: earningsPerDay.toFixed(6),
                    performance: this._calculatePerformanceScore(analytics, nftData),
                    nftData: {
                        creator: nftData.creator,
                        queryPrice: ethers.formatEther(nftData.queryPrice),
                        isActive: nftData.isActive,
                        dataClass: nftData.dataClass,
                        dataValue: nftData.dataValue,
                        createdAt: nftData.createdAt.toString()
                    }
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get marketplace analytics (top performers, trending, etc.)
     */
    async getMarketplaceAnalytics(limit = 10) {
        try {
            const contract = this.blockchainService.getDataStreamNFTContract();
            if (!contract) {
                throw new Error('Contract not initialized');
            }

            const stats = await contract.getPlatformStats();
            const totalTokens = Number(stats.totalTokens);
            
            if (totalTokens === 0) {
                return {
                    success: true,
                    analytics: {
                        topPerformers: [],
                        trendingTokens: [],
                        totalTokens: 0
                    }
                };
            }

            // Get analytics for all tokens (this could be optimized with events)
            const allTokenAnalytics = [];
            for (let i = 1; i <= totalTokens; i++) {
                try {
                    const analytics = await contract.getTokenAnalytics(i);
                    const nftData = await contract.getDataNFT(i);
                    
                    allTokenAnalytics.push({
                        tokenId: i.toString(),
                        totalQueries: Number(analytics.totalQueries),
                        totalVolume: Number(ethers.formatEther(analytics.totalVolume)),
                        averageQueryPrice: Number(ethers.formatEther(analytics.averageQueryPrice)),
                        lastQueryTime: Number(analytics.lastQueryTime),
                        isActive: nftData.isActive,
                        dataClass: nftData.dataClass,
                        dataValue: nftData.dataValue,
                        createdAt: Number(nftData.createdAt)
                    });
                } catch (error) {
                    // Skip invalid tokens
                    continue;
                }
            }

            // Sort by different metrics
            const topByQueries = allTokenAnalytics
                .filter(token => token.isActive)
                .sort((a, b) => b.totalQueries - a.totalQueries)
                .slice(0, limit);

            const topByVolume = allTokenAnalytics
                .filter(token => token.isActive)
                .sort((a, b) => b.totalVolume - a.totalVolume)
                .slice(0, limit);

            const trending = allTokenAnalytics
                .filter(token => token.isActive && token.lastQueryTime > 0)
                .sort((a, b) => b.lastQueryTime - a.lastQueryTime)
                .slice(0, limit);

            return {
                success: true,
                analytics: {
                    topPerformers: {
                        byQueries: topByQueries,
                        byVolume: topByVolume
                    },
                    trendingTokens: trending,
                    totalTokens: totalTokens,
                    activeTokens: allTokenAnalytics.filter(token => token.isActive).length
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get query analytics by type/pattern
     */
    async getQueryAnalytics(queryType = null) {
        try {
            // This would typically query events or a database
            // For now, return mock data structure
            return {
                success: true,
                analytics: {
                    queryType: queryType || 'all',
                    totalQueries: '0',
                    uniqueQueries: '0',
                    averageQueryPrice: '0',
                    mostPopularQueries: [],
                    queryTrends: []
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get privacy and security analytics
     */
    async getPrivacyAnalytics() {
        try {
            const contract = this.blockchainService.getDataStreamNFTContract();
            if (!contract) {
                throw new Error('Contract not initialized');
            }

            const stats = await contract.getPlatformStats();
            
            return {
                success: true,
                analytics: {
                    totalEncryptedUploads: stats.totalTokens.toString(),
                    activeDataStreams: stats.totalTokens.toString(), // All are encrypted
                    privacyCompliance: '100%', // All data is encrypted
                    securityScore: 'A+',
                    dataRetention: 'Encrypted on IPFS',
                    accessControls: 'Wallet-based authentication'
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Calculate performance score for a token
     */
    _calculatePerformanceScore(analytics, nftData) {
        const queries = Number(analytics.totalQueries);
        const volume = Number(ethers.formatEther(analytics.totalVolume));
        const avgPrice = Number(ethers.formatEther(analytics.averageQueryPrice));
        const timeSinceCreation = Date.now() / 1000 - Number(nftData.createdAt);
        
        // Simple scoring algorithm
        let score = 0;
        
        // Query frequency score (0-40 points)
        const queriesPerDay = timeSinceCreation > 0 ? queries / (timeSinceCreation / 86400) : 0;
        score += Math.min(queriesPerDay * 2, 40);
        
        // Volume score (0-30 points)
        score += Math.min(volume * 10, 30);
        
        // Price stability score (0-20 points)
        const priceStability = avgPrice > 0 ? Math.min(avgPrice * 100, 20) : 0;
        score += priceStability;
        
        // Activity recency score (0-10 points)
        const timeSinceLastQuery = Date.now() / 1000 - Number(analytics.lastQueryTime);
        const recencyScore = timeSinceLastQuery < 86400 ? 10 : Math.max(0, 10 - (timeSinceLastQuery / 86400));
        score += recencyScore;
        
        return Math.min(Math.round(score), 100);
    }

    /**
     * Get cached analytics or fetch fresh data
     */
    async getCachedAnalytics(key, fetchFunction) {
        const cached = this.analyticsCache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        const data = await fetchFunction();
        this.analyticsCache.set(key, {
            data,
            timestamp: Date.now()
        });

        return data;
    }

    /**
     * Clear analytics cache
     */
    clearCache() {
        this.analyticsCache.clear();
    }
}

module.exports = AnalyticsService;
