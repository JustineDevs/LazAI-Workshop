const express = require('express');
const router = express.Router();
const LazAIController = require('../controllers/LazAIController');

// LazAI Data Upload and Inference Routes

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
 * @route GET /api/lazai/dat/file/:fileId
 * @desc Get DAT information by file ID
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
 * @route PUT /api/lazai/dat/:tokenId/class
 * @desc Update data class for a DAT
 * @access Private (Token Owner)
 */
router.put('/dat/:tokenId/class', LazAIController.updateDataClass);

/**
 * @route PUT /api/lazai/dat/:tokenId/value
 * @desc Update data value for a DAT
 * @access Private (Token Owner)
 */
router.put('/dat/:tokenId/value', LazAIController.updateDataValue);

/**
 * @route PUT /api/lazai/dat/:tokenId/file
 * @desc Update file ID for a DAT
 * @access Private (Token Owner)
 */
router.put('/dat/:tokenId/file', LazAIController.updateFileId);

/**
 * @route PUT /api/lazai/dat/:tokenId/toggle
 * @desc Toggle active status of a DAT
 * @access Private (Token Owner)
 */
router.put('/dat/:tokenId/toggle', LazAIController.toggleActiveStatus);

module.exports = router;
