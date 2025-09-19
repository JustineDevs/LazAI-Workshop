const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class IPFSService {
    constructor() {
        this.apiKey = process.env.PINATA_API_KEY;
        this.secretKey = process.env.PINATA_SECRET_KEY;
        this.gatewayUrl = process.env.PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs/';
        this.baseUrl = 'https://api.pinata.cloud';
        
        if (!this.apiKey || !this.secretKey) {
            console.warn('Pinata API credentials not found. IPFS functionality will be limited.');
        }
    }

    /**
     * Upload a file to IPFS via Pinata
     * @param {Buffer|Stream} file - File to upload
     * @param {Object} metadata - File metadata
     * @returns {Promise<Object>} Upload result with IPFS hash
     */
    async uploadFile(file, metadata = {}) {
        try {
            if (!this.apiKey || !this.secretKey) {
                throw new Error('Pinata API credentials not configured');
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('pinataMetadata', JSON.stringify({
                name: metadata.name || 'DataStreamNFT File',
                keyvalues: {
                    type: metadata.type || 'datastream',
                    ...metadata.keyvalues
                }
            }));

            if (metadata.pinataOptions) {
                formData.append('pinataOptions', JSON.stringify(metadata.pinataOptions));
            }

            const response = await axios.post(`${this.baseUrl}/pinning/pinFileToIPFS`, formData, {
                headers: {
                    'pinata_api_key': this.apiKey,
                    'pinata_secret_api_key': this.secretKey,
                    ...formData.getHeaders()
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            });

            return {
                success: true,
                ipfsHash: response.data.IpfsHash,
                pinSize: response.data.PinSize,
                timestamp: response.data.Timestamp
            };

        } catch (error) {
            console.error('IPFS upload failed:', error.response?.data || error.message);
            throw new Error(`IPFS upload failed: ${error.response?.data?.error || error.message}`);
        }
    }

    /**
     * Upload JSON metadata to IPFS
     * @param {Object} metadata - JSON metadata to upload
     * @param {Object} options - Upload options
     * @returns {Promise<Object>} Upload result with IPFS hash
     */
    async uploadJSON(metadata, options = {}) {
        try {
            if (!this.apiKey || !this.secretKey) {
                throw new Error('Pinata API credentials not configured');
            }

            const response = await axios.post(`${this.baseUrl}/pinning/pinJSONToIPFS`, {
                pinataContent: metadata,
                pinataMetadata: {
                    name: options.name || 'DataStreamNFT Metadata',
                    keyvalues: {
                        type: 'metadata',
                        ...options.keyvalues
                    }
                },
                pinataOptions: {
                    cidVersion: 1,
                    ...options.pinataOptions
                }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'pinata_api_key': this.apiKey,
                    'pinata_secret_api_key': this.secretKey
                }
            });

            return {
                success: true,
                ipfsHash: response.data.IpfsHash,
                pinSize: response.data.PinSize,
                timestamp: response.data.Timestamp
            };

        } catch (error) {
            console.error('IPFS JSON upload failed:', error.response?.data || error.message);
            throw new Error(`IPFS JSON upload failed: ${error.response?.data?.error || error.message}`);
        }
    }

    /**
     * Create DataStream metadata JSON
     * @param {Object} dataStreamData - DataStream information
     * @returns {Object} Standardized metadata JSON
     */
    createDataStreamMetadata(dataStreamData) {
        const {
            title,
            description,
            category,
            tags,
            creator,
            queryPrice,
            ipfsHash,
            attributes
        } = dataStreamData;

        return {
            name: title,
            description,
            image: `${this.gatewayUrl}${ipfsHash}`,
            external_url: `${process.env.FRONTEND_URL || 'https://datastreamnft.com'}/datastream/${dataStreamData.tokenId}`,
            attributes: [
                {
                    trait_type: "Category",
                    value: category
                },
                {
                    trait_type: "Query Price",
                    value: `${queryPrice} DAT`
                },
                {
                    trait_type: "Creator",
                    value: creator
                },
                {
                    trait_type: "Data Type",
                    value: "DataStream"
                },
                ...(tags || []).map(tag => ({
                    trait_type: "Tag",
                    value: tag
                })),
                ...(attributes || [])
            ],
            properties: {
                type: "DataStreamNFT",
                version: "1.0",
                platform: "DataStreamNFT",
                dataHash: ipfsHash,
                queryPrice: queryPrice.toString(),
                creator: creator
            }
        };
    }

    /**
     * Get file from IPFS
     * @param {string} ipfsHash - IPFS hash of the file
     * @returns {Promise<Buffer>} File content
     */
    async getFile(ipfsHash) {
        try {
            const response = await axios.get(`${this.gatewayUrl}${ipfsHash}`, {
                responseType: 'arraybuffer',
                timeout: 30000
            });

            return Buffer.from(response.data);

        } catch (error) {
            console.error('IPFS file retrieval failed:', error.message);
            throw new Error(`Failed to retrieve file from IPFS: ${error.message}`);
        }
    }

    /**
     * Get JSON metadata from IPFS
     * @param {string} ipfsHash - IPFS hash of the metadata
     * @returns {Promise<Object>} JSON metadata
     */
    async getJSON(ipfsHash) {
        try {
            const response = await axios.get(`${this.gatewayUrl}${ipfsHash}`, {
                timeout: 30000
            });

            return response.data;

        } catch (error) {
            console.error('IPFS JSON retrieval failed:', error.message);
            throw new Error(`Failed to retrieve JSON from IPFS: ${error.message}`);
        }
    }

    /**
     * Pin a file to IPFS (if not already pinned)
     * @param {string} ipfsHash - IPFS hash to pin
     * @param {Object} metadata - Pin metadata
     * @returns {Promise<Object>} Pin result
     */
    async pinFile(ipfsHash, metadata = {}) {
        try {
            if (!this.apiKey || !this.secretKey) {
                throw new Error('Pinata API credentials not configured');
            }

            const response = await axios.post(`${this.baseUrl}/pinning/pinByHash`, {
                hashToPin: ipfsHash,
                pinataMetadata: {
                    name: metadata.name || 'DataStreamNFT Pin',
                    keyvalues: {
                        type: 'datastream',
                        ...metadata.keyvalues
                    }
                }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'pinata_api_key': this.apiKey,
                    'pinata_secret_api_key': this.secretKey
                }
            });

            return {
                success: true,
                ipfsHash: response.data.IpfsHash,
                pinSize: response.data.PinSize,
                timestamp: response.data.Timestamp
            };

        } catch (error) {
            console.error('IPFS pin failed:', error.response?.data || error.message);
            throw new Error(`IPFS pin failed: ${error.response?.data?.error || error.message}`);
        }
    }

    /**
     * Get pinning status
     * @param {string} ipfsHash - IPFS hash to check
     * @returns {Promise<Object>} Pin status
     */
    async getPinStatus(ipfsHash) {
        try {
            if (!this.apiKey || !this.secretKey) {
                throw new Error('Pinata API credentials not configured');
            }

            const response = await axios.get(`${this.baseUrl}/data/pinList?hashContains=${ipfsHash}`, {
                headers: {
                    'pinata_api_key': this.apiKey,
                    'pinata_secret_api_key': this.secretKey
                }
            });

            const pins = response.data.rows || [];
            const pin = pins.find(p => p.ipfs_pin_hash === ipfsHash);

            return {
                isPinned: !!pin,
                pinSize: pin?.size || 0,
                datePinned: pin?.date_pinned
            };

        } catch (error) {
            console.error('IPFS pin status check failed:', error.message);
            throw new Error(`Failed to check pin status: ${error.message}`);
        }
    }

    /**
     * Unpin a file from IPFS
     * @param {string} ipfsHash - IPFS hash to unpin
     * @returns {Promise<Object>} Unpin result
     */
    async unpinFile(ipfsHash) {
        try {
            if (!this.apiKey || !this.secretKey) {
                throw new Error('Pinata API credentials not configured');
            }

            await axios.delete(`${this.baseUrl}/pinning/unpin/${ipfsHash}`, {
                headers: {
                    'pinata_api_key': this.apiKey,
                    'pinata_secret_api_key': this.secretKey
                }
            });

            return {
                success: true,
                message: 'File unpinned successfully'
            };

        } catch (error) {
            console.error('IPFS unpin failed:', error.response?.data || error.message);
            throw new Error(`IPFS unpin failed: ${error.response?.data?.error || error.message}`);
        }
    }

    /**
     * Get gateway URL for an IPFS hash
     * @param {string} ipfsHash - IPFS hash
     * @returns {string} Full gateway URL
     */
    getGatewayUrl(ipfsHash) {
        return `${this.gatewayUrl}${ipfsHash}`;
    }

    /**
     * Validate IPFS hash format
     * @param {string} ipfsHash - IPFS hash to validate
     * @returns {boolean} True if valid
     */
    isValidIPFSHash(ipfsHash) {
        return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(ipfsHash) || 
               /^bafybei[a-z2-7]{52}$/.test(ipfsHash);
    }
}

module.exports = IPFSService;
