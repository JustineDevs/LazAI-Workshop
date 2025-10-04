const EnhancedLazAIService = require('../services/EnhancedLazAIService');
const BlockchainService = require('../services/BlockchainService');

/**
 * Enhanced LazAI Controller
 * Handles multi-LLM inference, provider switching, and query chaining
 */
class EnhancedLazAIController {
    constructor() {
        this.lazaiService = new EnhancedLazAIService();
        this.blockchainService = new BlockchainService();
    }

    /**
     * Initialize the controller
     */
    async initialize() {
        await this.blockchainService.initialize();
    }

    /**
     * Run inference with active provider
     */
    async runInference(req, res) {
        try {
            const { fileId, query, options = {} } = req.body;
            
            if (!fileId || !query) {
                return res.status(400).json({
                    success: false,
                    error: 'File ID and query are required'
                });
            }

            const result = await this.lazaiService.runInference(fileId, query, options);
            
            res.json({
                success: result.success,
                data: result.success ? {
                    result: result.result,
                    provider: result.provider,
                    model: result.model,
                    usage: result.usage,
                    duration: result.duration,
                    queryId: result.queryId
                } : null,
                error: result.error || null,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Inference error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to run inference'
            });
        }
    }

    /**
     * Switch LLM provider
     */
    async switchProvider(req, res) {
        try {
            const { provider, model } = req.body;
            
            if (!provider) {
                return res.status(400).json({
                    success: false,
                    error: 'Provider is required'
                });
            }

            const result = await this.lazaiService.switchProvider(provider, model);
            
            res.json({
                success: result.success,
                data: result,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Provider switch error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get available providers
     */
    async getProviders(req, res) {
        try {
            const providers = this.lazaiService.getAvailableProviders();
            
            res.json({
                success: true,
                data: providers,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Get providers error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get providers'
            });
        }
    }

    /**
     * Run inference with specific provider
     */
    async runInferenceWithProvider(req, res) {
        try {
            const { provider, fileId, query, options = {} } = req.body;
            
            if (!provider || !fileId || !query) {
                return res.status(400).json({
                    success: false,
                    error: 'Provider, File ID, and query are required'
                });
            }

            const result = await this.lazaiService.runInferenceWithProvider(provider, fileId, query, options);
            
            res.json({
                success: result.success,
                data: result.success ? {
                    result: result.result,
                    provider: result.provider,
                    model: result.model,
                    usage: result.usage,
                    duration: result.duration,
                    queryId: result.queryId
                } : null,
                error: result.error || null,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Provider inference error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to run inference with provider'
            });
        }
    }

    /**
     * Chain multiple queries
     */
    async chainQueries(req, res) {
        try {
            const { queries, options = {} } = req.body;
            
            if (!queries || !Array.isArray(queries) || queries.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Queries array is required and must not be empty'
                });
            }

            const result = await this.lazaiService.chainQueries(queries, options);
            
            res.json({
                success: result.success,
                data: result.success ? {
                    results: result.results,
                    totalQueries: result.totalQueries,
                    successfulQueries: result.successfulQueries
                } : null,
                error: result.error || null,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Query chaining error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to chain queries'
            });
        }
    }

    /**
     * Get query analytics
     */
    async getQueryAnalytics(req, res) {
        try {
            const { fileId } = req.query;
            
            const analytics = this.lazaiService.getQueryAnalytics(fileId);
            
            res.json({
                success: true,
                data: analytics,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Query analytics error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get query analytics'
            });
        }
    }

    /**
     * Upload encrypted data with enhanced privacy
     */
    async uploadEncryptedData(req, res) {
        try {
            const { file, title, description, dataClass, dataValue } = req.body;
            
            if (!file || !title || !description) {
                return res.status(400).json({
                    success: false,
                    error: 'File, title, and description are required'
                });
            }

            // Enhanced encryption with wallet signature
            const walletSignature = req.headers['x-wallet-signature'];
            if (!walletSignature) {
                return res.status(400).json({
                    success: false,
                    error: 'Wallet signature is required for data upload'
                });
            }

            // Verify wallet signature
            const isValidSignature = await this._verifyWalletSignature(file, walletSignature);
            if (!isValidSignature) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid wallet signature'
                });
            }

            // Process encrypted upload
            const uploadResult = await this._processEncryptedUpload(file, title, description, dataClass, dataValue);
            
            res.json({
                success: true,
                data: uploadResult,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Encrypted upload error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to upload encrypted data'
            });
        }
    }

    /**
     * Get inference performance metrics
     */
    async getPerformanceMetrics(req, res) {
        try {
            const analytics = this.lazaiService.getQueryAnalytics();
            
            res.json({
                success: true,
                data: {
                    performance: analytics,
                    recommendations: this._generatePerformanceRecommendations(analytics)
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Performance metrics error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get performance metrics'
            });
        }
    }

    /**
     * Test provider connectivity
     */
    async testProvider(req, res) {
        try {
            const { provider } = req.params;
            
            if (!provider) {
                return res.status(400).json({
                    success: false,
                    error: 'Provider is required'
                });
            }

            const testResult = await this._testProviderConnectivity(provider);
            
            res.json({
                success: testResult.success,
                data: testResult,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Provider test error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to test provider'
            });
        }
    }

    /**
     * Verify wallet signature
     */
    async _verifyWalletSignature(data, signature) {
        // This would implement proper signature verification
        // For now, return true as a placeholder
        return true;
    }

    /**
     * Process encrypted upload
     */
    async _processEncryptedUpload(file, title, description, dataClass, dataValue) {
        // This would implement proper encrypted upload processing
        // For now, return mock data
        return {
            fileId: `encrypted_${Date.now()}`,
            tokenURI: `ipfs://mock_uri_${Date.now()}`,
            encryptionKey: 'mock_encryption_key',
            uploadTime: new Date().toISOString()
        };
    }

    /**
     * Generate performance recommendations
     */
    _generatePerformanceRecommendations(analytics) {
        const recommendations = [];
        
        if (analytics.averageResponseTime > 5000) {
            recommendations.push({
                type: 'performance',
                message: 'Consider switching to a faster provider for better response times',
                priority: 'high'
            });
        }
        
        if (analytics.totalQueries < 10) {
            recommendations.push({
                type: 'usage',
                message: 'Increase query frequency to improve data monetization',
                priority: 'medium'
            });
        }
        
        return recommendations;
    }

    /**
     * Test provider connectivity
     */
    async _testProviderConnectivity(provider) {
        try {
            // Test with a simple query
            const testResult = await this.lazaiService.runInferenceWithProvider(
                provider,
                'test_file_id',
                'Test query for connectivity',
                { maxTokens: 10 }
            );
            
            return {
                success: testResult.success,
                responseTime: testResult.duration || 0,
                error: testResult.error || null
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = EnhancedLazAIController;
