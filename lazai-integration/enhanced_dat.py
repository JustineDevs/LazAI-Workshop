#!/usr/bin/env python3
"""
Enhanced LazAI/Alith Data Upload with DataStreamDAT Integration
This script demonstrates the complete workflow:
1. Upload encrypted data to IPFS using LazAI/Alith
2. Mint a Data Anchoring Token (DAT) on the blockchain
3. Integrate with DataStreamNFT platform
"""

import os
import sys
import json
import time
from dotenv import load_dotenv
from contract_integration import DataStreamDATIntegration

# Load environment variables
load_dotenv()

def upload_data_to_lazai(data: str, description: str = "DataStreamNFT Integration") -> dict:
    """
    Upload data to LazAI/Alith and get file ID
    
    Args:
        data: Data to upload
        description: Description of the data
        
    Returns:
        Dictionary with upload results
    """
    print("🔐 Uploading data to LazAI/Alith...")
    
    try:
        # Import alith after environment check
        from alith import AlithClient
        
        private_key = os.getenv('PRIVATE_KEY')
        ipfs_jwt = os.getenv('IPFS_JWT')
        
        if not private_key or not ipfs_jwt:
            raise ValueError("Missing required environment variables")
        
        # Initialize Alith client
        client = AlithClient(
            private_key=private_key,
            ipfs_jwt=ipfs_jwt
        )
        
        # Upload encrypted data to IPFS
        file_id = client.upload_data(
            data=data,
            data_type="text",
            description=description
        )
        
        print(f"✅ Data uploaded successfully!")
        print(f"📄 File ID: {file_id}")
        
        return {
            'success': True,
            'file_id': file_id,
            'description': description
        }
        
    except ImportError:
        print("❌ Error: Alith package not found")
        print("Please install alith: pip install alith -U")
        return {'success': False, 'error': 'Alith not installed'}
    except Exception as e:
        print(f"❌ Error uploading data: {str(e)}")
        return {'success': False, 'error': str(e)}

def create_metadata(file_id: str, data_class: str, data_value: str, 
                   description: str, creator: str) -> dict:
    """
    Create metadata for the DAT
    
    Args:
        file_id: LazAI file ID
        data_class: Data classification
        data_value: Data value assessment
        description: Data description
        creator: Creator address
        
    Returns:
        Metadata dictionary
    """
    metadata = {
        "name": f"DataStreamDAT #{file_id}",
        "description": description,
        "image": "https://ipfs.io/ipfs/QmDataStreamNFTImage",  # Placeholder
        "attributes": [
            {
                "trait_type": "File ID",
                "value": file_id
            },
            {
                "trait_type": "Data Class",
                "value": data_class
            },
            {
                "trait_type": "Data Value",
                "value": data_value
            },
            {
                "trait_type": "Creator",
                "value": creator
            },
            {
                "trait_type": "Created At",
                "value": int(time.time())
            },
            {
                "trait_type": "Platform",
                "value": "DataStreamNFT"
            }
        ],
        "external_url": f"https://datastreamnft.com/dat/{file_id}",
        "background_color": "000000",
        "animation_url": None
    }
    
    return metadata

def upload_metadata_to_ipfs(metadata: dict) -> str:
    """
    Upload metadata to IPFS and return URI
    
    Args:
        metadata: Metadata dictionary
        
    Returns:
        IPFS URI
    """
    print("📄 Uploading metadata to IPFS...")
    
    try:
        from alith import AlithClient
        
        private_key = os.getenv('PRIVATE_KEY')
        ipfs_jwt = os.getenv('IPFS_JWT')
        
        client = AlithClient(
            private_key=private_key,
            ipfs_jwt=ipfs_jwt
        )
        
        # Convert metadata to JSON string
        metadata_json = json.dumps(metadata, indent=2)
        
        # Upload metadata to IPFS
        metadata_uri = client.upload_data(
            data=metadata_json,
            data_type="json",
            description="DataStreamDAT Metadata"
        )
        
        print(f"✅ Metadata uploaded to IPFS: {metadata_uri}")
        return metadata_uri
        
    except Exception as e:
        print(f"❌ Error uploading metadata: {str(e)}")
        # Return a placeholder URI
        return f"https://ipfs.io/ipfs/QmMetadata{int(time.time())}"

