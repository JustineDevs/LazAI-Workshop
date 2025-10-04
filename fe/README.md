# LazAI Workshop Frontend

Frontend application for the LazAI Workshop - Web3 Data Monetization with AI Agents.

## Overview

This Next.js frontend provides:
- User dashboard and data management
- File upload and encryption interface
- DAT token minting and management
- AI query interface with real-time results
- Analytics and earnings tracking
- Community features and leaderboards

## Quick Start

### Prerequisites

- Node.js (v16+)
- MetaMask wallet extension
- Backend API running (see `../be/README.md`)

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your configuration
# Set NEXT_PUBLIC_API_URL, NEXT_PUBLIC_NETWORK_ID, etc.

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Features

### Core Components

- **UploadFile**: File selection and upload interface
- **MintDAT**: DAT token minting form
- **QueryData**: AI query interface with model selection
- **Dashboard**: User analytics and earnings overview
- **CommunityFeatures**: Leaderboards and social features

### Pages

- **Home** (`/`): Welcome page with feature overview
- **Upload** (`/upload`): File upload and minting flow
- **Dashboard** (`/dashboard`): User analytics and management
- **Query** (`/query`): AI query interface
- **Profile** (`/profile`): User profile and settings

### Hooks

- **usePinata**: IPFS upload and status tracking
- **useLazai**: DAT minting and AI query integration
- **useWeb3**: Wallet connection and blockchain interactions

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## Environment Variables

See `.env.example` for required configuration:

- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_NETWORK_ID`: Blockchain network ID
- `NEXT_PUBLIC_CONTRACT_ADDRESS`: Smart contract address
- `NEXT_PUBLIC_PINATA_GATEWAY`: IPFS gateway URL

## Architecture

- **Components**: Reusable UI components
- **Pages**: Route-based page components
- **Hooks**: Custom React hooks for data management
- **Services**: API integration and business logic
- **Contexts**: Global state management (Web3, Auth)
- **Utils**: Helper functions and utilities

## Integration

- **Backend API**: RESTful API for data operations
- **MetaMask**: Wallet connection and transactions
- **IPFS/Pinata**: File storage and retrieval
- **LazAI**: AI inference and DAT minting
- **Lazai Testnet**: Blockchain interactions
