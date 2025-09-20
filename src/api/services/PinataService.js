/**
 * Pinata IPFS Service
 * Handles file uploads to IPFS via Pinata API
 */

const FormData = require('form-data');
const fetch = require('node-fetch');

class PinataService {
    constructor() {
        this.pinataApiKey = process.env.PINATA_API_KEY;
        this.pinataSecretKey = process.env.PINATA_SECRET_KEY;
        this.pinataJWT = process.env.PINATA_JWT;
        this.baseUrl = 'https://api.pinata.cloud';
    }

    /**
     * Upload JSON data to IPFS
     * @param {Object} data - JSON data to upload
     * @param {Object} options - Upload options
     * @returns {Promise<Object>} Upload result
     */
    async uploadJSON(data, options = {}) {
        try {
            if (!this.pinataJWT) {
                throw new Error('Pinata JWT token not configured');
            }

            const url = `${this.baseUrl}/pinning/pinJSONToIPFS`;
            
            const body = {
                pinataContent: data,
                pinataMetadata: {
                    name: options.name || 'DataStreamNFT Data',
                    keyvalues: {
                        ...options.metadata,
                        timestamp: new Date().toISOString(),
                        platform: 'DataStreamNFT'
                    }
                },
                pinataOptions: {
                    cidVersion: 1
                }
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.pinataJWT}`
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Pinata upload failed: ${response.status} ${errorText}`);
            }

            const result = await response.json();
            
            return {
                success: true,
                ipfsHash: result.IpfsHash,
                pinSize: result.PinSize,
                timestamp: result.Timestamp
            };
        } catch (error) {
            console.error('Pinata upload error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Upload file to IPFS
     * @param {Buffer} fileBuffer - File buffer
     * @param {string} fileName - File name
     * @param {Object} options - Upload options
     * @returns {Promise<Object>} Upload result
     */
    async uploadFile(fileBuffer, fileName, options = {}) {
        try {
            if (!this.pinataJWT) {
                throw new Error('Pinata JWT token not configured');
            }

            const formData = new FormData();
            formData.append('file', fileBuffer, {
                filename: fileName,
                contentType: options.contentType || 'application/octet-stream'
            });

            const metadata = {
                name: options.name || fileName,
                keyvalues: {
                    ...options.metadata,
                    timestamp: new Date().toISOString(),
                    platform: 'DataStreamNFT'
                }
            };

            formData.append('pinataMetadata', JSON.stringify(metadata));

            const pinataOptions = {
                cidVersion: 1
            };

            formData.append('pinataOptions', JSON.stringify(pinataOptions));

            const url = `${this.baseUrl}/pinning/pinFileToIPFS`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.pinataJWT}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Pinata upload failed: ${response.status} ${errorText}`);
            }

            const result = await response.json();
            
            return {
                success: true,
                ipfsHash: result.IpfsHash,
                pinSize: result.PinSize,
                timestamp: result.Timestamp
            };
        } catch (error) {
            console.error('Pinata file upload error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get file from IPFS
     * @param {string} ipfsHash - IPFS hash
     * @returns {Promise<Object>} File data
     */
    async getFile(ipfsHash) {
        try {
            const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.status}`);
            }

            const data = await response.text();
            
            return {
                success: true,
                data: data,
                contentType: response.headers.get('content-type')
            };
        } catch (error) {
            console.error('Pinata get file error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Test Pinata connection
     * @returns {Promise<Object>} Connection status
     */
    async testConnection() {
        try {
            if (!this.pinataJWT) {
                return {
                    success: false,
                    error: 'Pinata JWT token not configured'
                };
            }

            const url = `${this.baseUrl}/data/testAuthentication`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.pinataJWT}`
                }
            });

            if (!response.ok) {
                throw new Error(`Authentication failed: ${response.status}`);
            }

            return {
                success: true,
                message: 'Pinata connection successful'
            };
        } catch (error) {
            console.error('Pinata connection test error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = PinataService;
