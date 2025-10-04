# DataStreamNFT Deployment Guide

Complete guide for deploying DataStreamNFT to production.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 8+
- MongoDB 6+
- PM2 (Process Manager)
- Nginx (Reverse Proxy)
- SSL Certificate
- Domain name

### 1. Server Setup

#### Ubuntu/Debian

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

#### CentOS/RHEL

```bash
# Update system
sudo yum update -y

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install MongoDB
sudo yum install -y mongodb-org

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo yum install nginx -y
```

### 2. Application Deployment

```bash
# Clone repository
git clone https://github.com/yourusername/DataStreamNFT.git
cd DataStreamNFT

# Install dependencies
npm install
cd fe && npm install && cd ..

# Build application
npm run build

# Set up environment
cp .env.example .env
# Edit .env with production values
```

### 3. Database Setup

```bash
# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database user
mongo
use datastreamnft
db.createUser({
  user: "datastreamnft",
  pwd: "secure_password",
  roles: ["readWrite"]
})
exit
```

### 4. Process Management

```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'datastreamnft-api',
    script: 'src/api/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. Reverse Proxy Setup

```bash
# Create Nginx configuration
sudo cat > /etc/nginx/sites-available/datastreamnft << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # API Backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Frontend
    location / {
        root /path/to/DataStreamNFT/fe/out;
        try_files \$uri \$uri.html \$uri/index.html /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/datastreamnft /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 SSL Certificate Setup

### Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Custom Certificate

```bash
# Upload certificate files
sudo cp your-certificate.crt /etc/ssl/certs/
sudo cp your-private.key /etc/ssl/private/
sudo chmod 600 /etc/ssl/private/your-private.key
```

## 🗄️ Database Configuration

### MongoDB Production Setup

```bash
# Create MongoDB configuration
sudo cat > /etc/mongod.conf << EOF
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  bindIp: 127.0.0.1

security:
  authorization: enabled

replication:
  replSetName: "rs0"
EOF

# Restart MongoDB
sudo systemctl restart mongod
```

### Database Backup

```bash
# Create backup script
cat > backup-db.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
mkdir -p \$BACKUP_DIR

mongodump --host localhost:27017 --db datastreamnft --out \$BACKUP_DIR/datastreamnft_\$DATE

# Keep only last 7 days of backups
find \$BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
EOF

chmod +x backup-db.sh

# Schedule daily backups
crontab -e
# Add: 0 2 * * * /path/to/backup-db.sh
```

## 📊 Monitoring Setup

### Application Monitoring

```bash
# Install monitoring tools
npm install -g pm2-logrotate
pm2 install pm2-server-monit

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

### System Monitoring

```bash
# Install htop for system monitoring
sudo apt install htop -y

# Install iotop for I/O monitoring
sudo apt install iotop -y

# Install nethogs for network monitoring
sudo apt install nethogs -y
```

### Log Management

```bash
# Create log directory
mkdir -p /var/log/datastreamnft

# Configure logrotate
sudo cat > /etc/logrotate.d/datastreamnft << EOF
/var/log/datastreamnft/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

## 🔧 Environment Configuration

### Production Environment Variables

```bash
# .env.production
NODE_ENV=production
PORT=3001

# Database
MONGODB_URI=mongodb://datastreamnft:secure_password@localhost:27017/datastreamnft
MONGODB_DATABASE=datastreamnft

# Blockchain
LAZAI_RPC_URL=https://mainnet.lazai.network
LAZAI_CHAIN_ID=133718
PRIVATE_KEY=your_private_key_here
DATASTREAM_NFT_CONTRACT_ADDRESS=0x...
DAT_CONTRACT_ADDRESS=0x...

# IPFS
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
IPFS_JWT=your_ipfs_jwt_token

# Security
JWT_SECRET=your_very_secure_jwt_secret
JWT_EXPIRES_IN=7d

# Server
CORS_ORIGIN=https://your-domain.com
LOG_LEVEL=info

# Monitoring
REDIS_URL=redis://localhost:6379
SENTRY_DSN=your_sentry_dsn
```

## 🚀 Deployment Scripts

### Automated Deployment

```bash
# Create deployment script
cat > deploy.sh << EOF
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Pull latest changes
git pull origin main

# Install dependencies
npm install
cd fe && npm install && cd ..

# Run tests
npm test

# Build application
npm run build

# Restart services
pm2 restart datastreamnft-api

# Check status
pm2 status

echo "✅ Deployment completed!"
EOF

chmod +x deploy.sh
```

### Health Check Script

```bash
# Create health check script
cat > health-check.sh << EOF
#!/bin/bash

# Check API health
curl -f http://localhost:3001/api/v1/monitoring/health || exit 1

# Check database
mongosh --eval "db.runCommand('ping')" || exit 1

# Check PM2 processes
pm2 status | grep -q "online" || exit 1

echo "✅ All systems healthy"
EOF

chmod +x health-check.sh
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        npm install
        cd fe && npm install
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /path/to/DataStreamNFT
          git pull origin main
          npm install
          cd fe && npm install && cd ..
          npm run build
          pm2 restart datastreamnft-api
```

## 🛡️ Security Hardening

### Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### System Hardening

```bash
# Disable root login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# Install fail2ban
sudo apt install fail2ban -y

# Configure fail2ban
sudo cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
EOF

sudo systemctl restart fail2ban
```

## 📈 Performance Optimization

### Nginx Optimization

```bash
# Optimize Nginx configuration
sudo cat >> /etc/nginx/nginx.conf << EOF
worker_processes auto;
worker_connections 1024;

http {
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    client_max_body_size 100M;
    client_body_timeout 60s;
    client_header_timeout 60s;
    
    keepalive_timeout 65;
    keepalive_requests 100;
}
EOF
```

### Node.js Optimization

```bash
# Set Node.js production optimizations
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=4096"
export UV_THREADPOOL_SIZE=128
```

## 🔍 Troubleshooting

### Common Issues

**Application won't start**
```bash
# Check logs
pm2 logs datastreamnft-api

# Check status
pm2 status

# Restart application
pm2 restart datastreamnft-api
```

**Database connection issues**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Test connection
mongosh --eval "db.runCommand('ping')"
```

**Nginx issues**
```bash
# Test configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log

# Reload configuration
sudo systemctl reload nginx
```

### Performance Issues

**High CPU usage**
```bash
# Check processes
htop

# Check PM2 processes
pm2 monit

# Scale application
pm2 scale datastreamnft-api 4
```

**High memory usage**
```bash
# Check memory usage
free -h

# Check Node.js memory
pm2 show datastreamnft-api

# Restart if needed
pm2 restart datastreamnft-api
```

## 📞 Support

- **Documentation**: Check this guide and other docs
- **Issues**: Report on GitHub
- **Email**: support@datastreamnft.com
- **Discord**: Join our community server

---

**Your DataStreamNFT platform is now ready for production!** 🚀
