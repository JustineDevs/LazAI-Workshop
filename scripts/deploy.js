const { ethers } = require("hardhat");

async function main() {
    console.log("Starting DataStreamNFT deployment...");

    // Get the contract factories
    const DATToken = await ethers.getContractFactory("DATToken");
    const DataStreamNFT = await ethers.getContractFactory("DataStreamNFT");

    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Check deployer balance
    const balance = await deployer.getBalance();
    console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");

    // Deploy DAT Token
    console.log("\nDeploying DAT Token...");
    const datToken = await DATToken.deploy();
    await datToken.deployed();
    console.log("DAT Token deployed to:", datToken.address);

    // Deploy DataStreamNFT
    console.log("\nDeploying DataStreamNFT...");
    const dataStreamNFT = await DataStreamNFT.deploy(datToken.address);
    await dataStreamNFT.deployed();
    console.log("DataStreamNFT deployed to:", dataStreamNFT.address);

    // Verify deployments
    console.log("\nVerifying deployments...");
    
    const datTokenName = await datToken.name();
    const datTokenSymbol = await datToken.symbol();
    const datTokenTotalSupply = await datToken.totalSupply();
    
    const dataStreamNFTName = await dataStreamNFT.name();
    const dataStreamNFTSymbol = await dataStreamNFT.symbol();
    const dataStreamNFTTotalTokens = await dataStreamNFT.getTotalTokens();

    console.log("\n=== Deployment Summary ===");
    console.log("DAT Token:");
    console.log("  Address:", datToken.address);
    console.log("  Name:", datTokenName);
    console.log("  Symbol:", datTokenSymbol);
    console.log("  Total Supply:", ethers.utils.formatEther(datTokenTotalSupply), "DAT");

    console.log("\nDataStreamNFT:");
    console.log("  Address:", dataStreamNFT.address);
    console.log("  Name:", dataStreamNFTName);
    console.log("  Symbol:", dataStreamNFTSymbol);
    console.log("  Total Tokens:", dataStreamNFTTotalTokens.toString());

    // Save deployment info
    const deploymentInfo = {
        network: await ethers.provider.getNetwork(),
        deployer: deployer.address,
        contracts: {
            DATToken: {
                address: datToken.address,
                name: datTokenName,
                symbol: datTokenSymbol,
                totalSupply: datTokenTotalSupply.toString()
            },
            DataStreamNFT: {
                address: dataStreamNFT.address,
                name: dataStreamNFTName,
                symbol: dataStreamNFTSymbol
            }
        },
        timestamp: new Date().toISOString()
    };

    // Write deployment info to file
    const fs = require('fs');
    const path = require('path');
    
    const deploymentDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentDir)) {
        fs.mkdirSync(deploymentDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentDir, `${await ethers.provider.getNetwork().then(n => n.name)}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    console.log(`\nDeployment info saved to: ${deploymentFile}`);

    // Instructions for next steps
    console.log("\n=== Next Steps ===");
    console.log("1. Update your .env file with the contract addresses");
    console.log("2. Verify contracts on block explorer (if applicable)");
    console.log("3. Test the contracts with sample data");
    console.log("4. Deploy frontend and connect to contracts");

    console.log("\nDeployment completed successfully!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Deployment failed:", error);
        process.exit(1);
    });
