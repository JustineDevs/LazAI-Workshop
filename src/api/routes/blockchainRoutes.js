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
 * @route GET /api/v1/blockchain/contract-info
 * @desc Get DataStreamNFT contract information
 * @access Public
 */
router.get('/contract-info',
    blockchainController.getContractInfo
);

/**
 * @route GET /api/v1/blockchain/data-nft/:tokenId
 * @desc Get Data NFT information
 * @access Public
 */
router.get('/data-nft/:tokenId',
    blockchainController.getDataNFT
);

/**
 * @route GET /api/v1/blockchain/ownership/:tokenId/:address
 * @desc Check if address owns a token
 * @access Public
 */
router.get('/ownership/:tokenId/:address',
    ValidationMiddleware.validateEthereumAddress,
    blockchainController.checkOwnership
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
