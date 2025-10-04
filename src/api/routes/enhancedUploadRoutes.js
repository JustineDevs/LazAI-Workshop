const express = require('express');
const multer = require('multer');
const EnhancedDataUploadService = require('../services/EnhancedDataUploadService');
const { authenticateToken } = require('../middleware/AuthMiddleware');
const { rateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
const uploadService = new EnhancedDataUploadService();

// Initialize service
uploadService.initialize().catch(console.error);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Apply rate limiting to all routes
router.use(rateLimiter);

/**
 * @route POST /api/enhanced-upload/encrypted
 * @desc Upload encrypted data with wallet signature verification
 * @access Private
 */
router.post('/encrypted', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const { file } = req;
        const { title, description, dataClass, dataValue, signature, address } = req.body;
        
        if (!file) {
            return res.status(400).json({
                success: false,
                error: 'File is required'
            });
        }
        
        if (!title || !description || !signature || !address) {
            return res.status(400).json({
                success: false,
                error: 'Title, description, signature, and address are required'
            });
        }
        
        const metadata = {
            title,
            description,
            dataClass: dataClass || 'dataset',
            dataValue: dataValue || 'medium'
        };
        
        const result = await uploadService.uploadEncryptedData(
            file,
            metadata,
            signature,
            address
        );
        
        res.json({
            success: result.success,
            data: result.success ? {
                fileId: result.fileId,
                tokenURI: result.tokenURI,
                ipfsHash: result.ipfsHash
            } : null,
            error: result.error || null,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Encrypted upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload encrypted data'
        });
    }
});

/**
 * @route POST /api/enhanced-upload/mint-dat
 * @desc Mint Data Anchoring Token with enhanced privacy
 * @access Private
 */
router.post('/mint-dat', authenticateToken, async (req, res) => {
    try {
        const { tokenURI, queryPrice, fileId, dataClass, dataValue, signature, address } = req.body;
        
        if (!tokenURI || !queryPrice || !fileId || !signature || !address) {
            return res.status(400).json({
                success: false,
                error: 'TokenURI, queryPrice, fileId, signature, and address are required'
            });
        }
        
        const result = await uploadService.mintDataDAT(
            tokenURI,
            queryPrice,
            fileId,
            dataClass || 'dataset',
            dataValue || 'medium',
            signature,
            address
        );
        
        res.json({
            success: result.success,
            data: result.success ? {
                tokenId: result.tokenId,
                transactionHash: result.transactionHash,
                blockNumber: result.blockNumber,
                gasUsed: result.gasUsed
            } : null,
            error: result.error || null,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('DAT minting error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to mint DAT'
        });
    }
});

/**
 * @route POST /api/enhanced-upload/query
 * @desc Query encrypted data with privacy protection
 * @access Private
 */
router.post('/query', authenticateToken, async (req, res) => {
    try {
        const { tokenId, query, signature, address } = req.body;
        
        if (!tokenId || !query || !signature || !address) {
            return res.status(400).json({
                success: false,
                error: 'TokenId, query, signature, and address are required'
            });
        }
        
        const result = await uploadService.queryEncryptedData(
            tokenId,
            query,
            signature,
            address
        );
        
        res.json({
            success: result.success,
            data: result.success ? {
                encryptedQuery: result.encryptedQuery,
                dat: result.dat,
                message: result.message
            } : null,
            error: result.error || null,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Query error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to query encrypted data'
        });
    }
});

/**
 * @route POST /api/enhanced-upload/decrypt-response
 * @desc Decrypt query response
 * @access Private
 */
router.post('/decrypt-response', authenticateToken, async (req, res) => {
    try {
        const { encryptedResponse, tokenId, signature, address } = req.body;
        
        if (!encryptedResponse || !tokenId || !signature || !address) {
            return res.status(400).json({
                success: false,
                error: 'EncryptedResponse, tokenId, signature, and address are required'
            });
        }
        
        const result = await uploadService.processQueryResponse(
            encryptedResponse,
            tokenId,
            signature,
            address
        );
        
        res.json({
            success: result.success,
            data: result.success ? {
                response: result.response
            } : null,
            error: result.error || null,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Response decryption error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to decrypt response'
        });
    }
});

/**
 * @route GET /api/enhanced-upload/verify/:fileId
 * @desc Verify data integrity
 * @access Public
 */
router.get('/verify/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        const { hash } = req.query;
        
        if (!fileId || !hash) {
            return res.status(400).json({
                success: false,
                error: 'FileId and hash are required'
            });
        }
        
        const result = await uploadService.verifyDataIntegrity(fileId, hash);
        
        res.json({
            success: result.success,
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Integrity verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify data integrity'
        });
    }
});

/**
 * @route POST /api/enhanced-upload/session
 * @desc Create secure session
 * @access Private
 */
router.post('/session', authenticateToken, async (req, res) => {
    try {
        const { address, signature, message } = req.body;
        
        if (!address || !signature || !message) {
            return res.status(400).json({
                success: false,
                error: 'Address, signature, and message are required'
            });
        }
        
        const result = await uploadService.createSecureSession(address, signature, message);
        
        res.json({
            success: result.success,
            data: result.success ? {
                sessionToken: result.sessionToken,
                expiresAt: result.expiresAt
            } : null,
            error: result.error || null,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Session creation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create secure session'
        });
    }
});

/**
 * @route POST /api/enhanced-upload/verify-session
 * @desc Verify secure session
 * @access Private
 */
router.post('/verify-session', authenticateToken, async (req, res) => {
    try {
        const { sessionToken, address } = req.body;
        
        if (!sessionToken || !address) {
            return res.status(400).json({
                success: false,
                error: 'SessionToken and address are required'
            });
        }
        
        const result = await uploadService.verifySecureSession(sessionToken, address);
        
        res.json({
            success: result.success,
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Session verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify session'
        });
    }
});

/**
 * @route GET /api/enhanced-upload/user/:address/data
 * @desc Get user's encrypted data
 * @access Private
 */
router.get('/user/:address/data', authenticateToken, async (req, res) => {
    try {
        const { address } = req.params;
        const { signature, message } = req.query;
        
        if (!address || !signature || !message) {
            return res.status(400).json({
                success: false,
                error: 'Address, signature, and message are required'
            });
        }
        
        const result = await uploadService.getUserEncryptedData(address, signature, message);
        
        res.json({
            success: result.success,
            data: result.success ? {
                encryptedData: result.encryptedData
            } : null,
            error: result.error || null,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('User data fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user data'
        });
    }
});

/**
 * @route PUT /api/enhanced-upload/update/:tokenId
 * @desc Update encrypted data
 * @access Private
 */
router.put('/update/:tokenId', authenticateToken, async (req, res) => {
    try {
        const { tokenId } = req.params;
        const { newData, signature, address } = req.body;
        
        if (!tokenId || !newData || !signature || !address) {
            return res.status(400).json({
                success: false,
                error: 'TokenId, newData, signature, and address are required'
            });
        }
        
        const result = await uploadService.updateEncryptedData(
            tokenId,
            newData,
            signature,
            address
        );
        
        res.json({
            success: result.success,
            data: result.success ? {
                updateResult: result.updateResult
            } : null,
            error: result.error || null,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Data update error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update encrypted data'
        });
    }
});

module.exports = router;
