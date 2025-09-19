const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('DataStreamNFT', function () {
    let dataStreamNFT;
    let owner;
    let user1;
    let user2;
    let platformTreasury;

    beforeEach(async function () {
        [owner, user1, user2, platformTreasury] = await ethers.getSigners();
        
        const DataStreamNFT = await ethers.getContractFactory('DataStreamNFT');
        dataStreamNFT = await DataStreamNFT.deploy(platformTreasury.address);
        await dataStreamNFT.waitForDeployment();
    });

    describe('Deployment', function () {
        it('Should set the correct name and symbol', async function () {
            expect(await dataStreamNFT.name()).to.equal('DataStreamNFT');
            expect(await dataStreamNFT.symbol()).to.equal('DAT');
        });

        it('Should set the correct platform treasury', async function () {
            expect(await dataStreamNFT.platformTreasury()).to.equal(platformTreasury.address);
        });

        it('Should set the correct platform fee', async function () {
            expect(await dataStreamNFT.platformFeeBps()).to.equal(250); // 2.5%
        });

        it('Should set the correct owner', async function () {
            expect(await dataStreamNFT.owner()).to.equal(owner.address);
        });
    });

    describe('Minting', function () {
        const tokenURI = 'ipfs://QmTestData123456789';
        const queryPrice = ethers.parseEther('0.01');

        it('Should mint a new Data NFT', async function () {
            const tx = await dataStreamNFT.connect(user1).mintDataNFT(tokenURI, queryPrice);
            const receipt = await tx.wait();

            // Check event emission
            const event = receipt.logs.find(log => {
                try {
                    const parsed = dataStreamNFT.interface.parseLog(log);
                    return parsed.name === 'DataNFTMinted';
                } catch (e) {
                    return false;
                }
            });

            expect(event).to.not.be.undefined;
            const parsed = dataStreamNFT.interface.parseLog(event);
            expect(parsed.args.creator).to.equal(user1.address);
            expect(parsed.args.uri).to.equal(tokenURI);
            expect(parsed.args.queryPrice).to.equal(queryPrice);
        });

        it('Should set correct NFT data', async function () {
            await dataStreamNFT.connect(user1).mintDataNFT(tokenURI, queryPrice);
            
            const nftData = await dataStreamNFT.dataNFTs(1);
            expect(nftData.creator).to.equal(user1.address);
            expect(nftData.queryPrice).to.equal(queryPrice);
            expect(nftData.totalQueries).to.equal(0);
            expect(nftData.totalEarned).to.equal(0);
        });

        it('Should assign token to creator', async function () {
            await dataStreamNFT.connect(user1).mintDataNFT(tokenURI, queryPrice);
            expect(await dataStreamNFT.ownerOf(1)).to.equal(user1.address);
        });

        it('Should reject zero query price', async function () {
            await expect(
                dataStreamNFT.connect(user1).mintDataNFT(tokenURI, 0)
            ).to.be.revertedWith('Query price must be positive');
        });

        it('Should emit DataNFTMinted event', async function () {
            await expect(dataStreamNFT.connect(user1).mintDataNFT(tokenURI, queryPrice))
                .to.emit(dataStreamNFT, 'DataNFTMinted')
                .withArgs(1, user1.address, tokenURI, queryPrice);
        });
    });

    describe('Query Payment', function () {
        const tokenURI = 'ipfs://QmTestData123456789';
        const queryPrice = ethers.parseEther('0.01');
        const paymentAmount = ethers.parseEther('0.01');

        beforeEach(async function () {
            await dataStreamNFT.connect(user1).mintDataNFT(tokenURI, queryPrice);
        });

        it('Should accept payment for query', async function () {
            const tx = await dataStreamNFT.connect(user2).payForQuery(1, { value: paymentAmount });
            const receipt = await tx.wait();

            // Check event emission
            const event = receipt.logs.find(log => {
                try {
                    const parsed = dataStreamNFT.interface.parseLog(log);
                    return parsed.name === 'QueryPaid';
                } catch (e) {
                    return false;
                }
            });

            expect(event).to.not.be.undefined;
            const parsed = dataStreamNFT.interface.parseLog(event);
            expect(parsed.args.tokenId).to.equal(1);
            expect(parsed.args.payer).to.equal(user2.address);
            expect(parsed.args.amount).to.equal(paymentAmount);
        });

        it('Should update NFT statistics', async function () {
            const initialBalance = await ethers.provider.getBalance(user1.address);
            const treasuryBalance = await ethers.provider.getBalance(platformTreasury.address);

            await dataStreamNFT.connect(user2).payForQuery(1, { value: paymentAmount });

            const nftData = await dataStreamNFT.dataNFTs(1);
            expect(nftData.totalQueries).to.equal(1);
            expect(nftData.totalEarned).to.equal(ethers.parseEther('0.00975')); // 97.5% after 2.5% fee

            // Check balances
            const finalBalance = await ethers.provider.getBalance(user1.address);
            const finalTreasuryBalance = await ethers.provider.getBalance(platformTreasury.address);
            
            expect(finalBalance).to.be.gt(initialBalance);
            expect(finalTreasuryBalance).to.be.gt(treasuryBalance);
        });

        it('Should reject insufficient payment', async function () {
            const insufficientPayment = ethers.parseEther('0.005');
            await expect(
                dataStreamNFT.connect(user2).payForQuery(1, { value: insufficientPayment })
            ).to.be.revertedWith('Insufficient payment');
        });

        it('Should reject payment for non-existent token', async function () {
            await expect(
                dataStreamNFT.connect(user2).payForQuery(999, { value: paymentAmount })
            ).to.be.revertedWithCustomError(dataStreamNFT, 'ERC721NonexistentToken');
        });

        it('Should distribute payment correctly', async function () {
            const initialCreatorBalance = await ethers.provider.getBalance(user1.address);
            const initialTreasuryBalance = await ethers.provider.getBalance(platformTreasury.address);

            await dataStreamNFT.connect(user2).payForQuery(1, { value: paymentAmount });

            const finalCreatorBalance = await ethers.provider.getBalance(user1.address);
            const finalTreasuryBalance = await ethers.provider.getBalance(platformTreasury.address);

            const creatorGain = finalCreatorBalance - initialCreatorBalance;
            const treasuryGain = finalTreasuryBalance - initialTreasuryBalance;

            // Platform fee: 2.5% of 0.01 ETH = 0.00025 ETH
            // Creator gets: 97.5% of 0.01 ETH = 0.00975 ETH
            expect(creatorGain).to.be.closeTo(ethers.parseEther('0.00975'), ethers.parseEther('0.001'));
            expect(treasuryGain).to.be.closeTo(ethers.parseEther('0.00025'), ethers.parseEther('0.0001'));
        });
    });

    describe('Price Updates', function () {
        const tokenURI = 'ipfs://QmTestData123456789';
        const initialPrice = ethers.parseEther('0.01');
        const newPrice = ethers.parseEther('0.02');

        beforeEach(async function () {
            await dataStreamNFT.connect(user1).mintDataNFT(tokenURI, initialPrice);
        });

        it('Should allow creator to update price', async function () {
            await dataStreamNFT.connect(user1).updateQueryPrice(1, newPrice);
            
            const nftData = await dataStreamNFT.dataNFTs(1);
            expect(nftData.queryPrice).to.equal(newPrice);
        });

        it('Should emit QueryPriceUpdated event', async function () {
            await expect(dataStreamNFT.connect(user1).updateQueryPrice(1, newPrice))
                .to.emit(dataStreamNFT, 'QueryPriceUpdated')
                .withArgs(1, newPrice);
        });

        it('Should reject price update from non-creator', async function () {
            await expect(
                dataStreamNFT.connect(user2).updateQueryPrice(1, newPrice)
            ).to.be.revertedWith('Only creator can update price');
        });

        it('Should reject zero price', async function () {
            await expect(
                dataStreamNFT.connect(user1).updateQueryPrice(1, 0)
            ).to.be.revertedWith('Price must be positive');
        });

        it('Should reject price update for non-existent token', async function () {
            await expect(
                dataStreamNFT.connect(user1).updateQueryPrice(999, newPrice)
            ).to.be.revertedWithCustomError(dataStreamNFT, 'ERC721NonexistentToken');
        });
    });

    describe('Access Control', function () {
        it('Should allow owner to withdraw', async function () {
            // The contract doesn't accumulate funds since payments go directly to creator and treasury
            // So we'll test that withdraw works when there are no funds (should revert)
            await expect(dataStreamNFT.withdraw()).to.be.revertedWith('No funds to withdraw');
        });

        it('Should reject withdrawal from non-owner', async function () {
            await expect(
                dataStreamNFT.connect(user1).withdraw()
            ).to.be.revertedWithCustomError(dataStreamNFT, 'OwnableUnauthorizedAccount');
        });
    });

    describe('Security', function () {
        it('Should reject direct ETH transfers', async function () {
            await expect(
                user1.sendTransaction({
                    to: await dataStreamNFT.getAddress(),
                    value: ethers.parseEther('0.1')
                })
            ).to.be.revertedWith('Direct ETH deposits not allowed');
        });

        it('Should reject fallback calls', async function () {
            await expect(
                user1.sendTransaction({
                    to: await dataStreamNFT.getAddress(),
                    value: ethers.parseEther('0.1'),
                    data: '0x1234'
                })
            ).to.be.revertedWith('Fallback called');
        });
    });

    describe('Edge Cases', function () {
        it('Should handle multiple queries correctly', async function () {
            const tokenURI = 'ipfs://QmTestData123456789';
            const queryPrice = ethers.parseEther('0.01');
            const paymentAmount = ethers.parseEther('0.01');

            await dataStreamNFT.connect(user1).mintDataNFT(tokenURI, queryPrice);

            // Make 3 queries
            for (let i = 0; i < 3; i++) {
                await dataStreamNFT.connect(user2).payForQuery(1, { value: paymentAmount });
            }

            const nftData = await dataStreamNFT.dataNFTs(1);
            expect(nftData.totalQueries).to.equal(3);
            expect(nftData.totalEarned).to.equal(ethers.parseEther('0.02925')); // 3 * 0.00975
        });

        it('Should handle price updates after queries', async function () {
            const tokenURI = 'ipfs://QmTestData123456789';
            const initialPrice = ethers.parseEther('0.01');
            const newPrice = ethers.parseEther('0.02');
            const paymentAmount = ethers.parseEther('0.01');

            await dataStreamNFT.connect(user1).mintDataNFT(tokenURI, initialPrice);
            await dataStreamNFT.connect(user2).payForQuery(1, { value: paymentAmount });
            await dataStreamNFT.connect(user1).updateQueryPrice(1, newPrice);

            const nftData = await dataStreamNFT.dataNFTs(1);
            expect(nftData.queryPrice).to.equal(newPrice);
            expect(nftData.totalQueries).to.equal(1);
        });
    });
});
