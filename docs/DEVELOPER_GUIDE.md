# DataStreamNFT Developer Guide

Complete guide for developers working with the DataStreamNFT platform.

## 🏗️ Architecture Overview

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Blockchain    │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (LazAI)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web3 Wallet   │    │   MongoDB       │    │   IPFS Storage  │
│   (MetaMask)    │    │   (Database)    │    │   (Pinata)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Blockchain**: Ethers.js, LazAI Testnet, Smart Contracts
- **Storage**: IPFS (Pinata), File Upload (Multer)
- **Testing**: Jest, Playwright, Mocha, Chai
- **Monitoring**: Winston, Performance Monitoring

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm 8+
- MongoDB 6+
- Git
- MetaMask browser extension

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/DataStreamNFT.git
cd DataStreamNFT
```

2. **Install dependencies**
```bash
npm install
cd fe && npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start MongoDB**
```bash
# On Windows
net start MongoDB

# On macOS/Linux
brew services start mongodb-community
```

5. **Start the development servers**
```bash
npm run dev
```

## 📁 Project Structure

```
DataStreamNFT/
├── contracts/                 # Smart contracts
│   ├── DataStreamNFT.sol
│   ├── DataStreamDAT.sol
│   └── DATToken.sol
├── fe/                       # Frontend (Next.js)
│   ├── src/
│   │   ├── app/             # App router
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   └── services/        # API services
│   └── public/              # Static assets
├── src/                     # Backend
│   ├── api/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   └── services/        # Business logic
│   └── scripts/             # Utility scripts
├── tests/                   # Test files
│   ├── backend/            # Backend tests
│   ├── contracts/          # Contract tests
│   ├── frontend/           # Frontend tests
│   └── integration/        # E2E tests
└── docs/                   # Documentation
```

## 🔧 Development Workflow

### Backend Development

1. **Start the backend server**
```bash
npm run dev:backend
```

2. **Run backend tests**
```bash
npm run test:backend
```

3. **Check code quality**
```bash
npm run lint
npm run lint:fix
```

### Frontend Development

1. **Start the frontend server**
```bash
cd fe
npm run dev
```

2. **Run frontend tests**
```bash
cd fe
npm test
```

3. **Build for production**
```bash
cd fe
npm run build
```

### Smart Contract Development

1. **Compile contracts**
```bash
npx hardhat compile
```

2. **Run contract tests**
```bash
npx hardhat test
```

3. **Deploy to testnet**
```bash
npx hardhat run scripts/deploy-lazai.js --network lazchain
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:contracts
npm run test:backend
npm run test:frontend
npm run test:e2e

# Run with coverage
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Individual functions and components
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: Complete user workflows
- **Contract Tests**: Smart contract functionality

### Writing Tests

**Backend API Test Example:**
```javascript
const request = require('supertest');
const { expect } = require('chai');
const app = require('../../src/api/server');

describe('DataStream API', () => {
  it('should create a new data stream', async () => {
    const dataStream = {
      title: 'Test Dataset',
      description: 'Test description',
      category: 'research',
      queryPrice: '1000000000000000000'
    };

    const res = await request(app)
      .post('/api/v1/datastreams')
      .send(dataStream)
      .expect(201);

    expect(res.body.success).to.be.true;
    expect(res.body.data.title).to.equal('Test Dataset');
  });
});
```

**Frontend Component Test Example:**
```javascript
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import HomePage from '../HomePage';

test('renders main title', () => {
  render(<HomePage />);
  expect(screen.getByText('DataStreamNFT')).toBeInTheDocument();
});
```

## 🔌 API Development

### Creating New Endpoints

1. **Create the route**
```javascript
// src/api/routes/newRoute.js
const express = require('express');
const router = express.Router();
const NewController = require('../controllers/NewController');

router.get('/endpoint', NewController.getData);
router.post('/endpoint', NewController.createData);

