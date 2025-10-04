'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import EnhancedDataUploader from '@/components/EnhancedDataUploader';
import EnhancedQueryInterface from '@/components/EnhancedQueryInterface';
import DashboardPage from '@/components/pages/DashboardPage';
import OnboardingFlow from '@/components/OnboardingFlow';
import CommunityFeatures from '@/components/CommunityFeatures';

interface UserToken {
  tokenId: string;
  totalQueries: string;
  totalVolume: string;
  isActive: boolean;
  dataClass: string;
  dataValue: string;
}

export default function HomePage() {
  const { account, isConnected, connectWallet } = useWeb3();
  const [activeTab, setActiveTab] = useState<'home' | 'upload' | 'query' | 'dashboard' | 'community'>('home');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<string>('');
  const [userTokens, setUserTokens] = useState<UserToken[]>([]);

  const fetchUserTokens = useCallback(async () => {
    if (!account) return;
    
    try {
      const response = await fetch(`/api/analytics/creator/${account}`);
      const data = await response.json();
      if (data.success) {
        setUserTokens(data.data.tokenAnalytics || []);
      }
    } catch (error) {
      console.error('Failed to fetch user tokens:', error);
    }
  }, [account]);

  useEffect(() => {
    if (isConnected && account) {
      fetchUserTokens();
    }
  }, [isConnected, account, fetchUserTokens]);

  const handleUploadComplete = (result: { tokenId: string; transactionHash: string }) => {
    console.log('Upload complete:', result);
    fetchUserTokens(); // Refresh token list
  };

  const handleQueryComplete = (result: { success: boolean; result?: string; error?: string }) => {
    console.log('Query complete:', result);
  };

  const handleError = (error: string) => {
    console.error('Error:', error);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🚀</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to DataStreamNFT
              </h1>
              <p className="text-gray-600 mb-6">
                Transform your data into a revenue stream with AI-powered queries and blockchain-based micropayments.
              </p>
              <Button onClick={connectWallet} size="lg" className="w-full">
                Connect Wallet to Get Started
              </Button>
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl mb-2">🔒</div>
                  <div className="text-sm text-gray-600">Secure</div>
                </div>
                <div>
                  <div className="text-2xl mb-2">💰</div>
                  <div className="text-sm text-gray-600">Profitable</div>
                </div>
                <div>
                  <div className="text-2xl mb-2">🤖</div>
                  <div className="text-sm text-gray-600">AI-Powered</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">DataStreamNFT</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowOnboarding(true)}
                variant="outline"
                size="sm"
              >
                Tutorial
              </Button>
              <Button
                onClick={() => setShowCommunity(true)}
                variant="outline"
                size="sm"
              >
                Community
              </Button>
              <div className="text-sm text-gray-600">
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'home', label: 'Home', icon: '🏠' },
              { id: 'upload', label: 'Upload Data', icon: '📁' },
              { id: 'query', label: 'Query Data', icon: '🤖' },
              { id: 'dashboard', label: 'Dashboard', icon: '📊' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'home' | 'upload' | 'query' | 'dashboard' | 'community')}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && (
          <HomeTab 
            userTokens={userTokens} 
            onSelectToken={setSelectedTokenId}
            onNavigateToUpload={() => setActiveTab('upload')}
            onNavigateToQuery={() => setActiveTab('query')}
          />
        )}
        {activeTab === 'upload' && <EnhancedDataUploader onUploadComplete={handleUploadComplete} onError={handleError} />}
        {activeTab === 'query' && <QueryTab selectedTokenId={selectedTokenId} onQueryComplete={handleQueryComplete} onError={handleError} />}
        {activeTab === 'dashboard' && <DashboardPage />}
      </main>
      
      {/* Modals */}
      {showOnboarding && (
        <OnboardingFlow
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onComplete={() => setShowOnboarding(false)}
        />
      )}

      {showCommunity && (
        <CommunityFeatures
          isOpen={showCommunity}
          onClose={() => setShowCommunity(false)}
        />
      )}
    </div>
  );
}

// Home Tab Component
function HomeTab({ userTokens, onSelectToken, onNavigateToUpload, onNavigateToQuery }: { 
  userTokens: UserToken[]; 
  onSelectToken: (tokenId: string) => void;
  onNavigateToUpload: () => void;
  onNavigateToQuery: () => void;
}) {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Your Data Monetization Hub
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Upload your data, set pricing, and start earning from AI queries. Your data is encrypted and secure, 
          and you maintain full control and ownership.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{userTokens.length}</div>
            <div className="text-sm text-gray-600">Your Data Tokens</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {userTokens.reduce((sum, token) => sum + parseInt(token.totalQueries), 0)}
            </div>
            <div className="text-sm text-gray-600">Total Queries</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {userTokens.reduce((sum, token) => sum + parseFloat(token.totalVolume), 0).toFixed(4)} ETH
            </div>
            <div className="text-sm text-gray-600">Total Earnings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {userTokens.filter(token => token.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Active Tokens</div>
          </CardContent>
        </Card>
      </div>

      {/* Your Data Tokens */}
      <Card>
        <CardHeader>
          <CardTitle>Your Data Tokens</CardTitle>
          <CardDescription>Manage and monitor your data assets</CardDescription>
        </CardHeader>
        <CardContent>
          {userTokens.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📁</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Tokens Yet</h3>
              <p className="text-gray-600 mb-4">Upload your first dataset to start earning from AI queries.</p>
              <Button onClick={onNavigateToUpload}>
                Upload Your First Dataset
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userTokens.map((token) => (
                <Card key={token.tokenId} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4" onClick={() => onSelectToken(token.tokenId)}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">Token #{token.tokenId}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        token.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {token.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {token.dataClass} • {token.dataValue} value
                    </div>
                    <div className="text-sm text-gray-500">
                      {token.totalQueries} queries • {token.totalVolume} ETH earned
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📁</span>
              <span>Upload New Data</span>
            </CardTitle>
            <CardDescription>
              Securely upload and encrypt your data to start earning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={onNavigateToUpload}
              className="w-full"
            >
              Start Uploading
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🤖</span>
              <span>Query Data</span>
            </CardTitle>
            <CardDescription>
              Ask questions about available datasets using AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={onNavigateToQuery}
              variant="outline"
              className="w-full"
            >
              Start Querying
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Query Tab Component
function QueryTab({ selectedTokenId, onQueryComplete, onError }: {
  selectedTokenId: string;
  onQueryComplete: (result: { success: boolean; result?: string; error?: string }) => void;
  onError: (error: string) => void;
}) {
  const [tokenId, setTokenId] = useState(selectedTokenId);

  useEffect(() => {
    setTokenId(selectedTokenId);
  }, [selectedTokenId]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Query Data with AI</CardTitle>
          <CardDescription>
            Select a data token and ask questions using various AI providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Token ID
            </label>
            <input
              type="text"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="Enter token ID to query"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {tokenId && (
        <EnhancedQueryInterface
          tokenId={tokenId}
          onQueryComplete={onQueryComplete}
          onError={onError}
        />
      )}
    </div>
  );
}