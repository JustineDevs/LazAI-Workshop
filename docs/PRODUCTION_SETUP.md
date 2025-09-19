# Production Setup Guide

This guide covers the essential steps to deploy and configure DataStreamNFT for production use.

## 🚀 **Deployment Checklist**

### 1. **Smart Contract Deployment**

#### Prerequisites
- [ ] LazAI Mainnet access
- [ ] Sufficient LAZAI tokens for gas fees
- [ ] Secure wallet with private key
- [ ] Contract verification setup

#### Deployment Steps
```bash
# 1. Update environment variables
cp .env.example .env
# Edit .env with production values

# 2. Deploy to LazAI Mainnet
npx hardhat run scripts/deploy-lazai.js --network lazchain

# 3. Verify contract (if supported)
npx hardhat verify --network lazchain <CONTRACT_ADDRESS> <PLATFORM_TREASURY>
```

### 2. **Platform Treasury Configuration**

#### Treasury Address Setup
```javascript
// Recommended: Use a multi-sig wallet for platform treasury
const platformTreasury = "0x..."; // Multi-sig wallet address

// Deploy with treasury
const dataStreamNFT = await DataStreamNFT.deploy(platformTreasury);
```

#### Treasury Management
- **Multi-sig Required**: Use a 3-of-5 or 4-of-7 multi-sig wallet
- **Backup Keys**: Store private keys in secure, separate locations
- **Regular Monitoring**: Monitor treasury balance and transactions
- **Fee Collection**: Platform fees (2.5%) are automatically sent to treasury

### 3. **Environment Configuration**

#### Production .env
```bash
# Network Configuration
LAZCHAIN_RPC_URL=https://mainnet.lazai.network
LAZCHAIN_CHAIN_ID=133718
CONTRACT_ADDRESS=0x... # Deployed contract address

# Security
PRIVATE_KEY=0x... # Deployer private key (keep secure)
JWT_SECRET=... # Strong, random secret

# Database
MONGODB_URI=mongodb://... # Production MongoDB
MONGODB_DATABASE=datastreamnft_prod

# IPFS
PINATA_API_KEY=... # Production Pinata API key
PINATA_SECRET_KEY=... # Production Pinata secret

# Server
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://yourdomain.com

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=... # Error tracking
```

### 4. **Frontend Configuration**

#### Production Build
```bash
cd frontend
npm run build
```

#### Environment Variables
```bash
# frontend/.env.production
REACT_APP_CONTRACT_ADDRESS=0x...
REACT_APP_NETWORK_NAME=LazAI Mainnet
REACT_APP_RPC_URL=https://mainnet.lazai.network
REACT_APP_EXPLORER_URL=https://explorer.lazai.network
```

### 5. **Backend Configuration**

#### Server Setup
```bash
# Install PM2 for process management
npm install -g pm2

# Start production server
pm2 start src/api/server.js --name datastreamnft-api

# Setup auto-restart
pm2 startup
pm2 save
```

#### Database Setup
```bash
# MongoDB production setup
# 1. Create production database
# 2. Setup user authentication
# 3. Configure backup strategy
# 4. Setup monitoring
```

### 6. **Security Configuration**

#### Smart Contract Security
- [ ] **Audit**: Get professional security audit
- [ ] **Bug Bounty**: Consider bug bounty program
- [ ] **Upgrade Path**: Plan for contract upgrades if needed
- [ ] **Access Control**: Review owner permissions

#### Infrastructure Security
- [ ] **HTTPS**: Enable SSL/TLS certificates
- [ ] **Firewall**: Configure proper firewall rules
- [ ] **DDoS Protection**: Setup DDoS mitigation
- [ ] **Monitoring**: Implement security monitoring

### 7. **Monitoring and Analytics**

#### Contract Monitoring
```javascript
// Monitor key events
contract.on('DataNFTMinted', (tokenId, creator, uri, queryPrice) => {
    // Log to monitoring system
});

contract.on('QueryPaid', (tokenId, payer, amount) => {
    // Track revenue
});
```

