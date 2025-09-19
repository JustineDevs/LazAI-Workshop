const express = require('express');
const router = express.Router();

// Import controllers
const BlockchainController = require('../controllers/BlockchainController');
const ValidationMiddleware = require('../middleware/ValidationMiddleware');
const AuthMiddleware = require('../middleware/AuthMiddleware');

// Initialize controller
const blockchainController = new BlockchainController();

/**
 * @route GET /api/v1/blockchain/network
 * @desc Get blockchain network information
 * @access Public
 */
router.get('/network',
    blockchainController.getNetworkInfo
);

/**
 * @route GET /api/v1/blockchain/balance/:address
 * @desc Get ETH balance for an address
 * @access Public
 */
router.get('/balance/:address',
    ValidationMiddleware.validateEthereumAddress,
    blockchainController.getBalance
);

/**
 * @route GET /api/v1/blockchain/dat-balance/:address
 * @desc Get DAT token balance for an address
 * @access Public
 */
router.get('/dat-balance/:address',
    ValidationMiddleware.validateEthereumAddress,
    blockchainController.getDATBalance
);

/**
 * @route GET /api/v1/blockchain/contract/:address
 * @desc Get contract information
 * @access Public
 */
router.get('/contract/:address',
    ValidationMiddleware.validateEthereumAddress,
    blockchainController.getContractInfo
);

/**
 * @route POST /api/v1/blockchain/approve
 * @desc Approve DAT tokens for spending
 * @access Private
 */
router.post('/approve',
    AuthMiddleware.authenticate,
    blockchainController.approveTokens
);

/**
 * @route GET /api/v1/blockchain/allowance/:owner/:spender
 * @desc Get token allowance
 * @access Public
 */
router.get('/allowance/:owner/:spender',
    ValidationMiddleware.validateEthereumAddress,
    blockchainController.getAllowance
);

/**
 * @route GET /api/v1/blockchain/transaction/:hash
 * @desc Get transaction details
 * @access Public
 */
router.get('/transaction/:hash',
    blockchainController.getTransaction
);

/**
 * @route GET /api/v1/blockchain/block/:number
 * @desc Get block information
 * @access Public
 */
router.get('/block/:number',
    blockchainController.getBlock
);

/**
 * @route GET /api/v1/blockchain/gas-price
 * @desc Get current gas price
 * @access Public
 */
router.get('/gas-price',
    blockchainController.getGasPrice
);

/**
 * @route POST /api/v1/blockchain/estimate-gas
 * @desc Estimate gas for a transaction
 * @access Public
 */
router.post('/estimate-gas',
    blockchainController.estimateGas
);

module.exports = router;
