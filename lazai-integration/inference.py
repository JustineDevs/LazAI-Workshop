#!/usr/bin/env python3
"""
LazAI/Alith Data Upload and Inference - Inference Script
This script demonstrates how to run AI inference on uploaded data using the File ID
from the data upload process.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def main():
    """Main function to run inference on uploaded data"""
    print("🤖 Starting LazAI Inference Process...")
    
    # Check if file_id.txt exists
    if not os.path.exists('file_id.txt'):
        print("❌ Error: file_id.txt not found")
        print("Please run Dat.py first to upload data and get a File ID")
        sys.exit(1)
    
    # Read file ID
    with open('file_id.txt', 'r') as f:
        file_id = f.read().strip()
    
    print(f"📄 Using File ID: {file_id}")
    
    # Check environment variables
    private_key = os.getenv('PRIVATE_KEY')
    ipfs_jwt = os.getenv('IPFS_JWT')
    
    if not private_key:
        print("❌ Error: PRIVATE_KEY not found in environment variables")
        sys.exit(1)
    
    if not ipfs_jwt:
        print("❌ Error: IPFS_JWT not found in environment variables")
        sys.exit(1)
    
    print("✅ Environment variables loaded successfully")
    
    # Get query from user
    print("\n💬 Enter your query for the uploaded data:")
    query = input("Query: ").strip()
    
    if not query:
        print("❌ Error: Query cannot be empty")
        sys.exit(1)
    
    try:
        # Import alith after environment check
        from alith import LazAIClient
        
        print("📦 Initializing LazAI client...")
        client = LazAIClient(
            private_key=private_key
        )
        
        print("🔍 Running inference query...")
        print(f"📝 Query: {query}")
        print(f"📄 File ID: {file_id}")
        
        # For demonstration purposes, we'll simulate the inference
        # In a real implementation, this would call the actual LazAI inference API
        print("ℹ️  Note: In production, this would call the actual LazAI inference API")
        
        # Simulate inference result
        result = {
            'response': f"Simulated AI response for query '{query}' on file {file_id}. This is a demonstration of how the LazAI integration would work.",
            'metadata': {
                'query_fee': '0.001 ETH',
                'processing_time': '2.5s',
                'data_source': f'File ID: {file_id}',
                'model': 'gpt-3.5-turbo'
            }
        }
        
        print("\n🎯 Inference Result:")
        print("=" * 50)
        print(result.get('response', 'No response received'))
        print("=" * 50)
        
        # Display additional metadata
        if 'metadata' in result:
            print(f"\n📊 Query Metadata:")
            print(f"💰 Query Fee: {result['metadata'].get('query_fee', 'N/A')}")
            print(f"⏱️  Processing Time: {result['metadata'].get('processing_time', 'N/A')}")
            print(f"🔗 Data Source: {result['metadata'].get('data_source', 'N/A')}")
        
        print("\n✅ Inference completed successfully!")
        
    except ImportError:
        print("❌ Error: Alith package not found")
        print("Please install alith: pip install alith -U")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error during inference: {str(e)}")
        print("Please check your credentials and network connection")
        sys.exit(1)

if __name__ == "__main__":
    main()
