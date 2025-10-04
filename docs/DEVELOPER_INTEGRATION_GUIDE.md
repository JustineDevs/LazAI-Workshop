# DataStreamNFT Developer Integration Guide

## 🚀 Quick Start

This guide helps developers integrate DataStreamNFT into their applications, whether you're building a data marketplace, AI platform, or any application that needs to monetize data through AI queries.

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Web3 wallet (MetaMask, WalletConnect, etc.)
- Basic understanding of React/Next.js
- Familiarity with smart contracts and Web3

## 🛠️ Installation

### 1. Install the SDK

```bash
npm install @datastreamnft/sdk
# or
yarn add @datastreamnft/sdk
```

### 2. Environment Setup

Create a `.env.local` file:

```env
# Required
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_API_URL=https://api.datastreamnft.com

# Optional - for enhanced features
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_MULTI_LLM_ENABLED=true
```

## 🔧 Basic Integration

### 1. Initialize the SDK

```typescript
import { DataStreamSDK } from '@datastreamnft/sdk';

const sdk = new DataStreamSDK({
  contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL,
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
});
```

### 2. Connect Wallet

```typescript
import { useWeb3 } from '@datastreamnft/sdk';

function App() {
  const { connectWallet, account, isConnected } = useWeb3();

  return (
    <div>
      {!isConnected ? (
        <button onClick={connectWallet}>
          Connect Wallet
        </button>
      ) : (
        <p>Connected: {account}</p>
      )}
    </div>
  );
}
```

### 3. Upload and Mint Data

```typescript
import { useDataStream } from '@datastreamnft/sdk';

function DataUploader() {
  const { uploadData, mintNFT, loading } = useDataStream();

  const handleUpload = async (file: File) => {
    try {
      // Upload encrypted data
      const uploadResult = await uploadData({
        file,
        title: 'My Dataset',
        description: 'A valuable dataset for AI training',
        dataClass: 'dataset',
        dataValue: 'high'
      });

      // Mint NFT
      const mintResult = await mintNFT({
        tokenURI: uploadResult.tokenURI,
        queryPrice: '0.001', // 0.001 ETH per query
        fileId: uploadResult.fileId,
        dataClass: 'dataset',
        dataValue: 'high'
      });

      console.log('NFT minted:', mintResult.tokenId);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        disabled={loading}
      />
      {loading && <p>Uploading...</p>}
    </div>
  );
}
```

### 4. Query Data

```typescript
import { useLazAI } from '@datastreamnft/sdk';

function DataQuerier() {
  const { runInference, switchProvider } = useLazAI();

  const handleQuery = async (tokenId: string, query: string) => {
    try {
      const result = await runInference({
        tokenId,
        query,
        provider: 'openai', // or 'gemini', 'groq', 'local'
        options: {
          maxTokens: 1000,
          temperature: 0.7
        }
      });

      console.log('Query result:', result.response);
    } catch (error) {
      console.error('Query failed:', error);
    }
  };

  return (
    <div>
      <input
        placeholder="Enter your query"
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleQuery('1', e.currentTarget.value);
          }
        }}
      />
    </div>
  );
}
```

## 🎯 Advanced Features

### 1. Analytics Integration

```typescript
import { useAnalytics } from '@datastreamnft/sdk';

function AnalyticsDashboard() {
  const { 
    getPlatformAnalytics, 
    getCreatorAnalytics, 
    getTokenAnalytics 
  } = useAnalytics();

  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const data = await getCreatorAnalytics(account);
      setAnalytics(data);
    };
    
    if (account) {
      fetchAnalytics();
    }
  }, [account]);

  return (
    <div>
      <h2>Your Analytics</h2>
      <p>Total Earnings: {analytics?.totalEarnings} ETH</p>
      <p>Total Queries: {analytics?.totalQueries}</p>
      <p>Performance Score: {analytics?.performanceScore}/100</p>
    </div>
  );
}
```

### 2. Multi-LLM Provider Support

