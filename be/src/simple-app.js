const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression and logging
app.use(compression());
app.use(morgan('combined'));

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple API routes
app.get('/api/v1/blockchain/network', (req, res) => {
  res.json({
    success: true,
    data: {
      chainId: 133718,
      name: 'LazAI Testnet',
      rpcUrl: 'https://testnet.lazai.network',
      blockExplorerUrl: 'https://testnet-explorer.lazai.network'
    }
  });
});

app.get('/api/v1/blockchain/balance/:address', (req, res) => {
  res.json({
    success: true,
    data: {
      address: req.params.address,
      balance: '0.0',
      currency: 'ETH'
    }
  });
});

app.get('/api/v1/blockchain/contract/:address', (req, res) => {
  res.json({
    success: true,
    data: {
      address: req.params.address,
      type: 'DataStreamNFT',
      verified: true
    }
  });
});

app.get('/api/v1/data-streams', (req, res) => {
  res.json({
    success: true,
    data: [],
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalCount: 0
    }
  });
});

app.get('/api/v1/users/profile/:address', (req, res) => {
  res.json({
    success: true,
    data: {
      address: req.params.address,
      username: 'User',
      totalEarnings: '0.0',
      totalDataStreams: 0
    }
  });
});

app.get('/api/v1/analytics/creator/:address', (req, res) => {
  res.json({
    success: true,
    data: {
      address: req.params.address,
      totalEarnings: '0.0',
      totalQueries: 0,
      totalDataStreams: 0,
      monthlyEarnings: '0.0'
    }
  });
});

app.get('/api/v1/ipfs/upload', (req, res) => {
  res.json({
    success: true,
    data: {
      hash: 'QmTestHash',
      url: 'https://gateway.pinata.cloud/ipfs/QmTestHash'
    }
  });
});

// Enhanced API endpoints for LazAI-Workshop integration

// NFT Operations
app.post('/api/v1/nft/mint', (req, res) => {
  const { ipfsHash, price, dataClass, dataValue, metadata } = req.body;
  res.json({
    success: true,
    data: {
      tokenId: Math.floor(Math.random() * 1000) + 1,
      ipfsHash,
      price: price || '0.001',
      dataClass: dataClass || 'dataset',
      dataValue: dataValue || 'high',
      metadata: metadata || {},
      transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
      timestamp: new Date().toISOString()
    }
  });
});

app.get('/api/v1/nft/:id/status', (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    data: {
      tokenId: id,
      owner: '0x1234...5678',
      price: '0.001',
      totalQueries: Math.floor(Math.random() * 100),
      totalEarned: '0.125',
      isActive: true,
      createdAt: new Date().toISOString(),
      dataClass: 'dataset',
      dataValue: 'high'
    }
  });
});

app.post('/api/v1/query/pay', (req, res) => {
  const { tokenId, queryType, amount, wallet } = req.body;
  res.json({
    success: true,
    data: {
      tokenId,
      queryType: queryType || 'general',
      amount: amount || '0.001',
      wallet,
      transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
      timestamp: new Date().toISOString(),
      status: 'completed'
    }
  });
});

app.get('/api/v1/user/:address/nfts', (req, res) => {
  const { address } = req.params;
  const { page = 1, limit = 10 } = req.query;
  
  // Mock user NFTs
  const nfts = Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
    tokenId: (page - 1) * limit + i + 1,
    owner: address,
    price: (0.001 + Math.random() * 0.01).toFixed(6),
    totalQueries: Math.floor(Math.random() * 50),
    totalEarned: (Math.random() * 0.5).toFixed(6),
    isActive: true,
    dataClass: ['dataset', 'model', 'reference'][Math.floor(Math.random() * 3)],
    dataValue: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  }));

  res.json({
    success: true,
    data: nfts,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(25 / limit),
      totalCount: 25
    }
  });
});

// AI Inference Service
app.post('/api/v1/ai/infer', (req, res) => {
  const { tokenId, query, model, wallet } = req.body;
  
  // Simulate AI processing time
  setTimeout(() => {
    res.json({
      success: true,
      data: {
        tokenId,
        query,
        model: model || 'gemini',
        result: `AI analysis result for query: "${query}". This is a comprehensive analysis based on the dataset.`,
        confidence: 0.85 + Math.random() * 0.1,
        cost: '0.001',
        processingTime: Math.floor(Math.random() * 2000) + 500,
        timestamp: new Date().toISOString(),
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64)
      }
    });
  }, 1000 + Math.random() * 2000);
});

// Query Metering
app.post('/api/v1/query/meter', (req, res) => {
  const { tokenId, queryType, cost, wallet } = req.body;
  res.json({
    success: true,
    data: {
      tokenId,
      queryType: queryType || 'ai_inference',
      cost: cost || '0.001',
      wallet,
      metered: true,
      transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
      timestamp: new Date().toISOString()
    }
  });
});

// Leaderboard and Analytics
app.get('/api/v1/leaderboard', (req, res) => {
  const { type = 'earnings', limit = 10 } = req.query;
  
  const leaderboard = Array.from({ length: parseInt(limit) }, (_, i) => ({
    rank: i + 1,
    address: '0x' + Math.random().toString(16).substr(2, 40),
    username: `User${i + 1}`,
    earnings: (Math.random() * 10).toFixed(4),
    queries: Math.floor(Math.random() * 1000),
    nfts: Math.floor(Math.random() * 50),
    score: Math.floor(Math.random() * 1000)
  }));

  res.json({
    success: true,
    data: leaderboard,
    type,
    updatedAt: new Date().toISOString()
  });
});

// Enhanced LazAI Query
app.get('/api/v1/lazai/query', (req, res) => {
  res.json({
    success: true,
    data: {
      query: req.query.q || 'test query',
      result: 'This is a mock AI response with enhanced analytics',
      confidence: 0.95,
      model: 'gpt-4o',
      cost: '0.001',
      processingTime: 1500,
      timestamp: new Date().toISOString()
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
