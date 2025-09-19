const { run } = require("hardhat");

async function main() {
    const contractAddress = process.argv[2];
    const constructorArgs = process.argv.slice(3);

    if (!contractAddress) {
        console.error("❌ Please provide a contract address");
        console.log("Usage: npx hardhat run scripts/verify-contract.js --network lazai-testnet <contractAddress> [constructorArgs...]");
        process.exit(1);
    }

    console.log("🔍 Verifying contract on LazAI Testnet...");
    console.log("Contract Address:", contractAddress);
    console.log("Constructor Args:", constructorArgs.length > 0 ? constructorArgs : "None");

    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: constructorArgs,
            network: "lazai-testnet"
        });
        
        console.log("✅ Contract verified successfully!");
        console.log("🔗 View on explorer:", `https://testnet-explorer.lazai.network/address/${contractAddress}`);
    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("✅ Contract is already verified!");
            console.log("🔗 View on explorer:", `https://testnet-explorer.lazai.network/address/${contractAddress}`);
        } else {
            console.error("❌ Verification failed:", error.message);
            process.exit(1);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
