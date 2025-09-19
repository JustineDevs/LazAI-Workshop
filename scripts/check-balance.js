const { ethers } = require("hardhat");

async function checkBalance() {
    console.log("🔍 Checking LazAI Testnet Balance...");
    console.log("Network: LazAI Testnet (Chain ID: 133718)");
    console.log("RPC: https://testnet.lazai.network");
    
    try {
        // Get the deployer account
        const [deployer] = await ethers.getSigners();
        console.log("\n📋 Account Information:");
        console.log("Address:", deployer.address);
        
        // Check balance
        const balance = await ethers.provider.getBalance(deployer.address);
        const balanceInLAZAI = ethers.formatEther(balance);
        
        console.log("Balance:", balanceInLAZAI, "LAZAI");
        
        if (balance === 0n) {
            console.log("\n❌ No LAZAI tokens found!");
            console.log("\n🔧 To get testnet LAZAI tokens:");
            console.log("1. Contact the LazAI team for testnet tokens");
            console.log("2. Check if there's a testnet faucet available");
            console.log("3. Your address:", deployer.address);
            console.log("\n💡 You need approximately 0.01 LAZAI for contract deployment");
        } else if (balance < ethers.parseEther("0.001")) {
            console.log("\n⚠️  Low balance! You might need more LAZAI tokens.");
            console.log("Current balance:", balanceInLAZAI, "LAZAI");
            console.log("Recommended: At least 0.01 LAZAI for deployment");
        } else {
            console.log("\n✅ Sufficient balance for deployment!");
            console.log("You can proceed with contract deployment.");
        }
        
        // Check network info
        const network = await ethers.provider.getNetwork();
        console.log("\n🌐 Network Information:");
        console.log("Chain ID:", network.chainId.toString());
        console.log("Network Name:", network.name);
        
    } catch (error) {
        console.error("❌ Error checking balance:", error.message);
        
        if (error.message.includes("network")) {
            console.log("\n💡 Make sure you're connected to the LazAI Testnet");
            console.log("Check your hardhat.config.js network configuration");
        }
    }
}

checkBalance().catch(console.error);
