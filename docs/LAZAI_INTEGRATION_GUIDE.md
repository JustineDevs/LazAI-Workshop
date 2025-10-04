# 🚀 LazAI-Workshop Integration Guide

## Overview

This guide demonstrates how to integrate your DataStreamNFT project with the LazAI-Workshop capabilities, implementing a complete AI-powered data monetization platform with query metering and micropayments.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   AI Service    │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (Python)      │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 5000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web3 Wallet   │    │   Smart         │    │   AI Models     │
│   (MetaMask)    │    │   Contracts     │    │   (GPT-4o, etc) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Core Components

### 1. Smart Contracts (Enhanced)

**File:** `smc/DataStreamNFT.sol`

**New Functions:**
- `queryMeter(uint256 tokenId, string memory queryType)` - Core query metering
- `triggerAIInference(uint256 tokenId, string memory model, string memory queryType)` - AI inference trigger
- Enhanced events for analytics and monitoring

**Key Features:**
- Per-query micropayments
- Query type tracking
- AI model integration
- Comprehensive analytics

### 2. Backend API (Enhanced)

**File:** `be/src/simple-app.js`

**New Endpoints:**
- `POST /api/v1/nft/mint` - Mint new DataStreamNFTs
- `GET /api/v1/nft/:id/status` - Get NFT status and analytics
- `POST /api/v1/query/pay` - Process query payments
- `POST /api/v1/ai/infer` - AI inference service
- `POST /api/v1/query/meter` - Query metering
- `GET /api/v1/leaderboard` - Community rankings

### 3. AI Service (New)

**File:** `ai-service/app.py`

**Features:**
- Multi-model support (Gemini Pro - FREE, GPT-4o, LM Studio)
- Query metering integration
- Payment processing
- Analytics and monitoring
- Fallback to mock responses

**Models Supported:**
- Gemini Pro (Google) - **FREE TIER AVAILABLE**
- GPT-4o (OpenAI) - Paid
- LM Studio (Local) - Free
- Claude (Anthropic) - Paid (Optional)
- Mock AI (Development) - Free

### 4. Frontend (Enhanced)

**New Components:**
- `Leaderboard.tsx` - Community rankings
- Enhanced `DashboardPage.tsx` - Advanced analytics
- Enhanced `EnhancedQueryInterface.tsx` - AI integration

## 🚀 Quick Start

### 1. Deploy All Components

```bash
# Make scripts executable
chmod +x deploy-with-ai.sh

# Deploy everything
./deploy-with-ai.sh
```

### 2. Manual Deployment

```bash
# Install dependencies
npm run install:all

# Start backend
cd be && npm run dev &

# Start AI service
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py &

# Start frontend
cd fe && npm run dev &
```

## 🔌 Integration Points

### 1. Query Metering Flow

```javascript
// Frontend → Backend → Smart Contract
const response = await fetch('/api/v1/query/meter', {
  method: 'POST',
  body: JSON.stringify({
    tokenId: '123',
    queryType: 'ai_inference',
    cost: '0.001',
    wallet: account
  })
});
```

### 2. AI Inference Flow

```javascript
// Frontend → AI Service → Backend → Smart Contract
const response = await fetch('http://localhost:5000/infer', {
  method: 'POST',
  body: JSON.stringify({
    tokenId: '123',
    query: 'Analyze this dataset',
    model: 'gpt-4o',
    wallet: account
  })
});
```

### 3. Smart Contract Integration

```solidity
// Query metering with micropayments
function queryMeter(uint256 tokenId, string memory queryType) external payable {
    // Validate payment
    // Process micropayment
    // Update analytics
    // Emit events
}
```

## 📊 API Usage Examples

### Mint DataStreamNFT

```bash
curl -X POST http://localhost:3001/api/v1/nft/mint \
  -H "Content-Type: application/json" \
  -d '{
    "ipfsHash": "QmExample...",
    "price": "0.001",
    "dataClass": "dataset",
    "dataValue": "high"
  }'
```

### Query AI Service

```bash
curl -X POST http://localhost:5000/infer \
  -H "Content-Type: application/json" \
  -d '{
    "tokenId": "123",
    "query": "Analyze market trends",
    "model": "gpt-4o",
    "wallet": "0x1234..."
  }'
```

### Get Leaderboard

```bash
curl "http://localhost:3001/api/v1/leaderboard?type=earnings&limit=10"
```

