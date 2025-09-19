const express = require('express');
const router = express.Router();

// Import controllers
const DataStreamController = require('../controllers/DataStreamController');
const ValidationMiddleware = require('../middleware/ValidationMiddleware');
const AuthMiddleware = require('../middleware/AuthMiddleware');

// Initialize controller
const dataStreamController = new DataStreamController();

/**
 * @route GET /api/v1/datastreams
 * @desc Get all data streams with pagination and filtering
 * @access Public
 */
router.get('/', 
    ValidationMiddleware.validateQueryParams,
    dataStreamController.getAllDataStreams
);

/**
 * @route GET /api/v1/datastreams/:id
 * @desc Get a specific data stream by ID
 * @access Public
 */
router.get('/:id',
    ValidationMiddleware.validateObjectId,
    dataStreamController.getDataStreamById
);

/**
 * @route POST /api/v1/datastreams
 * @desc Create a new data stream NFT
 * @access Private
 */
router.post('/',
    AuthMiddleware.authenticate,
    ValidationMiddleware.validateDataStreamCreation,
    dataStreamController.createDataStream
);

/**
 * @route POST /api/v1/datastreams/:id/query
 * @desc Execute a query on a data stream
 * @access Private
 */
router.post('/:id/query',
    AuthMiddleware.authenticate,
    ValidationMiddleware.validateObjectId,
    ValidationMiddleware.validateQueryExecution,
    dataStreamController.executeQuery
);

/**
 * @route PUT /api/v1/datastreams/:id/price
 * @desc Update query price for a data stream
 * @access Private (Owner only)
 */
router.put('/:id/price',
    AuthMiddleware.authenticate,
    ValidationMiddleware.validateObjectId,
    ValidationMiddleware.validatePriceUpdate,
    dataStreamController.updateQueryPrice
);

/**
 * @route PUT /api/v1/datastreams/:id/status
 * @desc Activate/deactivate a data stream
 * @access Private (Owner only)
 */
router.put('/:id/status',
    AuthMiddleware.authenticate,
    ValidationMiddleware.validateObjectId,
    ValidationMiddleware.validateStatusUpdate,
    dataStreamController.updateDataStreamStatus
);

/**
 * @route GET /api/v1/datastreams/creator/:address
 * @desc Get all data streams created by a specific address
 * @access Public
 */
router.get('/creator/:address',
    ValidationMiddleware.validateEthereumAddress,
    dataStreamController.getDataStreamsByCreator
);

/**
 * @route GET /api/v1/datastreams/stats/:id
 * @desc Get statistics for a specific data stream
 * @access Public
 */
router.get('/stats/:id',
    ValidationMiddleware.validateObjectId,
    dataStreamController.getDataStreamStats
);

/**
 * @route GET /api/v1/datastreams/search
 * @desc Search data streams by various criteria
 * @access Public
 */
router.get('/search',
    ValidationMiddleware.validateSearchParams,
    dataStreamController.searchDataStreams
);

module.exports = router;
