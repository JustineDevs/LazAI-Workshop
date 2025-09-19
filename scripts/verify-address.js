const { ethers } = require("hardhat");

async function verifyAddress() {
    console.log("🔍 Verifying wallet addresses...");
    
    // Get the current address from .env
    const [currentSigner] = await ethers.getSigners();
    const currentAddress = currentSigner.address;
    
    console.log("\n📋 Current Configuration:");
    console.log("Address from .env private key:", currentAddress);
    console.log("Expected address (from explorer):", "0xbadF2152017e26518140d7C8827BD83e2cA79f15");
    
    if (currentAddress.toLowerCase() === "0xbadf2152017e26518140d7c8827bd83e2ca79f15".toLowerCase()) {
        console.log("✅ Addresses match! You're using the correct wallet.");
        
        // Check balance
        const balance = await ethers.provider.getBalance(currentAddress);
        const balanceInLAZAI = ethers.formatEther(balance);
        console.log("Balance:", balanceInLAZAI, "LAZAI");
        
        if (balance > 0) {
            console.log("🎉 You have LAZAI tokens! Ready to deploy.");
        } else {
            console.log("❌ No LAZAI tokens found.");
        }
    } else {
        console.log("❌ Addresses don't match!");
        console.log("\n🔧 To fix this:");
        console.log("1. Update your .env file with the correct private key");
        console.log("2. The private key should correspond to: 0xbadF2152017e26518140d7C8827BD83e2cA79f15");
        console.log("3. Or provide the correct private key for that address");
        
        console.log("\n💡 Your current .env has a private key for:", currentAddress);
        console.log("But you want to use:", "0xbadF2152017e26518140d7C8827BD83e2cA79f15");
    }
}

verifyAddress().catch(console.error);
