const { run } = require("hardhat");

async function main() {
    console.log("🔍 LazAI Testnet Contract Verification Tool");
    console.log("==========================================");

    // Get contract address from command line arguments
    const contractAddress = process.argv[2];
    const contractType = process.argv[3]?.toLowerCase();

    if (!contractAddress) {
        console.error("❌ Please provide a contract address");
        console.log("\nUsage:");
        console.log("  npx hardhat run scripts/verify-existing.js --network lazai-testnet <contractAddress> [contractType]");
        console.log("\nContract Types:");
        console.log("  datastream - DataStreamNFT contract (requires platform treasury address)");
        console.log("  dat        - DATToken contract (no constructor args)");
        console.log("  auto       - Auto-detect based on contract name (default)");
        process.exit(1);
    }

    console.log("Contract Address:", contractAddress);
    console.log("Contract Type:", contractType || "auto-detect");

    try {
        // Get contract instance to determine type
        const contract = await ethers.getContractAt("DataStreamNFT", contractAddress);
        const name = await contract.name();
        
        console.log("Detected Contract:", name);

        if (name === "DataStreamNFT") {
            console.log("\n🔍 Verifying DataStreamNFT contract...");
            
            if (contractType === "dat") {
                console.error("❌ Contract type mismatch! This is a DataStreamNFT contract, not DATToken.");
                process.exit(1);
            }

            // Get platform treasury from contract
            const platformTreasury = await contract.platformTreasury();
            console.log("Platform Treasury:", platformTreasury);

            await run("verify:verify", {
                address: contractAddress,
                constructorArguments: [platformTreasury],
                network: "lazai-testnet"
            });
        } else {
            throw new Error("Unknown contract type");
        }

    } catch (error) {
        // Try DATToken if DataStreamNFT fails
        try {
            console.log("\n🔄 Trying DATToken contract...");
            const datContract = await ethers.getContractAt("DATToken", contractAddress);
            const name = await datContract.name();
            
            if (name === "Data Access Token") {
                console.log("Detected Contract:", name);
                
                if (contractType === "datastream") {
                    console.error("❌ Contract type mismatch! This is a DATToken contract, not DataStreamNFT.");
                    process.exit(1);
                }

                await run("verify:verify", {
                    address: contractAddress,
                    constructorArguments: [],
                    network: "lazai-testnet"
                });
            } else {
                throw new Error("Unknown contract type");
            }
        } catch (datError) {
            console.error("❌ Failed to verify contract:", error.message);
            console.log("\n💡 Manual verification commands:");
            console.log("\nFor DataStreamNFT:");
            console.log(`npx hardhat verify --network lazai-testnet ${contractAddress} <PLATFORM_TREASURY_ADDRESS>`);
            console.log("\nFor DATToken:");
            console.log(`npx hardhat verify --network lazai-testnet ${contractAddress}`);
            process.exit(1);
        }
    }

    console.log("\n✅ Contract verified successfully!");
    console.log("🔗 View on explorer:", `https://testnet-explorer.lazai.network/address/${contractAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
