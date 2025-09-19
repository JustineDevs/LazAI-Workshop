const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function testDeployedContract() {
    console.log("🧪 Testing Deployed DataStreamNFT Contract...");
    
    // Read deployment info
    const deploymentFile = path.join(__dirname, '..', 'deployments', 'lazai-testnet.json');
    if (!fs.existsSync(deploymentFile)) {
        console.error("❌ Deployment file not found. Please deploy the contract first.");
        return;
    }
    
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
    const contractAddress = deploymentInfo.contracts.DataStreamNFT.address;
    
    console.log(`📋 Contract Address: ${contractAddress}`);
    console.log(`🌐 Network: ${deploymentInfo.network}`);
    
    // Get contract instance
    const DataStreamNFT = await ethers.getContractFactory("DataStreamNFT");
    const contract = DataStreamNFT.attach(contractAddress);
    
    // Get test accounts
    const [deployer, user1, user2] = await ethers.getSigners();
    
    console.log("\n🔍 Testing Contract Functions...");
    
    try {
        // Test 1: Basic contract info
        console.log("\n1️⃣ Testing Basic Contract Info:");
        const name = await contract.name();
        const symbol = await contract.symbol();
        const platformTreasury = await contract.platformTreasury();
        const platformFeeBps = await contract.platformFeeBps();
        
        console.log(`   Name: ${name}`);
        console.log(`   Symbol: ${symbol}`);
        console.log(`   Platform Treasury: ${platformTreasury}`);
        console.log(`   Platform Fee: ${platformFeeBps} bps (${Number(platformFeeBps) / 100}%)`);
        
        // Test 2: Mint a Data NFT
        console.log("\n2️⃣ Testing Data NFT Minting:");
        const tokenURI = "ipfs://QmTestData123456789";
        const queryPrice = ethers.parseEther("0.01"); // 0.01 ETH per query
        
        console.log(`   Minting NFT with URI: ${tokenURI}`);
        console.log(`   Query Price: ${ethers.formatEther(queryPrice)} ETH`);
        
        const mintTx = await contract.connect(user1).mintDataNFT(tokenURI, queryPrice);
        const mintReceipt = await mintTx.wait();
        console.log(`   ✅ Mint successful! Gas used: ${mintReceipt.gasUsed}`);
        
        // Get the token ID from the event
        const mintEvent = mintReceipt.logs.find(log => {
            try {
                const parsed = contract.interface.parseLog(log);
                return parsed.name === 'DataNFTMinted';
            } catch (e) {
                return false;
            }
        });
        
        if (mintEvent) {
            const parsed = contract.interface.parseLog(mintEvent);
            const tokenId = parsed.args.tokenId;
            console.log(`   Token ID: ${tokenId}`);
            
            // Test 3: Check NFT data
            console.log("\n3️⃣ Testing NFT Data Retrieval:");
            const nftData = await contract.dataNFTs(tokenId);
            console.log(`   Creator: ${nftData.creator}`);
            console.log(`   Query Price: ${ethers.formatEther(nftData.queryPrice)} ETH`);
            console.log(`   Total Queries: ${nftData.totalQueries}`);
            console.log(`   Total Earned: ${ethers.formatEther(nftData.totalEarned)} ETH`);
            
            // Test 4: Pay for Query
            console.log("\n4️⃣ Testing Query Payment:");
            const queryPayment = ethers.parseEther("0.01");
            console.log(`   Paying ${ethers.formatEther(queryPayment)} ETH for query`);
            
            const queryTx = await contract.connect(user2).payForQuery(tokenId, { value: queryPayment });
            const queryReceipt = await queryTx.wait();
            console.log(`   ✅ Query payment successful! Gas used: ${queryReceipt.gasUsed}`);
            
            // Check updated NFT data
            const updatedNftData = await contract.dataNFTs(tokenId);
            console.log(`   Updated Total Queries: ${updatedNftData.totalQueries}`);
            console.log(`   Updated Total Earned: ${ethers.formatEther(updatedNftData.totalEarned)} ETH`);
            
            // Test 5: Update Query Price
            console.log("\n5️⃣ Testing Query Price Update:");
            const newPrice = ethers.parseEther("0.02");
            console.log(`   Updating price to ${ethers.formatEther(newPrice)} ETH`);
            
            const updateTx = await contract.connect(user1).updateQueryPrice(tokenId, newPrice);
            const updateReceipt = await updateTx.wait();
            console.log(`   ✅ Price update successful! Gas used: ${updateReceipt.gasUsed}`);
            
            // Verify price update
            const finalNftData = await contract.dataNFTs(tokenId);
            console.log(`   New Query Price: ${ethers.formatEther(finalNftData.queryPrice)} ETH`);
            
            // Test 6: Check balances
            console.log("\n6️⃣ Testing Balance Distribution:");
            const deployerBalance = await ethers.provider.getBalance(deployer.address);
            const user1Balance = await ethers.provider.getBalance(user1.address);
            const user2Balance = await ethers.provider.getBalance(user2.address);
            
            console.log(`   Deployer (Platform Treasury) Balance: ${ethers.formatEther(deployerBalance)} ETH`);
            console.log(`   User1 (Creator) Balance: ${ethers.formatEther(user1Balance)} ETH`);
            console.log(`   User2 (Query Payer) Balance: ${ethers.formatEther(user2Balance)} ETH`);
            
        } else {
            console.log("   ❌ Could not find mint event");
        }
        
        console.log("\n🎉 All tests completed successfully!");
        
    } catch (error) {
        console.error("❌ Test failed:", error.message);
        console.error("Stack trace:", error.stack);
    }
}

testDeployedContract()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
