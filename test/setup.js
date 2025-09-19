const { ethers } = require('hardhat');

// Global test setup
beforeAll(async function () {
    console.log('Setting up test environment...');
    
    // Ensure we have a clean state
    await ethers.provider.send('hardhat_reset', []);
    
    console.log('Test environment ready');
});

// Global test teardown
afterAll(async function () {
    console.log('Cleaning up test environment...');
});

// Helper function to get test accounts
global.getTestAccounts = async function() {
    const accounts = await ethers.getSigners();
    return {
        owner: accounts[0],
        user1: accounts[1],
        user2: accounts[2],
        user3: accounts[3],
        platformTreasury: accounts[4]
    };
};

// Helper function to deploy test contract
global.deployTestContract = async function(platformTreasury) {
    const DataStreamNFT = await ethers.getContractFactory('DataStreamNFT');
    const contract = await DataStreamNFT.deploy(platformTreasury.address);
    await contract.waitForDeployment();
    return contract;
};

// Helper function to mint test NFT
global.mintTestNFT = async function(contract, creator, tokenURI, queryPrice) {
    const tx = await contract.connect(creator).mintDataNFT(tokenURI, queryPrice);
    const receipt = await tx.wait();
    
    // Find the mint event
    const mintEvent = receipt.logs.find(log => {
        try {
            const parsed = contract.interface.parseLog(log);
            return parsed.name === 'DataNFTMinted';
        } catch (e) {
            return false;
        }
    });
    
    if (mintEvent) {
        const parsed = contract.interface.parseLog(mintEvent);
        return parsed.args.tokenId.toString();
    }
    
    throw new Error('Mint event not found');
};

// Helper function to advance time
global.advanceTime = async function(seconds) {
    await ethers.provider.send('evm_increaseTime', [seconds]);
    await ethers.provider.send('evm_mine');
};

// Helper function to get current block timestamp
global.getCurrentTimestamp = async function() {
    const block = await ethers.provider.getBlock('latest');
    return block.timestamp;
};

// Helper function to get balance
global.getBalance = async function(address) {
    const balance = await ethers.provider.getBalance(address);
    return ethers.formatEther(balance);
};

// Helper function to send ETH
global.sendETH = async function(from, to, amount) {
    const tx = await from.sendTransaction({
        to: to.address,
        value: ethers.parseEther(amount.toString())
    });
    await tx.wait();
};

// Mock console methods for cleaner test output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeEach(function() {
    // Suppress console output during tests unless explicitly enabled
    if (!process.env.VERBOSE_TESTS) {
        console.log = () => {};
        console.error = () => {};
    }
});

afterEach(function() {
    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
});
