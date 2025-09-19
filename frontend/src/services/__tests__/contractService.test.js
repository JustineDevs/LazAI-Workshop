import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ethers } from 'ethers';
import ContractService from '../contractService';

// Mock ethers
vi.mock('ethers', () => ({
    ethers: {
        Contract: vi.fn(),
        formatEther: vi.fn((value) => (Number(value) / 1e18).toString()),
        parseEther: vi.fn((value) => BigInt(Math.floor(Number(value) * 1e18)))
    }
}));

describe('ContractService', () => {
    let contractService;
    let mockProvider;
    let mockSigner;
    let mockContract;
    let contractAddress;

    beforeEach(() => {
        contractAddress = '0x1234567890123456789012345678901234567890';
        mockProvider = {};
        mockSigner = {};
        
        mockContract = {
            mintDataNFT: vi.fn(),
            payForQuery: vi.fn(),
            updateQueryPrice: vi.fn(),
            dataNFTs: vi.fn(),
            tokenURI: vi.fn(),
            ownerOf: vi.fn(),
            interface: {
                parseLog: vi.fn()
            }
        };

        // Mock ethers.Contract constructor
        ethers.Contract.mockReturnValue(mockContract);

        contractService = new ContractService(mockProvider, mockSigner, contractAddress);
    });

    describe('Constructor', () => {
        it('should initialize with correct parameters', () => {
            expect(contractService.provider).toBe(mockProvider);
            expect(contractService.signer).toBe(mockSigner);
            expect(contractService.contractAddress).toBe(contractAddress);
            expect(contractService.contract).toBe(mockContract);
        });
    });

    describe('mintDataNFT', () => {
        it('should mint a Data NFT successfully', async () => {
            const tokenURI = 'ipfs://QmTest123';
            const queryPriceInWei = BigInt('10000000000000000'); // 0.01 ETH
            const mockTx = { hash: '0xtx123', wait: vi.fn() };
            const mockReceipt = { 
                gasUsed: BigInt('200000'),
                logs: [{ 
                    topics: ['0x123'],
                    data: '0xdata'
                }]
            };
            const mockParsedLog = {
                name: 'DataNFTMinted',
                args: { tokenId: BigInt('1') }
            };

            mockContract.mintDataNFT.mockResolvedValue(mockTx);
            mockTx.wait.mockResolvedValue(mockReceipt);
            mockContract.interface.parseLog.mockReturnValue(mockParsedLog);

            const result = await contractService.mintDataNFT(tokenURI, queryPriceInWei);

            expect(mockContract.mintDataNFT).toHaveBeenCalledWith(tokenURI, queryPriceInWei);
            expect(result).toEqual({
                success: true,
                tokenId: '1',
                transactionHash: '0xtx123',
                gasUsed: '200000'
            });
        });

        it('should handle minting errors', async () => {
            const tokenURI = 'ipfs://QmTest123';
            const queryPriceInWei = BigInt('10000000000000000');
            const error = new Error('Transaction failed');

            mockContract.mintDataNFT.mockRejectedValue(error);

            await expect(contractService.mintDataNFT(tokenURI, queryPriceInWei))
                .rejects.toThrow('Transaction failed');
        });
    });

    describe('payForQuery', () => {
        it('should pay for query successfully', async () => {
            const tokenId = 1;
            const paymentAmount = '0.01';
            const mockTx = { hash: '0xtx123', wait: vi.fn() };
            const mockReceipt = { gasUsed: BigInt('100000') };

            mockContract.payForQuery.mockResolvedValue(mockTx);
            mockTx.wait.mockResolvedValue(mockReceipt);

            const result = await contractService.payForQuery(tokenId, paymentAmount);

            expect(mockContract.payForQuery).toHaveBeenCalledWith(tokenId, {
                value: BigInt('10000000000000000') // 0.01 ETH in wei
            });
            expect(result).toEqual({
                success: true,
                transactionHash: '0xtx123',
                gasUsed: '100000'
            });
        });

        it('should handle payment errors', async () => {
            const tokenId = 1;
            const paymentAmount = '0.01';
            const error = new Error('Insufficient funds');

            mockContract.payForQuery.mockRejectedValue(error);

            await expect(contractService.payForQuery(tokenId, paymentAmount))
                .rejects.toThrow('Insufficient funds');
        });
    });

    describe('updateQueryPrice', () => {
        it('should update query price successfully', async () => {
            const tokenId = 1;
            const newPriceInWei = BigInt('20000000000000000'); // 0.02 ETH
            const mockTx = { hash: '0xtx123', wait: vi.fn() };
            const mockReceipt = { gasUsed: BigInt('50000') };

            mockContract.updateQueryPrice.mockResolvedValue(mockTx);
            mockTx.wait.mockResolvedValue(mockReceipt);

            const result = await contractService.updateQueryPrice(tokenId, newPriceInWei);

            expect(mockContract.updateQueryPrice).toHaveBeenCalledWith(tokenId, newPriceInWei);
            expect(result).toEqual({
                success: true,
                transactionHash: '0xtx123',
                gasUsed: '50000'
            });
        });
    });

    describe('getDataNFT', () => {
        it('should get Data NFT information', async () => {
            const tokenId = 1;
            const mockNftData = {
                creator: '0xcreator123',
                queryPrice: BigInt('10000000000000000'),
                totalQueries: BigInt('5'),
                totalEarned: BigInt('50000000000000000')
            };
            const mockTokenURI = 'ipfs://QmTest123';
            const mockOwner = '0xowner123';

            mockContract.dataNFTs.mockResolvedValue(mockNftData);
            mockContract.tokenURI.mockResolvedValue(mockTokenURI);
            mockContract.ownerOf.mockResolvedValue(mockOwner);

            const result = await contractService.getDataNFT(tokenId);

            expect(mockContract.dataNFTs).toHaveBeenCalledWith(tokenId);
            expect(mockContract.tokenURI).toHaveBeenCalledWith(tokenId);
            expect(mockContract.ownerOf).toHaveBeenCalledWith(tokenId);
            expect(result).toEqual({
                tokenId: '1',
                creator: '0xcreator123',
                queryPrice: '0.01',
                totalQueries: '5',
                totalEarned: '0.05',
                tokenURI: 'ipfs://QmTest123',
                owner: '0xowner123'
            });
        });
    });

    describe('getContractInfo', () => {
        it('should get contract information', async () => {
            const mockInfo = {
                name: 'DataStreamNFT',
                symbol: 'DAT',
                platformTreasury: '0xtreasury123',
                platformFeeBps: BigInt('250')
            };

            // Mock contract methods
            Object.keys(mockInfo).forEach(key => {
                mockContract[key] = vi.fn().mockResolvedValue(mockInfo[key]);
            });

            const result = await contractService.getContractInfo();

            expect(result).toEqual({
                name: 'DataStreamNFT',
                symbol: 'DAT',
                platformTreasury: '0xtreasury123',
                platformFeeBps: '250',
                platformFeePercent: '2.50'
            });
        });
    });

    describe('isOwner', () => {
        it('should check ownership correctly', async () => {
            const tokenId = 1;
            const address = '0xowner123';
            const owner = '0xowner123';

            mockContract.ownerOf.mockResolvedValue(owner);

            const result = await contractService.isOwner(tokenId, address);

            expect(mockContract.ownerOf).toHaveBeenCalledWith(tokenId);
            expect(result).toBe(true);
        });

        it('should return false for non-owner', async () => {
            const tokenId = 1;
            const address = '0xowner123';
            const owner = '0xdifferent123';

            mockContract.ownerOf.mockResolvedValue(owner);

            const result = await contractService.isOwner(tokenId, address);

            expect(result).toBe(false);
        });
    });

    describe('Event Listeners', () => {
        it('should add event listeners', () => {
            const callback = vi.fn();
            
            contractService.onDataNFTMinted(callback);
            contractService.onQueryPaid(callback);
            contractService.onQueryPriceUpdated(callback);

            expect(mockContract.on).toHaveBeenCalledWith('DataNFTMinted', callback);
            expect(mockContract.on).toHaveBeenCalledWith('QueryPaid', callback);
            expect(mockContract.on).toHaveBeenCalledWith('QueryPriceUpdated', callback);
        });

        it('should remove all listeners', () => {
            contractService.removeAllListeners();

            expect(mockContract.removeAllListeners).toHaveBeenCalled();
        });
    });
});
