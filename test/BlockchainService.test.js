const { expect } = require('chai');
const { ethers } = require('hardhat');
const BlockchainService = require('../src/api/services/BlockchainService');

describe('BlockchainService', function () {
    let blockchainService;
    let dataStreamNFT;
    let owner;
    let user1;
    let user2;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        
        const DataStreamNFT = await ethers.getContractFactory('DataStreamNFT');
        dataStreamNFT = await DataStreamNFT.deploy(owner.address);
        await dataStreamNFT.waitForDeployment();

        // Set up environment variables for testing
        process.env.LAZCHAIN_RPC_URL = 'http://localhost:8545';
        process.env.CONTRACT_ADDRESS = await dataStreamNFT.getAddress();
        process.env.PRIVATE_KEY = owner.privateKey;

        blockchainService = new BlockchainService();
        await blockchainService.initialize();
    });

    describe('Initialization', function () {
        it('Should initialize successfully', async function () {
            expect(blockchainService.isServiceInitialized()).to.be.true;
        });

        it('Should have provider and wallet', function () {
            expect(blockchainService.getProvider()).to.not.be.null;
            expect(blockchainService.getWallet()).to.not.be.null;
        });

        it('Should have contract instance', function () {
            expect(blockchainService.getDataStreamNFTContract()).to.not.be.null;
        });
    });

    describe('Network Info', function () {
        it('Should get network information', async function () {
            const networkInfo = await blockchainService.getNetworkInfo();
            
            expect(networkInfo).to.have.property('name');
            expect(networkInfo).to.have.property('chainId');
            expect(networkInfo).to.have.property('blockNumber');
            expect(networkInfo).to.have.property('gasPrice');
        });
    });

    describe('Wallet Balance', function () {
        it('Should get wallet balance', async function () {
            const balance = await blockchainService.getWalletBalance(owner.address);
            expect(balance).to.be.a('string');
            expect(parseFloat(balance)).to.be.greaterThan(0);
        });
    });

    describe('Contract Info', function () {
        it('Should get contract information', async function () {
            const contractInfo = await blockchainService.getContractInfo();
            
            expect(contractInfo).to.have.property('name', 'DataStreamNFT');
            expect(contractInfo).to.have.property('symbol', 'DAT');
            expect(contractInfo).to.have.property('platformTreasury');
            expect(contractInfo).to.have.property('platformFeeBps', '250');
            expect(contractInfo).to.have.property('platformFeePercent', '2.50');
        });
    });

    describe('Data NFT Operations', function () {
        const tokenURI = 'ipfs://QmTestData123456789';
        const queryPrice = ethers.parseEther('0.01');

        beforeEach(async function () {
            // Mint a test NFT
            await dataStreamNFT.connect(user1).mintDataNFT(tokenURI, queryPrice);
        });

        it('Should get Data NFT information', async function () {
            const dataNFT = await blockchainService.getDataNFT(1);
            
            expect(dataNFT).to.have.property('tokenId', '1');
            expect(dataNFT).to.have.property('creator', user1.address);
            expect(dataNFT).to.have.property('queryPrice', '0.01');
            expect(dataNFT).to.have.property('totalQueries', '0');
            expect(dataNFT).to.have.property('totalEarned', '0.0');
            expect(dataNFT).to.have.property('tokenURI', tokenURI);
            expect(dataNFT).to.have.property('owner', user1.address);
        });

        it('Should get token URI', async function () {
            const uri = await blockchainService.getTokenURI(1);
            expect(uri).to.equal(tokenURI);
        });

        it('Should check ownership correctly', async function () {
            const isOwner1 = await blockchainService.isOwner(1, user1.address);
            const isOwner2 = await blockchainService.isOwner(1, user2.address);
            
            expect(isOwner1).to.be.true;
            expect(isOwner2).to.be.false;
        });

        it('Should mint Data NFT', async function () {
            const result = await blockchainService.mintDataNFT(tokenURI, queryPrice);
            
            expect(result).to.have.property('success', true);
            expect(result).to.have.property('tokenId');
            expect(result).to.have.property('transactionHash');
            expect(result).to.have.property('gasUsed');
        });

        it('Should pay for query', async function () {
            const result = await blockchainService.payForQuery(1, '0.01');
            
            expect(result).to.have.property('success', true);
            expect(result).to.have.property('transactionHash');
            expect(result).to.have.property('gasUsed');
        });

        it('Should update query price', async function () {
            const newPrice = ethers.parseEther('0.02');
            const result = await blockchainService.updateQueryPrice(1, newPrice);
            
            expect(result).to.have.property('success', true);
            expect(result).to.have.property('transactionHash');
            expect(result).to.have.property('gasUsed');
        });
    });

    describe('Error Handling', function () {
        it('Should handle non-existent token', async function () {
            try {
                await blockchainService.getDataNFT(999);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.include('Failed to get Data NFT');
            }
        });

        it('Should handle invalid address for ownership check', async function () {
            const isOwner = await blockchainService.isOwner(1, '0x0000000000000000000000000000000000000000');
            expect(isOwner).to.be.false;
        });
    });
});
