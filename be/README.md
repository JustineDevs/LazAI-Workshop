# LazAI Workshop Backend

Backend API for the LazAI Workshop - Web3 Data Monetization with AI Agents.

## Overview

This backend handles:
- File encryption and IPFS uploads via Pinata
- Smart contract interactions (DAT minting, query payments)
- LazAI/Alith API integration for AI inference
- User authentication and data management
- Analytics and community features

## Quick Start

### Prerequisites

- Node.js (v16+)
- MongoDB database
- Pinata API keys
- LazAI/Alith API access
- Lazai testnet wallet/private key

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Set PINATA_API_KEY, LAZAI_API_KEY, PRIVATE_KEY, etc.

# Start development server
npm run dev
```

### Environment Variables

See `.env.example` for required configuration.

## API Endpoints

### Data Streams
- `POST /api/data-streams/upload` - Upload and encrypt data
- `POST /api/data-streams/mint` - Mint DAT token
- `GET /api/data-streams/:id` - Get data stream info

### Blockchain
- `POST /api/blockchain/deploy` - Deploy contracts
- `GET /api/blockchain/status` - Get blockchain status
- `POST /api/blockchain/query` - Execute query with payment

### IPFS
- `POST /api/ipfs/upload` - Upload to IPFS
- `GET /api/ipfs/:hash` - Retrieve from IPFS

### LazAI
- `POST /api/lazai/inference` - Run AI inference
- `GET /api/lazai/models` - List available models

### Analytics
- `GET /api/analytics/creator/:address` - Creator analytics
- `GET /api/analytics/platform` - Platform statistics

## Development

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Deployment

```bash
# Deploy smart contracts
npm run deploy:contracts

# Deploy upgradeable contracts
npm run deploy:upgradeable

# Start production server
npm start
```

## Architecture

- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and external API integrations
- **Models**: Database schemas and data validation
- **Middleware**: Authentication, logging, error handling
- **Utils**: Helper functions and utilities

## Integration Points

- **Pinata IPFS**: File storage and retrieval
- **LazAI/Alith**: AI inference and DAT minting
- **Lazai Testnet**: Smart contract interactions
- **MongoDB**: Data persistence and analytics
