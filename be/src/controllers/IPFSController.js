const IPFSService = require('../services/IPFSService');

class IPFSController {
    constructor() {
        this.ipfsService = new IPFSService();
    }

    /**
     * Upload a file to IPFS
     */
    async uploadFile(req, res, next) {
        try {
            const file = req.file;
            const metadata = {
                name: req.body.name || file.originalname,
                type: req.body.type || 'datastream',
                keyvalues: {
                    uploadedBy: req.user.address,
                    uploadedAt: new Date().toISOString(),
                    ...JSON.parse(req.body.keyvalues || '{}')
                }
            };

            const result = await this.ipfsService.uploadFile(file.buffer, metadata);

            res.json({
                success: true,
                data: {
                    ipfsHash: result.ipfsHash,
                    pinSize: result.pinSize,
                    gatewayUrl: this.ipfsService.getGatewayUrl(result.ipfsHash),
                    timestamp: result.timestamp
                },
                message: 'File uploaded to IPFS successfully'
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Upload JSON metadata to IPFS
     */
    async uploadJSON(req, res, next) {
        try {
            const { metadata, options = {} } = req.body;

            if (!metadata) {
                return res.status(400).json({
                    success: false,
                    error: 'Metadata is required'
                });
            }

            const uploadOptions = {
                name: options.name || 'DataStreamNFT Metadata',
                keyvalues: {
                    uploadedBy: req.user.address,
                    uploadedAt: new Date().toISOString(),
                    ...options.keyvalues
                },
                ...options
            };

            const result = await this.ipfsService.uploadJSON(metadata, uploadOptions);

            res.json({
                success: true,
                data: {
                    ipfsHash: result.ipfsHash,
                    pinSize: result.pinSize,
                    gatewayUrl: this.ipfsService.getGatewayUrl(result.ipfsHash),
                    timestamp: result.timestamp
                },
                message: 'JSON metadata uploaded to IPFS successfully'
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Get file from IPFS
     */
    async getFile(req, res, next) {
        try {
            const { hash } = req.params;

            if (!this.ipfsService.isValidIPFSHash(hash)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid IPFS hash format'
                });
            }

            const fileBuffer = await this.ipfsService.getFile(hash);

            // Set appropriate headers
            res.set({
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${hash}"`,
                'Content-Length': fileBuffer.length
            });

            res.send(fileBuffer);

        } catch (error) {
            next(error);
        }
    }

    /**
     * Get JSON metadata from IPFS
     */
    async getJSON(req, res, next) {
        try {
            const { hash } = req.params;

            if (!this.ipfsService.isValidIPFSHash(hash)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid IPFS hash format'
                });
            }

            const jsonData = await this.ipfsService.getJSON(hash);

            res.json({
                success: true,
                data: jsonData
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Pin a file to IPFS
     */
    async pinFile(req, res, next) {
        try {
            const { ipfsHash, metadata = {} } = req.body;

            if (!ipfsHash) {
                return res.status(400).json({
                    success: false,
                    error: 'IPFS hash is required'
                });
            }

            if (!this.ipfsService.isValidIPFSHash(ipfsHash)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid IPFS hash format'
                });
            }

            const pinMetadata = {
                name: metadata.name || 'DataStreamNFT Pin',
                keyvalues: {
                    pinnedBy: req.user.address,
                    pinnedAt: new Date().toISOString(),
                    ...metadata.keyvalues
                }
            };

            const result = await this.ipfsService.pinFile(ipfsHash, pinMetadata);

            res.json({
                success: true,
                data: {
                    ipfsHash: result.ipfsHash,
                    pinSize: result.pinSize,
                    gatewayUrl: this.ipfsService.getGatewayUrl(result.ipfsHash),
                    timestamp: result.timestamp
                },
                message: 'File pinned to IPFS successfully'
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Get pin status for a file
     */
    async getPinStatus(req, res, next) {
        try {
            const { hash } = req.params;

            if (!this.ipfsService.isValidIPFSHash(hash)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid IPFS hash format'
                });
            }

            const status = await this.ipfsService.getPinStatus(hash);

            res.json({
                success: true,
                data: {
                    ipfsHash: hash,
                    isPinned: status.isPinned,
                    pinSize: status.pinSize,
                    datePinned: status.datePinned,
                    gatewayUrl: this.ipfsService.getGatewayUrl(hash)
                }
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Unpin a file from IPFS
     */
    async unpinFile(req, res, next) {
        try {
            const { hash } = req.params;

            if (!this.ipfsService.isValidIPFSHash(hash)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid IPFS hash format'
                });
            }

            const result = await this.ipfsService.unpinFile(hash);

            res.json({
                success: true,
                data: result,
                message: 'File unpinned from IPFS successfully'
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Create and upload DataStream metadata
     */
    async createDataStreamMetadata(req, res, next) {
        try {
            const {
                title,
                description,
                category,
                tags,
                queryPrice,
                ipfsHash,
                attributes
            } = req.body;

            // Validate required fields
            if (!title || !description || !category || !queryPrice || !ipfsHash) {
                return res.status(400).json({
                    success: false,
                    error: 'Title, description, category, queryPrice, and ipfsHash are required'
                });
            }

            // Create metadata object
            const dataStreamData = {
                title,
                description,
                category,
                tags,
                creator: req.user.address,
                queryPrice: parseFloat(queryPrice),
                ipfsHash,
                attributes
            };

            // Generate standardized metadata
            const metadata = this.ipfsService.createDataStreamMetadata(dataStreamData);

            // Upload to IPFS
            const result = await this.ipfsService.uploadJSON(metadata, {
                name: `${title} - DataStream Metadata`,
                keyvalues: {
                    type: 'datastream-metadata',
                    creator: req.user.address,
                    category,
                    queryPrice: queryPrice.toString()
                }
            });

            res.json({
                success: true,
                data: {
                    metadataHash: result.ipfsHash,
                    metadata: metadata,
                    gatewayUrl: this.ipfsService.getGatewayUrl(result.ipfsHash),
                    timestamp: result.timestamp
                },
                message: 'DataStream metadata created and uploaded successfully'
            });

        } catch (error) {
            next(error);
        }
    }
}

module.exports = IPFSController;
