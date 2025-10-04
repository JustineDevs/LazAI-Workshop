const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('DataStreamNFT Contract', () => {
  let dataStreamNFT;
  let owner;
  let user1;
  let user2;
  let platformTreasury;

  beforeEach(async () => {
    [owner, user1, user2, platformTreasury] = await ethers.getSigners();
    
    const DataStreamNFT = await ethers.getContractFactory('DataStreamNFT');
    dataStreamNFT = await DataStreamNFT.deploy(platformTreasury.address);
    await dataStreamNFT.waitForDeployment();
  });

  describe('Deployment', () => {
    it('should set the correct name and symbol', async () => {
      expect(await dataStreamNFT.name()).to.equal('DataStreamNFT');
      expect(await dataStreamNFT.symbol()).to.equal('DAT');
    });

    it('should set the correct platform treasury', async () => {
      expect(await dataStreamNFT.platformTreasury()).to.equal(platformTreasury.address);
    });

    it('should set the correct platform fee', async () => {
      expect(await dataStreamNFT.platformFeeBps()).to.equal(250); // 2.5%
    });
  });

  describe('Minting', () => {
    it('should mint a new Data NFT', async () => {
      const tokenURI = 'ipfs://QmTestData123456789';
      const queryPrice = ethers.parseEther('0.01');

      await expect(dataStreamNFT.connect(user1).mintDataNFT(tokenURI, queryPrice))
        .to.emit(dataStreamNFT, 'DataNFTMinted')
        .withArgs(1, user1.address, tokenURI, queryPrice);

      expect(await dataStreamNFT.ownerOf(1)).to.equal(user1.address);
      expect(await dataStreamNFT.tokenURI(1)).to.equal(tokenURI);
    });

    it('should store correct DataNFT data', async () => {
      const tokenURI = 'ipfs://QmTestData123456789';
      const queryPrice = ethers.parseEther('0.01');

      await dataStreamNFT.connect(user1).mintDataNFT(tokenURI, queryPrice);
      
      const dataNFT = await dataStreamNFT.dataNFTs(1);
      expect(dataNFT.creator).to.equal(user1.address);
      expect(dataNFT.queryPrice).to.equal(queryPrice);
      expect(dataNFT.totalQueries).to.equal(0);
      expect(dataNFT.totalEarned).to.equal(0);
    });
  });

  describe('Query Payments', () => {
    beforeEach(async () => {
      const tokenURI = 'ipfs://QmTestData123456789';
      const queryPrice = ethers.parseEther('0.01');
      await dataStreamNFT.connect(user1).mintDataNFT(tokenURI, queryPrice);
    });

    it('should allow query payment', async () => {
      const queryPrice = ethers.parseEther('0.01');
      
      await expect(dataStreamNFT.connect(user2).payForQuery(1, { value: queryPrice }))
        .to.emit(dataStreamNFT, 'QueryPaid')
        .withArgs(1, user2.address, queryPrice);

      const dataNFT = await dataStreamNFT.dataNFTs(1);
      expect(dataNFT.totalQueries).to.equal(1);
      expect(dataNFT.totalEarned).to.equal(queryPrice);
    });

    it('should reject insufficient payment', async () => {
      const insufficientPayment = ethers.parseEther('0.005');
      
      await expect(
        dataStreamNFT.connect(user2).payForQuery(1, { value: insufficientPayment })
      ).to.be.revertedWith('Insufficient payment');
    });

    it('should distribute platform fee correctly', async () => {
      const queryPrice = ethers.parseEther('0.01');
      const platformFee = (queryPrice * 250n) / 10000n; // 2.5%
      const creatorEarning = queryPrice - platformFee;

      const treasuryBalanceBefore = await ethers.provider.getBalance(platformTreasury.address);
      const creatorBalanceBefore = await ethers.provider.getBalance(user1.address);

      await dataStreamNFT.connect(user2).payForQuery(1, { value: queryPrice });

      const treasuryBalanceAfter = await ethers.provider.getBalance(platformTreasury.address);
      const creatorBalanceAfter = await ethers.provider.getBalance(user1.address);

      expect(treasuryBalanceAfter - treasuryBalanceBefore).to.equal(platformFee);
      expect(creatorBalanceAfter - creatorBalanceBefore).to.equal(creatorEarning);
    });
  });

  describe('Query Price Updates', () => {
    beforeEach(async () => {
      const tokenURI = 'ipfs://QmTestData123456789';
      const queryPrice = ethers.parseEther('0.01');
      await dataStreamNFT.connect(user1).mintDataNFT(tokenURI, queryPrice);
    });

    it('should allow owner to update query price', async () => {
      const newPrice = ethers.parseEther('0.02');
      
      await expect(dataStreamNFT.connect(user1).updateQueryPrice(1, newPrice))
        .to.emit(dataStreamNFT, 'QueryPriceUpdated')
        .withArgs(1, newPrice);

      const dataNFT = await dataStreamNFT.dataNFTs(1);
      expect(dataNFT.queryPrice).to.equal(newPrice);
    });

    it('should reject non-owner from updating price', async () => {
      const newPrice = ethers.parseEther('0.02');
      
      await expect(
        dataStreamNFT.connect(user2).updateQueryPrice(1, newPrice)
      ).to.be.revertedWith('Not the owner');
    });
  });

  describe('Access Control', () => {
    it('should allow only owner to update platform fee', async () => {
      const newFee = 500; // 5%
      
      await dataStreamNFT.connect(owner).updatePlatformFee(newFee);
      expect(await dataStreamNFT.platformFeeBps()).to.equal(newFee);
    });

    it('should reject non-owner from updating platform fee', async () => {
      const newFee = 500;
      
      await expect(
        dataStreamNFT.connect(user1).updatePlatformFee(newFee)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });
});