```typescript
import { useLazAI } from '@datastreamnft/sdk';

function LLMProviderSelector() {
  const { 
    getAvailableProviders, 
    switchProvider, 
    runInferenceWithProvider 
  } = useLazAI();

  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('openai');

  useEffect(() => {
    const fetchProviders = async () => {
      const availableProviders = await getAvailableProviders();
      setProviders(availableProviders);
    };
    fetchProviders();
  }, []);

  const handleProviderChange = async (provider: string) => {
    await switchProvider(provider);
    setSelectedProvider(provider);
  };

  return (
    <div>
      <select 
        value={selectedProvider} 
        onChange={(e) => handleProviderChange(e.target.value)}
      >
        {providers.map(provider => (
          <option key={provider.name} value={provider.name}>
            {provider.displayName}
          </option>
        ))}
      </select>
    </div>
  );
}
```

### 3. Query Chaining

```typescript
import { useLazAI } from '@datastreamnft/sdk';

function QueryChaining() {
  const { chainQueries } = useLazAI();

  const handleChainQueries = async () => {
    const queries = [
      { fileId: 'file1', query: 'What is this data about?' },
      { fileId: 'file2', query: 'Compare with previous data' },
      { fileId: 'file3', query: 'Generate a summary' }
    ];

    const results = await chainQueries(queries, {
      context: 'Previous analysis results',
      provider: 'openai'
    });

    console.log('Chained results:', results);
  };

  return (
    <button onClick={handleChainQueries}>
      Run Chained Queries
    </button>
  );
}
```

## 🎨 UI Components

### 1. Data Upload Component

```typescript
import { DataUploader } from '@datastreamnft/sdk';

function MyDataUploader() {
  return (
    <DataUploader
      onUploadComplete={(result) => {
        console.log('Upload complete:', result);
      }}
      onError={(error) => {
        console.error('Upload error:', error);
      }}
      acceptedFileTypes={['.csv', '.json', '.txt', '.pdf']}
      maxFileSize={10 * 1024 * 1024} // 10MB
      encryptionEnabled={true}
    />
  );
}
```

### 2. Analytics Dashboard

```typescript
import { AnalyticsDashboard } from '@datastreamnft/sdk';

function MyAnalytics() {
  return (
    <AnalyticsDashboard
      address={account}
      showEarnings={true}
      showQueries={true}
      showPerformance={true}
      refreshInterval={30000} // 30 seconds
    />
  );
}
```

### 3. Query Interface

```typescript
import { QueryInterface } from '@datastreamnft/sdk';

function MyQueryInterface() {
  return (
    <QueryInterface
      tokenId="1"
      providers={['openai', 'gemini', 'groq']}
      onQueryComplete={(result) => {
        console.log('Query result:', result);
      }}
      showProviderSelector={true}
      showQueryHistory={true}
    />
  );
}
```

## 🔌 API Integration

### 1. Direct API Calls

```typescript
// Platform analytics
const platformStats = await fetch('/api/analytics/platform')
  .then(res => res.json());

// Creator analytics
const creatorStats = await fetch(`/api/analytics/creator/${address}`)
  .then(res => res.json());

// Run inference
const inferenceResult = await fetch('/api/enhanced-lazai/inference', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    fileId: 'file123',
    query: 'What is this data about?',
    options: {
      provider: 'openai',
      maxTokens: 1000
    }
  })
}).then(res => res.json());
```

### 2. WebSocket Integration

```typescript
import { DataStreamWebSocket } from '@datastreamnft/sdk';

const ws = new DataStreamWebSocket({
  url: 'wss://api.datastreamnft.com/ws',
  token: 'your-auth-token'
});

// Listen for real-time updates
ws.on('queryCompleted', (data) => {
  console.log('Query completed:', data);
});

ws.on('earningsUpdated', (data) => {
  console.log('Earnings updated:', data);
});

// Subscribe to specific events
ws.subscribe('creator', address);
ws.subscribe('token', tokenId);
```

## 🧪 Testing

### 1. Unit Tests

```typescript
import { DataStreamSDK } from '@datastreamnft/sdk';

describe('DataStreamSDK', () => {
  let sdk: DataStreamSDK;

  beforeEach(() => {
    sdk = new DataStreamSDK({
      contractAddress: '0x...',
      rpcUrl: 'http://localhost:8545',
      apiUrl: 'http://localhost:3001'
    });
  });

  it('should connect wallet', async () => {
    const result = await sdk.connectWallet();
    expect(result.success).toBe(true);
  });

  it('should upload data', async () => {
    const file = new File(['test data'], 'test.txt');
    const result = await sdk.uploadData({
      file,
      title: 'Test Data',
      description: 'Test description'
    });
    expect(result.success).toBe(true);
  });
});
```

