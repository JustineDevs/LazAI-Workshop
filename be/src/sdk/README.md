# DataStreamNFT JavaScript SDK

A comprehensive JavaScript SDK for interacting with the DataStreamNFT platform, enabling developers to mint, query, and manage data NFTs with ease.

## Installation

```bash
npm install @datastreamnft/sdk ethers
```

## Quick Start

```javascript
const { ethers } = require('ethers');
const DataStreamSDK = require('@datastreamnft/sdk');

// Initialize SDK
const sdk = new DataStreamSDK({
    rpcUrl: 'https://rpc.lazchain.com',
    dataStreamNFTAddress: '0x...',
    datTokenAddress: '0x...'
});

// Connect to wallet
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// Initialize SDK with signer
await sdk.initialize(signer);

// Mint a new DataStream NFT
const result = await sdk.mintDataStream({
    ipfsHash: 'QmYourDataHash...',
    metadataHash: 'QmYourMetadataHash...',
    queryPrice: '0.1', // 0.1 DAT tokens
    to: '0xYourAddress...'
});

console.log('Minted DataStream NFT:', result.tokenId);
```

## API Reference

### Constructor

```javascript
new DataStreamSDK(config)
```

**Parameters:**
- `config.rpcUrl` (string): RPC URL for the blockchain network
- `config.dataStreamNFTAddress` (string): DataStreamNFT contract address
- `config.datTokenAddress` (string): DAT token contract address
- `config.apiBaseUrl` (string): API base URL for additional services

### Methods

#### `initialize(providerOrSigner)`

Initialize the SDK with a provider or signer.

**Parameters:**
- `providerOrSigner` (ethers.Provider|ethers.Signer): Provider or signer instance

#### `mintDataStream(dataStreamData)`

Mint a new DataStream NFT.

**Parameters:**
- `dataStreamData.ipfsHash` (string): IPFS hash of the data
- `dataStreamData.metadataHash` (string): IPFS hash of the metadata
- `dataStreamData.queryPrice` (string|number): Query price in DAT tokens
- `dataStreamData.to` (string): Address to mint the NFT to

**Returns:** Promise with transaction details and token ID

#### `executeQuery(tokenId)`

Execute a query on a DataStream NFT.

**Parameters:**
- `tokenId` (string|number): Token ID of the DataStream

**Returns:** Promise with transaction details

#### `getDataStream(tokenId)`

Get DataStream information.

**Parameters:**
- `tokenId` (string|number): Token ID of the DataStream

**Returns:** Promise with DataStream data

#### `updateQueryPrice(tokenId, newPrice)`

Update query price for a DataStream.

**Parameters:**
- `tokenId` (string|number): Token ID of the DataStream
- `newPrice` (string|number): New query price in DAT tokens

**Returns:** Promise with transaction details

#### `deactivateDataStream(tokenId)`

Deactivate a DataStream.

**Parameters:**
- `tokenId` (string|number): Token ID of the DataStream

**Returns:** Promise with transaction details

#### `getBalance(address)`

Get ETH balance for an address.

**Parameters:**
- `address` (string): Ethereum address

**Returns:** Promise with balance in ETH

#### `getDATBalance(address)`

Get DAT token balance for an address.

**Parameters:**
- `address` (string): Ethereum address

**Returns:** Promise with balance in DAT tokens

#### `approveDAT(spender, amount)`

Approve DAT tokens for spending.

**Parameters:**
- `spender` (string): Address to approve
- `amount` (string|number): Amount to approve

**Returns:** Promise with transaction details

## Examples

### Complete Workflow

```javascript
const { ethers } = require('ethers');
const DataStreamSDK = require('@datastreamnft/sdk');

async function completeWorkflow() {
    // Initialize SDK
    const sdk = new DataStreamSDK({
        rpcUrl: 'https://rpc.lazchain.com',
        dataStreamNFTAddress: '0x...',
        datTokenAddress: '0x...'
    });

    // Connect to wallet
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    await sdk.initialize(signer);

    // Get current address
    const address = await sdk.getCurrentAddress();
    console.log('Connected address:', address);

    // Check DAT balance
    const datBalance = await sdk.getDATBalance(address);
    console.log('DAT balance:', datBalance);

    // Mint DataStream NFT
    const mintResult = await sdk.mintDataStream({
        ipfsHash: 'QmYourDataHash...',
        metadataHash: 'QmYourMetadataHash...',
        queryPrice: '0.1',
        to: address
    });

    console.log('Minted DataStream NFT:', mintResult.tokenId);

    // Get DataStream info
    const dataStream = await sdk.getDataStream(mintResult.tokenId);
    console.log('DataStream info:', dataStream);

    // Execute query (requires DAT tokens)
    const queryResult = await sdk.executeQuery(mintResult.tokenId);
    console.log('Query executed:', queryResult.transactionHash);
}

completeWorkflow().catch(console.error);
```

### Error Handling

```javascript
try {
    const result = await sdk.mintDataStream({
        ipfsHash: 'QmYourDataHash...',
        metadataHash: 'QmYourMetadataHash...',
        queryPrice: '0.1',
        to: '0xYourAddress...'
    });
    console.log('Success:', result);
} catch (error) {
    console.error('Error:', error.message);
    // Handle specific error types
    if (error.message.includes('insufficient funds')) {
        console.log('Please add more ETH for gas');
    } else if (error.message.includes('user rejected')) {
        console.log('Transaction was rejected by user');
    }
}
```

### Event Listening

```javascript
// Listen for DataStream creation events
const filter = {
    address: sdk.config.dataStreamNFTAddress,
    topics: [
        ethers.id('DataStreamCreated(uint256,address,string,uint256)')
    ]
};

sdk.provider.on(filter, (log) => {
    const parsed = sdk.dataStreamNFT.interface.parseLog(log);
    console.log('New DataStream created:', {
        tokenId: parsed.args.tokenId.toString(),
        creator: parsed.args.creator,
        ipfsHash: parsed.args.ipfsHash,
        queryPrice: ethers.formatEther(parsed.args.queryPrice)
    });
});
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- Documentation: [https://docs.datastreamnft.com](https://docs.datastreamnft.com)
- GitHub: [https://github.com/yourusername/DataStreamNFT](https://github.com/yourusername/DataStreamNFT)
- Discord: [https://discord.gg/datastreamnft](https://discord.gg/datastreamnft)
