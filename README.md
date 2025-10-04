# 🚀 DataStreamNFT - Revolutionary Data Monetization Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue.svg)](https://soliditylang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5+-black.svg)](https://nextjs.org/)

> **Transform your data into valuable assets with AI-powered monetization, query metering, and micropayments on the LazAI blockchain.**

## 🌟 Overview

DataStreamNFT is a comprehensive Web3 platform that enables data creators to monetize their datasets through NFT-based licensing, AI-powered query processing, and automated micropayments. Built on the LazAI blockchain with advanced smart contract integration.

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

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.8+
- Git
- MetaMask wallet

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/datastreamnft.git
cd datastreamnft

# Install all dependencies
npm run install:all

# Copy environment files
cp config/env.example .env
cp fe/env.example fe/.env.local
cp ai-service/env.example ai-service/.env
```

### Development

```bash
# Start all services
npm run dev

# Or start individually
npm run dev:frontend  # Frontend on :3000
npm run dev:backend   # Backend on :3001
npm run ai:start      # AI service on :5000
```

### Production Deployment

```bash
# Deploy with AI integration
npm run deploy:ai

# Deploy contracts only
npm run deploy:testnet
```

## 📁 Project Structure

```
DataStreamNFT/
├── 📁 ai-service/           # AI inference service (Python)
├── 📁 assets/               # Static assets and media
├── 📁 be/                   # Backend API (Node.js)
├── 📁 config/               # Configuration files
├── 📁 docs/                 # Documentation
├── 📁 fe/                   # Frontend (Next.js)
├── 📁 logs/                 # Application logs
├── 📁 scripts/              # Deployment and utility scripts
│   ├── 📁 deployment/       # Deployment scripts
│   ├── 📁 monitoring/       # Monitoring scripts
│   ├── 📁 testing/          # Test scripts
│   └── 📁 utilities/        # Utility scripts
├── 📁 smc/                  # Smart contracts (Solidity)
├── 📁 tests/                # Test suites
└── 📁 tmp/                  # Temporary files
```

## 🔧 Core Features

### 🎯 Data Monetization
- **NFT-based Licensing** - Convert datasets into tradeable NFTs
- **Query Metering** - Per-query micropayment system
- **Dynamic Pricing** - Flexible pricing models
- **Revenue Sharing** - Automatic creator payments

### 🤖 AI Integration
- **Multi-Model Support** - Gemini Pro (FREE), GPT-4o, LM Studio
- **Query Processing** - AI-powered data analysis
- **Cost Optimization** - Efficient query routing with free tier support
- **Fallback Systems** - Graceful degradation

### 🌐 Web3 Features
- **Wallet Integration** - MetaMask support
- **Smart Contracts** - Automated payments
- **IPFS Storage** - Decentralized file hosting
- **Blockchain Analytics** - Real-time tracking

### 📊 Analytics & Community
- **Creator Dashboard** - Earnings and performance metrics
- **Leaderboards** - Community rankings
- **Query Analytics** - Usage statistics
- **Platform Metrics** - System health monitoring

## 🛠️ Technology Stack

### Frontend
- **Next.js 15.5** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Ethers.js** - Web3 integration

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Winston** - Logging

### Smart Contracts
- **Solidity 0.8.20** - Contract language
- **Hardhat** - Development environment
- **OpenZeppelin** - Security libraries

### AI Service
- **Python 3.8+** - Runtime
- **Flask** - Web framework
- **Google Gemini API** - FREE tier integration (PRIMARY)
- **OpenAI API** - GPT-4o integration
- **Claude API** - Anthropic integration (optional)

## 📚 Documentation

- [**Environment Setup**](docs/ENVIRONMENT_SETUP.md) - Configuration guide
- [**API Documentation**](docs/API_DOCUMENTATION.md) - API reference
- [**Deployment Guide**](docs/DEPLOYMENT_GUIDE.md) - Production deployment
- [**Developer Guide**](docs/DEVELOPER_GUIDE.md) - Development setup
- [**User Guide**](docs/USER_GUIDE.md) - End-user documentation
- [**Security Guide**](docs/SECURITY_GUIDE.md) - Security best practices

## 🔑 Environment Variables

### Required API Keys
- **Gemini API Key** - For Gemini Pro integration (FREE TIER) - **RECOMMENDED**
- **OpenAI API Key** - For GPT-4o integration (optional)
- **Claude API Key** - For Claude integration (optional)
- **Pinata API Keys** - For IPFS storage
- **Private Key** - For contract deployment

### Configuration
```bash
# Copy and configure environment files
cp config/env.example .env
cp fe/env.example fe/.env.local
cp ai-service/env.example ai-service/.env
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:contracts  # Smart contract tests
npm run test:backend    # Backend API tests
npm run test:frontend   # Frontend component tests
npm run test:e2e        # End-to-end tests
```

## 🚀 Deployment

### Development
```bash
# Start local development
npm run dev

# Deploy to local testnet
npm run deploy
```

### Production
```bash
# Deploy to LazAI testnet
npm run deploy:testnet

# Deploy to mainnet
npm run deploy:mainnet
```

## 📊 Monitoring

```bash
# Health check
npm run health-check

# Performance monitoring
npm run test:performance

# System monitoring
npm run monitor
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/datastreamnft/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/datastreamnft/discussions)

## 🎯 Roadmap

- [ ] **Q1 2024** - Core platform launch
- [ ] **Q2 2024** - Advanced AI features
- [ ] **Q3 2024** - Mobile app
- [ ] **Q4 2024** - Enterprise features

---

**Built with ❤️ by the DataStreamNFT Team**

*Transforming data into value, one query at a time.*