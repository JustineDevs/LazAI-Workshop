const crypto = require('crypto');
const { ethers } = require('ethers');

/**
 * Encryption Service for DataStreamNFT
 * Handles wallet-based encryption, signature verification, and secure key management
 */
class EncryptionService {
    constructor() {
        this.algorithm = 'aes-256-gcm';
        this.keyLength = 32; // 256 bits
        this.ivLength = 16; // 128 bits
        this.tagLength = 16; // 128 bits
    }

    /**
     * Derive encryption key from wallet signature
     */
    async deriveKeyFromSignature(signature, message, address) {
        try {
            // Verify signature first
            const isValid = await this.verifySignature(message, signature, address);
            if (!isValid) {
                throw new Error('Invalid signature');
            }

            // Derive key from signature using PBKDF2
            const key = crypto.pbkdf2Sync(
                signature,
                address.toLowerCase(),
                100000, // iterations
                this.keyLength,
                'sha256'
            );

            return key;
        } catch (error) {
            throw new Error(`Key derivation failed: ${error.message}`);
        }
    }

    /**
     * Verify wallet signature
     */
    async verifySignature(message, signature, expectedAddress) {
        try {
            const recoveredAddress = ethers.utils.verifyMessage(message, signature);
            return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
        } catch (error) {
            console.error('Signature verification failed:', error);
            return false;
        }
    }

    /**
     * Encrypt data with wallet-derived key
     */
    async encryptData(data, signature, address, message) {
        try {
            const key = await this.deriveKeyFromSignature(signature, message, address);
            const iv = crypto.randomBytes(this.ivLength);
            const cipher = crypto.createCipher(this.algorithm, key);
            cipher.setAAD(Buffer.from(address.toLowerCase()));

            let encrypted = cipher.update(data, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            const tag = cipher.getAuthTag();

            return {
                encrypted: encrypted,
                iv: iv.toString('hex'),
                tag: tag.toString('hex'),
                algorithm: this.algorithm,
                address: address.toLowerCase()
            };
        } catch (error) {
            throw new Error(`Encryption failed: ${error.message}`);
        }
    }

    /**
     * Decrypt data with wallet-derived key
     */
    async decryptData(encryptedData, signature, address, message) {
        try {
            const key = await this.deriveKeyFromSignature(signature, message, address);
            const decipher = crypto.createDecipher(this.algorithm, key);
            decipher.setAAD(Buffer.from(address.toLowerCase()));
            decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));

            let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            throw new Error(`Decryption failed: ${error.message}`);
        }
    }

    /**
     * Generate secure nonce for signature
     */
    generateNonce() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Create signature message with nonce
     */
    createSignatureMessage(action, data, nonce) {
        return `DataStreamNFT ${action}: ${data} (nonce: ${nonce})`;
    }

    /**
     * Encrypt file with metadata
     */
    async encryptFile(file, metadata, signature, address, message) {
        try {
            const fileBuffer = Buffer.from(await file.arrayBuffer());
            const metadataBuffer = Buffer.from(JSON.stringify(metadata));
            
            // Combine file and metadata
            const combinedData = Buffer.concat([
                Buffer.from('FILE_START'),
                fileBuffer,
                Buffer.from('METADATA_START'),
                metadataBuffer,
                Buffer.from('END')
            ]);

            return await this.encryptData(combinedData.toString('base64'), signature, address, message);
        } catch (error) {
            throw new Error(`File encryption failed: ${error.message}`);
        }
    }

    /**
     * Decrypt file with metadata
     */
    async decryptFile(encryptedFile, signature, address, message) {
        try {
            const decryptedData = await this.decryptData(encryptedFile, signature, address, message);
            const buffer = Buffer.from(decryptedData, 'base64');
            
            // Parse file and metadata
            const fileStart = buffer.indexOf('FILE_START');
            const metadataStart = buffer.indexOf('METADATA_START');
            const end = buffer.indexOf('END');

            if (fileStart === -1 || metadataStart === -1 || end === -1) {
                throw new Error('Invalid encrypted file format');
            }

            const fileData = buffer.slice(fileStart + 10, metadataStart);
            const metadataData = buffer.slice(metadataStart + 15, end);
            const metadata = JSON.parse(metadataData.toString());

            return {
                fileData: fileData,
                metadata: metadata
            };
        } catch (error) {
            throw new Error(`File decryption failed: ${error.message}`);
        }
    }

    /**
     * Generate encryption key for query
     */
    async generateQueryKey(tokenId, query, signature, address) {
        try {
            const message = this.createSignatureMessage('query', `${tokenId}:${query}`, this.generateNonce());
            return await this.deriveKeyFromSignature(signature, message, address);
        } catch (error) {
            throw new Error(`Query key generation failed: ${error.message}`);
        }
    }

    /**
     * Encrypt query for privacy
     */
    async encryptQuery(query, tokenId, signature, address) {
        try {
            const message = this.createSignatureMessage('query', tokenId, this.generateNonce());
            return await this.encryptData(query, signature, address, message);
        } catch (error) {
            throw new Error(`Query encryption failed: ${error.message}`);
        }
    }

    /**
     * Decrypt query response
     */
    async decryptQueryResponse(encryptedResponse, tokenId, signature, address) {
        try {
            const message = this.createSignatureMessage('response', tokenId, this.generateNonce());
            return await this.decryptData(encryptedResponse, signature, address, message);
        } catch (error) {
            throw new Error(`Response decryption failed: ${error.message}`);
        }
    }

    /**
     * Generate secure hash for data integrity
     */
    generateHash(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    /**
     * Verify data integrity
     */
    verifyIntegrity(data, expectedHash) {
        const actualHash = this.generateHash(data);
        return actualHash === expectedHash;
    }

    /**
     * Create secure session token
     */
    createSessionToken(address, signature, message) {
        const payload = {
            address: address.toLowerCase(),
            signature: signature,
            message: message,
            timestamp: Date.now(),
            nonce: this.generateNonce()
        };

        return Buffer.from(JSON.stringify(payload)).toString('base64');
    }

    /**
     * Verify session token
     */
    async verifySessionToken(token, expectedAddress) {
        try {
            const payload = JSON.parse(Buffer.from(token, 'base64').toString());
            
            // Check if token is not expired (24 hours)
            if (Date.now() - payload.timestamp > 24 * 60 * 60 * 1000) {
                return false;
            }

            // Verify signature
            const isValid = await this.verifySignature(payload.message, payload.signature, expectedAddress);
            return isValid && payload.address.toLowerCase() === expectedAddress.toLowerCase();
        } catch (error) {
            return false;
        }
    }
}

module.exports = EncryptionService;
