const { ethers } = require('ethers');

class BlockchainService {
    constructor() {
        this.provider = null;
        this.wallet = null;
        this.dataStreamNFT = null;
        this.dataStreamDAT = null;
        this.datToken = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            // Initialize provider
            const rpcUrl = process.env.LAZCHAIN_RPC_URL || 'http://localhost:8545';
            this.provider = new ethers.JsonRpcProvider(rpcUrl);

            // Initialize wallet if private key is provided
            if (process.env.PRIVATE_KEY) {
                this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
            }

            // Load contract addresses from environment
            const dataStreamNFTAddress = process.env.CONTRACT_ADDRESS || '0x1868C3935B5A548C90d5660981FB866160382Da7';
            const dataStreamDATAddress = process.env.DAT_CONTRACT_ADDRESS;

            if (dataStreamNFTAddress) {
                await this.loadContracts(dataStreamNFTAddress);
            }

            if (dataStreamDATAddress) {
                await this.loadDATContract(dataStreamDATAddress);
            }

            this.isInitialized = true;
            console.log('Blockchain service initialized successfully');

        } catch (error) {
            console.error('Blockchain service initialization failed:', error);
            throw error;
        }
    }

    async loadContracts(dataStreamNFTAddress) {
        try {
            // Load DataStreamNFT contract ABI (updated for deployed contract)
            const dataStreamNFTABI = [
                "function mintDataNFT(string memory tokenURI, uint256 queryPriceInWei) external returns (uint256)",
                "function payForQuery(uint256 tokenId) external payable",
                "function updateQueryPrice(uint256 tokenId, uint256 newPriceInWei) external",
                "function dataNFTs(uint256 tokenId) external view returns (address creator, uint256 queryPrice, uint256 totalQueries, uint256 totalEarned)",
                "function ownerOf(uint256 tokenId) external view returns (address)",
                "function tokenURI(uint256 tokenId) external view returns (string memory)",
                "function name() external view returns (string memory)",
                "function symbol() external view returns (string memory)",
                "function platformTreasury() external view returns (address)",
                "function platformFeeBps() external view returns (uint256)",
                "event DataNFTMinted(uint256 indexed tokenId, address indexed creator, string uri, uint256 queryPrice)",
                "event QueryPaid(uint256 indexed tokenId, address indexed payer, uint256 amount)",
                "event QueryPriceUpdated(uint256 indexed tokenId, uint256 newPrice)"
            ];

            // Create contract instance
            this.dataStreamNFT = new ethers.Contract(
                dataStreamNFTAddress,
                dataStreamNFTABI,
                this.wallet || this.provider
            );

            console.log('DataStreamNFT contract loaded successfully');

        } catch (error) {
            console.error('Failed to load contracts:', error);
            throw error;
        }
    }

    async loadDATContract(dataStreamDATAddress) {
        try {
            // Load DataStreamDAT contract ABI
            const dataStreamDATABI = [
                "function mintDataDAT(string memory tokenURI, uint256 queryPriceInWei, string memory fileId, string memory dataClass, string memory dataValue) external returns (uint256)",
                "function payForQuery(uint256 tokenId, string memory query) external payable",
                "function dataDATs(uint256 tokenId) external view returns (address creator, uint256 queryPrice, uint256 totalQueries, uint256 totalEarned, string memory fileId, string memory dataClass, string memory dataValue, uint256 createdAt, bool isActive)",
                "function getDATByFileId(string memory fileId) external view returns (uint256 tokenId, tuple(address creator, uint256 queryPrice, uint256 totalQueries, uint256 totalEarned, string fileId, string dataClass, string dataValue, uint256 createdAt, bool isActive) dat)",
                "function getDATStats(uint256 tokenId) external view returns (uint256 totalQueries, uint256 totalEarned, bool isActive)",
                "function getCreatorTokens(address creator) external view returns (uint256[] memory)",
                "function fileIdExists(string memory fileId) external view returns (bool)",
                "function updateDataClass(uint256 tokenId, string memory newDataClass) external",
                "function updateDataValue(uint256 tokenId, string memory newDataValue) external",
                "function updateFileId(uint256 tokenId, string memory newFileId) external",
                "function toggleActiveStatus(uint256 tokenId) external",
                "function ownerOf(uint256 tokenId) external view returns (address)",
                "function tokenURI(uint256 tokenId) external view returns (string memory)",
                "function name() external view returns (string memory)",
                "function symbol() external view returns (string memory)",
                "function totalSupply() external view returns (uint256)",
                "event DataDATMinted(uint256 indexed tokenId, address indexed creator, string tokenURI, uint256 queryPrice, string fileId, string dataClass, string dataValue)",
                "event QueryPaid(uint256 indexed tokenId, address indexed querier, uint256 amount, string query)",
                "event DataClassUpdated(uint256 indexed tokenId, string newClass)",
                "event DataValueUpdated(uint256 indexed tokenId, string newValue)",
                "event FileIdUpdated(uint256 indexed tokenId, string newFileId)"
            ];

            // Create contract instance
            this.dataStreamDAT = new ethers.Contract(
                dataStreamDATAddress,
                dataStreamDATABI,
                this.wallet || this.provider
            );

            console.log('DataStreamDAT contract loaded successfully');

        } catch (error) {
            console.error('Failed to load DAT contract:', error);
            throw error;
        }
    }

    async getNetworkInfo() {
        try {
            const network = await this.provider.getNetwork();
            const blockNumber = await this.provider.getBlockNumber();
            const feeData = await this.provider.getFeeData();

            return {
                name: network.name,
                chainId: Number(network.chainId),
                blockNumber,
                gasPrice: ethers.formatUnits(feeData.gasPrice || 0, 'gwei'),
                maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : null,
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : null
            };
        } catch (error) {
            throw new Error(`Failed to get network info: ${error.message}`);
        }
    }

    async getWalletBalance(address) {
        try {
            const balance = await this.provider.getBalance(address);
            return ethers.formatEther(balance);
        } catch (error) {
            throw new Error(`Failed to get wallet balance: ${error.message}`);
        }
    }

    async getContractInfo() {
        try {
            if (!this.dataStreamNFT) {
                throw new Error('DataStreamNFT contract not loaded');
            }

            const name = await this.dataStreamNFT.name();
            const symbol = await this.dataStreamNFT.symbol();
            const platformTreasury = await this.dataStreamNFT.platformTreasury();
            const platformFeeBps = await this.dataStreamNFT.platformFeeBps();

            return {
                name,
                symbol,
                platformTreasury,
                platformFeeBps: platformFeeBps.toString(),
                platformFeePercent: (Number(platformFeeBps) / 100).toFixed(2)
            };
        } catch (error) {
            throw new Error(`Failed to get contract info: ${error.message}`);
        }
    }

    async mintDataNFT(tokenURI, queryPriceInWei) {
        try {
            if (!this.dataStreamNFT) {
                throw new Error('DataStreamNFT contract not loaded');
            }

            if (!this.wallet) {
                throw new Error('Wallet not initialized');
            }

            const tx = await this.dataStreamNFT.mintDataNFT(
                tokenURI,
                queryPriceInWei
            );

            const receipt = await tx.wait();
            
            // Find the mint event
            const mintEvent = receipt.logs.find(log => {
                try {
                    const parsed = this.dataStreamNFT.interface.parseLog(log);
                    return parsed.name === 'DataNFTMinted';
                } catch (e) {
                    return false;
                }
            });

            if (mintEvent) {
                const parsed = this.dataStreamNFT.interface.parseLog(mintEvent);
                return {
                    transactionHash: tx.hash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString(),
                    tokenId: parsed.args.tokenId.toString()
                };
            } else {
                throw new Error('Mint event not found in transaction receipt');
            }

        } catch (error) {
            throw new Error(`Failed to mint Data NFT: ${error.message}`);
        }
    }

    async payForQuery(tokenId, paymentAmount) {
        try {
            if (!this.dataStreamNFT) {
                throw new Error('DataStreamNFT contract not loaded');
            }

            if (!this.wallet) {
                throw new Error('Wallet not initialized');
            }

            const tx = await this.dataStreamNFT.payForQuery(tokenId, {
                value: ethers.parseEther(paymentAmount.toString())
            });

            const receipt = await tx.wait();

            return {
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString()
            };

        } catch (error) {
            throw new Error(`Failed to pay for query: ${error.message}`);
        }
    }

    async updateQueryPrice(tokenId, newPriceInWei) {
        try {
            if (!this.dataStreamNFT) {
                throw new Error('DataStreamNFT contract not loaded');
            }

            if (!this.wallet) {
                throw new Error('Wallet not initialized');
            }

            const tx = await this.dataStreamNFT.updateQueryPrice(tokenId, newPriceInWei);
            const receipt = await tx.wait();

            return {
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString()
            };

        } catch (error) {
            throw new Error(`Failed to update query price: ${error.message}`);
        }
    }

    async getDataNFT(tokenId) {
        try {
            if (!this.dataStreamNFT) {
                throw new Error('DataStreamNFT contract not loaded');
            }

            const nftData = await this.dataStreamNFT.dataNFTs(tokenId);
            const tokenURI = await this.dataStreamNFT.tokenURI(tokenId);
            const owner = await this.dataStreamNFT.ownerOf(tokenId);
            
            return {
                tokenId: tokenId.toString(),
                creator: nftData.creator,
                queryPrice: ethers.formatEther(nftData.queryPrice),
                totalQueries: nftData.totalQueries.toString(),
                totalEarned: ethers.formatEther(nftData.totalEarned),
                tokenURI,
                owner
            };

        } catch (error) {
            throw new Error(`Failed to get Data NFT: ${error.message}`);
        }
    }

    async getTokenURI(tokenId) {
        try {
            if (!this.dataStreamNFT) {
                throw new Error('DataStreamNFT contract not loaded');
            }

            const tokenURI = await this.dataStreamNFT.tokenURI(tokenId);
            return tokenURI;

        } catch (error) {
            throw new Error(`Failed to get token URI: ${error.message}`);
        }
    }

    async isOwner(tokenId, address) {
        try {
            if (!this.dataStreamNFT) {
                throw new Error('DataStreamNFT contract not loaded');
            }

            const owner = await this.dataStreamNFT.ownerOf(tokenId);
            return owner.toLowerCase() === address.toLowerCase();

        } catch (error) {
            throw new Error(`Failed to check ownership: ${error.message}`);
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

    getDataStreamDATContract() {
        return this.dataStreamDAT;
    }

    // DAT (Data Anchoring Token) Methods

    async mintDataDAT(tokenURI, queryPriceInWei, fileId, dataClass, dataValue) {
        try {
            if (!this.dataStreamDAT) {
                throw new Error('DataStreamDAT contract not loaded');
            }

            if (!this.wallet) {
                throw new Error('Wallet not initialized');
            }

            const tx = await this.dataStreamDAT.mintDataDAT(
                tokenURI,
                queryPriceInWei,
                fileId,
                dataClass,
                dataValue
            );

            const receipt = await tx.wait();
            
            // Find the mint event
            const mintEvent = receipt.logs.find(log => {
                try {
                    const parsed = this.dataStreamDAT.interface.parseLog(log);
                    return parsed.name === 'DataDATMinted';
                } catch (e) {
                    return false;
                }
            });

            if (mintEvent) {
                const parsed = this.dataStreamDAT.interface.parseLog(mintEvent);
                return {
                    success: true,
                    transactionHash: tx.hash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString(),
                    tokenId: parsed.args.tokenId.toString()
                };
            } else {
                throw new Error('Mint event not found in transaction receipt');
            }

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getDataDAT(tokenId) {
        try {
            if (!this.dataStreamDAT) {
                throw new Error('DataStreamDAT contract not loaded');
            }

            const datData = await this.dataStreamDAT.dataDATs(tokenId);
            const tokenURI = await this.dataStreamDAT.tokenURI(tokenId);
            const owner = await this.dataStreamDAT.ownerOf(tokenId);
            
            return {
                success: true,
                dat: {
                    tokenId: tokenId.toString(),
                    creator: datData.creator,
                    queryPrice: ethers.formatEther(datData.queryPrice),
                    totalQueries: datData.totalQueries.toString(),
                    totalEarned: ethers.formatEther(datData.totalEarned),
                    fileId: datData.fileId,
                    dataClass: datData.dataClass,
                    dataValue: datData.dataValue,
                    createdAt: datData.createdAt.toString(),
                    isActive: datData.isActive,
                    tokenURI,
                    owner
                }
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getDATByFileId(fileId) {
        try {
            if (!this.dataStreamDAT) {
                throw new Error('DataStreamDAT contract not loaded');
            }

            const result = await this.dataStreamDAT.getDATByFileId(fileId);
            
            return {
                success: true,
                tokenId: result.tokenId.toString(),
                dat: {
                    tokenId: result.tokenId.toString(),
                    creator: result.dat.creator,
                    queryPrice: ethers.formatEther(result.dat.queryPrice),
                    totalQueries: result.dat.totalQueries.toString(),
                    totalEarned: ethers.formatEther(result.dat.totalEarned),
                    fileId: result.dat.fileId,
                    dataClass: result.dat.dataClass,
                    dataValue: result.dat.dataValue,
                    createdAt: result.dat.createdAt.toString(),
                    isActive: result.dat.isActive
                }
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getDATStats(tokenId) {
        try {
            if (!this.dataStreamDAT) {
                throw new Error('DataStreamDAT contract not loaded');
            }

            const stats = await this.dataStreamDAT.getDATStats(tokenId);
            
            return {
                success: true,
                stats: {
                    totalQueries: stats.totalQueries.toString(),
                    totalEarned: ethers.formatEther(stats.totalEarned),
                    isActive: stats.isActive
                }
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getCreatorDATs(address) {
        try {
            if (!this.dataStreamDAT) {
                throw new Error('DataStreamDAT contract not loaded');
            }

            const tokenIds = await this.dataStreamDAT.getCreatorTokens(address);
            
            return {
                success: true,
                dats: tokenIds.map(id => id.toString())
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async updateDataClass(tokenId, dataClass, owner) {
        try {
            if (!this.dataStreamDAT) {
                throw new Error('DataStreamDAT contract not loaded');
            }

            if (!this.wallet) {
                throw new Error('Wallet not initialized');
            }

            // Verify ownership
            const tokenOwner = await this.dataStreamDAT.ownerOf(tokenId);
            if (tokenOwner.toLowerCase() !== owner.toLowerCase()) {
                throw new Error('Not the token owner');
            }

            const tx = await this.dataStreamDAT.updateDataClass(tokenId, dataClass);
            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async updateDataValue(tokenId, dataValue, owner) {
        try {
            if (!this.dataStreamDAT) {
                throw new Error('DataStreamDAT contract not loaded');
            }

            if (!this.wallet) {
                throw new Error('Wallet not initialized');
            }

            // Verify ownership
            const tokenOwner = await this.dataStreamDAT.ownerOf(tokenId);
            if (tokenOwner.toLowerCase() !== owner.toLowerCase()) {
                throw new Error('Not the token owner');
            }

            const tx = await this.dataStreamDAT.updateDataValue(tokenId, dataValue);
            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async updateFileId(tokenId, fileId, owner) {
        try {
            if (!this.dataStreamDAT) {
                throw new Error('DataStreamDAT contract not loaded');
            }

            if (!this.wallet) {
                throw new Error('Wallet not initialized');
            }

            // Verify ownership
            const tokenOwner = await this.dataStreamDAT.ownerOf(tokenId);
            if (tokenOwner.toLowerCase() !== owner.toLowerCase()) {
                throw new Error('Not the token owner');
            }

            const tx = await this.dataStreamDAT.updateFileId(tokenId, fileId);
            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async toggleActiveStatus(tokenId, owner) {
        try {
            if (!this.dataStreamDAT) {
                throw new Error('DataStreamDAT contract not loaded');
            }

            if (!this.wallet) {
                throw new Error('Wallet not initialized');
            }

            // Verify ownership
            const tokenOwner = await this.dataStreamDAT.ownerOf(tokenId);
            if (tokenOwner.toLowerCase() !== owner.toLowerCase()) {
                throw new Error('Not the token owner');
            }

            const tx = await this.dataStreamDAT.toggleActiveStatus(tokenId);
            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = BlockchainService;
