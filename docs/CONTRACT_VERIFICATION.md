# Contract Verification Guide

This guide explains how to verify your smart contracts on the LazAI Testnet using Hardhat's verification plugin.

## Prerequisites

1. Contract deployed to LazAI Testnet
2. Hardhat configured with verification settings
3. Contract source code and constructor arguments

## Configuration

The Hardhat configuration includes the following verification setup:

```javascript
etherscan: {
  apiKey: {
    'lazai-testnet': 'empty'
  },
  customChains: [
    {
      network: "lazai-testnet",
      chainId: 133718,
      urls: {
        apiURL: "https://testnet-explorer-api.lazai.network/api",
        browserURL: "https://testnet-explorer.lazai.network"
      }
    }
  ]
}
```

## Verification Methods

### Method 1: Using Hardhat Verify Command

#### For DataStreamNFT Contract
```bash
npx hardhat verify \
  --network lazai-testnet \
  <CONTRACT_ADDRESS> \
  <PLATFORM_TREASURY_ADDRESS>
```

Example:
```bash
npx hardhat verify \
  --network lazai-testnet \
  0x1868C3935B5A548C90d5660981FB866160382Da7 \
  0x1234567890123456789012345678901234567890
```

#### For DATToken Contract
```bash
npx hardhat verify \
  --network lazai-testnet \
  <CONTRACT_ADDRESS>
```

Example:
```bash
npx hardhat verify \
  --network lazai-testnet \
  0x1868C3935B5A548C90d5660981FB866160382Da7
```

### Method 2: Using the Verification Script

We provide a convenient script for verification:

```bash
# For DataStreamNFT (with constructor args)
npx hardhat run scripts/verify-contract.js --network lazai-testnet <CONTRACT_ADDRESS> <PLATFORM_TREASURY_ADDRESS>

# For DATToken (no constructor args)
npx hardhat run scripts/verify-contract.js --network lazai-testnet <CONTRACT_ADDRESS>
```

### Method 3: Programmatic Verification

You can also verify contracts programmatically in your deployment scripts:

```javascript
// After deployment
await hre.run("verify:verify", {
  address: contractAddress,
  constructorArguments: [platformTreasury], // Only for DataStreamNFT
  network: "lazai-testnet"
});
```

## Constructor Arguments

### DataStreamNFT
- **platformTreasury** (address): The address that will receive platform fees

### DATToken
- No constructor arguments required

## Troubleshooting

### Common Issues

1. **"Contract already verified"**
   - This means the contract is already verified on the explorer
   - You can view it at: `https://testnet-explorer.lazai.network/address/<CONTRACT_ADDRESS>`

2. **"Constructor arguments mismatch"**
   - Ensure you provide the exact same constructor arguments used during deployment
   - Check your deployment script for the correct arguments

3. **"Network not found"**
   - Make sure you're using the correct network name: `lazai-testnet`
   - Verify your Hardhat configuration includes the custom chain

4. **"API key required"**
   - The LazAI testnet uses 'empty' as the API key
   - This is already configured in the Hardhat config

### Verification Status Check

After verification, you can check the status by visiting:
```
https://testnet-explorer.lazai.network/address/<CONTRACT_ADDRESS>
```

## Best Practices

1. **Verify immediately after deployment** - This ensures the contract is verified while the deployment transaction is still recent
2. **Save constructor arguments** - Keep a record of constructor arguments used during deployment
3. **Test verification locally** - Use Hardhat's local network to test verification before deploying to testnet
4. **Use deployment scripts** - Include verification in your deployment scripts for automation

## Example Deployment with Verification

```javascript
async function main() {
  // Deploy contract
  const DataStreamNFT = await ethers.getContractFactory("DataStreamNFT");
  const platformTreasury = "0x1234567890123456789012345678901234567890";
  const dataStreamNFT = await DataStreamNFT.deploy(platformTreasury);
  await dataStreamNFT.waitForDeployment();
  
  const contractAddress = await dataStreamNFT.getAddress();
  console.log("Contract deployed to:", contractAddress);
  
  // Wait for a few blocks before verification
  console.log("Waiting for contract to be mined...");
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  // Verify contract
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [platformTreasury],
      network: "lazai-testnet"
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("Contract is already verified!");
    } else {
      console.error("Verification failed:", error.message);
    }
  }
}
```

## Support

If you encounter issues with verification:

1. Check the LazAI Testnet explorer for contract status
2. Verify your constructor arguments match the deployment
3. Ensure your Hardhat configuration is correct
4. Contact the LazAI team for support with their testnet
