const { ethers } = require('ethers');

/**
 * DataStreamNFT SDK
 * A comprehensive JavaScript SDK for interacting with DataStreamNFT platform
 */
class DataStreamSDK {
    constructor(config = {}) {
        this.config = {
            rpcUrl: config.rpcUrl || process.env.LAZCHAIN_RPC_URL || 'http://localhost:8545',
            dataStreamNFTAddress: config.dataStreamNFTAddress || process.env.DATASTREAM_NFT_ADDRESS,
            datTokenAddress: config.datTokenAddress || process.env.DAT_TOKEN_ADDRESS,
            apiBaseUrl: config.apiBaseUrl || process.env.API_BASE_URL || 'http://localhost:3001/api/v1',
            ...config
        };

        this.provider = null;
        this.signer = null;
        this.dataStreamNFT = null;
        this.datToken = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the SDK with a provider or signer
     * @param {ethers.Provider|ethers.Signer} providerOrSigner - Provider or signer instance
     */
    async initialize(providerOrSigner) {
        try {
            if (providerOrSigner instanceof ethers.Signer) {
                this.signer = providerOrSigner;
                this.provider = providerOrSigner.provider;
            } else {
                this.provider = providerOrSigner;
            }

            // Load contracts if addresses are provided
            if (this.config.dataStreamNFTAddress && this.config.datTokenAddress) {
                await this.loadContracts();
            }

            this.isInitialized = true;
            console.log('DataStreamSDK initialized successfully');
        } catch (error) {
            console.error('Failed to initialize DataStreamSDK:', error);
            throw error;
        }
    }

    /**
     * Load contract instances
     */
    async loadContracts() {
        const dataStreamNFTABI = [
            "function mintDataStream(string memory ipfsHash, string memory metadataHash, uint256 queryPrice, address to) external returns (uint256)",
            "function executeQuery(uint256 tokenId) external",
            "function getDataStream(uint256 tokenId) external view returns (tuple(string ipfsHash, string metadataHash, uint256 queryPrice, address creator, uint256 totalQueries, uint256 totalEarnings, bool isActive, uint256 createdAt))",
            "function getTotalTokens() external view returns (uint256)",
            "function tokenURI(uint256 tokenId) external view returns (string memory)",
            "function updateQueryPrice(uint256 tokenId, uint256 newPrice) external",
            "function deactivateDataStream(uint256 tokenId) external"
        ];

        const datTokenABI = [
            "function transfer(address to, uint256 amount) external returns (bool)",
            "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
            "function approve(address spender, uint256 amount) external returns (bool)",
            "function balanceOf(address account) external view returns (uint256)",
            "function allowance(address owner, address spender) external view returns (uint256)"
        ];

        this.dataStreamNFT = new ethers.Contract(
            this.config.dataStreamNFTAddress,
            dataStreamNFTABI,
            this.signer || this.provider
        );

        this.datToken = new ethers.Contract(
            this.config.datTokenAddress,
            datTokenABI,
            this.signer || this.provider
        );
    }

    /**
     * Check if SDK is initialized
     */
    checkInitialized() {
        if (!this.isInitialized) {
            throw new Error('SDK not initialized. Call initialize() first.');
        }
    }

    /**
     * Get current account address
     */
    async getCurrentAddress() {
        this.checkInitialized();
        if (this.signer) {
            return await this.signer.getAddress();
        }
        throw new Error('No signer available');
    }

    /**
     * Get network information
     */
    async getNetworkInfo() {
        this.checkInitialized();
        const network = await this.provider.getNetwork();
        return {
            name: network.name,
            chainId: network.chainId,
            ensAddress: network.ensAddress
        };
    }

    /**
     * Get ETH balance for an address
     */
    async getBalance(address) {
        this.checkInitialized();
        const balance = await this.provider.getBalance(address);
        return ethers.formatEther(balance);
    }

    /**
     * Get DAT token balance for an address
     */
    async getDATBalance(address) {
        this.checkInitialized();
        if (!this.datToken) {
            throw new Error('DAT token contract not loaded');
        }
        const balance = await this.datToken.balanceOf(address);
        return ethers.formatEther(balance);
    }

    /**
     * Mint a new DataStream NFT
     * @param {Object} dataStreamData - DataStream information
     * @param {string} dataStreamData.ipfsHash - IPFS hash of the data
     * @param {string} dataStreamData.metadataHash - IPFS hash of the metadata
     * @param {string|number} dataStreamData.queryPrice - Query price in DAT tokens
     * @param {string} dataStreamData.to - Address to mint the NFT to
     */
    async mintDataStream({ ipfsHash, metadataHash, queryPrice, to }) {
        this.checkInitialized();
        if (!this.dataStreamNFT) {
            throw new Error('DataStreamNFT contract not loaded');
        }
        if (!this.signer) {
            throw new Error('Signer required for minting');
        }

        try {
            const tx = await this.dataStreamNFT.mintDataStream(
                ipfsHash,
                metadataHash,
                ethers.parseEther(queryPrice.toString()),
                to
            );

            const receipt = await tx.wait();
            
            // Extract token ID from event logs
            const event = receipt.logs.find(log => {
                try {
                    const parsed = this.dataStreamNFT.interface.parseLog(log);
                    return parsed.name === 'DataStreamCreated';
                } catch {
                    return false;
                }
            });

            let tokenId = null;
            if (event) {
                const parsed = this.dataStreamNFT.interface.parseLog(event);
                tokenId = parsed.args.tokenId.toString();
            }

            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString(),
                tokenId
            };
        } catch (error) {
            console.error('Mint DataStream failed:', error);
            throw new Error(`Failed to mint DataStream: ${error.message}`);
        }
    }

