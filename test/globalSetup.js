module.exports = async () => {
    console.log('🚀 Starting global test setup...');
    
    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.LAZCHAIN_RPC_URL = 'http://localhost:8545';
    process.env.CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; // Will be set per test
    process.env.PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Hardhat test key
    
    console.log('✅ Global test setup complete');
};
