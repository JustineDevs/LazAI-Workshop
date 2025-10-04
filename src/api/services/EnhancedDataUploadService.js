const EncryptionService = require('./EncryptionService');
const IPFSService = require('./IPFSService');
const BlockchainService = require('./BlockchainService');

/**
 * Enhanced Data Upload Service with Privacy Features
 * Handles secure data upload with wallet signatures and encryption
 */
class EnhancedDataUploadService {
    constructor() {
        this.encryptionService = new EncryptionService();
        this.ipfsService = new IPFSService();
        this.blockchainService = new BlockchainService();
    }

    /**
     * Initialize the service
     */
    async initialize() {
        await this.blockchainService.initialize();
        await this.ipfsService.initialize();
    }

    /**
     * Upload encrypted data with wallet signature verification
     */
    async uploadEncryptedData(file, metadata, signature, address) {
        try {
            // Verify signature
            const message = this.encryptionService.createSignatureMessage(
                'upload',
                `${file.name}:${metadata.title}`,
                this.encryptionService.generateNonce()
            );

            const isValidSignature = await this.encryptionService.verifySignature(
                message,
                signature,
                address
            );

            if (!isValidSignature) {
                throw new Error('Invalid wallet signature');
            }

            // Encrypt file with metadata
            const encryptedData = await this.encryptionService.encryptFile(
                file,
                metadata,
                signature,
                address,
                message
            );

            // Generate integrity hash
            const integrityHash = this.encryptionService.generateHash(
                JSON.stringify(encryptedData)
            );

            // Upload to IPFS
            const ipfsResult = await this.ipfsService.uploadEncryptedData(
                encryptedData,
                {
                    ...metadata,
                    encrypted: true,
                    integrityHash: integrityHash,
                    address: address.toLowerCase(),
                    timestamp: Date.now()
                }
            );

            return {
                success: true,
                fileId: ipfsResult.fileId,
                tokenURI: ipfsResult.tokenURI,
                encryptedData: encryptedData,
                integrityHash: integrityHash,
                ipfsHash: ipfsResult.ipfsHash
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Mint Data Anchoring Token with enhanced privacy
     */
    async mintDataDAT(tokenURI, queryPrice, fileId, dataClass, dataValue, signature, address) {
        try {
            // Verify signature for minting
            const message = this.encryptionService.createSignatureMessage(
                'mint',
                `${fileId}:${queryPrice}`,
                this.encryptionService.generateNonce()
            );

            const isValidSignature = await this.encryptionService.verifySignature(
                message,
                signature,
                address
            );

            if (!isValidSignature) {
                throw new Error('Invalid wallet signature for minting');
            }

            // Mint DAT using blockchain service
            const result = await this.blockchainService.mintDataDAT(
                tokenURI,
                ethers.parseEther(queryPrice),
                fileId,
                dataClass,
                dataValue
            );

            if (result.success) {
                return {
                    success: true,
                    tokenId: result.tokenId,
                    transactionHash: result.transactionHash,
                    blockNumber: result.blockNumber,
                    gasUsed: result.gasUsed
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Query encrypted data with privacy protection
     */
    async queryEncryptedData(tokenId, query, signature, address) {
        try {
            // Verify signature for query
            const message = this.encryptionService.createSignatureMessage(
                'query',
                `${tokenId}:${query}`,
                this.encryptionService.generateNonce()
            );

            const isValidSignature = await this.encryptionService.verifySignature(
                message,
                signature,
                address
            );

            if (!isValidSignature) {
                throw new Error('Invalid wallet signature for query');
            }

            // Get DAT information
            const datResult = await this.blockchainService.getDataDAT(tokenId);
            if (!datResult.success) {
                throw new Error('DAT not found');
            }

            const dat = datResult.dat;
            
            // Verify ownership or payment
            const isOwner = dat.creator.toLowerCase() === address.toLowerCase();
            if (!isOwner) {
                // This would trigger payment in a real implementation
                // For now, we'll just verify the signature
            }

            // Encrypt query for privacy
            const encryptedQuery = await this.encryptionService.encryptQuery(
                query,
                tokenId,
                signature,
                address
            );

            return {
                success: true,
                encryptedQuery: encryptedQuery,
                dat: dat,
                message: message
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Decrypt and process query response
     */
    async processQueryResponse(encryptedResponse, tokenId, signature, address) {
        try {
            // Decrypt response
            const decryptedResponse = await this.encryptionService.decryptQueryResponse(
                encryptedResponse,
                tokenId,
                signature,
                address
            );

            return {
                success: true,
                response: decryptedResponse
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Verify data integrity
     */
    async verifyDataIntegrity(fileId, expectedHash) {
        try {
            // Get data from IPFS
            const data = await this.ipfsService.getData(fileId);
            
            // Verify integrity
            const isValid = this.encryptionService.verifyIntegrity(
                JSON.stringify(data),
                expectedHash
            );

            return {
                success: true,
                isValid: isValid,
                fileId: fileId
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Create secure session for user
     */
    async createSecureSession(address, signature, message) {
        try {
            // Verify signature
            const isValidSignature = await this.encryptionService.verifySignature(
                message,
                signature,
                address
            );

            if (!isValidSignature) {
                throw new Error('Invalid signature');
            }

            // Create session token
            const sessionToken = this.encryptionService.createSessionToken(
                address,
                signature,
                message
            );

            return {
                success: true,
                sessionToken: sessionToken,
                expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Verify secure session
     */
    async verifySecureSession(sessionToken, address) {
        try {
            const isValid = await this.encryptionService.verifySessionToken(
                sessionToken,
                address
            );

            return {
                success: true,
                isValid: isValid
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get user's encrypted data
     */
    async getUserEncryptedData(address, signature, message) {
        try {
            // Verify signature
            const isValidSignature = await this.encryptionService.verifySignature(
                message,
                signature,
                address
            );

            if (!isValidSignature) {
                throw new Error('Invalid signature');
            }

            // Get user's DATs
            const datsResult = await this.blockchainService.getCreatorDATs(address);
            if (!datsResult.success) {
                throw new Error('Failed to get user DATs');
            }

            const dats = datsResult.dats;
            const encryptedDataList = [];

            // Get encrypted data for each DAT
            for (const tokenId of dats) {
                const datResult = await this.blockchainService.getDataDAT(tokenId);
                if (datResult.success) {
                    const dat = datResult.dat;
                    encryptedDataList.push({
                        tokenId: tokenId,
                        fileId: dat.fileId,
                        dataClass: dat.dataClass,
                        dataValue: dat.dataValue,
                        isActive: dat.isActive,
                        totalQueries: dat.totalQueries,
                        totalEarned: dat.totalEarned
                    });
                }
            }

            return {
                success: true,
                encryptedData: encryptedDataList
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Update data with privacy protection
     */
    async updateEncryptedData(tokenId, newData, signature, address) {
        try {
            // Verify signature
            const message = this.encryptionService.createSignatureMessage(
                'update',
                `${tokenId}:${JSON.stringify(newData)}`,
                this.encryptionService.generateNonce()
            );

            const isValidSignature = await this.encryptionService.verifySignature(
                message,
                signature,
                address
            );

            if (!isValidSignature) {
                throw new Error('Invalid signature');
            }

            // Verify ownership
            const datResult = await this.blockchainService.getDataDAT(tokenId);
            if (!datResult.success) {
                throw new Error('DAT not found');
            }

            const dat = datResult.dat;
            if (dat.creator.toLowerCase() !== address.toLowerCase()) {
                throw new Error('Not the owner of this DAT');
            }

            // Encrypt new data
            const encryptedData = await this.encryptionService.encryptData(
                JSON.stringify(newData),
                signature,
                address,
                message
            );

            // Update on IPFS
            const updateResult = await this.ipfsService.updateData(
                dat.fileId,
                encryptedData
            );

            return {
                success: true,
                updateResult: updateResult
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = EnhancedDataUploadService;
