const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Starting DataStreamDAT deployment...");
    
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    
    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");
    
    if (balance === 0n) {
        console.log("❌ Error: Insufficient balance for deployment");
        console.log("Please ensure your account has testnet tokens");
        return;
    }
    
    // Set platform treasury (using deployer for now, should be changed in production)
    const platformTreasury = deployer.address;
    console.log("Platform treasury:", platformTreasury);
    
    // Deploy DataStreamDAT contract
    console.log("📦 Deploying DataStreamDAT contract...");
    const DataStreamDAT = await ethers.getContractFactory("DataStreamDAT");
    const dataStreamDAT = await DataStreamDAT.deploy(platformTreasury);
    await dataStreamDAT.waitForDeployment();
    
    const datAddress = await dataStreamDAT.getAddress();
    console.log("✅ DataStreamDAT deployed to:", datAddress);
    
    // Get contract info
    const name = await dataStreamDAT.name();
    const symbol = await dataStreamDAT.symbol();
    const platformFee = await dataStreamDAT.platformFeeBps();
    const treasury = await dataStreamDAT.platformTreasury();
    const totalSupply = await dataStreamDAT.totalSupply();
    
    console.log("\n📊 Contract Information:");
    console.log("Name:", name);
    console.log("Symbol:", symbol);
    console.log("Platform Fee:", platformFee.toString(), "basis points");
    console.log("Platform Treasury:", treasury);
    console.log("Total Supply:", totalSupply.toString());
    
    // Save deployment info
    const deploymentInfo = {
        network: "lazchain",
        contractName: "DataStreamDAT",
        contractAddress: datAddress,
        deployer: deployer.address,
        platformTreasury: platformTreasury,
        platformFeeBps: platformFee.toString(),
        deploymentTime: new Date().toISOString(),
        blockNumber: await ethers.provider.getBlockNumber(),
        transactionHash: dataStreamDAT.deploymentTransaction()?.hash
    };
    
    const fs = require('fs');
    const path = require('path');
    
    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    // Save deployment info
    const deploymentFile = path.join(deploymentsDir, `DataStreamDAT-${Date.now()}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Deployment info saved to:", deploymentFile);
    
    // Update .env file with contract address
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add contract address
    const contractAddressRegex = /^DAT_CONTRACT_ADDRESS=.*$/m;
    const contractAddressLine = `DAT_CONTRACT_ADDRESS=${datAddress}`;
    
    if (contractAddressRegex.test(envContent)) {
        envContent = envContent.replace(contractAddressRegex, contractAddressLine);
    } else {
        envContent += `\n${contractAddressLine}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log("🔧 Updated .env file with DAT contract address");
    
    console.log("\n🎉 DataStreamDAT deployment completed successfully!");
    console.log("\n📋 Next Steps:");
    console.log("1. Update frontend to use the new DAT contract");
    console.log("2. Test DAT minting functionality");
    console.log("3. Integrate with LazAI data upload process");
    console.log("4. Deploy to production when ready");
    
    console.log("\n🔗 Contract Address:", datAddress);
    console.log("🌐 Block Explorer:", `https://testnet-explorer.lazai.network/address/${datAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
