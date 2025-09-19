const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

class DataStreamNFTMonitor {
    constructor() {
        this.contract = null;
        this.metrics = {
            totalNFTs: 0,
            totalQueries: 0,
            totalRevenue: 0,
            platformRevenue: 0,
            lastUpdate: null
        };
    }

    async initialize() {
        console.log("🔧 Initializing DataStreamNFT Monitor...");

        // Read deployment info
        const deploymentFile = path.join(__dirname, '..', 'deployments', 'lazchain.json');
        if (!fs.existsSync(deploymentFile)) {
            throw new Error('Deployment file not found. Please deploy the contract first.');
        }

        const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
        const contractAddress = deploymentInfo.contracts.DataStreamNFT.address;

        // Get contract instance
        const DataStreamNFT = await ethers.getContractFactory("DataStreamNFT");
        this.contract = DataStreamNFT.attach(contractAddress);

        console.log(`✅ Monitor initialized for contract: ${contractAddress}`);
    }

    async getContractMetrics() {
        console.log("📊 Collecting contract metrics...");

        try {
            // Get contract info
            const name = await this.contract.name();
            const symbol = await this.contract.symbol();
            const platformTreasury = await this.contract.platformTreasury();
            const platformFeeBps = await this.contract.platformFeeBps();

            // Get network info
            const network = await ethers.provider.getNetwork();
            const blockNumber = await ethers.provider.getBlockNumber();
            const gasPrice = await ethers.provider.getFeeData();

            // Get treasury balance
            const treasuryBalance = await ethers.provider.getBalance(platformTreasury);

            return {
                contract: {
                    name,
                    symbol,
                    address: await this.contract.getAddress(),
                    platformTreasury,
                    platformFeeBps: platformFeeBps.toString(),
                    platformFeePercent: (Number(platformFeeBps) / 100).toFixed(2)
                },
                network: {
                    name: network.name,
                    chainId: Number(network.chainId),
                    blockNumber,
                    gasPrice: ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei')
                },
                treasury: {
                    address: platformTreasury,
                    balance: ethers.formatEther(treasuryBalance)
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error("❌ Failed to collect metrics:", error.message);
            throw error;
        }
    }

    async getNFTMetrics() {
        console.log("📈 Collecting NFT metrics...");

        try {
            // This is a simplified version - in production you'd use an indexer
            // For now, we'll estimate based on available data
            let totalNFTs = 0;
            let totalQueries = 0;
            let totalEarned = 0;

            // Check first 100 token IDs (in production, use an indexer)
            for (let i = 1; i <= 100; i++) {
                try {
                    const nftData = await this.contract.dataNFTs(i);
                    if (nftData.creator !== '0x0000000000000000000000000000000000000000') {
                        totalNFTs++;
                        totalQueries += Number(nftData.totalQueries);
                        totalEarned += Number(ethers.formatEther(nftData.totalEarned));
                    }
                } catch (error) {
                    // Token doesn't exist, stop checking
                    break;
                }
            }

            return {
                totalNFTs,
                totalQueries,
                totalEarned: totalEarned.toFixed(6),
                averageQueriesPerNFT: totalNFTs > 0 ? (totalQueries / totalNFTs).toFixed(2) : 0
            };
        } catch (error) {
            console.error("❌ Failed to collect NFT metrics:", error.message);
            return {
                totalNFTs: 0,
                totalQueries: 0,
                totalEarned: '0',
                averageQueriesPerNFT: 0
            };
        }
    }

    async generateReport() {
        console.log("📋 Generating monitoring report...");

        try {
            const contractMetrics = await this.getContractMetrics();
            const nftMetrics = await this.getNFTMetrics();

            const report = {
                ...contractMetrics,
                nft: nftMetrics,
                generatedAt: new Date().toISOString()
            };

            // Save report to file
            const reportsDir = path.join(__dirname, '..', 'reports');
            if (!fs.existsSync(reportsDir)) {
                fs.mkdirSync(reportsDir);
            }

            const reportFile = path.join(reportsDir, `monitor-${Date.now()}.json`);
            fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

            console.log(`💾 Report saved to: ${reportFile}`);

            return report;
        } catch (error) {
            console.error("❌ Failed to generate report:", error.message);
            throw error;
        }
    }

    displayReport(report) {
        console.log("\n" + "=".repeat(60));
        console.log("📊 DataStreamNFT Monitoring Report");
        console.log("=".repeat(60));

        console.log("\n🏗️  Contract Information:");
        console.log(`   Name: ${report.contract.name}`);
        console.log(`   Symbol: ${report.contract.symbol}`);
        console.log(`   Address: ${report.contract.address}`);
        console.log(`   Platform Treasury: ${report.contract.platformTreasury}`);
        console.log(`   Platform Fee: ${report.contract.platformFeePercent}%`);

        console.log("\n🌐 Network Information:");
        console.log(`   Network: ${report.network.name}`);
        console.log(`   Chain ID: ${report.network.chainId}`);
        console.log(`   Block Number: ${report.network.blockNumber}`);
        console.log(`   Gas Price: ${report.network.gasPrice} gwei`);

        console.log("\n💰 Treasury Information:");
        console.log(`   Address: ${report.treasury.address}`);
        console.log(`   Balance: ${report.treasury.balance} LAZAI`);

        console.log("\n📈 NFT Metrics:");
        console.log(`   Total NFTs: ${report.nft.totalNFTs}`);
        console.log(`   Total Queries: ${report.nft.totalQueries}`);
        console.log(`   Total Earned: ${report.nft.totalEarned} LAZAI`);
        console.log(`   Avg Queries/NFT: ${report.nft.averageQueriesPerNFT}`);

        console.log("\n⏰ Report Generated:");
        console.log(`   ${report.generatedAt}`);

        console.log("\n" + "=".repeat(60));
    }

    async startMonitoring(intervalMinutes = 5) {
        console.log(`🔄 Starting monitoring (interval: ${intervalMinutes} minutes)...`);

        const intervalMs = intervalMinutes * 60 * 1000;

        // Initial report
        try {
            const report = await this.generateReport();
            this.displayReport(report);
        } catch (error) {
            console.error("❌ Initial monitoring failed:", error.message);
        }

        // Set up interval
        setInterval(async () => {
            try {
                console.log(`\n🔄 Generating periodic report...`);
                const report = await this.generateReport();
                this.displayReport(report);
            } catch (error) {
                console.error("❌ Periodic monitoring failed:", error.message);
            }
        }, intervalMs);

        console.log("✅ Monitoring started. Press Ctrl+C to stop.");
    }
}

async function main() {
    const monitor = new DataStreamNFTMonitor();

    try {
        await monitor.initialize();

        const command = process.argv[2];
        const interval = parseInt(process.argv[3]) || 5;

        switch (command) {
            case 'report':
                const report = await monitor.generateReport();
                monitor.displayReport(report);
                break;

            case 'monitor':
                await monitor.startMonitoring(interval);
                break;

            default:
                console.log("Usage:");
                console.log("  node scripts/monitor.js report          # Generate single report");
                console.log("  node scripts/monitor.js monitor [min]   # Start continuous monitoring");
                console.log("  node scripts/monitor.js monitor 10      # Monitor every 10 minutes");
                break;
        }
    } catch (error) {
        console.error("❌ Monitor failed:", error.message);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down monitor...');
    process.exit(0);
});

main().catch((error) => {
    console.error("❌ Monitor error:", error);
    process.exit(1);
});
