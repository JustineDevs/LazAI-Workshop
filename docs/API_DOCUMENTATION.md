# DataStreamNFT API Documentation

Complete API reference for DataStreamNFT platform.

## Base URL

```
http://localhost:3001/api/v1
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Upload endpoints**: 5 requests per hour
- **Auth endpoints**: 5 attempts per 15 minutes

## Response Format

All responses follow this format:

```json
{
  "success": true|false,
  "data": {}, // Present on success
  "error": "Error message", // Present on error
  "message": "Additional info"
}
```

## Blockchain API

### Get Network Information

```http
GET /blockchain/network
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "LazAI Testnet",
    "chainId": 133718,
    "blockNumber": 9781971,
    "gasPrice": "3.000000007",
    "maxFeePerGas": "3.000000007"
  }
}
```

### Get Balance

```http
GET /blockchain/balance/{address}
```

**Parameters:**
- `address` (string): Ethereum address

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "0x1868C3935B5A548C90d5660981FB866160382Da7",
    "balance": "1.234567890123456789",
    "formatted": "1.2346 LAZAI"
  }
}
```

### Get Contract Information

```http
GET /blockchain/contract/{address}
```

**Parameters:**
- `address` (string): Contract address

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "0x1868C3935B5A548C90d5660981FB866160382Da7",
    "name": "DataStreamNFT",
    "symbol": "DAT",
    "platformTreasury": "0xbadF2152017e26518140d7C8827BD83e2cA79f15",
    "platformFeeBps": "250"
  }
}
```

## Data Stream API

### Create Data Stream

```http
POST /datastreams
```

**Body:**
```json
{
  "title": "My Dataset",
  "description": "Description of the data",
  "category": "research",
  "queryPrice": "1000000000000000000",
  "metadata": {
    "source": "research",
    "quality": "high"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "title": "My Dataset",
    "creator": "0x1868C3935B5A548C90d5660981FB866160382Da7",
    "tokenId": 1,
    "queryPrice": "1000000000000000000",
    "status": "active",
    "createdAt": "2025-01-27T10:30:00Z"
  }
}
```

### Get Data Stream

```http
GET /datastreams/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "title": "My Dataset",
    "description": "Description of the data",
    "creator": "0x1868C3935B5A548C90d5660981FB866160382Da7",
    "tokenId": 1,
    "queryPrice": "1000000000000000000",
    "totalQueries": 42,
    "totalEarned": "42000000000000000000",
    "status": "active",
    "createdAt": "2025-01-27T10:30:00Z"
  }
}
```

### Query Data Stream

```http
POST /datastreams/{id}/query
```

**Body:**
```json
{
  "query": "What insights can you provide about this data?",
  "querierAddress": "0x1868C3935B5A548C90d5660981FB866160382Da7"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "queryId": "query_123456",
    "query": "What insights can you provide about this data?",
    "response": "Based on the data analysis...",
    "cost": "1000000000000000000",
    "transactionHash": "0x1234567890abcdef..."
  }
}
```

## LazAI API

### Upload Encrypted Data

```http
POST /lazai/upload-encrypted-data
```

**Content-Type:** `multipart/form-data`

**Body:**
- `file`: File to upload

**Response:**
```json
{
  "success": true,
  "data": {
    "fileId": "file_abc123",
    "ipfsHash": "QmHash123456789",
    "size": 1024,
    "type": "text/plain"
  }
}
```

### Mint Data Anchoring Token

```http
POST /lazai/mint-dat
```

**Body:**
```json
{
  "fileId": "file_abc123",
  "dataClass": "model",
  "dataValue": "high",
  "queryPrice": "1000000000000000000",
  "creatorAddress": "0x1868C3935B5A548C90d5660981FB866160382Da7"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tokenId": 1,
    "fileId": "file_abc123",
    "transactionHash": "0x1234567890abcdef...",
    "datAddress": "0x3A9F22DEddF83E5A49df9A9c946E4b0840ecd877"
  }
}
```

### Run AI Inference

```http
POST /lazai/run-inference
```

**Body:**
```json
{
  "fileId": "file_abc123",
  "query": "Analyze this data and provide insights",
  "querierAddress": "0x1868C3935B5A548C90d5660981FB866160382Da7",
  "paymentAmount": "1000000000000000000"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "queryId": "inference_123456",
    "query": "Analyze this data and provide insights",
    "response": "Based on the analysis...",
    "cost": "1000000000000000000",
    "transactionHash": "0x1234567890abcdef..."
  }
}
```

## User API

### Register User

```http
POST /users/register
```

**Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "address": "0x1868C3935B5A548C90d5660981FB866160382Da7",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "address": "0x1868C3935B5A548C90d5660981FB866160382Da7",
      "createdAt": "2025-01-27T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login User

```http
POST /users/login
```

**Body:**
```json
{
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "address": "0x1868C3935B5A548C90d5660981FB866160382Da7"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get User Profile

```http
GET /users/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "address": "0x1868C3935B5A548C90d5660981FB866160382Da7",
      "createdAt": "2025-01-27T10:30:00Z",
      "updatedAt": "2025-01-27T10:30:00Z"
    }
  }
}
```

## IPFS API

### Upload File

```http
POST /ipfs/upload
```

**Content-Type:** `multipart/form-data`

**Body:**
- `file`: File to upload

**Response:**
```json
{
  "success": true,
  "data": {
    "hash": "QmHash123456789",
    "size": 1024,
    "type": "text/plain",
    "url": "https://gateway.pinata.cloud/ipfs/QmHash123456789"
  }
}
```

### Upload JSON

```http
POST /ipfs/upload-json
```

**Body:**
```json
{
  "name": "My Data",
  "description": "Description",
  "data": {
    "key": "value"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hash": "QmHash123456789",
    "url": "https://gateway.pinata.cloud/ipfs/QmHash123456789"
  }
}
```

## Monitoring API

### Health Check

```http
GET /monitoring/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "excellent",
    "message": "Performance is excellent",
    "timestamp": "2025-01-27T10:30:00Z",
    "services": {
      "database": "connected",
      "blockchain": "connected",
      "api": "running"
    },
    "performance": {
      "responseTime": 150,
      "totalRequests": 1000,
      "cacheHitRate": "85%"
    },
    "memory": {
      "used": "45 MB",
      "total": "128 MB",
      "external": "12 MB"
    },
    "uptime": "3600 seconds"
  }
}
```

### Get Metrics

```http
GET /monitoring/metrics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "performance": {
      "response_time": {
        "count": 1000,
        "average": 150,
        "min": 50,
        "max": 500,
        "sum": 150000
      }
    },
    "cache": {
      "hits": 850,
      "misses": 150,
      "hitRate": "85%",
      "keys": 42
    }
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## SDK Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
  headers: {
    'Authorization': 'Bearer your-token-here'
  }
});

// Get network info
const networkInfo = await api.get('/blockchain/network');

// Create data stream
const dataStream = await api.post('/datastreams', {
  title: 'My Dataset',
  description: 'Description',
  category: 'research',
  queryPrice: '1000000000000000000'
});

// Query data stream
const result = await api.post(`/datastreams/${dataStream.data.id}/query`, {
  query: 'What insights can you provide?',
  querierAddress: '0x1868C3935B5A548C90d5660981FB866160382Da7'
});
```

### Python

```python
import requests

API_BASE = 'http://localhost:3001/api/v1'
HEADERS = {'Authorization': 'Bearer your-token-here'}

# Get network info
response = requests.get(f'{API_BASE}/blockchain/network')
network_info = response.json()

# Create data stream
data_stream = requests.post(f'{API_BASE}/datastreams', json={
    'title': 'My Dataset',
    'description': 'Description',
    'category': 'research',
    'queryPrice': '1000000000000000000'
}, headers=HEADERS)

# Query data stream
result = requests.post(f'{API_BASE}/datastreams/{data_stream.json()["data"]["id"]}/query', json={
    'query': 'What insights can you provide?',
    'querierAddress': '0x1868C3935B5A548C90d5660981FB866160382Da7'
}, headers=HEADERS)
```

## Webhooks

### Event Types

- `datastream.created` - New data stream created
- `datastream.queried` - Data stream queried
- `datastream.updated` - Data stream updated
- `user.registered` - New user registered
- `payment.completed` - Payment completed

### Webhook Payload

```json
{
  "event": "datastream.queried",
  "timestamp": "2025-01-27T10:30:00Z",
  "data": {
    "datastreamId": "507f1f77bcf86cd799439011",
    "querierAddress": "0x1868C3935B5A548C90d5660981FB866160382Da7",
    "query": "What insights can you provide?",
    "cost": "1000000000000000000",
    "transactionHash": "0x1234567890abcdef..."
  }
}
```

---

For more information, visit our [GitHub repository](https://github.com/yourusername/DataStreamNFT) or contact support@datastreamnft.com.
