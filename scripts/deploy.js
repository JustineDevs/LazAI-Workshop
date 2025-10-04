const { ethers } = require("hardhat");

async function main() {
    console.log("Starting DataStreamNFTUpgradeable deployment...");

    // Get the contract factories
    const DataStreamNFTUpgradeable = await ethers.getContractFactory("DataStreamNFTUpgradeable");
    const ProxyAdmin = await ethers.getContractFactory("ProxyAdmin");
    const TransparentUpgradeableProxy = await ethers.getContractFactory("TransparentUpgradeableProxy");

    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Check deployer balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");

    // Deploy platform treasury (using deployer for now)
    const platformTreasury = deployer.address;
    const platformFeeBps = 250; // 2.5% platform fee

    console.log("\n=== Deployment Steps ===");

    // Step 1: Deploy implementation contract
    console.log("1. Deploying DataStreamNFTUpgradeable implementation...");
    const implementation = await DataStreamNFTUpgradeable.deploy();
    await implementation.waitForDeployment();
    const implementationAddress = await implementation.getAddress();
    console.log("   Implementation deployed to:", implementationAddress);

    // Step 2: Deploy ProxyAdmin
    console.log("2. Deploying ProxyAdmin...");
    const proxyAdmin = await ProxyAdmin.deploy();
    await proxyAdmin.waitForDeployment();
    const proxyAdminAddress = await proxyAdmin.getAddress();
    console.log("   ProxyAdmin deployed to:", proxyAdminAddress);

    // Step 3: Prepare initialization data
    console.log("3. Preparing initialization data...");
    const initData = DataStreamNFTUpgradeable.interface.encodeFunctionData(
        "initialize",
        [platformTreasury, platformFeeBps]
    );

    // Step 4: Deploy TransparentUpgradeableProxy
    console.log("4. Deploying TransparentUpgradeableProxy...");
    const proxy = await TransparentUpgradeableProxy.deploy(
        implementationAddress,
        proxyAdminAddress,
        initData
    );
    await proxy.waitForDeployment();
    const proxyAddress = await proxy.getAddress();
    console.log("   Proxy deployed to:", proxyAddress);

    // Step 5: Create contract instance to interact with proxy
    console.log("5. Creating contract instance...");
    const dataStreamNFT = DataStreamNFTUpgradeable.attach(proxyAddress);

    // Step 6: Verify deployment
    console.log("\n=== Verifying Deployment ===");
    
    const dataStreamNFTName = await dataStreamNFT.name();
    const dataStreamNFTSymbol = await dataStreamNFT.symbol();
    const platformTreasuryAddress = await dataStreamNFT.platformTreasury();
    const platformFeeBpsActual = await dataStreamNFT.platformFeeBps();
    const owner = await dataStreamNFT.owner();

    console.log("\n=== Deployment Summary ===");
    console.log("DataStreamNFTUpgradeable (Upgradeable):");
    console.log("  Proxy Address:", proxyAddress);
    console.log("  Implementation Address:", implementationAddress);
    console.log("  ProxyAdmin Address:", proxyAdminAddress);
    console.log("  Name:", dataStreamNFTName);
    console.log("  Symbol:", dataStreamNFTSymbol);
    console.log("  Owner:", owner);
    console.log("  Platform Treasury:", platformTreasuryAddress);
    console.log("  Platform Fee:", platformFeeBpsActual.toString(), "bps (", (Number(platformFeeBpsActual) / 100).toString(), "%)");

    // Save deployment info
    const deploymentInfo = {
        network: await ethers.provider.getNetwork(),
        deployer: deployer.address,
        contracts: {
            DataStreamNFTUpgradeable: {
                proxyAddress: proxyAddress,
                implementationAddress: implementationAddress,
                proxyAdminAddress: proxyAdminAddress,
                name: dataStreamNFTName,
                symbol: dataStreamNFTSymbol,
                owner: owner,
                platformTreasury: platformTreasuryAddress,
                platformFeeBps: platformFeeBpsActual.toString()
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

    const networkName = (await ethers.provider.getNetwork()).name;
    const deploymentFile = path.join(deploymentDir, `${networkName}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    console.log(`\nDeployment info saved to: ${deploymentFile}`);

    // Instructions for next steps
    console.log("\n=== Next Steps ===");
    console.log("1. Update your .env file with the proxy address:", proxyAddress);
    console.log("2. Verify contracts on block explorer (if applicable)");
    console.log("3. Test the contract with sample data");
    console.log("4. Deploy frontend and connect to contract");
    console.log("5. Set up platform treasury address for production");
    console.log("6. Transfer ownership to a multisig wallet for security");

    console.log("\n=== Upgrade Instructions ===");
    console.log("To upgrade the contract in the future:");
    console.log("1. Deploy new implementation contract");
    console.log("2. Call proxyAdmin.upgrade(proxyAddress, newImplementationAddress)");
    console.log("3. Verify the upgrade was successful");

    console.log("\nDeployment completed successfully!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Deployment failed:", error);
        process.exit(1);
    });
