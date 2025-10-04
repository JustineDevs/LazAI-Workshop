const { ethers } = require('ethers');
const PinataService = require('../services/PinataService');
const multer = require('multer');
const serviceManager = require('../services/ServiceManager');

class LazAIController {
    constructor() {
        // Use shared service if available, otherwise create new instance
        this.blockchainService = serviceManager.get('blockchain') || new (require('../services/BlockchainService'))();
        this.pinataService = new PinataService();
        
        // Configure multer for file uploads
        this.upload = multer({
            storage: multer.memoryStorage(),
            limits: {
                fileSize: 10 * 1024 * 1024 // 10MB limit
            }
        });
    }

    /**
     * Upload encrypted data to IPFS and get file ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async uploadEncryptedData(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'File is required.' 
                });
            }

            const { title, description } = req.body;
            const file = req.file;

            // Read file content
            const fileContent = file.buffer.toString('utf8');
            
            // Create metadata for IPFS upload
            const metadata = {
                name: title || file.originalname,
                description: description || 'DataStreamNFT Integration',
                encryptedData: fileContent,
                timestamp: new Date().toISOString(),
                fileType: file.mimetype,
                size: file.size
            };

            // Upload to IPFS
            const ipfsResult = await this.pinataService.uploadJSON(metadata);

            if (!ipfsResult.success) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'Failed to upload to IPFS.', 
                    error: ipfsResult.error 
                });
            }

            // Generate file ID (simulated for now, in production this would come from LazAI)
            const fileId = `lazai_${ipfsResult.ipfsHash.substring(0, 16)}_${Date.now()}`;
            const tokenURI = `ipfs://${ipfsResult.ipfsHash}`;

            res.status(200).json({
                success: true,
                message: 'Encrypted data uploaded to IPFS successfully.',
                fileId: fileId,
                ipfsHash: ipfsResult.ipfsHash,
                tokenURI: tokenURI
            });
        } catch (error) {
            console.error('Error in uploadEncryptedData:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    /**
     * Mint a Data Anchoring Token (DAT)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async mintDataDAT(req, res) {
        try {
            const { tokenURI, queryPrice, fileId, dataClass, dataValue, creatorAddress } = req.body;

            if (!tokenURI || !queryPrice || !fileId || !dataClass || !dataValue || !creatorAddress) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Missing required fields for DAT minting.' 
                });
            }

            // Convert queryPrice to Wei
            const queryPriceInWei = ethers.parseEther(queryPrice.toString());

            const mintResult = await this.blockchainService.mintDataDAT(
                tokenURI,
                queryPriceInWei,
                fileId,
                dataClass,
                dataValue
            );

            if (!mintResult.success) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'Failed to mint Data DAT.', 
                    error: mintResult.error 
                });
            }

            res.status(201).json({
                success: true,
                message: 'Data Anchoring Token (DAT) minted successfully.',
                tokenId: mintResult.tokenId,
                transactionHash: mintResult.transactionHash
            });
        } catch (error) {
            console.error('Error in mintDataDAT:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    /**
     * Run AI inference on uploaded data
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async runInference(req, res) {
        try {
            const { fileId, query, querierAddress, paymentAmount } = req.body;

            if (!fileId || !query || !querierAddress || !paymentAmount) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Missing required fields for inference.' 
                });
            }

            // 1. Get DAT tokenId from fileId
            const datLookup = await this.blockchainService.getDATByFileId(fileId);
            if (!datLookup.success) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'DAT not found for the given file ID.', 
                    error: datLookup.error 
                });
            }
            const tokenId = datLookup.tokenId;

            // 2. Pay for query on-chain
            const paymentResult = await this.blockchainService.payForQuery(tokenId, paymentAmount);
            if (!paymentResult.success) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'Failed to pay for query on-chain.', 
                    error: paymentResult.error 
                });
            }

            // 3. Simulate AI inference (this would be a call to LazAI API/model)
            const inferenceResponse = `AI processed query "${query}" on data associated with File ID ${fileId}. Result: [Simulated AI Output]`;

            res.status(200).json({
                success: true,
                message: 'AI inference completed successfully.',
                query: query,
                response: inferenceResponse,
                transactionHash: paymentResult.transactionHash
            });
        } catch (error) {
            console.error('Error in runInference:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    /**
     * Upload data to LazAI/Alith and mint DAT
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async uploadData(req, res) {
        try {
            const { data, description, dataClass, dataValue, queryPrice, creator } = req.body;

            // Validate required fields
            if (!data || !dataClass || !dataValue || !queryPrice || !creator) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields'
                });
            }

            // Convert query price to wei
            const queryPriceWei = ethers.parseEther(queryPrice.toString());

            // Step 1: Upload data to LazAI/Alith (simulated)
            // In a real implementation, this would call the LazAI/Alith service
            const fileId = `lazai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            console.log(`📤 Uploading data to LazAI/Alith...`);
            console.log(`📄 File ID: ${fileId}`);
            console.log(`📝 Description: ${description}`);
            console.log(`🏷️  Data Class: ${dataClass}`);
            console.log(`💰 Data Value: ${dataValue}`);

            // Step 2: Create metadata
            const metadata = {
                name: `DataStreamDAT #${fileId}`,
                description: description || 'DataStreamNFT Integration Sample',
                image: 'https://ipfs.io/ipfs/QmDataStreamNFTImage', // Placeholder
                attributes: [
                    {
                        trait_type: 'File ID',
                        value: fileId
                    },
                    {
                        trait_type: 'Data Class',
                        value: dataClass
                    },
                    {
                        trait_type: 'Data Value',
                        value: dataValue
                    },
                    {
                        trait_type: 'Creator',
                        value: creator
                    },
                    {
                        trait_type: 'Created At',
                        value: Math.floor(Date.now() / 1000)
                    },
                    {
                        trait_type: 'Platform',
                        value: 'DataStreamNFT'
                    }
                ],
                external_url: `https://datastreamnft.com/dat/${fileId}`,
                background_color: '000000'
            };

            // Step 3: Upload metadata to IPFS
            const tokenURI = await this.pinataService.uploadJSON(metadata);
            console.log(`📄 Metadata uploaded to IPFS: ${tokenURI}`);

            // Step 4: Mint DAT on blockchain
            console.log(`🪙 Minting Data Anchoring Token (DAT)...`);
            
            const mintResult = await this.blockchainService.mintDataDAT(
                tokenURI,
                queryPriceWei,
                fileId,
                dataClass,
                dataValue
            );

            if (!mintResult.success) {
                return res.status(500).json({
                    success: false,
                    error: mintResult.error
                });
            }

            // Return success response
            res.json({
                success: true,
                fileId: fileId,
                tokenId: mintResult.tokenId,
                tokenURI: tokenURI,
                dataClass: dataClass,
                dataValue: dataValue,
                queryPrice: queryPrice,
                creator: creator,
                transactionHash: mintResult.transactionHash,
                blockNumber: mintResult.blockNumber
            });

        } catch (error) {
            console.error('Error in uploadData:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }


    /**
     * Get DAT information by token ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getDATInfo(req, res) {
        try {
            const { tokenId } = req.params;

            const datInfo = await this.blockchainService.getDataDAT(parseInt(tokenId));

            if (!datInfo.success) {
                return res.status(404).json({
                    success: false,
                    error: 'DAT not found'
                });
            }

            res.json({
                success: true,
                dat: datInfo.dat
            });

        } catch (error) {
            console.error('Error in getDATInfo:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    /**
     * Get DAT information by file ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getDATByFileId(req, res) {
        try {
            const { fileId } = req.params;

            const datInfo = await this.blockchainService.getDATByFileId(fileId);

            if (!datInfo.success) {
                return res.status(404).json({
                    success: false,
                    error: 'DAT not found'
                });
            }

            res.json({
                success: true,
                dat: datInfo.dat
            });

        } catch (error) {
            console.error('Error in getDATByFileId:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    /**
     * Get DAT statistics
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getDATStats(req, res) {
        try {
            const { tokenId } = req.params;

            const stats = await this.blockchainService.getDATStats(parseInt(tokenId));

            if (!stats.success) {
                return res.status(404).json({
                    success: false,
                    error: 'DAT not found'
                });
            }

            res.json({
                success: true,
                stats: stats.stats
            });

        } catch (error) {
            console.error('Error in getDATStats:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    /**
     * Pay for and execute a query on a DAT
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async payForQuery(req, res) {
        try {
            const { tokenId, query, payment } = req.body;

            // Validate required fields
            if (!tokenId || !query || !payment) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields'
                });
            }

            const queryResult = await this.blockchainService.payForQuery(
                parseInt(tokenId),
                query,
                ethers.parseEther(payment.toString())
            );

            if (!queryResult.success) {
                return res.status(500).json({
                    success: false,
                    error: queryResult.error
                });
            }

            res.json({
                success: true,
                transactionHash: queryResult.transactionHash,
                blockNumber: queryResult.blockNumber
            });

        } catch (error) {
            console.error('Error in payForQuery:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    /**
     * Get all DATs created by an address
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getCreatorDATs(req, res) {
        try {
            const { address } = req.params;

            const creatorDATs = await this.blockchainService.getCreatorDATs(address);

            if (!creatorDATs.success) {
                return res.status(500).json({
                    success: false,
                    error: creatorDATs.error
                });
            }

            res.json({
                success: true,
                dats: creatorDATs.dats
            });

        } catch (error) {
            console.error('Error in getCreatorDATs:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    /**
     * Update data class for a DAT
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async updateDataClass(req, res) {
        try {
            const { tokenId } = req.params;
            const { dataClass, owner } = req.body;

            // Validate required fields
            if (!dataClass || !owner) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields'
                });
            }

            const updateResult = await this.blockchainService.updateDataClass(
                parseInt(tokenId),
                dataClass,
                owner
            );

            if (!updateResult.success) {
                return res.status(500).json({
                    success: false,
                    error: updateResult.error
                });
            }

            res.json({
                success: true,
                transactionHash: updateResult.transactionHash
            });

        } catch (error) {
            console.error('Error in updateDataClass:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    /**
     * Update data value for a DAT
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async updateDataValue(req, res) {
        try {
            const { tokenId } = req.params;
            const { dataValue, owner } = req.body;

            // Validate required fields
            if (!dataValue || !owner) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields'
                });
            }

            const updateResult = await this.blockchainService.updateDataValue(
                parseInt(tokenId),
                dataValue,
                owner
            );

            if (!updateResult.success) {
                return res.status(500).json({
                    success: false,
                    error: updateResult.error
                });
            }

            res.json({
                success: true,
                transactionHash: updateResult.transactionHash
            });

        } catch (error) {
            console.error('Error in updateDataValue:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    /**
     * Update file ID for a DAT
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async updateFileId(req, res) {
        try {
            const { tokenId } = req.params;
            const { fileId, owner } = req.body;

            // Validate required fields
            if (!fileId || !owner) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields'
                });
            }

            const updateResult = await this.blockchainService.updateFileId(
                parseInt(tokenId),
                fileId,
                owner
            );

            if (!updateResult.success) {
                return res.status(500).json({
                    success: false,
                    error: updateResult.error
                });
            }

            res.json({
                success: true,
                transactionHash: updateResult.transactionHash
            });

        } catch (error) {
            console.error('Error in updateFileId:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    /**
     * Toggle active status of a DAT
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async toggleActiveStatus(req, res) {
        try {
            const { tokenId } = req.params;
            const { owner } = req.body;

            // Validate required fields
            if (!owner) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields'
                });
            }

            const toggleResult = await this.blockchainService.toggleActiveStatus(
                parseInt(tokenId),
                owner
            );

            if (!toggleResult.success) {
                return res.status(500).json({
                    success: false,
                    error: toggleResult.error
                });
            }

            res.json({
                success: true,
                transactionHash: toggleResult.transactionHash
            });

        } catch (error) {
            console.error('Error in toggleActiveStatus:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
}

module.exports = new LazAIController();
