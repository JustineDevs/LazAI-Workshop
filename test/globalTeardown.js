module.exports = async () => {
    console.log('🧹 Starting global test teardown...');
    
    // Clean up any global resources
    // Reset environment variables if needed
    delete process.env.NODE_ENV;
    delete process.env.LAZCHAIN_RPC_URL;
    delete process.env.CONTRACT_ADDRESS;
    delete process.env.PRIVATE_KEY;
    
    console.log('✅ Global test teardown complete');
};
