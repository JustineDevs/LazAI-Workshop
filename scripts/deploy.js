const { ethers } = require("hardhat");

async function main() {
    console.log("Starting DataStreamNFT deployment...");

    // Get the contract factory
    const DataStreamNFT = await ethers.getContractFactory("DataStreamNFT");

    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Check deployer balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");

    // Deploy DataStreamNFT with platform treasury
    console.log("\nDeploying DataStreamNFT...");
    const platformTreasury = deployer.address; // Use deployer as platform treasury for now
    const dataStreamNFT = await DataStreamNFT.deploy(platformTreasury);
    await dataStreamNFT.waitForDeployment();
    console.log("DataStreamNFT deployed to:", await dataStreamNFT.getAddress());

    // Verify deployments
    console.log("\nVerifying deployments...");
    
    const dataStreamNFTName = await dataStreamNFT.name();
    const dataStreamNFTSymbol = await dataStreamNFT.symbol();
    const platformTreasuryAddress = await dataStreamNFT.platformTreasury();
    const platformFeeBps = await dataStreamNFT.platformFeeBps();

    console.log("\n=== Deployment Summary ===");
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
    console.log("1. Update your .env file with the contract address");
    console.log("2. Verify contract on block explorer (if applicable)");
    console.log("3. Test the contract with sample data");
    console.log("4. Deploy frontend and connect to contract");
    console.log("5. Set up platform treasury address for production");

    console.log("\nDeployment completed successfully!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Deployment failed:", error);
        process.exit(1);
    });
