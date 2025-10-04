# LazAI/Alith Data Upload and Inference Integration

This project demonstrates how to upload encrypted data to IPFS using LazAI/Alith framework and then use the uploaded data for AI inference. This integration extends the DataStreamNFT platform with LazAI's data anchoring capabilities.

## Prerequisites

- Python 3.8 or higher
- A LazAI wallet with private key
- Pinata IPFS JWT token
- Testnet tokens for gas fees (get from https://t.me/lazai_testnet_bot)

## Setup Instructions

### 1. Python Environment Setup

First, create and activate a Python virtual environment:

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### 2. Install Dependencies

Install the Alith framework and required dependencies:

```bash
# Install dependencies
pip install -r requirements.txt

# Install alith (if not already installed)
python3 -m pip install alith -U
```

### 3. Environment Configuration

Set up your environment variables for authentication:

```bash
# Copy the example environment file
cp env.example .env

# Edit .env with your actual credentials
# Export your LazAI private key
export PRIVATE_KEY="your_lazai_private_key_here"

# Export your Pinata IPFS JWT token
export IPFS_JWT="your_pinata_jwt_token_here"
```

**Note:** Replace `your_lazai_private_key_here` and `your_pinata_jwt_token_here` with your actual credentials.

### 4. Run Data Upload (Dat.py)

Execute the data upload script to encrypt and upload your privacy data to IPFS and mint DAT:

```bash
python Dat.py
```

This script will:
- Encrypt your privacy data using your wallet signature
- Upload the encrypted data to IPFS via Pinata
- Register the file with LazAI
- Mint a Data Anchoring Token (DAT)
- Print the File ID which you'll need for inference

**Expected Output:**
```
File ID: [some_number]
```

**Important:** Save the File ID that is printed - you'll need it for the next step.

### 5. Run Inference (inference.py)

Use the File ID from the previous step to run inference on your uploaded data:

```bash
python inference.py
```

The script will:
- Load the File ID from `file_id.txt`
- Prompt you for a query
- Run AI inference on your encrypted data
- Display the results and metadata

## Integration with DataStreamNFT

This LazAI integration works alongside the DataStreamNFT platform:

1. **Data Upload**: Use `Dat.py` to upload and encrypt your data
2. **DAT Minting**: The script automatically mints a Data Anchoring Token
3. **NFT Creation**: Use the DataStreamNFT frontend to create an NFT with the IPFS hash
4. **Query System**: Users can query your data through the DataStreamNFT marketplace
5. **Revenue Sharing**: Query fees are distributed to data contributors via the DAT system

## Troubleshooting

### Common Issues

**Environment Variables Not Set**
- Make sure you've exported both `PRIVATE_KEY` and `IPFS_JWT`
- You can verify by running: `echo $PRIVATE_KEY` and `echo $IPFS_JWT`

**Virtual Environment Not Activated**
- Ensure your virtual environment is activated (you should see `(venv)` in your terminal prompt)
- If not activated, run: `source venv/bin/activate`

**Getting Your Credentials**

**LazAI Private Key:**
- This is your wallet's private key from your EVM wallet
- Keep this secure and never share it

**Pinata IPFS JWT Token:**
- Sign up at [Pinata](https://app.pinata.cloud)
- Go to your API keys section
- Create a new JWT token
- Copy the token and use it as your `IPFS_JWT`

## Project Structure

```
lazai-integration/
├── venv/                    # Python virtual environment
├── Dat.py                   # Data upload script
├── inference.py             # Inference script
├── requirements.txt         # Python dependencies
├── env.example              # Environment variables template
├── README.md                # This file
└── file_id.txt              # Generated file ID (after running Dat.py)
```

## Features

- **Encrypted Data Storage**: Your data is encrypted before upload to IPFS
- **Data Anchoring Tokens**: Automatic DAT minting for data contribution tracking
- **AI Inference**: Query your encrypted data using AI models
- **Revenue Distribution**: Query fees are distributed to data contributors
- **Privacy Protection**: Data remains encrypted and only accessible through authorized queries
- **Blockchain Integration**: Full integration with LazAI blockchain infrastructure

## Next Steps

1. **DataStreamNFT Integration**: Connect the uploaded data with DataStreamNFT marketplace
2. **Frontend Integration**: Add LazAI upload functionality to the React frontend
3. **Backend Integration**: Update the Node.js backend to handle DAT operations
4. **Production Deployment**: Deploy the integrated system to production

## Support

For questions and support:
- Join the LazAI Discord: [Discord Link]
- Check the LazAI documentation: [Documentation Link]
- Follow LazAI on Twitter: [@LazAI](https://twitter.com/lazai)
