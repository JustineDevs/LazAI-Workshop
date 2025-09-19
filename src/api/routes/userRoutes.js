const express = require('express');
const router = express.Router();

// Import controllers
const UserController = require('../controllers/UserController');
const ValidationMiddleware = require('../middleware/ValidationMiddleware');
const AuthMiddleware = require('../middleware/AuthMiddleware');

// Initialize controller
const userController = new UserController();

/**
 * @route POST /api/v1/users/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register',
    ValidationMiddleware.validateUserRegistration,
    userController.register
);

/**
 * @route POST /api/v1/users/login
 * @desc Login user
 * @access Public
 */
router.post('/login',
    ValidationMiddleware.validateUserLogin,
    userController.login
);

/**
 * @route GET /api/v1/users/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile',
    AuthMiddleware.authenticate,
    userController.getProfile
);

/**
 * @route PUT /api/v1/users/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile',
    AuthMiddleware.authenticate,
    userController.updateProfile
);

/**
 * @route GET /api/v1/users/:address
 * @desc Get user profile by address
 * @access Public
 */
router.get('/:address',
    ValidationMiddleware.validateEthereumAddress,
    userController.getUserByAddress
);

/**
 * @route GET /api/v1/users/:address/datastreams
 * @desc Get user's data streams
 * @access Public
 */
router.get('/:address/datastreams',
    ValidationMiddleware.validateEthereumAddress,
    userController.getUserDataStreams
);

/**
 * @route GET /api/v1/users/:address/stats
 * @desc Get user statistics
 * @access Public
 */
router.get('/:address/stats',
    ValidationMiddleware.validateEthereumAddress,
    userController.getUserStats
);

/**
 * @route POST /api/v1/users/refresh-token
 * @desc Refresh JWT token
 * @access Private
 */
router.post('/refresh-token',
    AuthMiddleware.authenticate,
    userController.refreshToken
);

/**
 * @route POST /api/v1/users/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout',
    AuthMiddleware.authenticate,
    userController.logout
);

/**
 * @route GET /api/v1/users/leaderboard/earners
 * @desc Get top earners leaderboard
 * @access Public
 */
router.get('/leaderboard/earners',
    userController.getTopEarners
);

/**
 * @route GET /api/v1/users/leaderboard/creators
 * @desc Get top creators leaderboard
 * @access Public
 */
router.get('/leaderboard/creators',
    userController.getTopCreators
);

/**
 * @route GET /api/v1/users/search
 * @desc Search users
 * @access Public
 */
router.get('/search',
    userController.searchUsers
);

module.exports = router;
