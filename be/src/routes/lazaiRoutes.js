const express = require('express');
const router = express.Router();
const LazAIController = require('../controllers/LazAIController');

// LazAI Data Upload and Inference Routes

/**
 * @route POST /api/lazai/upload-encrypted-data
 * @desc Upload encrypted data to IPFS and get fileId/tokenURI
 * @access Private
 */
router.post('/upload-encrypted-data', LazAIController.upload.single('file'), LazAIController.uploadEncryptedData);

/**
 * @route POST /api/lazai/mint-dat
 * @desc Mint a Data Anchoring Token (DAT)
 * @access Private
 */
router.post('/mint-dat', LazAIController.mintDataDAT);

/**
 * @route POST /api/lazai/run-inference
 * @desc Run AI inference on uploaded data
 * @access Private
 */
router.post('/run-inference', LazAIController.runInference);

/**
 * @route POST /api/lazai/upload
 * @desc Upload data to LazAI/Alith and mint DAT
 * @access Private
 */
router.post('/upload', LazAIController.uploadData);

/**
 * @route POST /api/lazai/inference
 * @desc Run AI inference on uploaded data
 * @access Private
 */
router.post('/inference', LazAIController.runInference);

/**
 * @route GET /api/lazai/dat/:tokenId
 * @desc Get DAT information by token ID
 * @access Public
 */
router.get('/dat/:tokenId', LazAIController.getDATInfo);

/**
 * @route GET /api/lazai/dat-by-fileid/:fileId
 * @desc Get DAT information by file ID
 * @access Public
 */
router.get('/dat-by-fileid/:fileId', LazAIController.getDATByFileId);

/**
 * @route GET /api/lazai/dat/file/:fileId
 * @desc Get DAT information by file ID (legacy)
 * @access Public
 */
router.get('/dat/file/:fileId', LazAIController.getDATByFileId);

/**
 * @route GET /api/lazai/stats/:tokenId
 * @desc Get DAT statistics
 * @access Public
 */
router.get('/stats/:tokenId', LazAIController.getDATStats);

/**
 * @route POST /api/lazai/query
 * @desc Pay for and execute a query on a DAT
 * @access Private
 */
router.post('/query', LazAIController.payForQuery);

/**
 * @route GET /api/lazai/creator/:address
 * @desc Get all DATs created by an address
 * @access Public
 */
router.get('/creator/:address', LazAIController.getCreatorDATs);

/**
 * @route PUT /api/lazai/dat/:tokenId/update-class
 * @desc Update data class for a DAT
 * @access Private (Token Owner)
 */
router.put('/dat/:tokenId/update-class', LazAIController.updateDataClass);

/**
 * @route PUT /api/lazai/dat/:tokenId/class
 * @desc Update data class for a DAT (legacy)
 * @access Private (Token Owner)
 */
router.put('/dat/:tokenId/class', LazAIController.updateDataClass);

/**
 * @route PUT /api/lazai/dat/:tokenId/update-value
 * @desc Update data value for a DAT
 * @access Private (Token Owner)
 */
router.put('/dat/:tokenId/update-value', LazAIController.updateDataValue);

/**
 * @route PUT /api/lazai/dat/:tokenId/value
 * @desc Update data value for a DAT (legacy)
 * @access Private (Token Owner)
 */
router.put('/dat/:tokenId/value', LazAIController.updateDataValue);

/**
 * @route PUT /api/lazai/dat/:tokenId/update-fileid
 * @desc Update file ID for a DAT
 * @access Private (Token Owner)
 */
router.put('/dat/:tokenId/update-fileid', LazAIController.updateFileId);

/**
 * @route PUT /api/lazai/dat/:tokenId/file
 * @desc Update file ID for a DAT (legacy)
 * @access Private (Token Owner)
 */
router.put('/dat/:tokenId/file', LazAIController.updateFileId);

/**
 * @route PUT /api/lazai/dat/:tokenId/toggle-active
 * @desc Toggle active status of a DAT
 * @access Private (Token Owner)
 */
router.put('/dat/:tokenId/toggle-active', LazAIController.toggleActiveStatus);

/**
 * @route PUT /api/lazai/dat/:tokenId/toggle
 * @desc Toggle active status of a DAT (legacy)
 * @access Private (Token Owner)
 */
router.put('/dat/:tokenId/toggle', LazAIController.toggleActiveStatus);

module.exports = router;