    /**
     * Execute a query on a DataStream
     * @param {string|number} tokenId - Token ID of the DataStream
     */
    async executeQuery(tokenId) {
        this.checkInitialized();
        if (!this.dataStreamNFT) {
            throw new Error('DataStreamNFT contract not loaded');
        }
        if (!this.signer) {
            throw new Error('Signer required for querying');
        }

        try {
            const tx = await this.dataStreamNFT.executeQuery(tokenId);
            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString()
            };
        } catch (error) {
            console.error('Execute query failed:', error);
            throw new Error(`Failed to execute query: ${error.message}`);
        }
    }

    /**
     * Get DataStream information
     * @param {string|number} tokenId - Token ID of the DataStream
     */
    async getDataStream(tokenId) {
        this.checkInitialized();
        if (!this.dataStreamNFT) {
            throw new Error('DataStreamNFT contract not loaded');
        }

        try {
            const dataStream = await this.dataStreamNFT.getDataStream(tokenId);
            
            return {
                ipfsHash: dataStream.ipfsHash,
                metadataHash: dataStream.metadataHash,
                queryPrice: ethers.formatEther(dataStream.queryPrice),
                creator: dataStream.creator,
                totalQueries: dataStream.totalQueries.toString(),
                totalEarnings: ethers.formatEther(dataStream.totalEarnings),
                isActive: dataStream.isActive,
                createdAt: new Date(Number(dataStream.createdAt) * 1000).toISOString()
            };
        } catch (error) {
            console.error('Get DataStream failed:', error);
            throw new Error(`Failed to get DataStream: ${error.message}`);
        }
    }

    /**
     * Update query price for a DataStream
     * @param {string|number} tokenId - Token ID of the DataStream
     * @param {string|number} newPrice - New query price in DAT tokens
     */
    async updateQueryPrice(tokenId, newPrice) {
        this.checkInitialized();
        if (!this.dataStreamNFT) {
            throw new Error('DataStreamNFT contract not loaded');
        }
        if (!this.signer) {
            throw new Error('Signer required for updating price');
        }

        try {
            const tx = await this.dataStreamNFT.updateQueryPrice(
                tokenId,
                ethers.parseEther(newPrice.toString())
            );
            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString()
            };
        } catch (error) {
            console.error('Update query price failed:', error);
            throw new Error(`Failed to update query price: ${error.message}`);
        }
    }

    /**
     * Deactivate a DataStream
     * @param {string|number} tokenId - Token ID of the DataStream
     */
    async deactivateDataStream(tokenId) {
        this.checkInitialized();
        if (!this.dataStreamNFT) {
            throw new Error('DataStreamNFT contract not loaded');
        }
        if (!this.signer) {
            throw new Error('Signer required for deactivating');
        }

        try {
            const tx = await this.dataStreamNFT.deactivateDataStream(tokenId);
            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString()
            };
        } catch (error) {
            console.error('Deactivate DataStream failed:', error);
            throw new Error(`Failed to deactivate DataStream: ${error.message}`);
        }
    }

    /**
     * Get total number of tokens minted
     */
    async getTotalTokens() {
        this.checkInitialized();
        if (!this.dataStreamNFT) {
            throw new Error('DataStreamNFT contract not loaded');
        }

        try {
            const totalTokens = await this.dataStreamNFT.getTotalTokens();
            return totalTokens.toString();
        } catch (error) {
            console.error('Get total tokens failed:', error);
            throw new Error(`Failed to get total tokens: ${error.message}`);
        }
    }

    /**
     * Approve DAT tokens for spending
     * @param {string} spender - Address to approve
     * @param {string|number} amount - Amount to approve
     */
    async approveDAT(spender, amount) {
        this.checkInitialized();
        if (!this.datToken) {
            throw new Error('DAT token contract not loaded');
        }
        if (!this.signer) {
            throw new Error('Signer required for approval');
        }

        try {
            const tx = await this.datToken.approve(
                spender,
                ethers.parseEther(amount.toString())
            );
            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString()
            };
        } catch (error) {
            console.error('Approve DAT failed:', error);
            throw new Error(`Failed to approve DAT tokens: ${error.message}`);
        }
    }

    /**
     * Get DAT token allowance
     * @param {string} owner - Owner address
     * @param {string} spender - Spender address
     */
    async getDATAllowance(owner, spender) {
        this.checkInitialized();
        if (!this.datToken) {
            throw new Error('DAT token contract not loaded');
        }

        try {
            const allowance = await this.datToken.allowance(owner, spender);
            return ethers.formatEther(allowance);
        } catch (error) {
            console.error('Get DAT allowance failed:', error);
            throw new Error(`Failed to get DAT allowance: ${error.message}`);
        }
    }

    /**
     * Estimate gas for a transaction
     * @param {string} method - Contract method name
     * @param {Array} params - Method parameters
     */
    async estimateGas(method, params = []) {
        this.checkInitialized();
        if (!this.dataStreamNFT) {
            throw new Error('DataStreamNFT contract not loaded');
        }

        try {
            const gasEstimate = await this.dataStreamNFT[method].estimateGas(...params);
            return gasEstimate.toString();
        } catch (error) {
            console.error('Estimate gas failed:', error);
            throw new Error(`Failed to estimate gas: ${error.message}`);
        }
    }

    /**
     * Get transaction details
     * @param {string} txHash - Transaction hash
     */
    async getTransaction(txHash) {
        this.checkInitialized();
        try {
            const tx = await this.provider.getTransaction(txHash);
            const receipt = await this.provider.getTransactionReceipt(txHash);

            return {
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: tx.value.toString(),
                gasLimit: tx.gasLimit.toString(),
                gasPrice: tx.gasPrice?.toString(),
                nonce: tx.nonce,
                blockNumber: tx.blockNumber,
                blockHash: tx.blockHash,
                status: receipt?.status,
                gasUsed: receipt?.gasUsed?.toString(),
                effectiveGasPrice: receipt?.effectiveGasPrice?.toString()
            };
        } catch (error) {
            console.error('Get transaction failed:', error);
            throw new Error(`Failed to get transaction: ${error.message}`);
        }
    }

    /**
     * Wait for transaction confirmation
     * @param {string} txHash - Transaction hash
     * @param {number} confirmations - Number of confirmations to wait for
     */
    async waitForTransaction(txHash, confirmations = 1) {
        this.checkInitialized();
        try {
            const receipt = await this.provider.waitForTransaction(txHash, confirmations);
            return receipt;
        } catch (error) {
            console.error('Wait for transaction failed:', error);
            throw new Error(`Failed to wait for transaction: ${error.message}`);
        }
    }
}

module.exports = DataStreamSDK;
