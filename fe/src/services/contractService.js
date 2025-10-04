import { ethers } from 'ethers';

export class ContractService {
    constructor(provider, signer, contractAddress) {
        this.provider = provider;
        this.signer = signer;
        this.contractAddress = contractAddress;
        
        // Contract ABI
        this.abi = [
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
        
        this.contract = new ethers.Contract(contractAddress, this.abi, signer);
    }

    // Mint a new Data NFT
    async mintDataNFT(tokenURI, queryPriceInWei) {
        try {
            console.log('Minting Data NFT...', { tokenURI, queryPriceInWei });
            
            const tx = await this.contract.mintDataNFT(tokenURI, queryPriceInWei);
            console.log('Transaction sent:', tx.hash);
            
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);
            
            // Find the mint event
            const mintEvent = receipt.logs.find(log => {
                try {
                    const parsed = this.contract.interface.parseLog(log);
                    return parsed.name === 'DataNFTMinted';
                } catch (e) {
                    return false;
                }
            });
            
            if (mintEvent) {
                const parsed = this.contract.interface.parseLog(mintEvent);
                return {
                    success: true,
                    tokenId: parsed.args.tokenId.toString(),
                    transactionHash: tx.hash,
                    gasUsed: receipt.gasUsed.toString()
                };
            } else {
                throw new Error('Mint event not found in transaction receipt');
            }
        } catch (error) {
            console.error('Error minting Data NFT:', error);
            throw error;
        }
    }

    // Pay for a query on a Data NFT
    async payForQuery(tokenId, paymentAmount) {
        try {
            console.log('Paying for query...', { tokenId, paymentAmount });
            
            const tx = await this.contract.payForQuery(tokenId, { 
                value: ethers.parseEther(paymentAmount.toString()) 
            });
            console.log('Payment transaction sent:', tx.hash);
            
            const receipt = await tx.wait();
            console.log('Payment transaction confirmed:', receipt);
            
            return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString()
            };
        } catch (error) {
            console.error('Error paying for query:', error);
            throw error;
        }
    }

    // Update query price for a Data NFT (only by creator)
    async updateQueryPrice(tokenId, newPriceInWei) {
        try {
            console.log('Updating query price...', { tokenId, newPriceInWei });
            
            const tx = await this.contract.updateQueryPrice(tokenId, newPriceInWei);
            console.log('Update transaction sent:', tx.hash);
            
            const receipt = await tx.wait();
            console.log('Update transaction confirmed:', receipt);
            
            return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString()
            };
        } catch (error) {
            console.error('Error updating query price:', error);
            throw error;
        }
    }

    // Get Data NFT information
    async getDataNFT(tokenId) {
        try {
            const nftData = await this.contract.dataNFTs(tokenId);
            const tokenURI = await this.contract.tokenURI(tokenId);
            const owner = await this.contract.ownerOf(tokenId);
            
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
            console.error('Error getting Data NFT:', error);
            throw error;
        }
    }

    // Get contract information
    async getContractInfo() {
        try {
            const name = await this.contract.name();
            const symbol = await this.contract.symbol();
            const platformTreasury = await this.contract.platformTreasury();
            const platformFeeBps = await this.contract.platformFeeBps();
            
            return {
                name,
                symbol,
                platformTreasury,
                platformFeeBps: platformFeeBps.toString(),
                platformFeePercent: (Number(platformFeeBps) / 100).toFixed(2)
            };
        } catch (error) {
            console.error('Error getting contract info:', error);
            throw error;
        }
    }

    // Check if user owns a token
    async isOwner(tokenId, address) {
        try {
            const owner = await this.contract.ownerOf(tokenId);
            return owner.toLowerCase() === address.toLowerCase();
        } catch (error) {
            console.error('Error checking ownership:', error);
            return false;
        }
    }

    // Get all Data NFTs created by an address
    async getDataNFTsByCreator(creatorAddress) {
        try {
            // This would require indexing events or using a subgraph
            // For now, we'll return an empty array
            // In production, you'd want to use The Graph or similar
            console.log('Getting Data NFTs by creator:', creatorAddress);
            return [];
        } catch (error) {
            console.error('Error getting Data NFTs by creator:', error);
            return [];
        }
    }

    // Listen for events
    onDataNFTMinted(callback) {
        this.contract.on('DataNFTMinted', callback);
    }

    onQueryPaid(callback) {
        this.contract.on('QueryPaid', callback);
    }

    onQueryPriceUpdated(callback) {
        this.contract.on('QueryPriceUpdated', callback);
    }

    // Remove event listeners
    removeAllListeners() {
        this.contract.removeAllListeners();
    }
}

export default ContractService;
