const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Starting comprehensive smart contract deployment...");

    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying contracts with account:", deployer.address);

    // Check deployer balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

    const deploymentInfo = {
        network: await ethers.provider.getNetwork(),
        deployer: deployer.address,
        contracts: {},
        timestamp: new Date().toISOString()
    };

    try {
        // 1. Deploy DATToken (ERC20)
        console.log("\n📦 1. Deploying DATToken (ERC20)...");
        const DATToken = await ethers.getContractFactory("DATToken");
        const datToken = await DATToken.deploy();
        await datToken.waitForDeployment();
        const datTokenAddress = await datToken.getAddress();
        
        const datTokenName = await datToken.name();
        const datTokenSymbol = await datToken.symbol();
        const datTokenDecimals = await datToken.decimals();
        const datTokenTotalSupply = await datToken.totalSupply();
        
        console.log("✅ DATToken deployed to:", datTokenAddress);
        console.log("   Name:", datTokenName);
        console.log("   Symbol:", datTokenSymbol);
        console.log("   Decimals:", datTokenDecimals);
        console.log("   Total Supply:", ethers.formatEther(datTokenTotalSupply));

        deploymentInfo.contracts.DATToken = {
            address: datTokenAddress,
            name: datTokenName,
            symbol: datTokenSymbol,
            decimals: datTokenDecimals.toString(),
            totalSupply: datTokenTotalSupply.toString()
        };

        // 2. Deploy DataStreamDAT
        console.log("\n📦 2. Deploying DataStreamDAT...");
        const DataStreamDAT = await ethers.getContractFactory("DataStreamDAT");
        const dataStreamDAT = await DataStreamDAT.deploy(deployer.address);
        await dataStreamDAT.waitForDeployment();
        const dataStreamDATAddress = await dataStreamDAT.getAddress();
        
        console.log("✅ DataStreamDAT deployed to:", dataStreamDATAddress);

        deploymentInfo.contracts.DataStreamDAT = {
            address: dataStreamDATAddress
        };

        // 3. Deploy DataStreamNFT (Regular)
        console.log("\n📦 3. Deploying DataStreamNFT (Regular)...");
        const DataStreamNFT = await ethers.getContractFactory("DataStreamNFT");
        const platformTreasury = deployer.address;
        const platformFeeBps = 250; // 2.5%
        
        const dataStreamNFT = await DataStreamNFT.deploy(platformTreasury, platformFeeBps);
        await dataStreamNFT.waitForDeployment();
        const dataStreamNFTAddress = await dataStreamNFT.getAddress();
        
        const dataStreamNFTName = await dataStreamNFT.name();
        const dataStreamNFTSymbol = await dataStreamNFT.symbol();
        const platformTreasuryAddress = await dataStreamNFT.platformTreasury();
        const platformFeeBpsActual = await dataStreamNFT.platformFeeBps();
        const owner = await dataStreamNFT.owner();
        
        console.log("✅ DataStreamNFT deployed to:", dataStreamNFTAddress);
        console.log("   Name:", dataStreamNFTName);
        console.log("   Symbol:", dataStreamNFTSymbol);
        console.log("   Owner:", owner);
        console.log("   Platform Treasury:", platformTreasuryAddress);
        console.log("   Platform Fee:", platformFeeBpsActual.toString(), "bps");

        deploymentInfo.contracts.DataStreamNFT = {
            address: dataStreamNFTAddress,
            name: dataStreamNFTName,
            symbol: dataStreamNFTSymbol,
            owner: owner,
            platformTreasury: platformTreasuryAddress,
            platformFeeBps: platformFeeBpsActual.toString()
        };

        // 4. Deploy DataStreamNFTUpgradeable (Implementation only)
        console.log("\n📦 4. Deploying DataStreamNFTUpgradeable (Implementation)...");
        const DataStreamNFTUpgradeable = await ethers.getContractFactory("DataStreamNFTUpgradeable");
        const dataStreamNFTUpgradeable = await DataStreamNFTUpgradeable.deploy();
        await dataStreamNFTUpgradeable.waitForDeployment();
        const dataStreamNFTUpgradeableAddress = await dataStreamNFTUpgradeable.getAddress();
        
        console.log("✅ DataStreamNFTUpgradeable implementation deployed to:", dataStreamNFTUpgradeableAddress);
        console.log("   Note: This is the implementation contract for future upgrades");

        deploymentInfo.contracts.DataStreamNFTUpgradeable = {
            implementationAddress: dataStreamNFTUpgradeableAddress,
            note: "Implementation contract for future upgrades"
        };

        // Save deployment info
        const fs = require('fs');
        const path = require('path');
        
        const deploymentDir = path.join(__dirname, '..', '..', 'deployments');
        if (!fs.existsSync(deploymentDir)) {
            fs.mkdirSync(deploymentDir, { recursive: true });
        }

        const networkName = (await ethers.provider.getNetwork()).name;
        const deploymentFile = path.join(deploymentDir, `${networkName}-all.json`);
        fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
        
        console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);

        // Summary
        console.log("\n🎉 === ALL CONTRACTS DEPLOYED SUCCESSFULLY ===");
        console.log("📊 Contract Summary:");
        console.log("   🪙 DATToken (ERC20):", datTokenAddress);
        console.log("   📊 DataStreamDAT:", dataStreamDATAddress);
        console.log("   🎨 DataStreamNFT:", dataStreamNFTAddress);
        console.log("   🔄 DataStreamNFTUpgradeable:", dataStreamNFTUpgradeableAddress);
        
        console.log("\n🎯 === Next Steps ===");
        console.log("1. 📝 Update your .env files with the contract addresses");
        console.log("2. 🔍 Verify contracts on block explorer (if applicable)");
        console.log("3. 🧪 Test the contracts with sample data");
        console.log("4. 🌐 Deploy frontend and connect to contracts");
        console.log("5. 🏦 Set up platform treasury address for production");
        console.log("6. 🔄 Use DataStreamNFTUpgradeable for future upgrades");

        console.log("\n✨ Deployment completed successfully!");

    } catch (error) {
        console.error("💥 Deployment failed:", error);
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("💥 Deployment failed:", error);
        process.exit(1);
    });
