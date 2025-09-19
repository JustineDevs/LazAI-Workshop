import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';
import ContractService from '../services/contractService';
import toast from 'react-hot-toast';

const CreatePage = () => {
    const { isConnected, account, switchToLazAINetwork, chainId, getContract } = useWeb3();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dataFile: null,
        queryPrice: '0.01'
    });
    const [isUploading, setIsUploading] = useState(false);
    const [isMinting, setIsMinting] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                dataFile: file
            }));
            setUploadedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!formData.dataFile) {
            toast.error('Please select a file to upload');
            return;
        }

        setIsUploading(true);
        try {
            // In a real implementation, you would upload to IPFS here
            // For now, we'll simulate the upload
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const mockIpfsHash = `Qm${Math.random().toString(36).substring(2, 15)}`;
            setUploadedFile({
                ...formData.dataFile,
                ipfsHash: mockIpfsHash
            });
            
            toast.success('File uploaded to IPFS successfully');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload file');
        } finally {
            setIsUploading(false);
        }
    };

    const handleMint = async () => {
        if (!isConnected) {
            toast.error('Please connect your wallet first');
            return;
        }

        if (chainId !== 133718) {
            toast.error('Please switch to LazAI Testnet');
            await switchToLazAINetwork();
            return;
        }

        if (!uploadedFile || !uploadedFile.ipfsHash) {
            toast.error('Please upload a file first');
            return;
        }

        setIsMinting(true);
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

            const tokenURI = `ipfs://${uploadedFile.ipfsHash}`;
            const queryPriceInWei = ethers.parseEther(formData.queryPrice);

            const result = await contractService.mintDataNFT(tokenURI, queryPriceInWei);
            
            toast.success(`Data NFT minted successfully! Token ID: ${result.tokenId}`);
            
            // Reset form
            setFormData({
                title: '',
                description: '',
                dataFile: null,
                queryPrice: '0.01'
            });
            setUploadedFile(null);
            
        } catch (error) {
            console.error('Mint error:', error);
            toast.error(`Failed to mint NFT: ${error.message}`);
        } finally {
            setIsMinting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container-custom section-padding">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Create DataStream NFT
                        </h1>
                        <p className="text-xl text-gray-600">
                            Upload your data and mint it as a queryable NFT on LazAI Testnet
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-8">
                        {!isConnected ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🔗</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Connect Your Wallet
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Please connect your wallet to create a DataStream NFT
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Connect Wallet
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Network Check */}
                                {chainId !== 133718 && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <div className="text-yellow-600 mr-3">⚠️</div>
                                            <div>
                                                <p className="text-yellow-800 font-medium">
                                                    Wrong Network
                                                </p>
                                                <p className="text-yellow-700 text-sm">
                                                    Please switch to LazAI Testnet to create NFTs
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

                                {/* Form */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter data title"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Query Price (LAZAI)
                                        </label>
                                        <input
                                            type="number"
                                            name="queryPrice"
                                            value={formData.queryPrice}
                                            onChange={handleInputChange}
                                            step="0.001"
                                            min="0.001"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="0.01"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Describe your data..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Data File
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="file-upload"
                                            accept=".csv,.json,.txt,.xlsx"
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className="cursor-pointer"
                                        >
                                            <div className="text-4xl mb-2">📁</div>
                                            <p className="text-gray-600">
                                                {formData.dataFile ? formData.dataFile.name : 'Click to select file'}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Supports CSV, JSON, TXT, XLSX files
                                            </p>
                                        </label>
                                    </div>
                                </div>

                                {/* Upload Status */}
                                {uploadedFile && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <div className="text-green-600 mr-3">✅</div>
                                            <div>
                                                <p className="text-green-800 font-medium">
                                                    File Uploaded Successfully
                                                </p>
                                                <p className="text-green-700 text-sm">
                                                    IPFS Hash: {uploadedFile.ipfsHash}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex space-x-4">
                                    {!uploadedFile ? (
                                        <button
                                            onClick={handleUpload}
                                            disabled={!formData.dataFile || isUploading}
                                            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {isUploading ? 'Uploading...' : 'Upload to IPFS'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleMint}
                                            disabled={isMinting}
                                            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {isMinting ? 'Minting NFT...' : 'Mint Data NFT'}
                                        </button>
                                    )}
                                </div>

                                {/* Wallet Info */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-2">Wallet Information</h4>
                                    <p className="text-sm text-gray-600">
                                        <strong>Address:</strong> {account}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <strong>Network:</strong> {chainId === 133718 ? 'LazAI Testnet' : 'Unknown'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default CreatePage;