### 2. Integration Tests

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DataUploader } from '@datastreamnft/sdk';

test('should upload file and mint NFT', async () => {
  render(<DataUploader />);
  
  const fileInput = screen.getByRole('file');
  const file = new File(['test data'], 'test.txt');
  
  fireEvent.change(fileInput, { target: { files: [file] } });
  
  await waitFor(() => {
    expect(screen.getByText('Upload complete')).toBeInTheDocument();
  });
});
```

## 🚀 Deployment

### 1. Environment Configuration

```bash
# Production environment
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_API_URL=https://api.datastreamnft.com
NEXT_PUBLIC_ANALYTICS_ENABLED=true
```

### 2. Build and Deploy

```bash
# Build the application
npm run build

# Deploy to Vercel
vercel --prod

# Or deploy to other platforms
npm run deploy
```

### 3. Monitoring

```typescript
import { DataStreamMonitor } from '@datastreamnft/sdk';

const monitor = new DataStreamMonitor({
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  token: process.env.MONITORING_TOKEN
});

// Track custom events
monitor.track('data_uploaded', {
  fileSize: file.size,
  dataClass: 'dataset',
  userId: account
});

// Track errors
monitor.trackError('upload_failed', error);
```

## 📚 Examples

### Complete Data Marketplace

```typescript
import React from 'react';
import { 
  DataStreamSDK, 
  DataUploader, 
  AnalyticsDashboard, 
  QueryInterface 
} from '@datastreamnft/sdk';

function DataMarketplace() {
  const [selectedToken, setSelectedToken] = useState(null);
  const [tokens, setTokens] = useState([]);

  return (
    <div className="marketplace">
      <header>
        <h1>Data Marketplace</h1>
        <DataUploader onUploadComplete={handleUploadComplete} />
      </header>
      
      <main>
        <div className="sidebar">
          <AnalyticsDashboard address={account} />
        </div>
        
        <div className="content">
          <div className="token-list">
            {tokens.map(token => (
              <div 
                key={token.id} 
                className="token-card"
                onClick={() => setSelectedToken(token)}
              >
                <h3>{token.title}</h3>
                <p>{token.description}</p>
                <p>Price: {token.queryPrice} ETH</p>
                <p>Queries: {token.totalQueries}</p>
              </div>
            ))}
          </div>
          
          {selectedToken && (
            <QueryInterface 
              tokenId={selectedToken.id}
              onQueryComplete={handleQueryComplete}
            />
          )}
        </div>
      </main>
    </div>
  );
}
```

### AI-Powered Data Analysis

```typescript
import React, { useState } from 'react';
import { useLazAI, useAnalytics } from '@datastreamnft/sdk';

function DataAnalysis() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const { runInference, chainQueries } = useLazAI();
  const { getTokenAnalytics } = useAnalytics();

  const handleAnalysis = async () => {
    const tokens = ['1', '2', '3']; // Your token IDs
    
    const queries = tokens.map(tokenId => ({
      fileId: tokenId,
      query: `Analyze this data: ${query}`
    }));

    const results = await chainQueries(queries, {
      provider: 'openai',
      context: 'Previous analysis results'
    });

    setResults(results.results);
  };

  return (
    <div>
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Describe what you want to analyze..."
      />
      <button onClick={handleAnalysis}>Analyze Data</button>
      
      <div className="results">
        {results.map((result, index) => (
          <div key={index} className="result">
            <h3>Token {result.fileId}</h3>
            <p>{result.result}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 🆘 Support

### Documentation
- [Full API Documentation](https://docs.datastreamnft.com/api)
- [SDK Reference](https://docs.datastreamnft.com/sdk)
- [Examples Repository](https://github.com/datastreamnft/examples)

### Community
- [Discord](https://discord.gg/datastreamnft)
- [GitHub Discussions](https://github.com/datastreamnft/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/datastreamnft)

### Support
- [Email Support](mailto:support@datastreamnft.com)
- [GitHub Issues](https://github.com/datastreamnft/issues)
- [Status Page](https://status.datastreamnft.com)

---

**Happy Building!** 🚀

For more examples and advanced use cases, check out our [examples repository](https://github.com/datastreamnft/examples) and [documentation](https://docs.datastreamnft.com).
