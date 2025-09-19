import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWeb3 } from '../contexts/Web3Context';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const LazAIPage = () => {
  const { account, isConnected, switchToLazAINetwork } = useWeb3();
  const [activeTab, setActiveTab] = useState('upload');
  const [loading, setLoading] = useState(false);
  
  // Upload form state
  const [uploadData, setUploadData] = useState({
    data: '',
    description: '',
    dataClass: 'reference',
    dataValue: 'medium',
    queryPrice: '0.001'
  });
  
  // Inference form state
  const [inferenceData, setInferenceData] = useState({
    fileId: '',
    query: ''
  });
  
  // Results state
  const [uploadResult, setUploadResult] = useState(null);
  const [inferenceResult, setInferenceResult] = useState(null);

  useEffect(() => {
    // Load saved file ID if exists
    const savedFileId = localStorage.getItem('lazai_file_id');
    if (savedFileId) {
      setInferenceData(prev => ({ ...prev, fileId: savedFileId }));
    }
  }, []);

  const handleUpload = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!uploadData.data.trim()) {
      toast.error('Please enter data to upload');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call to backend
      const response = await fetch('/api/lazai/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...uploadData,
          creator: account
        })
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setUploadResult(result);
      
      // Save file ID for inference
      localStorage.setItem('lazai_file_id', result.fileId);
      setInferenceData(prev => ({ ...prev, fileId: result.fileId }));
      
      toast.success('Data uploaded and DAT minted successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInference = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!inferenceData.fileId.trim() || !inferenceData.query.trim()) {
      toast.error('Please enter file ID and query');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call to backend
      const response = await fetch('/api/lazai/inference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...inferenceData,
          querier: account
        })
      });

      if (!response.ok) {
        throw new Error('Inference failed');
      }

      const result = await response.json();
      setInferenceResult(result);
      
      toast.success('Inference completed successfully!');
    } catch (error) {
      console.error('Inference error:', error);
      toast.error('Inference failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'upload', label: 'Upload Data', icon: '📤' },
    { id: 'inference', label: 'Run Inference', icon: '🤖' },
    { id: 'results', label: 'View Results', icon: '📊' }
  ];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🔗</div>
          <h1 className="text-4xl font-bold text-white mb-4">Connect Your Wallet</h1>
          <p className="text-xl text-gray-300 mb-8">
            Connect your wallet to access LazAI data upload and inference features
          </p>
          <Button onClick={switchToLazAINetwork} size="lg">
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            LazAI Integration
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Upload encrypted data to IPFS, mint Data Anchoring Tokens (DATs), 
            and run AI inference queries on your data
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 rounded-lg p-1 flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-4xl mx-auto"
        >
          {activeTab === 'upload' && (
            <div className="bg-gray-800 rounded-xl p-8">
              <h2 className="text-3xl font-bold text-white mb-6">Upload Data & Mint DAT</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data to Upload
                  </label>
                  <textarea
                    value={uploadData.data}
                    onChange={(e) => setUploadData(prev => ({ ...prev, data: e.target.value }))}
                    placeholder="Enter your data here (will be encrypted before upload)..."
                    className="w-full h-32 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={uploadData.description}
                    onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of your data..."
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Data Class
                    </label>
                    <select
                      value={uploadData.dataClass}
                      onChange={(e) => setUploadData(prev => ({ ...prev, dataClass: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="model">Model</option>
                      <option value="reference">Reference</option>
                      <option value="asset">Asset</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Data Value
                    </label>
                    <select
                      value={uploadData.dataValue}
                      onChange={(e) => setUploadData(prev => ({ ...prev, dataValue: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Query Price (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={uploadData.queryPrice}
                    onChange={(e) => setUploadData(prev => ({ ...prev, queryPrice: e.target.value }))}
                    placeholder="0.001"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={loading}
                  size="lg"
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Uploading & Minting DAT...
                    </>
                  ) : (
                    'Upload Data & Mint DAT'
                  )}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'inference' && (
            <div className="bg-gray-800 rounded-xl p-8">
              <h2 className="text-3xl font-bold text-white mb-6">Run AI Inference</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    File ID
                  </label>
                  <input
                    type="text"
                    value={inferenceData.fileId}
                    onChange={(e) => setInferenceData(prev => ({ ...prev, fileId: e.target.value }))}
                    placeholder="Enter the File ID from your uploaded data..."
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    This should be automatically filled if you just uploaded data
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Query
                  </label>
                  <textarea
                    value={inferenceData.query}
                    onChange={(e) => setInferenceData(prev => ({ ...prev, query: e.target.value }))}
                    placeholder="What would you like to know about the data?"
                    className="w-full h-24 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <Button
                  onClick={handleInference}
                  disabled={loading}
                  size="lg"
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Running Inference...
                    </>
                  ) : (
                    'Run AI Inference'
                  )}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-6">
              {/* Upload Results */}
              {uploadResult && (
                <div className="bg-gray-800 rounded-xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-4">Upload Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400">File ID:</span>
                      <p className="text-white font-mono">{uploadResult.fileId}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Token ID:</span>
                      <p className="text-white font-mono">{uploadResult.tokenId}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Data Class:</span>
                      <p className="text-white">{uploadResult.dataClass}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Data Value:</span>
                      <p className="text-white">{uploadResult.dataValue}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Query Price:</span>
                      <p className="text-white">{uploadResult.queryPrice} ETH</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Transaction Hash:</span>
                      <a
                        href={`https://testnet-explorer.lazai.network/tx/${uploadResult.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 underline"
                      >
                        View on Explorer
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Inference Results */}
              {inferenceResult && (
                <div className="bg-gray-800 rounded-xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-4">Inference Results</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-gray-400">Query:</span>
                      <p className="text-white">{inferenceResult.query}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Response:</span>
                      <div className="bg-gray-700 rounded-lg p-4 mt-2">
                        <p className="text-white whitespace-pre-wrap">{inferenceResult.response}</p>
                      </div>
                    </div>
                    {inferenceResult.metadata && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <span className="text-gray-400">Query Fee:</span>
                          <p className="text-white">{inferenceResult.metadata.queryFee}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Processing Time:</span>
                          <p className="text-white">{inferenceResult.metadata.processingTime}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Data Source:</span>
                          <p className="text-white">{inferenceResult.metadata.dataSource}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!uploadResult && !inferenceResult && (
                <div className="bg-gray-800 rounded-xl p-8 text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Results Yet</h3>
                  <p className="text-gray-400">
                    Upload some data or run inference to see results here
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LazAIPage;
