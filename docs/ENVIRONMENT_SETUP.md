# 🔧 DataStreamNFT Environment Setup Guide

## Overview

This guide explains how to set up environment variables for the DataStreamNFT project. The project uses multiple environment files for different components.

## 📁 Environment Files Structure

```
DataStreamNFT/
├── env.example                 # Root environment template
├── fe/
│   ├── env.example            # Frontend environment template
│   └── .env.local            # Frontend environment (create this)
├── be/
│   └── .env                  # Backend environment (create this)
└── ai-service/
    ├── env.example           # AI service environment template
    └── .env                  # AI service environment (create this)
```

## 🚀 Quick Setup

### 1. Root Environment (Backend)

```bash
# Copy the template
cp env.example .env

# Edit with your values
nano .env
```

**Key variables to set:**
- `PRIVATE_KEY` - Your wallet private key for deployment
- `PLATFORM_TREASURY_ADDRESS` - Your wallet address for fee collection
- Contract addresses (after deployment)

### 2. Frontend Environment

```bash
cd fe
cp env.example .env.local

# Edit with your values
nano .env.local
```

**Key variables to set:**
- Contract addresses (after deployment)
- `NEXT_PUBLIC_TEST_MODE=true` for development

### 3. AI Service Environment

```bash
cd ai-service
cp env.example .env

# Edit with your values
nano .env
```

**Key variables to set:**
- `OPENAI_API_KEY` - Get from https://platform.openai.com/api-keys
- `CLAUDE_API_KEY` - Get from https://console.anthropic.com/

## 🔑 Required API Keys

### 1. OpenAI API Key
- **Purpose:** GPT-4o AI model integration
- **Get it:** https://platform.openai.com/api-keys
- **Cost:** Pay-per-use
- **Required for:** AI inference service

### 2. Gemini API Key (RECOMMENDED - FREE TIER)
- **Purpose:** Google Gemini AI model integration (PRIMARY)
- **Get it:** https://aistudio.google.com/app/apikey
- **Cost:** FREE tier available with generous limits
- **Required for:** AI inference service

### 3. Claude API Key (OPTIONAL)
- **Purpose:** Claude AI model integration (alternative)
- **Get it:** https://console.anthropic.com/
- **Cost:** Pay-per-use
- **Required for:** Optional Claude AI support

### 4. Pinata API Keys
- **Purpose:** IPFS file storage
- **Get it:** https://app.pinata.cloud/developers
- **Cost:** Free tier available
- **Required for:** File uploads

### 4. LM Studio (Optional)
- **Purpose:** Local AI model inference
- **Get it:** https://lmstudio.ai/
- **Cost:** Free
- **Required for:** Local AI inference

## 🌐 Network Configuration

### LazAI Testnet (Primary)
```env
RPC_URL=https://testnet.lazai.network
CHAIN_ID=133718
NETWORK_NAME=LazAI Testnet
```

### Local Hardhat (Development)
```env
RPC_URL=http://localhost:8545
CHAIN_ID=31337
NETWORK_NAME=Hardhat Local
```

## 🔒 Security Best Practices

### 1. Never Commit Real Keys
```bash
# Add to .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo "**/.env" >> .gitignore
```

### 2. Use Test Keys for Development
```env
# Development - use test keys
PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000
OPENAI_API_KEY=sk-test-key-for-development
```

### 3. Rotate Keys Regularly
- Change API keys monthly
- Use different keys for different environments
- Monitor API usage and costs

## 🧪 Development vs Production

### Development Environment
```env
# Backend
NODE_ENV=development
TEST_MODE=true
DEBUG=true

# Frontend
NEXT_PUBLIC_TEST_MODE=true
NEXT_PUBLIC_MOCK_AI_RESPONSES=true

# AI Service
AI_SERVICE_DEBUG=true
```

### Production Environment
```env
# Backend
NODE_ENV=production
TEST_MODE=false
DEBUG=false

# Frontend
NEXT_PUBLIC_TEST_MODE=false
NEXT_PUBLIC_MOCK_AI_RESPONSES=false

# AI Service
AI_SERVICE_DEBUG=false
```

## 📋 Environment Checklist

### Before Development
- [ ] Copy all `env.example` files to `.env`
- [ ] Set `TEST_MODE=true` for development
- [ ] Use mock contract addresses (`0x0000...`)
- [ ] Enable mock AI responses
- [ ] Set debug logging to true

### Before Production
- [ ] Deploy smart contracts
- [ ] Update contract addresses in all env files
- [ ] Set `TEST_MODE=false`
- [ ] Use real API keys
- [ ] Disable debug logging
- [ ] Set strong secrets and keys
- [ ] Configure CORS properly
- [ ] Set up monitoring

## 🔧 Troubleshooting

### Common Issues

1. **"Contract not found" errors**
   - Check contract addresses are correct
   - Ensure contracts are deployed
   - Verify network configuration

2. **"API key invalid" errors**
   - Check API key format
   - Verify key is active
   - Check rate limits

3. **"CORS error" in frontend**
   - Check `CORS_ORIGIN` in backend
   - Verify frontend URL matches
   - Check network configuration

4. **"AI service not responding"**
   - Check AI service is running
   - Verify API keys are set
   - Check service logs

### Debug Commands

```bash
# Check environment variables
echo $NODE_ENV
echo $CHAIN_ID

# Test API endpoints
curl http://localhost:3001/api/v1/health
curl http://localhost:5000/health

# Check contract addresses
grep "ADDRESS" .env
```

## 📚 Additional Resources

- [Google Gemini API Documentation](https://ai.google.dev/docs) - **RECOMMENDED (FREE)**
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Claude API Documentation](https://docs.anthropic.com/)
- [Pinata Documentation](https://docs.pinata.cloud/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

## 🎯 Next Steps

1. **Set up development environment** with test keys
2. **Deploy smart contracts** to testnet
3. **Update contract addresses** in all env files
4. **Test all integrations** with real contracts
5. **Configure production environment** with real keys
6. **Deploy to production** with proper security

---

**Remember:** Never commit real API keys or private keys to version control!