module.exports = router;
```

2. **Create the controller**
```javascript
// src/api/controllers/NewController.js
class NewController {
  static async getData(req, res) {
    try {
      // Implementation
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = NewController;
```

3. **Register the route**
```javascript
// src/api/server.js
const newRoutes = require('./routes/newRoute');
app.use('/api/v1/new', newRoutes);
```

### Middleware Development

```javascript
// src/api/middleware/customMiddleware.js
const customMiddleware = (req, res, next) => {
  // Middleware logic
  console.log('Custom middleware executed');
  next();
};

module.exports = customMiddleware;
```

## 🗄️ Database Development

### Creating Models

```javascript
// src/api/models/NewModel.js
const mongoose = require('mongoose');

const newSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NewModel', newSchema);
```

### Database Operations

```javascript
// Create
const newDoc = new NewModel({ name: 'Test' });
await newDoc.save();

// Read
const docs = await NewModel.find({ name: 'Test' });

// Update
await NewModel.findByIdAndUpdate(id, { name: 'Updated' });

// Delete
await NewModel.findByIdAndDelete(id);
```

## ⛓️ Blockchain Development

### Smart Contract Interaction

```javascript
// src/api/services/BlockchainService.js
const { ethers } = require('ethers');

class BlockchainService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.LAZAI_RPC_URL);
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
  }

  async mintNFT(tokenURI, queryPrice) {
    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      CONTRACT_ABI,
      this.wallet
    );

    const tx = await contract.mintDataNFT(tokenURI, queryPrice);
    return await tx.wait();
  }
}
```

### Event Listening

```javascript
contract.on('DataNFTMinted', (tokenId, creator, uri, queryPrice) => {
  console.log(`NFT ${tokenId} minted by ${creator}`);
  // Handle event
});
```

## 🎨 Frontend Development

### Component Development

```typescript
// fe/src/components/NewComponent.tsx
import React from 'react';

interface NewComponentProps {
  title: string;
  onAction: () => void;
}

export const NewComponent: React.FC<NewComponentProps> = ({ title, onAction }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold">{title}</h2>
      <button onClick={onAction} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
        Action
      </button>
    </div>
  );
};
```

### Context Development

```typescript
// fe/src/contexts/NewContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface NewContextType {
  data: any;
  setData: (data: any) => void;
}

const NewContext = createContext<NewContextType | undefined>(undefined);

export const useNew = () => {
  const context = useContext(NewContext);
  if (!context) {
    throw new Error('useNew must be used within a NewProvider');
  }
  return context;
};

export const NewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState(null);

  return (
    <NewContext.Provider value={{ data, setData }}>
      {children}
    </NewContext.Provider>
  );
};
```

## 📊 Monitoring & Performance

### Performance Monitoring

```javascript
// src/api/middleware/performance.js
const { performance } = require('perf_hooks');

const performanceMiddleware = (req, res, next) => {
  const start = performance.now();
  
  res.on('finish', () => {
    const duration = performance.now() - start;
    console.log(`${req.method} ${req.path} - ${duration.toFixed(2)}ms`);
  });
  
  next();
};
```

### Logging

```javascript
// src/api/middleware/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

## 🚀 Deployment

### Environment Setup

1. **Production Environment Variables**
```bash
NODE_ENV=production
MONGODB_URI=mongodb://production-server:27017/datastreamnft
LAZAI_RPC_URL=https://mainnet.lazai.network
CONTRACT_ADDRESS=0x...
```

2. **Build for Production**
```bash
npm run build
```

3. **Start Production Server**
```bash
npm start
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001
CMD ["npm", "start"]
```

## 🔒 Security Best Practices

### Input Validation

```javascript
const { body, validationResult } = require('express-validator');

const validateDataStream = [
  body('title').isLength({ min: 1, max: 100 }).trim(),
  body('description').isLength({ max: 1000 }).trim(),
  body('queryPrice').isNumeric().isLength({ min: 1 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
```

### Authentication

```javascript
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};
```

## 🐛 Debugging

### Backend Debugging

```javascript
// Enable debug logging
process.env.DEBUG = 'app:*';

// Use debug module
const debug = require('debug')('app:server');
debug('Server starting...');
```

### Frontend Debugging

```typescript
// Use React DevTools
import { useEffect } from 'react';

useEffect(() => {
  console.log('Component mounted');
}, []);
```

### Blockchain Debugging

```javascript
// Enable ethers debug logging
process.env.DEBUG = 'ethers:*';

// Log transaction details
const tx = await contract.mintDataNFT(tokenURI, queryPrice);
console.log('Transaction hash:', tx.hash);
console.log('Gas used:', tx.gasUsed.toString());
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Ethers.js Documentation](https://docs.ethers.io/v6/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Playwright Testing](https://playwright.dev/docs/intro)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

- **Documentation**: Check this guide and API docs
- **Issues**: Report bugs on GitHub
- **Discussions**: Join our Discord server
- **Email**: dev@datastreamnft.com

---

Happy coding! 🚀
