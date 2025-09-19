import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';
import ContractService from '../services/contractService';
import toast from 'react-hot-toast';

const MarketplacePage = () => {
    const { isConnected, account, switchToLazAINetwork, chainId, getContract } = useWeb3();
    const [dataNFTs, setDataNFTs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [querying, setQuerying] = useState({});

    // Mock data for demonstration
    const mockDataNFTs = [
        {
            tokenId: '1',
            creator: '0x1234...5678',
            queryPrice: '0.01',
            totalQueries: '5',
            totalEarned: '0.05',
            tokenURI: 'ipfs://QmExample1',
            title: 'Sales Data 2023',
            description: 'Comprehensive sales data for Q1-Q4 2023',
            category: 'Business'
        },
        {
            tokenId: '2',
            creator: '0x9876...5432',
            queryPrice: '0.02',
            totalQueries: '12',
            totalEarned: '0.24',
            tokenURI: 'ipfs://QmExample2',
            title: 'Weather Dataset',
            description: 'Historical weather data for major cities',
            category: 'Environment'
        }
    ];

    useEffect(() => {
        loadDataNFTs();
    }, []);

    const loadDataNFTs = async () => {
        setLoading(true);
        try {
            // In a real implementation, you would fetch from a subgraph or API
            // For now, we'll use mock data
            setDataNFTs(mockDataNFTs);
        } catch (error) {
            console.error('Error loading Data NFTs:', error);
            toast.error('Failed to load Data NFTs');
        } finally {
            setLoading(false);
        }
    };

    const handleQuery = async (tokenId, queryPrice) => {
        if (!isConnected) {
            toast.error('Please connect your wallet first');
            return;
        }

        if (chainId !== 133718) {
            toast.error('Please switch to LazAI Testnet');
            await switchToLazAINetwork();
            return;
        }

        setQuerying(prev => ({ ...prev, [tokenId]: true }));
        
        try {
            const contract = getContract('DataStreamNFT');
            if (!contract) {
                throw new Error('Contract not available');
            }

            const contractService = new ContractService(
                contract.provider,
                contract.signer,
                contract.target
            );

            const result = await contractService.payForQuery(tokenId, queryPrice);
            
            toast.success(`Query executed successfully! Transaction: ${result.transactionHash}`);
            
            // Refresh the NFT data
            await loadDataNFTs();
            
        } catch (error) {
            console.error('Query error:', error);
            toast.error(`Failed to execute query: ${error.message}`);
        } finally {
            setQuerying(prev => ({ ...prev, [tokenId]: false }));
        }
    };

    const formatAddress = (address) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const formatPrice = (price) => {
        return `${parseFloat(price).toFixed(3)} LAZAI`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container-custom section-padding">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            DataStream Marketplace
                        </h1>
                        <p className="text-xl text-gray-600">
                            Discover and query DataStream NFTs on LazAI Testnet
                        </p>
                    </div>

                    {/* Network Check */}
                    {isConnected && chainId !== 133718 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <div className="text-yellow-600 mr-3">⚠️</div>
                                <div>
                                    <p className="text-yellow-800 font-medium">
                                        Wrong Network
                                    </p>
                                    <p className="text-yellow-700 text-sm">
                                        Please switch to LazAI Testnet to interact with Data NFTs
                                    </p>
                                    <button
                                        onClick={switchToLazAINetwork}
                                        className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded text-sm hover:bg-yellow-700"
                                    >
                                        Switch to LazAI Testnet
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="text-2xl font-bold text-blue-600">
                                {dataNFTs.length}
                            </div>
                            <div className="text-gray-600">Total Data NFTs</div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="text-2xl font-bold text-green-600">
                                {dataNFTs.reduce((sum, nft) => sum + parseInt(nft.totalQueries), 0)}
                            </div>
                            <div className="text-gray-600">Total Queries</div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="text-2xl font-bold text-purple-600">
                                {dataNFTs.reduce((sum, nft) => sum + parseFloat(nft.totalEarned), 0).toFixed(3)} LAZAI
                            </div>
                            <div className="text-gray-600">Total Earnings</div>
                        </div>
                    </div>

                    {/* Data NFTs Grid */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading Data NFTs...</p>
                        </div>
                    ) : dataNFTs.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📊</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                No Data NFTs Found
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Be the first to create a DataStream NFT!
                            </p>
                            <button
                                onClick={() => window.location.href = '/create'}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Create Data NFT
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {dataNFTs.map((nft) => (
                                <motion.div
                                    key={nft.tokenId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                {nft.category}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                #{nft.tokenId}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {nft.title}
                                        </h3>

                                        <p className="text-gray-600 text-sm mb-4">
                                            {nft.description}
                                        </p>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Creator:</span>
                                                <span className="font-mono">{formatAddress(nft.creator)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Query Price:</span>
                                                <span className="font-semibold text-green-600">
                                                    {formatPrice(nft.queryPrice)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Total Queries:</span>
                                                <span>{nft.totalQueries}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Total Earned:</span>
                                                <span className="font-semibold text-purple-600">
                                                    {parseFloat(nft.totalEarned).toFixed(3)} LAZAI
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleQuery(nft.tokenId, nft.queryPrice)}
                                                disabled={!isConnected || querying[nft.tokenId]}
                                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {querying[nft.tokenId] ? 'Querying...' : 'Query Data'}
                                            </button>
                                            <button
                                                onClick={() => window.open(`https://testnet-explorer.lazai.network/address/0x1868C3935B5A548C90d5660981FB866160382Da7`, '_blank')}
                                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                View
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Connection Prompt */}
                    {!isConnected && (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🔗</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Connect Your Wallet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Connect your wallet to query Data NFTs
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Connect Wallet
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default MarketplacePage;
