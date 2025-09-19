const jwt = require('jsonwebtoken');
const UserModel = require('../../models/UserModel');

class AuthMiddleware {
    /**
     * Authenticate JWT token
     */
    static async authenticate(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({
                    success: false,
                    error: 'Access token required'
                });
            }

            const token = authHeader.substring(7); // Remove 'Bearer ' prefix
            
            if (!token) {
                return res.status(401).json({
                    success: false,
                    error: 'Access token required'
                });
            }

            // Verify JWT token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get user from database
            const user = await UserModel.findById(decoded.userId).select('-password');
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'User not found'
                });
            }

            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    error: 'Account deactivated'
                });
            }

            // Add user to request object
            req.user = user;
            next();

        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid token'
                });
            }

            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    error: 'Token expired'
                });
            }

            console.error('Authentication error:', error);
            return res.status(500).json({
                success: false,
                error: 'Authentication failed'
            });
        }
    }

    /**
     * Optional authentication - doesn't fail if no token provided
     */
    static async optionalAuthenticate(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return next();
            }

            const token = authHeader.substring(7);
            
            if (!token) {
                return next();
            }

            // Verify JWT token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get user from database
            const user = await UserModel.findById(decoded.userId).select('-password');
            
            if (user && user.isActive) {
                req.user = user;
            }

            next();

        } catch (error) {
            // Continue without authentication for optional auth
            next();
        }
    }

    /**
     * Check if user is admin
     */
    static requireAdmin(req, res, next) {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }

        next();
    }

    /**
     * Check if user owns the resource
     */
    static requireOwnership(req, res, next) {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const resourceOwnerId = req.params.userId || req.body.userId;
        
        if (!resourceOwnerId) {
            return res.status(400).json({
                success: false,
                error: 'Resource owner ID required'
            });
        }

        if (req.user._id.toString() !== resourceOwnerId) {
            return res.status(403).json({
                success: false,
                error: 'Access denied. You can only access your own resources.'
            });
        }

        next();
    }

    /**
     * Check if user is verified
     */
    static requireVerification(req, res, next) {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        if (!req.user.isVerified) {
            return res.status(403).json({
                success: false,
                error: 'Account verification required'
            });
        }

        next();
    }

    /**
     * Rate limiting middleware (simple implementation)
     */
    static createRateLimit(windowMs = 15 * 60 * 1000, maxRequests = 100) {
        const requests = new Map();

        return (req, res, next) => {
            const key = req.ip || req.connection.remoteAddress;
            const now = Date.now();
            const windowStart = now - windowMs;

            // Clean old entries
            for (const [ip, timestamps] of requests.entries()) {
                const validTimestamps = timestamps.filter(timestamp => timestamp > windowStart);
                if (validTimestamps.length === 0) {
                    requests.delete(ip);
                } else {
                    requests.set(ip, validTimestamps);
                }
            }

            // Check current IP
            const userRequests = requests.get(key) || [];
            const recentRequests = userRequests.filter(timestamp => timestamp > windowStart);

            if (recentRequests.length >= maxRequests) {
                return res.status(429).json({
                    success: false,
                    error: 'Too many requests',
                    retryAfter: Math.ceil(windowMs / 1000)
                });
            }

            // Add current request
            recentRequests.push(now);
            requests.set(key, recentRequests);

            next();
        };
    }

    /**
     * Generate JWT token
     */
    static generateToken(userId, expiresIn = '7d') {
        return jwt.sign(
            { userId },
            process.env.JWT_SECRET,
            { expiresIn }
        );
    }

    /**
     * Verify JWT token without middleware
     */
    static verifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Extract token from request
     */
    static extractToken(req) {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        
        return null;
    }

    /**
     * Check if user has specific permission
     */
    static hasPermission(permission) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }

            if (!req.user.permissions || !req.user.permissions.includes(permission)) {
                return res.status(403).json({
                    success: false,
                    error: `Permission '${permission}' required`
                });
            }

            next();
        };
    }

    /**
     * Check if user has any of the specified roles
     */
    static hasAnyRole(roles) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }

            if (!req.user.roles || !req.user.roles.some(role => roles.includes(role))) {
                return res.status(403).json({
                    success: false,
                    error: `One of these roles required: ${roles.join(', ')}`
                });
            }

            next();
        };
    }
}

module.exports = AuthMiddleware;
