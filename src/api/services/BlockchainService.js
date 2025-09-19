const { ethers } = require('ethers');

class BlockchainService {
    constructor() {
        this.provider = null;
        this.wallet = null;
        this.dataStreamNFT = null;
        this.datToken = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            // Initialize provider
            const rpcUrl = process.env.LAZCHAIN_RPC_URL || 'http://localhost:8545';
            this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);

            // Initialize wallet if private key is provided
            if (process.env.PRIVATE_KEY) {
                this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
            }

            // Load contract addresses from environment
            const dataStreamNFTAddress = process.env.DATASTREAM_NFT_ADDRESS;
            const datTokenAddress = process.env.DAT_TOKEN_ADDRESS;

            if (dataStreamNFTAddress && datTokenAddress) {
                await this.loadContracts(dataStreamNFTAddress, datTokenAddress);
            }

            this.isInitialized = true;
            console.log('Blockchain service initialized successfully');

        } catch (error) {
            console.error('Blockchain service initialization failed:', error);
            throw error;
        }
    }

    async loadContracts(dataStreamNFTAddress, datTokenAddress) {
        try {
            // Load DataStreamNFT contract ABI (simplified for now)
            const dataStreamNFTABI = [
                "function mintDataStream(string memory ipfsHash, string memory metadataHash, uint256 queryPrice, address to) external returns (uint256)",
                "function executeQuery(uint256 tokenId) external",
                "function getDataStream(uint256 tokenId) external view returns (tuple(string ipfsHash, string metadataHash, uint256 queryPrice, address creator, uint256 totalQueries, uint256 totalEarnings, bool isActive, uint256 createdAt))",
                "function getTotalTokens() external view returns (uint256)",
                "function tokenURI(uint256 tokenId) external view returns (string memory)"
            ];

            // Load DAT Token contract ABI (simplified for now)
            const datTokenABI = [
                "function transfer(address to, uint256 amount) external returns (bool)",
                "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
                "function approve(address spender, uint256 amount) external returns (bool)",
                "function balanceOf(address account) external view returns (uint256)",
                "function allowance(address owner, address spender) external view returns (uint256)"
            ];

            // Create contract instances
            this.dataStreamNFT = new ethers.Contract(
                dataStreamNFTAddress,
                dataStreamNFTABI,
                this.wallet || this.provider
            );

            this.datToken = new ethers.Contract(
                datTokenAddress,
                datTokenABI,
                this.wallet || this.provider
            );

            console.log('Contracts loaded successfully');

        } catch (error) {
            console.error('Failed to load contracts:', error);
            throw error;
        }
    }

    async getNetworkInfo() {
        try {
            const network = await this.provider.getNetwork();
            const blockNumber = await this.provider.getBlockNumber();
            const gasPrice = await this.provider.getGasPrice();

            return {
                name: network.name,
                chainId: network.chainId,
                blockNumber,
                gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei')
            };
        } catch (error) {
            throw new Error(`Failed to get network info: ${error.message}`);
        }
    }

    async getWalletBalance(address) {
        try {
            const balance = await this.provider.getBalance(address);
            return ethers.utils.formatEther(balance);
        } catch (error) {
            throw new Error(`Failed to get wallet balance: ${error.message}`);
        }
    }

    async getDATTokenBalance(address) {
        try {
            if (!this.datToken) {
                throw new Error('DAT Token contract not loaded');
            }

            const balance = await this.datToken.balanceOf(address);
            return ethers.utils.formatEther(balance);
        } catch (error) {
            throw new Error(`Failed to get DAT token balance: ${error.message}`);
        }
    }

    async mintDataStream(ipfsHash, metadataHash, queryPrice, toAddress) {
        try {
            if (!this.dataStreamNFT) {
                throw new Error('DataStreamNFT contract not loaded');
            }

            if (!this.wallet) {
                throw new Error('Wallet not initialized');
            }

            const tx = await this.dataStreamNFT.mintDataStream(
                ipfsHash,
                metadataHash,
                ethers.utils.parseEther(queryPrice.toString()),
                toAddress
            );

            const receipt = await tx.wait();
            return {
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString(),
                tokenId: receipt.events[0].args.tokenId.toString()
            };

        } catch (error) {
            throw new Error(`Failed to mint DataStream: ${error.message}`);
        }
    }

    async executeQuery(tokenId, fromAddress) {
        try {
            if (!this.dataStreamNFT) {
                throw new Error('DataStreamNFT contract not loaded');
            }

            // Create a new wallet instance for the user
            const userWallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
            const dataStreamNFTWithUser = this.dataStreamNFT.connect(userWallet);

            const tx = await dataStreamNFTWithUser.executeQuery(tokenId);
            const receipt = await tx.wait();

            return {
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString()
            };

        } catch (error) {
            throw new Error(`Failed to execute query: ${error.message}`);
        }
    }

    async getDataStream(tokenId) {
        try {
            if (!this.dataStreamNFT) {
                throw new Error('DataStreamNFT contract not loaded');
            }

            const dataStream = await this.dataStreamNFT.getDataStream(tokenId);
            
            return {
                ipfsHash: dataStream.ipfsHash,
                metadataHash: dataStream.metadataHash,
                queryPrice: ethers.utils.formatEther(dataStream.queryPrice),
                creator: dataStream.creator,
                totalQueries: dataStream.totalQueries.toString(),
                totalEarnings: ethers.utils.formatEther(dataStream.totalEarnings),
                isActive: dataStream.isActive,
                createdAt: new Date(parseInt(dataStream.createdAt) * 1000).toISOString()
            };

        } catch (error) {
            throw new Error(`Failed to get DataStream: ${error.message}`);
        }
    }

    async getTotalTokens() {
        try {
            if (!this.dataStreamNFT) {
                throw new Error('DataStreamNFT contract not loaded');
            }

            const totalTokens = await this.dataStreamNFT.getTotalTokens();
            return totalTokens.toString();

        } catch (error) {
            throw new Error(`Failed to get total tokens: ${error.message}`);
        }
    }

    isServiceInitialized() {
        return this.isInitialized;
    }

    getProvider() {
        return this.provider;
    }

    getWallet() {
        return this.wallet;
    }

    getDataStreamNFTContract() {
        return this.dataStreamNFT;
    }

    getDATTokenContract() {
        return this.datToken;
    }
}

module.exports = BlockchainService;
