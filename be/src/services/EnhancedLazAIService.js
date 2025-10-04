const crypto = require('crypto');
const axios = require('axios');

/**
 * Enhanced LazAI Service with Multi-LLM Support
 * Supports OpenAI, Gemini, Groq, and local models with plug-and-play architecture
 */
class EnhancedLazAIService {
    constructor() {
        this.providers = {
            openai: {
                name: 'OpenAI',
                baseUrl: 'https://api.openai.com/v1',
                models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
                defaultModel: 'gpt-4'
            },
            gemini: {
                name: 'Google Gemini',
                baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
                models: ['gemini-pro', 'gemini-pro-vision'],
                defaultModel: 'gemini-pro'
            },
            groq: {
                name: 'Groq',
                baseUrl: 'https://api.groq.com/openai/v1',
                models: ['llama2-70b-4096', 'mixtral-8x7b-32768'],
                defaultModel: 'llama2-70b-4096'
            },
            local: {
                name: 'Local Model',
                baseUrl: process.env.LOCAL_LLM_URL || 'http://localhost:11434',
                models: ['llama2', 'codellama', 'mistral'],
                defaultModel: 'llama2'
            }
        };
        
        this.activeProvider = process.env.ACTIVE_LLM_PROVIDER || 'openai';
        this.encryptionKey = process.env.ENCRYPTION_KEY || this._generateEncryptionKey();
        this.queryHistory = new Map();
        this.performanceMetrics = new Map();
    }

    /**
     * Run inference with the active LLM provider
     */
    async runInference(fileId, query, options = {}) {
        try {
            const startTime = Date.now();
            
            // Get encrypted data
            const encryptedData = await this._getEncryptedData(fileId);
            if (!encryptedData) {
                throw new Error('Data not found or access denied');
            }

            // Decrypt data
            const decryptedData = await this._decryptData(encryptedData);
            
            // Prepare context for LLM
            const context = await this._prepareContext(decryptedData, query, options);
            
            // Run inference with active provider
            const result = await this._runLLMInference(context, options);
            
            // Track performance
            const duration = Date.now() - startTime;
            this._trackPerformance(fileId, query, duration, result);
            
            // Store query history
            this._storeQueryHistory(fileId, query, result);
            
            return {
                success: true,
                result: result.response,
                provider: this.activeProvider,
                model: result.model,
                usage: result.usage,
                duration: duration,
                timestamp: new Date().toISOString(),
                queryId: result.queryId
            };
            
        } catch (error) {
            console.error('Inference error:', error);
            return {
                success: false,
                error: error.message,
                provider: this.activeProvider
            };
        }
    }

    /**
     * Switch LLM provider
     */
    async switchProvider(providerName, model = null) {
        if (!this.providers[providerName]) {
            throw new Error(`Provider ${providerName} not supported`);
        }

        this.activeProvider = providerName;
        const provider = this.providers[providerName];
        
        if (model && provider.models.includes(model)) {
            provider.defaultModel = model;
        }

        return {
            success: true,
            provider: providerName,
            model: provider.defaultModel,
            availableModels: provider.models
        };
    }

    /**
     * Get available providers and models
     */
    getAvailableProviders() {
        return Object.keys(this.providers).map(key => ({
            name: key,
            displayName: this.providers[key].name,
            models: this.providers[key].models,
            defaultModel: this.providers[key].defaultModel,
            isActive: key === this.activeProvider
        }));
    }

    /**
     * Run inference with specific provider
     */
    async runInferenceWithProvider(providerName, fileId, query, options = {}) {
        const originalProvider = this.activeProvider;
        
        try {
            await this.switchProvider(providerName);
            return await this.runInference(fileId, query, options);
        } finally {
            this.activeProvider = originalProvider;
        }
    }

