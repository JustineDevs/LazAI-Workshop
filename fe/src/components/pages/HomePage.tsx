'use client'

import { useWeb3 } from '@/contexts/Web3Context';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

export function HomePage() {
  const { isConnected, account, connectWallet, balance } = useWeb3();
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              DataStreamNFT
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Revolutionary Data Monetization Platform
            </p>

            <p className="text-lg text-gray-500 mb-12 max-w-4xl mx-auto">
              Transform your data into queryable NFTs that generate continuous revenue through AI model usage.
            </p>

            {/* Connection Status */}
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection Status</h3>
              
              {isConnected ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className="text-sm font-medium text-green-600">Connected</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Address:</span>
                    <span className="text-sm font-mono text-gray-900">
                      {account?.slice(0, 6)}...{account?.slice(-4)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Balance:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {parseFloat(balance).toFixed(4)} LAZAI
                    </span>
                  </div>
                  {isAuthenticated && user && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">User:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.username}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">Connect your wallet to get started</p>
                  <Button
                    onClick={connectWallet}
                    variant="primary"
                    size="md"
                  >
                    Connect Wallet
                  </Button>
                </div>
              )}
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Monetization</h3>
                <p className="text-gray-600">Transform your data into valuable NFTs that generate continuous revenue.</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Integration</h3>
                <p className="text-gray-600">Leverage LazAI framework for encrypted data upload and AI inference.</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Micropayments</h3>
                <p className="text-gray-600">Earn from every query made on your data with automatic micropayments.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
