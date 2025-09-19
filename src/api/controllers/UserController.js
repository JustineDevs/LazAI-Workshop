const UserModel = require('../../models/UserModel');
const DataStreamModel = require('../../models/DataStreamModel');
const AuthMiddleware = require('../middleware/AuthMiddleware');

class UserController {
    /**
     * Register a new user
     */
    async register(req, res, next) {
        try {
            const { address, username, email, password, profile } = req.body;

            // Check if user already exists
            const existingUser = await UserModel.findOne({
                $or: [
                    { address: address.toLowerCase() },
                    { username: username.toLowerCase() },
                    { email: email.toLowerCase() }
                ]
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    error: 'User already exists with this address, username, or email'
                });
            }

            // Create new user
            const user = new UserModel({
                address: address.toLowerCase(),
                username: username.toLowerCase(),
                email: email.toLowerCase(),
                password,
                profile: profile || {}
            });

            await user.save();

            // Generate JWT token
            const token = AuthMiddleware.generateToken(user._id);

            // Remove password from response
            const userResponse = user.toObject();
            delete userResponse.password;

            res.status(201).json({
                success: true,
                data: {
                    user: userResponse,
                    token
                },
                message: 'User registered successfully'
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Login user
     */
    async login(req, res, next) {
        try {
            const { identifier, password } = req.body;

            // Find user by identifier (email, username, or address)
            const user = await UserModel.findOne({
                $or: [
                    { email: identifier.toLowerCase() },
                    { username: identifier.toLowerCase() },
                    { address: identifier.toLowerCase() }
                ]
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid credentials'
                });
            }

            // Check if account is active
            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    error: 'Account is deactivated'
                });
            }

            // Verify password
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid credentials'
                });
            }

            // Update last login
            await user.updateLastLogin();

            // Generate JWT token
            const token = AuthMiddleware.generateToken(user._id);

            // Remove password from response
            const userResponse = user.toObject();
            delete userResponse.password;

            res.json({
                success: true,
                data: {
                    user: userResponse,
                    token
                },
                message: 'Login successful'
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Get current user profile
     */
    async getProfile(req, res, next) {
        try {
            const user = req.user;

            // Get additional stats
            const dataStreamCount = await DataStreamModel.countDocuments({ creator: user._id });
            const totalQueries = await DataStreamModel.aggregate([
                { $match: { creator: user._id } },
                { $group: { _id: null, total: { $sum: '$queryCount' } } }
            ]);

            const userWithStats = {
                ...user.toObject(),
                stats: {
                    ...user.stats,
                    totalDataStreams: dataStreamCount,
                    totalQueries: totalQueries[0]?.total || 0
                }
            };

            res.json({
                success: true,
                data: userWithStats
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(req, res, next) {
        try {
            const userId = req.user._id;
            const updates = req.body;

            // Remove fields that shouldn't be updated directly
            delete updates.password;
            delete updates.address;
            delete updates.stats;
            delete updates.isActive;
            delete updates.isVerified;

            const user = await UserModel.findByIdAndUpdate(
                userId,
                { $set: updates },
                { new: true, runValidators: true }
            ).select('-password');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            res.json({
                success: true,
                data: user,
                message: 'Profile updated successfully'
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Get user profile by address
     */
    async getUserByAddress(req, res, next) {
        try {
            const { address } = req.params;

            const user = await UserModel.findOne({ address: address.toLowerCase() })
                .select('-password -email')
                .lean();

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            // Get user's data streams count
            const dataStreamCount = await DataStreamModel.countDocuments({ creator: user._id });

            res.json({
                success: true,
                data: {
                    ...user,
                    dataStreamCount
                }
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Get user's data streams
     */
    async getUserDataStreams(req, res, next) {
        try {
            const { address } = req.params;
            const { page = 1, limit = 10 } = req.query;

            // Find user by address
            const user = await UserModel.findOne({ address: address.toLowerCase() });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            // Get user's data streams
            const dataStreams = await DataStreamModel.find({ creator: user._id })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .populate('creator', 'address username')
                .lean();

            const totalCount = await DataStreamModel.countDocuments({ creator: user._id });

            res.json({
                success: true,
                data: dataStreams,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / parseInt(limit)),
                    totalCount
                }
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Get user statistics
     */
    async getUserStats(req, res, next) {
        try {
            const { address } = req.params;

            // Find user by address
            const user = await UserModel.findOne({ address: address.toLowerCase() });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            // Get detailed stats
            const stats = await DataStreamModel.aggregate([
                { $match: { creator: user._id } },
                {
                    $group: {
                        _id: null,
                        totalDataStreams: { $sum: 1 },
                        totalQueries: { $sum: '$queryCount' },
                        totalEarnings: { $sum: '$totalEarnings' },
                        averageQueryPrice: { $avg: '$queryPrice' },
                        activeDataStreams: {
                            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
                        }
                    }
                }
            ]);

            const userStats = stats[0] || {
                totalDataStreams: 0,
                totalQueries: 0,
                totalEarnings: 0,
                averageQueryPrice: 0,
                activeDataStreams: 0
            };

            res.json({
                success: true,
                data: {
                    address: user.address,
                    username: user.username,
                    stats: userStats,
                    joinedAt: user.createdAt
                }
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Refresh JWT token
     */
    async refreshToken(req, res, next) {
        try {
            const user = req.user;

            // Generate new token
            const token = AuthMiddleware.generateToken(user._id);

            res.json({
                success: true,
                data: {
                    token
                },
                message: 'Token refreshed successfully'
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Logout user
     */
    async logout(req, res, next) {
        try {
            // In a more sophisticated implementation, you might want to
            // blacklist the token or store it in a database
            res.json({
                success: true,
                message: 'Logout successful'
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Get top earners leaderboard
     */
    async getTopEarners(req, res, next) {
        try {
            const { limit = 10 } = req.query;

            const topEarners = await UserModel.getTopEarners(parseInt(limit));

            res.json({
                success: true,
                data: topEarners
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Get top creators leaderboard
     */
    async getTopCreators(req, res, next) {
        try {
            const { limit = 10 } = req.query;

            const topCreators = await UserModel.aggregate([
                { $match: { isActive: true } },
                {
                    $lookup: {
                        from: 'datastreams',
                        localField: '_id',
                        foreignField: 'creator',
                        as: 'dataStreams'
                    }
                },
                {
                    $project: {
                        username: 1,
                        'profile.firstName': 1,
                        'profile.lastName': 1,
                        'stats.totalEarnings': 1,
                        dataStreamCount: { $size: '$dataStreams' },
                        totalQueries: { $sum: '$dataStreams.queryCount' }
                    }
                },
                { $sort: { dataStreamCount: -1 } },
                { $limit: parseInt(limit) }
            ]);

            res.json({
                success: true,
                data: topCreators
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Search users
     */
    async searchUsers(req, res, next) {
        try {
            const { q: searchQuery, page = 1, limit = 10 } = req.query;

            if (!searchQuery) {
                return res.status(400).json({
                    success: false,
                    error: 'Search query is required'
                });
            }

            const users = await UserModel.search(searchQuery, { page, limit });

            res.json({
                success: true,
                data: users
            });

        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController;
