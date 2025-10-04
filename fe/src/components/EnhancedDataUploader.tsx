'use client';

import React, { useState, useRef } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface EnhancedDataUploaderProps {
  onUploadComplete?: (result: { tokenId: string; transactionHash: string }) => void;
  onError?: (error: string) => void;
}

export default function EnhancedDataUploader({ onUploadComplete, onError }: EnhancedDataUploaderProps) {
  const { account, isConnected, signMessage } = useWeb3();
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    dataClass: 'dataset',
    dataValue: 'medium',
    queryPrice: '0.005'
  });
  const [loading, setLoading] = useState(false);
  const [uploadStep, setUploadStep] = useState<'select' | 'metadata' | 'encrypt' | 'upload' | 'mint' | 'complete'>('select');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadStep('metadata');
    }
  };

  const handleMetadataChange = (field: string, value: string) => {
    setMetadata(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignMessage = async () => {
    if (!isConnected || !account) {
      onError?.('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setUploadStep('encrypt');
      
      const message = `DataStreamNFT Upload: ${file?.name} - ${metadata.title} (${Date.now()})`;
      await signMessage(message);
      
      // Simulate encryption progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setUploadStep('upload');
      await handleUpload();
    } catch (error) {
      console.error('Signature failed:', error);
      onError?.('Failed to sign message. Please try again.');
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file || !account) return;

    try {
      setLoading(true);
      setProgress(0);

      // Simulate upload process
      setUploadStep('mint');
      setProgress(75);

      // Simulate minting
      await new Promise(resolve => setTimeout(resolve, 2000));
      setProgress(100);

      setUploadStep('complete');
      onUploadComplete?.({
        tokenId: '123',
        transactionHash: '0xabc123...'
      });

    } catch (error) {
      console.error('Upload error:', error);
      onError?.(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setMetadata({
      title: '',
      description: '',
      dataClass: 'dataset',
      dataValue: 'medium',
      queryPrice: '0.005'
    });
    setUploadStep('select');
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Wallet Required</h3>
            <p className="text-gray-600">Please connect your wallet to upload data securely.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      {uploadStep !== 'select' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {uploadStep === 'metadata' && 'Enter Metadata'}
                {uploadStep === 'encrypt' && 'Encrypting Data'}
                {uploadStep === 'upload' && 'Uploading to IPFS'}
                {uploadStep === 'mint' && 'Minting NFT'}
                {uploadStep === 'complete' && 'Complete!'}
              </span>
              <span className="text-sm text-gray-500">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: File Selection */}
      {uploadStep === 'select' && (
        <Card>
          <CardHeader>
            <CardTitle>Select Your Data File</CardTitle>
            <CardDescription>
              Choose a file to upload. It will be encrypted before storage.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="*/*"
              />
              <div className="text-gray-400 text-4xl mb-4">📁</div>
              <p className="text-gray-600 mb-4">Drag and drop your file here</p>
              <Button onClick={() => fileInputRef.current?.click()}>
                Choose File
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Supports all file types • Max 100MB • Encrypted storage
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Metadata */}
      {uploadStep === 'metadata' && (
        <Card>
          <CardHeader>
            <CardTitle>Data Information</CardTitle>
            <CardDescription>
              Provide details about your data for better discoverability.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => handleMetadataChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter a descriptive title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={metadata.description}
                onChange={(e) => handleMetadataChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe your data and its value"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Class
                </label>
                <select
                  value={metadata.dataClass}
                  onChange={(e) => handleMetadataChange('dataClass', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="dataset">Dataset</option>
                  <option value="model">AI Model</option>
                  <option value="reference">Reference Data</option>
                  <option value="asset">Digital Asset</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Value
                </label>
                <select
                  value={metadata.dataValue}
                  onChange={(e) => handleMetadataChange('dataValue', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low Value</option>
                  <option value="medium">Medium Value</option>
                  <option value="high">High Value</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Query Price (ETH) *
              </label>
              <input
                type="number"
                step="0.001"
                value={metadata.queryPrice}
                onChange={(e) => handleMetadataChange('queryPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.005"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Recommended: 0.001 - 0.01 ETH per query
              </p>
            </div>

            <div className="flex space-x-4">
              <Button onClick={() => setUploadStep('select')} variant="outline">
                Back
              </Button>
              <Button
                onClick={handleSignMessage}
                disabled={!metadata.title || !metadata.description}
              >
                {loading && <LoadingSpinner size="sm" className="mr-2" />}
                Sign & Encrypt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Encryption */}
      {uploadStep === 'encrypt' && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-blue-600 text-4xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Encrypting Your Data</h3>
            <p className="text-gray-600 mb-4">
              Your data is being encrypted with your wallet signature for maximum security.
            </p>
            <LoadingSpinner size="lg" />
          </CardContent>
        </Card>
      )}

      {/* Step 4: Upload */}
      {uploadStep === 'upload' && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-green-600 text-4xl mb-4">☁️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Uploading to IPFS</h3>
            <p className="text-gray-600 mb-4">
              Your encrypted data is being uploaded to decentralized storage.
            </p>
            <LoadingSpinner size="lg" />
          </CardContent>
        </Card>
      )}

      {/* Step 5: Minting */}
      {uploadStep === 'mint' && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-purple-600 text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Minting Data NFT</h3>
            <p className="text-gray-600 mb-4">
              Creating your Data Anchoring Token on the blockchain.
            </p>
            <LoadingSpinner size="lg" />
          </CardContent>
        </Card>
      )}

      {/* Step 6: Complete */}
      {uploadStep === 'complete' && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-green-600 text-4xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Complete!</h3>
            <p className="text-gray-600 mb-4">
              Your data has been encrypted, uploaded, and minted as an NFT. It&apos;s now ready to earn from AI queries.
            </p>
            <div className="space-y-2">
              <Button onClick={resetUpload} variant="outline">
                Upload Another File
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}