    /**
     * Chain multiple queries across different NFTs/DATs
     */
    async chainQueries(queries, options = {}) {
        try {
            const results = [];
            let context = '';

            for (const query of queries) {
                const result = await this.runInference(query.fileId, query.query, {
                    ...options,
                    context: context
                });

                if (result.success) {
                    results.push({
                        fileId: query.fileId,
                        query: query.query,
                        result: result.result,
                        provider: result.provider
                    });
                    
                    // Build context for next query
                    context += `\n\nQuery: ${query.query}\nResult: ${result.result}`;
                } else {
                    results.push({
                        fileId: query.fileId,
                        query: query.query,
                        error: result.error
                    });
                }
            }

            return {
                success: true,
                results: results,
                totalQueries: queries.length,
                successfulQueries: results.filter(r => !r.error).length
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get query analytics and performance metrics
     */
    getQueryAnalytics(fileId = null) {
        if (fileId) {
            return {
                fileId,
                queryCount: this.queryHistory.get(fileId)?.length || 0,
                performance: this.performanceMetrics.get(fileId) || {},
                lastQuery: this.queryHistory.get(fileId)?.slice(-1)[0] || null
            };
        }

        return {
            totalQueries: Array.from(this.queryHistory.values()).reduce((sum, queries) => sum + queries.length, 0),
            uniqueFiles: this.queryHistory.size,
            averageResponseTime: this._calculateAverageResponseTime(),
            providerUsage: this._getProviderUsageStats(),
            topQueries: this._getTopQueries()
        };
    }

    /**
     * Run inference with OpenAI
     */
    async _runOpenAIInference(context, options = {}) {
        const provider = this.providers.openai;
        const model = options.model || provider.defaultModel;
        
        const response = await axios.post(
            `${provider.baseUrl}/chat/completions`,
            {
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an AI assistant that analyzes encrypted data streams. Provide accurate, helpful responses based on the provided context.'
                    },
                    {
                        role: 'user',
                        content: context
                    }
                ],
                max_tokens: options.maxTokens || 1000,
                temperature: options.temperature || 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            response: response.data.choices[0].message.content,
            model: model,
            usage: response.data.usage,
            queryId: crypto.randomUUID()
        };
    }

    /**
     * Run inference with Gemini
     */
    async _runGeminiInference(context, options = {}) {
        const provider = this.providers.gemini;
        const model = options.model || provider.defaultModel;
        
        const response = await axios.post(
            `${provider.baseUrl}/models/${model}:generateContent`,
            {
                contents: [{
                    parts: [{
                        text: context
                    }]
                }],
                generationConfig: {
                    maxOutputTokens: options.maxTokens || 1000,
                    temperature: options.temperature || 0.7
                }
            },
            {
                headers: {
                    'x-goog-api-key': process.env.GEMINI_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            response: response.data.candidates[0].content.parts[0].text,
            model: model,
            usage: response.data.usageMetadata,
            queryId: crypto.randomUUID()
        };
    }

    /**
     * Run inference with Groq
     */
    async _runGroqInference(context, options = {}) {
        const provider = this.providers.groq;
        const model = options.model || provider.defaultModel;
        
        const response = await axios.post(
            `${provider.baseUrl}/chat/completions`,
            {
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an AI assistant that analyzes encrypted data streams. Provide accurate, helpful responses based on the provided context.'
                    },
                    {
                        role: 'user',
                        content: context
                    }
                ],
                max_tokens: options.maxTokens || 1000,
                temperature: options.temperature || 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            response: response.data.choices[0].message.content,
            model: model,
            usage: response.data.usage,
            queryId: crypto.randomUUID()
        };
    }

    /**
     * Run inference with local model
     */
    async _runLocalInference(context, options = {}) {
        const provider = this.providers.local;
        const model = options.model || provider.defaultModel;
        
        const response = await axios.post(
            `${provider.baseUrl}/api/generate`,
            {
                model: model,
                prompt: context,
                stream: false,
                options: {
                    temperature: options.temperature || 0.7,
                    num_predict: options.maxTokens || 1000
                }
            }
        );

        return {
            response: response.data.response,
            model: model,
            usage: {
                prompt_tokens: response.data.prompt_eval_count || 0,
                completion_tokens: response.data.eval_count || 0,
                total_tokens: (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0)
            },
            queryId: crypto.randomUUID()
        };
    }

    /**
     * Route to appropriate LLM provider
     */
    async _runLLMInference(context, options = {}) {
        switch (this.activeProvider) {
            case 'openai':
                return await this._runOpenAIInference(context, options);
            case 'gemini':
                return await this._runGeminiInference(context, options);
            case 'groq':
                return await this._runGroqInference(context, options);
            case 'local':
                return await this._runLocalInference(context, options);
            default:
                throw new Error(`Unsupported provider: ${this.activeProvider}`);
        }
    }

    /**
     * Prepare context for LLM
     */
    async _prepareContext(decryptedData, query, options = {}) {
        let context = `Data: ${decryptedData}\n\nQuery: ${query}`;
        
        if (options.context) {
            context = `Previous Context: ${options.context}\n\n${context}`;
        }
        
        if (options.dataClass) {
            context = `Data Class: ${options.dataClass}\n${context}`;
        }
        
        if (options.dataValue) {
            context = `Data Value: ${options.dataValue}\n${context}`;
        }
        
        return context;
    }

    /**
     * Get encrypted data (mock implementation)
     */
    async _getEncryptedData(fileId) {
        // This would typically fetch from IPFS or database
        // For now, return mock encrypted data
        return `encrypted_data_for_${fileId}`;
    }

    /**
     * Decrypt data
     */
    async _decryptData(encryptedData) {
        // This would use proper encryption/decryption
        // For now, return mock decrypted data
        return `Decrypted data: ${encryptedData}`;
    }

    /**
     * Track performance metrics
     */
    _trackPerformance(fileId, query, duration, result) {
        if (!this.performanceMetrics.has(fileId)) {
            this.performanceMetrics.set(fileId, {
                totalQueries: 0,
                totalDuration: 0,
                averageDuration: 0,
                lastQuery: null
            });
        }

        const metrics = this.performanceMetrics.get(fileId);
        metrics.totalQueries++;
        metrics.totalDuration += duration;
        metrics.averageDuration = metrics.totalDuration / metrics.totalQueries;
        metrics.lastQuery = new Date().toISOString();
    }

    /**
     * Store query history
     */
    _storeQueryHistory(fileId, query, result) {
        if (!this.queryHistory.has(fileId)) {
            this.queryHistory.set(fileId, []);
        }

        this.queryHistory.get(fileId).push({
            query,
            result: result.response,
            timestamp: new Date().toISOString(),
            duration: result.duration,
            provider: this.activeProvider
        });
    }

    /**
     * Calculate average response time
     */
    _calculateAverageResponseTime() {
        const allMetrics = Array.from(this.performanceMetrics.values());
        if (allMetrics.length === 0) return 0;
        
        const totalDuration = allMetrics.reduce((sum, metric) => sum + metric.totalDuration, 0);
        const totalQueries = allMetrics.reduce((sum, metric) => sum + metric.totalQueries, 0);
        
        return totalQueries > 0 ? totalDuration / totalQueries : 0;
    }

    /**
     * Get provider usage statistics
     */
    _getProviderUsageStats() {
        const stats = {};
        for (const [fileId, queries] of this.queryHistory) {
            for (const query of queries) {
                const provider = query.provider;
                stats[provider] = (stats[provider] || 0) + 1;
            }
        }
        return stats;
    }

    /**
     * Get top queries
     */
    _getTopQueries() {
        const queryCounts = {};
        for (const [fileId, queries] of this.queryHistory) {
            for (const query of queries) {
                const queryText = query.query;
                queryCounts[queryText] = (queryCounts[queryText] || 0) + 1;
            }
        }
        
        return Object.entries(queryCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([query, count]) => ({ query, count }));
    }

    /**
     * Generate encryption key
     */
    _generateEncryptionKey() {
        return crypto.randomBytes(32).toString('hex');
    }
}

module.exports = EnhancedLazAIService;
