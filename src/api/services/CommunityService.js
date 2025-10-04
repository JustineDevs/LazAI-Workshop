const axios = require('axios');

/**
 * Community Service for DataStreamNFT
 * Handles Discord integration, FAQ management, and community features
 */
class CommunityService {
    constructor() {
        this.discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
        this.discordBotToken = process.env.DISCORD_BOT_TOKEN;
        this.discordGuildId = process.env.DISCORD_GUILD_ID;
        this.faqData = new Map();
        this.leaderboardData = new Map();
        this.communityStats = {
            totalUsers: 0,
            totalQueries: 0,
            totalEarnings: 0,
            activeUsers: 0
        };
    }

    /**
     * Initialize the service
     */
    async initialize() {
        await this.loadFAQData();
        await this.loadLeaderboardData();
        await this.updateCommunityStats();
    }

    /**
     * Send Discord notification
     */
    async sendDiscordNotification(type, data) {
        try {
            if (!this.discordWebhookUrl) {
                console.log('Discord webhook not configured');
                return { success: false, error: 'Discord not configured' };
            }

            const embed = this.createDiscordEmbed(type, data);
            
            const response = await axios.post(this.discordWebhookUrl, {
                embeds: [embed]
            });

            return {
                success: true,
                messageId: response.data.id
            };
        } catch (error) {
            console.error('Discord notification failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Create Discord embed based on notification type
     */
    createDiscordEmbed(type, data) {
        const baseEmbed = {
            title: 'DataStreamNFT Notification',
            color: 0x3b82f6,
            timestamp: new Date().toISOString(),
            footer: {
                text: 'DataStreamNFT Platform'
            }
        };

        switch (type) {
            case 'new_upload':
                return {
                    ...baseEmbed,
                    title: '📁 New Data Upload',
                    description: `**${data.title}** has been uploaded and encrypted`,
                    fields: [
                        { name: 'Creator', value: data.creator, inline: true },
                        { name: 'Data Class', value: data.dataClass, inline: true },
                        { name: 'Data Value', value: data.dataValue, inline: true },
                        { name: 'Query Price', value: `${data.queryPrice} ETH`, inline: true }
                    ],
                    color: 0x10b981
                };

            case 'query_completed':
                return {
                    ...baseEmbed,
                    title: '🤖 Query Completed',
                    description: `AI query completed on **${data.title}**`,
                    fields: [
                        { name: 'Query', value: data.query.substring(0, 100) + '...', inline: false },
                        { name: 'Token ID', value: data.tokenId, inline: true },
                        { name: 'Payment', value: `${data.payment} ETH`, inline: true },
                        { name: 'Provider', value: data.provider, inline: true }
                    ],
                    color: 0x8b5cf6
                };

            case 'earnings_milestone':
                return {
                    ...baseEmbed,
                    title: '💰 Earnings Milestone',
                    description: `**${data.creator}** reached a new earnings milestone!`,
                    fields: [
                        { name: 'Total Earnings', value: `${data.totalEarnings} ETH`, inline: true },
                        { name: 'Total Queries', value: data.totalQueries.toString(), inline: true },
                        { name: 'Performance Score', value: `${data.performanceScore}/100`, inline: true }
                    ],
                    color: 0xf59e0b
                };

            case 'new_user':
                return {
                    ...baseEmbed,
                    title: '👋 New User Joined',
                    description: `Welcome **${data.address}** to DataStreamNFT!`,
                    fields: [
                        { name: 'Address', value: data.address, inline: true },
                        { name: 'Join Time', value: new Date(data.timestamp).toLocaleString(), inline: true }
                    ],
                    color: 0x06b6d4
                };

            default:
                return {
                    ...baseEmbed,
                    description: 'DataStreamNFT platform update',
                    fields: [
                        { name: 'Type', value: type, inline: true },
                        { name: 'Data', value: JSON.stringify(data, null, 2), inline: false }
                    ]
                };
        }
    }

    /**
     * Load FAQ data
     */
    async loadFAQData() {
        const faqItems = [
            {
                id: 'what-is-datastreamnft',
                question: 'What is DataStreamNFT?',
                answer: 'DataStreamNFT is a platform that allows you to monetize your data by allowing AI to query it securely. You upload encrypted data, set a price per query, and earn ETH when AI systems query your data.',
                category: 'general'
            },
            {
                id: 'how-does-encryption-work',
                question: 'How does data encryption work?',
                answer: 'All data is encrypted using AES-256-GCM encryption with keys derived from your wallet signature. This ensures only you can decrypt your data, and it remains private even when stored on IPFS.',
                category: 'security'
            },
            {
                id: 'how-do-i-earn-money',
                question: 'How do I earn money from my data?',
                answer: 'When someone queries your data, they pay the price you set (in ETH). The payment is automatically processed through smart contracts, with a small platform fee deducted. You receive the rest directly to your wallet.',
                category: 'monetization'
            },
            {
                id: 'what-ai-providers-are-supported',
                question: 'What AI providers are supported?',
                answer: 'We support multiple AI providers including OpenAI (GPT-4, GPT-3.5), Google Gemini, Groq (Llama2, Mixtral), and local models. You can switch between providers or use multiple providers for different queries.',
                category: 'ai'
            },
            {
                id: 'how-do-i-set-query-prices',
                question: 'How do I set query prices?',
                answer: 'You can set your query price when minting your Data Anchoring Token (DAT). We recommend starting with 0.001-0.01 ETH per query. You can update prices anytime through your dashboard.',
                category: 'pricing'
            },
            {
                id: 'is-my-data-private',
                question: 'Is my data private and secure?',
                answer: 'Yes! Your data is encrypted before upload and stored on IPFS. Only you have the decryption key. AI queries are processed without exposing your raw data, and all transactions are recorded on the blockchain for transparency.',
                category: 'privacy'
            },
            {
                id: 'how-do-i-track-earnings',
                question: 'How do I track my earnings?',
                answer: 'Your dashboard shows real-time earnings, query statistics, and performance metrics. You can see total earnings, queries per token, and performance scores to optimize your data monetization strategy.',
                category: 'analytics'
            },
            {
                id: 'what-file-types-are-supported',
                question: 'What file types are supported?',
                answer: 'We support all file types including CSV, JSON, TXT, PDF, images, and more. The platform automatically handles encryption and storage regardless of file type.',
                category: 'technical'
            },
            {
                id: 'how-do-i-connect-my-wallet',
                question: 'How do I connect my wallet?',
                answer: 'Click the "Connect Wallet" button and select your preferred wallet (MetaMask, WalletConnect, etc.). You\'ll need to sign a message to verify ownership and enable secure operations.',
                category: 'wallet'
            },
            {
                id: 'what-are-data-classes',
                question: 'What are data classes and values?',
                answer: 'Data classes categorize your data (model, reference, asset, dataset). Data values indicate quality (low, medium, high). These help users find relevant data and set appropriate pricing.',
                category: 'classification'
            }
        ];

        faqItems.forEach(item => {
            this.faqData.set(item.id, item);
        });
    }

    /**
     * Get FAQ data
     */
    getFAQData(category = null) {
        const faqs = Array.from(this.faqData.values());
        
        if (category) {
            return faqs.filter(faq => faq.category === category);
        }
        
        return faqs;
    }

    /**
     * Search FAQ
     */
    searchFAQ(query) {
        const faqs = Array.from(this.faqData.values());
        const searchTerm = query.toLowerCase();
        
        return faqs.filter(faq => 
            faq.question.toLowerCase().includes(searchTerm) ||
            faq.answer.toLowerCase().includes(searchTerm)
        );
    }

    /**
     * Load leaderboard data
     */
    async loadLeaderboardData() {
        // This would typically load from a database
        // For now, we'll use mock data
        const mockLeaderboard = [
            {
                address: '0x1234...5678',
                totalEarnings: '12.5',
                totalQueries: 1250,
                performanceScore: 95,
                rank: 1
            },
            {
                address: '0x2345...6789',
                totalEarnings: '8.7',
                totalQueries: 870,
                performanceScore: 88,
                rank: 2
            },
            {
                address: '0x3456...7890',
                totalEarnings: '6.2',
                totalQueries: 620,
                performanceScore: 82,
                rank: 3
            }
        ];

        mockLeaderboard.forEach(user => {
            this.leaderboardData.set(user.address, user);
        });
    }

    /**
     * Get leaderboard data
     */
    getLeaderboard(limit = 10) {
        const leaderboard = Array.from(this.leaderboardData.values())
            .sort((a, b) => b.totalEarnings - a.totalEarnings)
            .slice(0, limit);

        return leaderboard;
    }

    /**
     * Update user leaderboard position
     */
    async updateUserLeaderboard(address, earnings, queries, performanceScore) {
        const userData = {
            address,
            totalEarnings: earnings,
            totalQueries: queries,
            performanceScore,
            lastUpdated: Date.now()
        };

        this.leaderboardData.set(address, userData);
        
        // Send Discord notification for milestones
        if (parseFloat(earnings) >= 10) {
            await this.sendDiscordNotification('earnings_milestone', {
                creator: address,
                totalEarnings: earnings,
                totalQueries: queries,
                performanceScore: performanceScore
            });
        }
    }

    /**
     * Update community stats
     */
    async updateCommunityStats() {
        // This would typically query the database
        // For now, we'll use mock data
        this.communityStats = {
            totalUsers: 1250,
            totalQueries: 15600,
            totalEarnings: '125.7',
            activeUsers: 340
        };
    }

    /**
     * Get community stats
     */
    getCommunityStats() {
        return this.communityStats;
    }

    /**
     * Send welcome message to new user
     */
    async sendWelcomeMessage(address) {
        return await this.sendDiscordNotification('new_user', {
            address: address,
            timestamp: Date.now()
        });
    }

    /**
     * Send data upload notification
     */
    async sendUploadNotification(data) {
        return await this.sendDiscordNotification('new_upload', data);
    }

    /**
     * Send query completion notification
     */
    async sendQueryNotification(data) {
        return await this.sendDiscordNotification('query_completed', data);
    }

    /**
     * Get Discord server invite
     */
    getDiscordInvite() {
        return process.env.DISCORD_INVITE_URL || 'https://discord.gg/datastreamnft';
    }

    /**
     * Get community links
     */
    getCommunityLinks() {
        return {
            discord: this.getDiscordInvite(),
            twitter: process.env.TWITTER_URL || 'https://twitter.com/datastreamnft',
            github: process.env.GITHUB_URL || 'https://github.com/datastreamnft',
            telegram: process.env.TELEGRAM_URL || 'https://t.me/datastreamnft'
        };
    }

    /**
     * Get user's community rank
     */
    getUserRank(address) {
        const leaderboard = this.getLeaderboard(100);
        const userIndex = leaderboard.findIndex(user => user.address === address);
        
        if (userIndex === -1) {
            return null;
        }
        
        return {
            rank: userIndex + 1,
            totalUsers: leaderboard.length,
            user: leaderboard[userIndex]
        };
    }

    /**
     * Get community achievements
     */
    getCommunityAchievements() {
        return [
            {
                id: 'first_upload',
                name: 'Data Pioneer',
                description: 'Upload your first dataset',
                icon: '🚀',
                requirement: 1
            },
            {
                id: 'first_earnings',
                name: 'First Earnings',
                description: 'Earn your first ETH from queries',
                icon: '💰',
                requirement: 0.001
            },
            {
                id: 'query_master',
                name: 'Query Master',
                description: 'Reach 100 total queries',
                icon: '🎯',
                requirement: 100
            },
            {
                id: 'earnings_milestone',
                name: 'Earnings Milestone',
                description: 'Earn 10 ETH total',
                icon: '💎',
                requirement: 10
            },
            {
                id: 'top_performer',
                name: 'Top Performer',
                description: 'Reach top 10 in leaderboard',
                icon: '🏆',
                requirement: 10
            }
        ];
    }
}

module.exports = CommunityService;