def main():
    """Main function for enhanced data upload and DAT minting"""
    print("🚀 Starting Enhanced LazAI Data Upload and DAT Minting...")
    print("=" * 60)
    
    # Check environment variables
    required_vars = ['PRIVATE_KEY', 'IPFS_JWT', 'DAT_CONTRACT_ADDRESS']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Error: Missing required environment variables: {', '.join(missing_vars)}")
        print("Please check your .env file")
        sys.exit(1)
    
    print("✅ Environment variables loaded successfully")
    
    # Get user input
    print("\n📝 Please provide the following information:")
    
    data = input("Enter your data to upload: ").strip()
    if not data:
        print("❌ Error: Data cannot be empty")
        sys.exit(1)
    
    description = input("Enter description (optional): ").strip() or "DataStreamNFT Integration Sample"
    
    print("\n🏷️  Data Classification:")
    print("1. model - AI model data")
    print("2. reference - Reference data")
    print("3. asset - Asset data")
    print("4. other - Other type")
    
    class_choice = input("Choose data class (1-4): ").strip()
    class_map = {
        '1': 'model',
        '2': 'reference', 
        '3': 'asset',
        '4': 'other'
    }
    data_class = class_map.get(class_choice, 'other')
    
    print("\n💰 Data Value Assessment:")
    print("1. low - Low value data")
    print("2. medium - Medium value data")
    print("3. high - High value data")
    
    value_choice = input("Choose data value (1-3): ").strip()
    value_map = {
        '1': 'low',
        '2': 'medium',
        '3': 'high'
    }
    data_value = value_map.get(value_choice, 'medium')
    
    query_price = input("Enter query price in ETH (e.g., 0.001): ").strip()
    try:
        query_price_eth = float(query_price)
        query_price_wei = int(query_price_eth * 10**18)
    except ValueError:
        print("❌ Error: Invalid query price")
        sys.exit(1)
    
    print(f"\n📊 Summary:")
    print(f"Data: {data[:50]}{'...' if len(data) > 50 else ''}")
    print(f"Description: {description}")
    print(f"Data Class: {data_class}")
    print(f"Data Value: {data_value}")
    print(f"Query Price: {query_price} ETH")
    
    confirm = input("\nProceed with upload and minting? (y/N): ").strip().lower()
    if confirm != 'y':
        print("❌ Operation cancelled")
        sys.exit(0)
    
    try:
        # Step 1: Upload data to LazAI/Alith
        print("\n" + "=" * 60)
        print("STEP 1: Uploading data to LazAI/Alith")
        print("=" * 60)
        
        upload_result = upload_data_to_lazai(data, description)
        if not upload_result['success']:
            print(f"❌ Data upload failed: {upload_result['error']}")
            sys.exit(1)
        
        file_id = upload_result['file_id']
        
        # Step 2: Create metadata
        print("\n" + "=" * 60)
        print("STEP 2: Creating metadata")
        print("=" * 60)
        
        # Initialize contract integration to get creator address
        contract_integration = DataStreamDATIntegration()
        creator_address = contract_integration.account_address
        
        metadata = create_metadata(
            file_id=file_id,
            data_class=data_class,
            data_value=data_value,
            description=description,
            creator=creator_address
        )
        
        # Step 3: Upload metadata to IPFS
        print("\n" + "=" * 60)
        print("STEP 3: Uploading metadata to IPFS")
        print("=" * 60)
        
        token_uri = upload_metadata_to_ipfs(metadata)
        
        # Step 4: Mint DAT on blockchain
        print("\n" + "=" * 60)
        print("STEP 4: Minting Data Anchoring Token (DAT)")
        print("=" * 60)
        
        mint_result = contract_integration.mint_dat(
            token_uri=token_uri,
            query_price_wei=query_price_wei,
            file_id=file_id,
            data_class=data_class,
            data_value=data_value
        )
        
        if not mint_result['success']:
            print(f"❌ DAT minting failed: {mint_result['error']}")
            sys.exit(1)
        
        # Step 5: Save results
        print("\n" + "=" * 60)
        print("STEP 5: Saving results")
        print("=" * 60)
        
        results = {
            'file_id': file_id,
            'token_id': mint_result['token_id'],
            'token_uri': token_uri,
            'data_class': data_class,
            'data_value': data_value,
            'query_price_eth': query_price_eth,
            'query_price_wei': query_price_wei,
            'creator': creator_address,
            'contract_address': contract_integration.contract_address,
            'transaction_hash': mint_result['transaction_hash'],
            'block_number': mint_result['block_number'],
            'created_at': int(time.time())
        }
        
        # Save to file
        with open('dat_results.json', 'w') as f:
            json.dump(results, f, indent=2)
        
        # Save file ID for inference
        with open('file_id.txt', 'w') as f:
            f.write(file_id)
        
        print("✅ Results saved to 'dat_results.json'")
        print("✅ File ID saved to 'file_id.txt'")
        
        # Final summary
        print("\n" + "=" * 60)
        print("🎉 ENHANCED DATA UPLOAD AND DAT MINTING COMPLETED!")
        print("=" * 60)
        print(f"📄 File ID: {file_id}")
        print(f"🪙 Token ID: {mint_result['token_id']}")
        print(f"🔗 Token URI: {token_uri}")
        print(f"🏷️  Data Class: {data_class}")
        print(f"💰 Data Value: {data_value}")
        print(f"💵 Query Price: {query_price} ETH")
        print(f"👤 Creator: {creator_address}")
        print(f"📤 Transaction: {mint_result['transaction_hash']}")
        print(f"🔗 Block Explorer: https://testnet-explorer.lazai.network/tx/{mint_result['transaction_hash']}")
        
        print("\n📋 Next Steps:")
        print("1. Use 'python inference.py' to query your data")
        print("2. View your DAT on the DataStreamNFT marketplace")
        print("3. Monitor query activity and earnings")
        print("4. Update data class/value as needed")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