#### Application Monitoring
- **Uptime**: Monitor API and frontend availability
- **Performance**: Track response times and throughput
- **Errors**: Monitor and alert on errors
- **Usage**: Track user activity and revenue

### 8. **Backup and Recovery**

#### Database Backups
```bash
# Daily MongoDB backups
mongodump --uri="mongodb://..." --out=/backups/$(date +%Y%m%d)
```

#### Contract State
- **Event Indexing**: Use The Graph or similar for event indexing
- **State Snapshots**: Regular state snapshots for recovery
- **Transaction History**: Maintain transaction logs

### 9. **Scaling Considerations**

#### Horizontal Scaling
- **Load Balancer**: Setup load balancer for API
- **Database Replicas**: Read replicas for database
- **CDN**: Content delivery network for frontend

#### Performance Optimization
- **Caching**: Redis for API response caching
- **Database Indexing**: Optimize database queries
- **Image Optimization**: Optimize IPFS content

### 10. **Compliance and Legal**

#### Data Protection
- **GDPR**: Ensure GDPR compliance for EU users
- **Data Retention**: Implement data retention policies
- **Privacy Policy**: Clear privacy policy for users

#### Financial Compliance
- **KYC/AML**: Consider KYC requirements
- **Tax Reporting**: Track transactions for tax purposes
- **Regulatory**: Stay updated on crypto regulations

## 🔧 **Production Scripts**

### Deploy Script
```bash
#!/bin/bash
# deploy.sh

echo "🚀 Starting production deployment..."

# 1. Build frontend
cd frontend && npm run build && cd ..

# 2. Deploy contract
npx hardhat run scripts/deploy-lazai.js --network lazchain

# 3. Update environment
# (Manual step - update .env with new contract address)

# 4. Deploy backend
pm2 restart datastreamnft-api

# 5. Deploy frontend
# (Deploy to your hosting service)

echo "✅ Production deployment complete!"
```

### Health Check Script
```bash
#!/bin/bash
# health-check.sh

# Check API health
curl -f http://localhost:3001/api/v1/health || exit 1

# Check contract connectivity
npx hardhat run scripts/check-contract.js --network lazchain || exit 1

# Check database
mongosh --eval "db.runCommand('ping')" || exit 1

echo "✅ All systems healthy"
```

## 📊 **Monitoring Dashboard**

### Key Metrics to Track
1. **Contract Metrics**
   - Total NFTs minted
   - Total queries executed
   - Platform revenue
   - Gas usage

2. **API Metrics**
   - Request rate
   - Response time
   - Error rate
   - Active users

3. **Business Metrics**
   - User registrations
   - NFT creation rate
   - Query success rate
   - Revenue growth

## 🚨 **Emergency Procedures**

### Contract Issues
1. **Pause Contract**: If critical bug found
2. **Upgrade Contract**: Deploy new version
3. **Migrate Data**: Move to new contract if needed

### Infrastructure Issues
1. **Failover**: Switch to backup servers
2. **Database Recovery**: Restore from backup
3. **Service Restart**: Restart affected services

## 📞 **Support and Maintenance**

### Regular Maintenance
- **Weekly**: Review logs and metrics
- **Monthly**: Security updates and patches
- **Quarterly**: Performance optimization
- **Annually**: Security audit

### Support Channels
- **Documentation**: Keep docs updated
- **User Support**: Provide user support channels
- **Developer Support**: Support for API users

---

## ✅ **Production Readiness Checklist**

- [ ] Smart contract deployed and verified
- [ ] Platform treasury configured (multi-sig)
- [ ] Environment variables configured
- [ ] Database setup and secured
- [ ] Frontend built and deployed
- [ ] Backend deployed with PM2
- [ ] SSL certificates installed
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Support channels established

**🎉 Congratulations! Your DataStreamNFT platform is ready for production!**
