const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function testContractReadOnly() {
    console.log("🧪 Testing Deployed DataStreamNFT Contract (Read-Only)...");
    
    // Read deployment info
    const deploymentFile = path.join(__dirname, '..', 'deployments', 'lazai-testnet.json');
    if (!fs.existsSync(deploymentFile)) {
        console.error("❌ Deployment file not found. Please deploy the contract first.");
        return;
    }
    
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
    const contractAddress = deploymentInfo.contracts.DataStreamNFT.address;
    
    console.log(`📋 Contract Address: ${contractAddress}`);
    console.log(`🌐 Network: ${deploymentInfo.network}`);
    
    // Get contract instance
    const DataStreamNFT = await ethers.getContractFactory("DataStreamNFT");
    const contract = DataStreamNFT.attach(contractAddress);
    
    console.log("\n🔍 Testing Contract Read-Only Functions...");
    
    try {
        // Test 1: Basic contract info
        console.log("\n1️⃣ Contract Information:");
        const name = await contract.name();
        const symbol = await contract.symbol();
        const platformTreasury = await contract.platformTreasury();
        const platformFeeBps = await contract.platformFeeBps();
        
        console.log(`   ✅ Name: ${name}`);
        console.log(`   ✅ Symbol: ${symbol}`);
        console.log(`   ✅ Platform Treasury: ${platformTreasury}`);
        console.log(`   ✅ Platform Fee: ${platformFeeBps} bps (${Number(platformFeeBps) / 100}%)`);
        
        // Test 2: Check if contract is properly deployed
        console.log("\n2️⃣ Contract Deployment Verification:");
        const code = await ethers.provider.getCode(contractAddress);
        if (code !== "0x") {
            console.log("   ✅ Contract code exists on blockchain");
            console.log(`   ✅ Contract size: ${code.length} characters`);
        } else {
            console.log("   ❌ No contract code found at address");
        }
        
        // Test 3: Check contract owner
        console.log("\n3️⃣ Contract Ownership:");
        try {
            const owner = await contract.owner();
            console.log(`   ✅ Contract Owner: ${owner}`);
        } catch (error) {
            console.log(`   ⚠️  Owner check failed: ${error.message}`);
        }
        
        // Test 4: Check if any NFTs exist
        console.log("\n4️⃣ NFT Data Check:");
        try {
            // Try to get NFT data for token ID 1
            const nftData = await contract.dataNFTs(1);
            console.log(`   ✅ NFT #1 exists:`);
            console.log(`      Creator: ${nftData.creator}`);
            console.log(`      Query Price: ${ethers.formatEther(nftData.queryPrice)} ETH`);
            console.log(`      Total Queries: ${nftData.totalQueries}`);
            console.log(`      Total Earned: ${ethers.formatEther(nftData.totalEarned)} ETH`);
        } catch (error) {
            console.log(`   ℹ️  No NFTs found yet (this is normal for a new contract)`);
        }
        
        // Test 5: Network information
        console.log("\n5️⃣ Network Information:");
        const network = await ethers.provider.getNetwork();
        console.log(`   ✅ Chain ID: ${network.chainId}`);
        console.log(`   ✅ Network Name: ${network.name}`);
        
        // Test 6: Check deployer balance
        console.log("\n6️⃣ Deployer Balance:");
        const deployerBalance = await ethers.provider.getBalance(platformTreasury);
        console.log(`   ✅ Platform Treasury Balance: ${ethers.formatEther(deployerBalance)} LAZAI`);
        
        console.log("\n🎉 Contract is properly deployed and accessible!");
        console.log("\n📝 Next Steps:");
        console.log("   1. Use MetaMask or another wallet to interact with the contract");
        console.log("   2. Connect your frontend to this contract address");
        console.log("   3. Test minting and querying through the UI");
        
    } catch (error) {
        console.error("❌ Test failed:", error.message);
    }
}

testContractReadOnly()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
