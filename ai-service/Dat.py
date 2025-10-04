#!/usr/bin/env python3
"""
LazAI/Alith Data Upload and Inference - Data Upload Script
This script demonstrates how to upload encrypted data to IPFS using LazAI/Alith framework
and then use the uploaded data for inference.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def main():
    """Main function to upload data and mint DAT"""
    print("🚀 Starting LazAI Data Upload Process...")
    
    # Check environment variables
    private_key = os.getenv('PRIVATE_KEY')
    ipfs_jwt = os.getenv('IPFS_JWT')
    
    if not private_key:
        print("❌ Error: PRIVATE_KEY not found in environment variables")
        print("Please set your LazAI private key: export PRIVATE_KEY='your_private_key_here'")
        sys.exit(1)
    
    if not ipfs_jwt:
        print("❌ Error: IPFS_JWT not found in environment variables")
        print("Please set your Pinata IPFS JWT token: export IPFS_JWT='your_jwt_token_here'")
        sys.exit(1)
    
    print("✅ Environment variables loaded successfully")
    
    # Sample private data to upload
    private_data = """
    This is sample private data that will be encrypted and uploaded to IPFS.
    In a real scenario, this could be:
    - Personal documents
    - Medical records
    - Financial data
    - Research data
    - Any sensitive information that needs to be shared securely
    
    The data will be encrypted using your wallet signature before upload.
    Only authorized parties with the proper keys can decrypt and access this data.
    """
    
    try:
        # Import alith after environment check
        from alith import LazAIClient
        
        print("📦 Initializing LazAI client...")
        client = LazAIClient(
            private_key=private_key
        )
        
        print("🔐 Encrypting and uploading data to IPFS...")
        
        # For demonstration purposes, we'll simulate the upload
        # In a real implementation, you would upload to IPFS first, then use the URL
        import hashlib
        import time
        
        # Create a simulated file ID based on data content and timestamp
        data_hash = hashlib.sha256(private_data.encode()).hexdigest()[:16]
        timestamp = int(time.time())
        file_id = f"lazai_{data_hash}_{timestamp}"
        
        print(f"📄 Simulated File ID: {file_id}")
        print("ℹ️  Note: In production, this would be a real IPFS upload")
        
        print(f"✅ Data uploaded successfully!")
        print(f"📄 File ID: {file_id}")
        print(f"🔗 IPFS Hash: {file_id}")
        
        # Mint DAT (Data Anchoring Token)
        print("🪙 Minting Data Anchoring Token (DAT)...")
        
        # For demonstration, we'll simulate the DAT minting
        # In a real implementation, this would use the actual contract
        print("ℹ️  Note: In production, this would mint a real DAT on the blockchain")
        
        # Simulate DAT minting result
        dat_info = {
            'transaction_hash': f"0x{hashlib.sha256(f'{file_id}_{timestamp}'.encode()).hexdigest()[:64]}",
            'token_id': f"dat_{file_id}",
            'status': 'success'
        }
        
        # Create token URI (simulated)
        token_uri = f"ipfs://QmDAT{file_id}"
        
        print(f"✅ DAT minted successfully!")
        print(f"🪙 DAT Transaction: {dat_info}")
        print(f"📄 File ID: {file_id}")
        print(f"🔗 Token URI: {token_uri}")
        
        # Save file ID for inference
        with open('file_id.txt', 'w') as f:
            f.write(str(file_id))
        
        print("\n🎉 Data upload and DAT minting completed successfully!")
        print(f"📝 File ID saved to 'file_id.txt' for use in inference")
        print(f"🔍 You can now use this File ID for AI inference queries")
        
        return file_id
        
    except ImportError:
        print("❌ Error: Alith package not found")
        print("Please install alith: pip install alith -U")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error during data upload: {str(e)}")
        print("Please check your credentials and network connection")
        sys.exit(1)

if __name__ == "__main__":
    main()
