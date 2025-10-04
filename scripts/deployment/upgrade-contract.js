const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("🔄 Starting contract upgrade process...");

    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📝 Upgrading with account:", deployer.address);

    // Load deployment info
    const networkName = (await ethers.provider.getNetwork()).name;
    const deploymentFile = path.join(__dirname, '..', 'deployments', `${networkName}-upgradeable.json`);
    
    if (!fs.existsSync(deploymentFile)) {
        throw new Error(`Deployment file not found: ${deploymentFile}`);
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
    const { proxyAddress, proxyAdminAddress } = deploymentInfo.contracts.DataStreamNFTUpgradeable;

    console.log("📋 Current deployment info:");
    console.log("   Proxy Address:", proxyAddress);
    console.log("   ProxyAdmin Address:", proxyAdminAddress);

    // Deploy new implementation
    console.log("\n🚀 Deploying new implementation...");
    const DataStreamNFTUpgradeable = await ethers.getContractFactory("DataStreamNFTUpgradeable");
    const newImplementation = await DataStreamNFTUpgradeable.deploy();
    await newImplementation.waitForDeployment();
    const newImplementationAddress = await newImplementation.getAddress();
    console.log("   ✅ New implementation deployed to:", newImplementationAddress);

    // Upgrade the proxy
    console.log("\n⚡ Upgrading proxy...");
    const proxyAdmin = await ethers.getContractAt("ProxyAdmin", proxyAdminAddress);
    
    // Check if caller is admin
    const admin = await proxyAdmin.owner();
    if (admin.toLowerCase() !== deployer.address.toLowerCase()) {
        throw new Error(`Only admin can upgrade. Current admin: ${admin}, Caller: ${deployer.address}`);
    }

    const upgradeTx = await proxyAdmin.upgrade(proxyAddress, newImplementationAddress);
    await upgradeTx.wait();
    console.log("   ✅ Proxy upgraded successfully");
    console.log("   📝 Transaction hash:", upgradeTx.hash);

    // Verify the upgrade
    console.log("\n🔍 Verifying upgrade...");
    const dataStreamNFT = DataStreamNFTUpgradeable.attach(proxyAddress);
    
    try {
        const name = await dataStreamNFT.name();
        const symbol = await dataStreamNFT.symbol();
        const owner = await dataStreamNFT.owner();
        
        console.log("   ✅ Contract is working after upgrade:");
        console.log("      Name:", name);
        console.log("      Symbol:", symbol);
        console.log("      Owner:", owner);
    } catch (error) {
        console.error("   ❌ Contract verification failed:", error);
        throw error;
    }

    // Update deployment info
    const updatedDeploymentInfo = {
        ...deploymentInfo,
        contracts: {
            ...deploymentInfo.contracts,
            DataStreamNFTUpgradeable: {
                ...deploymentInfo.contracts.DataStreamNFTUpgradeable,
                implementationAddress: newImplementationAddress,
                previousImplementationAddress: deploymentInfo.contracts.DataStreamNFTUpgradeable.implementationAddress,
                upgradeTransactionHash: upgradeTx.hash,
                upgradeTimestamp: new Date().toISOString()
            }
        }
    };

    // Save updated deployment info
    fs.writeFileSync(deploymentFile, JSON.stringify(updatedDeploymentInfo, null, 2));
    console.log(`\n💾 Updated deployment info saved to: ${deploymentFile}`);

    console.log("\n🎉 Contract upgrade completed successfully!");
    console.log("\n📊 === Upgrade Summary ===");
    console.log("   🔧 New Implementation:", newImplementationAddress);
    console.log("   📍 Proxy Address:", proxyAddress);
    console.log("   👑 ProxyAdmin Address:", proxyAdminAddress);
    console.log("   📝 Upgrade Transaction:", upgradeTx.hash);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("💥 Upgrade failed:", error);
        process.exit(1);
    });
