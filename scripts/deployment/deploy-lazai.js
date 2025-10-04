const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Starting DataStreamNFT deployment to LazAI Testnet...");
    console.log("Network: LazAI Testnet (Chain ID: 133718)");
    console.log("RPC: https://testnet.lazai.network");
    console.log("Explorer: https://testnet-explorer.lazai.network");

    // Get the contract factory
    const DataStreamNFT = await ethers.getContractFactory("DataStreamNFT");

    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("\n📋 Deployment Details:");
    console.log("Deployer address:", deployer.address);

    // Check deployer balance
    const balance = await ethers.provider.getBalance(deployer.address);
    const balanceInLAZAI = ethers.formatEther(balance);
    console.log("Account balance:", balanceInLAZAI, "LAZAI");

    // Check if account has enough balance for deployment
    if (balance === 0n) {
        console.log("\n❌ Insufficient LAZAI tokens for deployment!");
        console.log("\n🔧 To get testnet LAZAI tokens:");
        console.log("1. Visit the LazAI Testnet Faucet (if available)");
        console.log("2. Or contact the LazAI team for testnet tokens");
        console.log("3. Your address:", deployer.address);
        console.log("\n💡 You need approximately 0.01 LAZAI for deployment");
        return;
    }

    if (balance < ethers.parseEther("0.001")) {
        console.log("\n⚠️  Low balance! You might need more LAZAI tokens for deployment.");
        console.log("Current balance:", balanceInLAZAI, "LAZAI");
        console.log("Recommended: At least 0.01 LAZAI");
    }

    try {
        // Deploy DataStreamNFT with platform treasury
        console.log("\n🔨 Deploying DataStreamNFT contract...");
        const platformTreasury = deployer.address; // Use deployer as platform treasury for now
        const dataStreamNFT = await DataStreamNFT.deploy(platformTreasury);
        await dataStreamNFT.waitForDeployment();
        
        const contractAddress = await dataStreamNFT.getAddress();
        console.log("✅ DataStreamNFT deployed successfully!");
        console.log("Contract address:", contractAddress);

        // Verify deployments
        console.log("\n🔍 Verifying deployment...");
        
        const dataStreamNFTName = await dataStreamNFT.name();
        const dataStreamNFTSymbol = await dataStreamNFT.symbol();
        const platformTreasuryAddress = await dataStreamNFT.platformTreasury();
        const platformFeeBps = await dataStreamNFT.platformFeeBps();

        console.log("\n📊 Contract Information:");
        console.log("  Name:", dataStreamNFTName);
        console.log("  Symbol:", dataStreamNFTSymbol);
        console.log("  Platform Treasury:", platformTreasuryAddress);
        console.log("  Platform Fee:", platformFeeBps.toString(), "bps (", (Number(platformFeeBps) / 100).toString(), "%)");

        // Save deployment info
        const deploymentInfo = {
            network: {
                name: "LazAI Testnet",
                chainId: 133718,
                rpc: "https://testnet.lazai.network",
                explorer: "https://testnet-explorer.lazai.network"
            },
            deployer: deployer.address,
            contracts: {
                DataStreamNFT: {
                    address: contractAddress,
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

        const deploymentFile = path.join(deploymentDir, 'lazai-testnet.json');
        fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
        
        console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);

        // Instructions for next steps
        console.log("\n🎯 Next Steps:");
        console.log("1. ✅ Contract deployed to LazAI Testnet");
        console.log("2. 🔍 Verify contract on explorer:", `https://testnet-explorer.lazai.network/address/${contractAddress}`);
        console.log("3. 🔧 Update your .env file with the contract address");
        console.log("4. 🧪 Test the contract with sample data");
        console.log("5. 🌐 Deploy frontend and connect to contract");
        console.log("6. 🏦 Set up platform treasury address for production");

        console.log("\n🎉 Deployment completed successfully!");
        console.log("\n📝 Contract Address:", contractAddress);
        console.log("🔗 Explorer URL:", `https://testnet-explorer.lazai.network/address/${contractAddress}`);

    } catch (error) {
        console.error("\n❌ Deployment failed:", error.message);
        
        if (error.message.includes("insufficient funds")) {
            console.log("\n💡 You need LAZAI tokens for gas fees.");
            console.log("Contact the LazAI team or check for a testnet faucet.");
        }
        
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
