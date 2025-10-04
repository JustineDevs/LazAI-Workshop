#!/usr/bin/env python3
"""
DataStreamDAT Contract Integration
This module provides Python integration with the DataStreamDAT smart contract
for seamless LazAI data upload and DAT minting workflow.
"""

import os
import json
import time
from typing import Dict, Any, Optional
from web3 import Web3
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class DataStreamDATIntegration:
    """Integration class for DataStreamDAT smart contract"""
    
    def __init__(self, rpc_url: str = None, contract_address: str = None, private_key: str = None):
        """
        Initialize the DataStreamDAT integration
        
        Args:
            rpc_url: LazAI RPC URL (defaults to testnet)
            contract_address: DataStreamDAT contract address
            private_key: Wallet private key
        """
        self.rpc_url = rpc_url or os.getenv('LAZAI_RPC_URL', 'https://testnet.lazai.network')
        self.contract_address = contract_address or os.getenv('DAT_CONTRACT_ADDRESS')
        self.private_key = private_key or os.getenv('PRIVATE_KEY')
        
        if not self.contract_address:
            raise ValueError("Contract address not provided")
        if not self.private_key:
            raise ValueError("Private key not provided")
        
        # Initialize Web3
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        if not self.w3.is_connected():
            raise ConnectionError("Failed to connect to LazAI network")
        
        # Load contract ABI
        self.contract_abi = self._load_contract_abi()
        
        # Initialize contract
        self.contract = self.w3.eth.contract(
            address=self.contract_address,
            abi=self.contract_abi
        )
        
        # Get account
        self.account = self.w3.eth.account.from_key(self.private_key)
        self.account_address = self.account.address
        
        print(f"✅ Connected to LazAI network: {self.rpc_url}")
        print(f"📄 Contract address: {self.contract_address}")
        print(f"👤 Account: {self.account_address}")
    
    def _load_contract_abi(self) -> list:
        """Load contract ABI from file"""
        try:
            # Try to load from deployments directory
            abi_path = os.path.join(os.path.dirname(__file__), '..', 'deployments', 'DataStreamDAT-abi.json')
            if os.path.exists(abi_path):
                with open(abi_path, 'r') as f:
                    return json.load(f)
            
            # Fallback to hardcoded ABI (simplified version)
            return self._get_simplified_abi()
        except Exception as e:
            print(f"⚠️  Warning: Could not load contract ABI: {e}")
            return self._get_simplified_abi()
    
    def _get_simplified_abi(self) -> list:
        """Get simplified ABI for basic functionality"""
        return [
            {
                "inputs": [
                    {"name": "tokenURI", "type": "string"},
                    {"name": "queryPriceInWei", "type": "uint256"},
                    {"name": "fileId", "type": "string"},
                    {"name": "dataClass", "type": "string"},
                    {"name": "dataValue", "type": "string"}
                ],
                "name": "mintDataDAT",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"name": "tokenId", "type": "uint256"},
                    {"name": "query", "type": "string"}
                ],
                "name": "payForQuery",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "inputs": [{"name": "tokenId", "type": "uint256"}],
                "name": "getDATStats",
                "outputs": [
                    {"name": "totalQueries", "type": "uint256"},
                    {"name": "totalEarned", "type": "uint256"},
                    {"name": "isActive", "type": "bool"}
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"name": "fileId", "type": "string"}],
                "name": "fileIdExists",
                "outputs": [{"name": "", "type": "bool"}],
                "stateMutability": "view",
                "type": "function"
            }
        ]
    
    def mint_dat(self, token_uri: str, query_price_wei: int, file_id: str, 
                 data_class: str, data_value: str) -> Dict[str, Any]:
        """
        Mint a new Data Anchoring Token (DAT)
        
        Args:
            token_uri: IPFS URI containing metadata
            query_price_wei: Price per query in wei
            file_id: LazAI file ID for encrypted data
            data_class: Classification of the data
            data_value: Value assessment of the data
            
        Returns:
            Dictionary containing transaction details and token ID
        """
        try:
            print(f"🪙 Minting DAT for file ID: {file_id}")
            
            # Check if file ID already exists
            if self.contract.functions.fileIdExists(file_id).call():
                raise ValueError(f"File ID {file_id} already exists")
            
            # Build transaction
            transaction = self.contract.functions.mintDataDAT(
                token_uri,
                query_price_wei,
                file_id,
                data_class,
                data_value
            ).build_transaction({
                'from': self.account_address,
                'gas': 500000,
                'gasPrice': self.w3.eth.gas_price,
                'nonce': self.w3.eth.get_transaction_count(self.account_address)
            })
            
            # Sign and send transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            print(f"📤 Transaction sent: {tx_hash.hex()}")
            
            # Wait for transaction receipt
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            if receipt.status == 1:
                # Extract token ID from logs (simplified - in real implementation, parse events)
                token_id = receipt.blockNumber  # Simplified approach
                
                print(f"✅ DAT minted successfully!")
                print(f"🪙 Token ID: {token_id}")
                print(f"📄 File ID: {file_id}")
                print(f"🏷️  Data Class: {data_class}")
                print(f"💰 Data Value: {data_value}")
                
                return {
                    'success': True,
                    'token_id': token_id,
                    'file_id': file_id,
                    'transaction_hash': tx_hash.hex(),
                    'block_number': receipt.blockNumber,
                    'gas_used': receipt.gasUsed
                }
            else:
                raise Exception("Transaction failed")
                
        except Exception as e:
            print(f"❌ Error minting DAT: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def pay_for_query(self, token_id: int, query: str, payment_wei: int) -> Dict[str, Any]:
        """
        Pay for a query on a specific DAT
        
        Args:
            token_id: ID of the DAT to query
            query: The query string
            payment_wei: Payment amount in wei
            
        Returns:
            Dictionary containing transaction details
        """
        try:
            print(f"💳 Paying for query on token {token_id}")
            print(f"📝 Query: {query}")
            print(f"💰 Payment: {payment_wei} wei")
            
            # Build transaction
            transaction = self.contract.functions.payForQuery(
                token_id,
                query
            ).build_transaction({
                'from': self.account_address,
                'value': payment_wei,
                'gas': 200000,
                'gasPrice': self.w3.eth.gas_price,
                'nonce': self.w3.eth.get_transaction_count(self.account_address)
            })
            
            # Sign and send transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            print(f"📤 Transaction sent: {tx_hash.hex()}")
            
            # Wait for transaction receipt
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            if receipt.status == 1:
                print(f"✅ Query payment successful!")
                
                return {
                    'success': True,
                    'transaction_hash': tx_hash.hex(),
                    'block_number': receipt.blockNumber,
                    'gas_used': receipt.gasUsed
                }
            else:
                raise Exception("Transaction failed")
                
        except Exception as e:
            print(f"❌ Error paying for query: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_dat_stats(self, token_id: int) -> Dict[str, Any]:
        """
        Get statistics for a specific DAT
        
        Args:
            token_id: ID of the DAT
            
        Returns:
            Dictionary containing DAT statistics
        """
        try:
            stats = self.contract.functions.getDATStats(token_id).call()
            
            return {
                'success': True,
                'token_id': token_id,
                'total_queries': stats[0],
                'total_earned': stats[1],
                'is_active': stats[2]
            }
        except Exception as e:
            print(f"❌ Error getting DAT stats: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_balance(self) -> int:
        """Get account balance in wei"""
        return self.w3.eth.get_balance(self.account_address)
    
    def get_balance_eth(self) -> float:
        """Get account balance in ETH"""
        balance_wei = self.get_balance()
        return self.w3.from_wei(balance_wei, 'ether')

def main():
    """Example usage of DataStreamDAT integration"""
    try:
        # Initialize integration
        integration = DataStreamDATIntegration()
        
        # Check balance
        balance = integration.get_balance_eth()
        print(f"💰 Account balance: {balance} ETH")
        
        if balance < 0.001:
            print("⚠️  Warning: Low balance, may not be able to perform transactions")
        
        # Example: Mint a DAT
        token_uri = "https://ipfs.io/ipfs/QmExample123"
        query_price_wei = 1000000000000000  # 0.001 ETH
        file_id = "lazai_file_12345"
        data_class = "reference"
        data_value = "high"
        
        print("\n🪙 Example: Minting DAT...")
        result = integration.mint_dat(
            token_uri=token_uri,
            query_price_wei=query_price_wei,
            file_id=file_id,
            data_class=data_class,
            data_value=data_value
        )
        
        if result['success']:
            print(f"✅ DAT minted with token ID: {result['token_id']}")
            
            # Example: Pay for query
            print("\n💳 Example: Paying for query...")
            query_result = integration.pay_for_query(
                token_id=result['token_id'],
                query="What is the data about?",
                payment_wei=query_price_wei
            )
            
            if query_result['success']:
                print("✅ Query payment successful!")
            
            # Get stats
            print("\n📊 Example: Getting DAT stats...")
            stats = integration.get_dat_stats(result['token_id'])
            if stats['success']:
                print(f"📈 Total queries: {stats['total_queries']}")
                print(f"💰 Total earned: {stats['total_earned']} wei")
                print(f"🟢 Active: {stats['is_active']}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    main()
