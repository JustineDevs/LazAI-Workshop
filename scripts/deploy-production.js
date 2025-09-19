const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("🚀 Starting DataStreamNFT Production Deployment...");
    console.log("⚠️  WARNING: This will deploy to MAINNET!");
    
    // Confirm deployment
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const answer = await new Promise((resolve) => {
        rl.question('Are you sure you want to deploy to MAINNET? (yes/no): ', resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== 'yes') {
        console.log("❌ Deployment cancelled");
        process.exit(0);
    }

    // Get the contract factory
    const DataStreamNFT = await ethers.getContractFactory("DataStreamNFT");

    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Check deployer balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "LAZAI");

    if (balance === 0n) {
        console.error("\n❌ Deployment failed: Insufficient funds for gas fees.");
        console.error("Please ensure you have LAZAI tokens for gas fees.");
        process.exit(1);
    }

    // Get platform treasury address
    const platformTreasury = process.env.PLATFORM_TREASURY || deployer.address;
    console.log("Platform Treasury:", platformTreasury);

    // Deploy DataStreamNFT
    console.log("\n🔨 Deploying DataStreamNFT contract...");
    const dataStreamNFT = await DataStreamNFT.deploy(platformTreasury);
    await dataStreamNFT.waitForDeployment();

    console.log("✅ DataStreamNFT deployed to:", await dataStreamNFT.getAddress());

    // Verify deployments
    console.log("\n🔍 Verifying deployment...");
    
    const dataStreamNFTName = await dataStreamNFT.name();
    const dataStreamNFTSymbol = await dataStreamNFT.symbol();
    const platformTreasuryAddress = await dataStreamNFT.platformTreasury();
    const platformFeeBps = await dataStreamNFT.platformFeeBps();

    console.log("\n=== Production Deployment Summary ===");
    console.log("DataStreamNFT:");
    console.log("  Address:", await dataStreamNFT.getAddress());
    console.log("  Name:", dataStreamNFTName);
    console.log("  Symbol:", dataStreamNFTSymbol);
    console.log("  Platform Treasury:", platformTreasuryAddress);
    console.log("  Platform Fee:", platformFeeBps.toString(), "bps (", (Number(platformFeeBps) / 100).toString(), "%)");

    // Save deployment info
    const deploymentInfo = {
        network: await ethers.provider.getNetwork(),
        deployer: deployer.address,
        contracts: {
            DataStreamNFT: {
                address: await dataStreamNFT.getAddress(),
                name: dataStreamNFTName,
                symbol: dataStreamNFTSymbol,
                platformTreasury: platformTreasuryAddress,
                platformFeeBps: platformFeeBps.toString()
            }
        },
        timestamp: new Date().toISOString(),
        environment: 'production'
    };

    // Write deployment info to file
    const deploymentDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentDir)) {
        fs.mkdirSync(deploymentDir);
    }
    const deploymentFile = path.join(deploymentDir, `lazchain-production.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);

    // Generate environment update
    console.log("\n📝 Environment Variables to Update:");
    console.log(`CONTRACT_ADDRESS=${await dataStreamNFT.getAddress()}`);
    console.log(`PLATFORM_TREASURY=${platformTreasuryAddress}`);

    // Instructions for next steps
    console.log("\n=== Next Steps ===");
    console.log("1. ✅ Contract deployed to LazAI Mainnet");
    console.log("2. 🔍 Verify contract on block explorer");
    console.log("3. 🔧 Update your .env file with the contract address");
    console.log("4. 🧪 Test the contract with sample data");
    console.log("5. 🌐 Deploy frontend and connect to contract");
    console.log("6. 📊 Setup monitoring and analytics");
    console.log("7. 🔒 Configure security and access controls");

    console.log("\n🎉 Production deployment completed successfully!");
    console.log("\n⚠️  IMPORTANT: Keep your private keys secure and never share them!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
