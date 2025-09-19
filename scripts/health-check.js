const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function checkContractHealth() {
    console.log("🏥 Checking DataStreamNFT Contract Health...");

    try {
        // Read deployment info
        const deploymentFile = path.join(__dirname, '..', 'deployments', 'lazchain.json');
        if (!fs.existsSync(deploymentFile)) {
            console.error("❌ Deployment file not found. Please deploy the contract first.");
            return false;
        }

        const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
        const contractAddress = deploymentInfo.contracts.DataStreamNFT.address;

        console.log(`📋 Contract Address: ${contractAddress}`);

        // Get contract instance
        const DataStreamNFT = await ethers.getContractFactory("DataStreamNFT");
        const contract = DataStreamNFT.attach(contractAddress);

        // Check 1: Contract is deployed
        console.log("\n1️⃣ Checking contract deployment...");
        const code = await ethers.provider.getCode(contractAddress);
        if (code === "0x") {
            console.error("❌ Contract not found at address");
            return false;
        }
        console.log("✅ Contract code exists on blockchain");

        // Check 2: Contract functions work
        console.log("\n2️⃣ Checking contract functions...");
        try {
            const name = await contract.name();
            const symbol = await contract.symbol();
            const platformTreasury = await contract.platformTreasury();
            const platformFeeBps = await contract.platformFeeBps();

            console.log(`✅ Name: ${name}`);
            console.log(`✅ Symbol: ${symbol}`);
            console.log(`✅ Platform Treasury: ${platformTreasury}`);
            console.log(`✅ Platform Fee: ${platformFeeBps} bps`);
        } catch (error) {
            console.error("❌ Contract function calls failed:", error.message);
            return false;
        }

        // Check 3: Network connectivity
        console.log("\n3️⃣ Checking network connectivity...");
        try {
            const network = await ethers.provider.getNetwork();
            const blockNumber = await ethers.provider.getBlockNumber();
            const gasPrice = await ethers.provider.getFeeData();

            console.log(`✅ Network: ${network.name} (Chain ID: ${network.chainId})`);
            console.log(`✅ Latest Block: ${blockNumber}`);
            console.log(`✅ Gas Price: ${ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei')} gwei`);
        } catch (error) {
            console.error("❌ Network connectivity failed:", error.message);
            return false;
        }

        // Check 4: Deployer balance
        console.log("\n4️⃣ Checking deployer balance...");
        try {
            const [deployer] = await ethers.getSigners();
            const balance = await ethers.provider.getBalance(deployer.address);
            console.log(`✅ Deployer: ${deployer.address}`);
            console.log(`✅ Balance: ${ethers.formatEther(balance)} LAZAI`);

            if (balance === 0n) {
                console.warn("⚠️  Deployer has no LAZAI tokens");
            }
        } catch (error) {
            console.error("❌ Balance check failed:", error.message);
            return false;
        }

        // Check 5: Contract events (if any)
        console.log("\n5️⃣ Checking contract events...");
        try {
            // Try to get the latest block and check for events
            const latestBlock = await ethers.provider.getBlock('latest');
            console.log(`✅ Latest block timestamp: ${new Date(latestBlock.timestamp * 1000).toISOString()}`);
            console.log("✅ Event monitoring ready");
        } catch (error) {
            console.error("❌ Event check failed:", error.message);
            return false;
        }

        console.log("\n🎉 All health checks passed!");
        console.log("\n📊 Contract Status: HEALTHY ✅");
        return true;

    } catch (error) {
        console.error("❌ Health check failed:", error.message);
        console.log("\n📊 Contract Status: UNHEALTHY ❌");
        return false;
    }
}

async function checkAPIServer() {
    console.log("\n🌐 Checking API Server Health...");

    try {
        const axios = require('axios');
        const apiUrl = process.env.API_URL || 'http://localhost:3001';
        
        // Check API health endpoint
        const response = await axios.get(`${apiUrl}/api/v1/health`, { timeout: 5000 });
        
        if (response.status === 200) {
            console.log("✅ API Server is healthy");
            console.log(`✅ Response: ${JSON.stringify(response.data)}`);
            return true;
        } else {
            console.error(`❌ API Server returned status: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.error("❌ API Server check failed:", error.message);
        console.log("💡 Make sure the API server is running on port 3001");
        return false;
    }
}

async function checkDatabase() {
    console.log("\n🗄️ Checking Database Health...");

    try {
        const mongoose = require('mongoose');
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/datastreamnft';
        
        await mongoose.connect(mongoUri);
        console.log("✅ Database connection successful");
        
        // Check if we can perform basic operations
        const admin = mongoose.connection.db.admin();
        const result = await admin.ping();
        console.log("✅ Database ping successful");
        
        await mongoose.disconnect();
        return true;
    } catch (error) {
        console.error("❌ Database check failed:", error.message);
        console.log("💡 Make sure MongoDB is running and accessible");
        return false;
    }
}

async function main() {
    console.log("🔍 Starting comprehensive health check...\n");

    const results = {
        contract: false,
        api: false,
        database: false
    };

    // Check contract
    results.contract = await checkContractHealth();

    // Check API server (optional)
    if (process.env.CHECK_API === 'true') {
        results.api = await checkAPIServer();
    } else {
        console.log("\n🌐 Skipping API check (set CHECK_API=true to enable)");
    }

    // Check database (optional)
    if (process.env.CHECK_DATABASE === 'true') {
        results.database = await checkDatabase();
    } else {
        console.log("\n🗄️ Skipping database check (set CHECK_DATABASE=true to enable)");
    }

    // Summary
    console.log("\n📋 Health Check Summary:");
    console.log(`Contract: ${results.contract ? '✅ HEALTHY' : '❌ UNHEALTHY'}`);
    console.log(`API: ${results.api ? '✅ HEALTHY' : '❌ UNHEALTHY'}`);
    console.log(`Database: ${results.database ? '✅ HEALTHY' : '❌ UNHEALTHY'}`);

    const allHealthy = Object.values(results).every(status => status === true);
    
    if (allHealthy) {
        console.log("\n🎉 All systems are healthy!");
        process.exit(0);
    } else {
        console.log("\n⚠️  Some systems are unhealthy. Please check the logs above.");
        process.exit(1);
    }
}

main().catch((error) => {
    console.error("❌ Health check failed:", error);
    process.exit(1);
});
