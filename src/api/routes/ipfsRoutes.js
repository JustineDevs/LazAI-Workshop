const express = require('express');
const multer = require('multer');
const router = express.Router();

// Import controllers
const IPFSController = require('../controllers/IPFSController');
const ValidationMiddleware = require('../middleware/ValidationMiddleware');
const AuthMiddleware = require('../middleware/AuthMiddleware');

// Initialize controller
const ipfsController = new IPFSController();

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

/**
 * @route POST /api/v1/ipfs/upload
 * @desc Upload a file to IPFS
 * @access Private
 */
router.post('/upload',
    AuthMiddleware.authenticate,
    upload.single('file'),
    ValidationMiddleware.validateFileUpload,
    ipfsController.uploadFile
);

/**
 * @route POST /api/v1/ipfs/upload-json
 * @desc Upload JSON metadata to IPFS
 * @access Private
 */
router.post('/upload-json',
    AuthMiddleware.authenticate,
    ipfsController.uploadJSON
);

/**
 * @route GET /api/v1/ipfs/:hash
 * @desc Get file from IPFS
 * @access Public
 */
router.get('/:hash',
    ipfsController.getFile
);

/**
 * @route GET /api/v1/ipfs/:hash/json
 * @desc Get JSON metadata from IPFS
 * @access Public
 */
router.get('/:hash/json',
    ipfsController.getJSON
);

/**
 * @route POST /api/v1/ipfs/pin
 * @desc Pin a file to IPFS
 * @access Private
 */
router.post('/pin',
    AuthMiddleware.authenticate,
    ipfsController.pinFile
);

/**
 * @route GET /api/v1/ipfs/:hash/status
 * @desc Get pin status for a file
 * @access Public
 */
router.get('/:hash/status',
    ipfsController.getPinStatus
);

/**
 * @route DELETE /api/v1/ipfs/:hash/unpin
 * @desc Unpin a file from IPFS
 * @access Private
 */
router.delete('/:hash/unpin',
    AuthMiddleware.authenticate,
    ipfsController.unpinFile
);

/**
 * @route POST /api/v1/ipfs/datastream-metadata
 * @desc Create and upload DataStream metadata
 * @access Private
 */
router.post('/datastream-metadata',
    AuthMiddleware.authenticate,
    ipfsController.createDataStreamMetadata
);

module.exports = router;