## 🔐 Environment Configuration

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
CHAIN_ID=133718
NETWORK_NAME=LazAI Testnet
RPC_URL=https://testnet.lazai.network
```

### AI Service (ai-service/.env)
```env
AI_SERVICE_PORT=5000
BACKEND_API_URL=http://localhost:3001
GEMINI_API_KEY=your_gemini_key  # FREE TIER AVAILABLE
OPENAI_API_KEY=your_openai_key  # PAID
CLAUDE_API_KEY=your_claude_key  # PAID (OPTIONAL)
LM_STUDIO_URL=http://localhost:1234
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:5000
NEXT_PUBLIC_CHAIN_ID=133718
NEXT_PUBLIC_TEST_MODE=true
```

## 🎯 Key Features Implemented

### 1. Query Metering
- Per-query micropayments
- Real-time cost calculation
- Transaction tracking
- Analytics integration

### 2. AI Integration
- Multiple AI model support
- Fallback mechanisms
- Cost optimization
- Performance monitoring

### 3. Community Features
- Leaderboards
- User rankings
- Analytics dashboards
- Social features

### 4. Smart Contract Features
- Query metering functions
- AI inference triggers
- Micropayment processing
- Event logging

## 🔄 Data Flow

1. **User Uploads Data** → IPFS → Mint NFT
2. **User Queries Data** → AI Service → Smart Contract Payment
3. **AI Processes Query** → Returns Results → Updates Analytics
4. **Payment Processed** → Creator Earns → Platform Fee Collected
5. **Analytics Updated** → Leaderboard → Dashboard

## 🛠️ Development Workflow

### 1. Local Development
```bash
# Start all services
./deploy-with-ai.sh

# Test AI integration
curl -X POST http://localhost:5000/infer \
  -H "Content-Type: application/json" \
  -d '{"tokenId":"1","query":"test","model":"mock","wallet":"0x123"}'
```

### 2. Testing Smart Contracts
```bash
cd smc
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy-simple.js --network localhost
```

### 3. Frontend Development
```bash
cd fe
npm run dev
# Visit http://localhost:3000
```

## 📈 Monitoring and Analytics

### 1. Service Health
- Backend: `http://localhost:3001/api/v1/health`
- AI Service: `http://localhost:5000/health`
- Frontend: `http://localhost:3000`

### 2. Analytics Endpoints
- Leaderboard: `/api/v1/leaderboard`
- User Stats: `/api/v1/user/:address/nfts`
- AI Stats: `/api/v1/ai/stats`

### 3. Smart Contract Events
- `QueryMetered` - Query payment processed
- `AIInferenceTriggered` - AI model used
- `DataNFTMinted` - New NFT created

## 🚀 Production Deployment

### 1. Environment Setup
- Configure real API keys
- Set production contract addresses
- Enable HTTPS
- Configure CORS properly

### 2. Smart Contract Deployment
```bash
cd smc
npx hardhat run scripts/deploy-simple.js --network lazai-testnet
```

### 3. Service Deployment
- Deploy backend to cloud provider
- Deploy AI service with proper scaling
- Configure load balancers
- Set up monitoring

## 🎉 Success Metrics

- ✅ **Query Metering** - Per-query payments working
- ✅ **AI Integration** - Multiple models supported
- ✅ **Micropayments** - Smart contract integration
- ✅ **Analytics** - Comprehensive tracking
- ✅ **Community** - Leaderboards and rankings
- ✅ **Dashboard** - Advanced user interface
- ✅ **Error Handling** - Graceful fallbacks
- ✅ **Development** - Mock modes for testing

## 🔧 Troubleshooting

### Common Issues

1. **AI Service Not Starting**
   - Check Python dependencies
   - Verify virtual environment
   - Check port availability

2. **Smart Contract Errors**
   - Verify contract addresses
   - Check network configuration
   - Ensure sufficient gas

3. **Frontend Build Issues**
   - Clear Next.js cache
   - Check environment variables
   - Verify API endpoints

### Debug Commands

```bash
# Check service status
curl http://localhost:3001/api/v1/health
curl http://localhost:5000/health

# Test AI integration
curl -X POST http://localhost:5000/infer \
  -H "Content-Type: application/json" \
  -d '{"tokenId":"1","query":"test","model":"mock","wallet":"0x123"}'

# Check smart contract
npx hardhat console --network localhost
```

## 📚 Next Steps

1. **Deploy to Testnet** - Test with real contracts
2. **Configure AI Models** - Set up real API keys
3. **Add More Features** - Implement additional AI models
4. **Optimize Performance** - Add caching and scaling
5. **Security Audit** - Review smart contract security
6. **User Testing** - Gather feedback and iterate

---

**🎯 Your DataStreamNFT platform is now fully integrated with LazAI-Workshop capabilities!**

The platform supports:
- ✅ AI-powered data analysis
- ✅ Query-based micropayments
- ✅ Multi-model AI integration
- ✅ Community features and leaderboards
- ✅ Comprehensive analytics
- ✅ Production-ready architecture
