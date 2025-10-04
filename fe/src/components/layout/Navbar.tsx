'use client'

import { useState } from 'react';
import Link from 'next/link';
import { useWeb3 } from '@/contexts/Web3Context';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isConnected, account, connectWallet, disconnectWallet, balance } = useWeb3();
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">DataStreamNFT</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Home
            </Link>
            <Link href="/marketplace" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Marketplace
            </Link>
            <Link href="/create" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Create
            </Link>
            <Link href="/lazai" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              LazAI
            </Link>
            {isAuthenticated && (
              <Link href="/profile" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Profile
              </Link>
            )}
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:flex items-center space-x-4">
                  {isConnected ? (
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-600">
                        <div className="font-medium">{account?.slice(0, 6)}...{account?.slice(-4)}</div>
                        <div className="text-xs">{parseFloat(balance).toFixed(4)} LAZAI</div>
                      </div>
                      <Button
                        onClick={disconnectWallet}
                        variant="danger"
                        size="sm"
                      >
                        Disconnect
                      </Button>
                      {isAuthenticated && (
                        <Button
                          onClick={logout}
                          variant="secondary"
                          size="sm"
                        >
                          Logout
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button
                      onClick={connectWallet}
                      variant="primary"
                      size="sm"
                    >
                      Connect Wallet
                    </Button>
                  )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
              <Link href="/" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                Home
              </Link>
              <Link href="/marketplace" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                Marketplace
              </Link>
              <Link href="/create" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                Create
              </Link>
              <Link href="/lazai" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                LazAI
              </Link>
              {isAuthenticated && (
                <Link href="/profile" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                  Profile
                </Link>
              )}
              
                    <div className="pt-4 border-t border-gray-200">
                      {isConnected ? (
                        <div className="space-y-2">
                          <div className="px-3 py-2 text-sm text-gray-600">
                            {account?.slice(0, 6)}...{account?.slice(-4)}
                          </div>
                          <div className="px-3 py-2 text-sm text-gray-600">
                            {parseFloat(balance).toFixed(4)} LAZAI
                          </div>
                          <Button
                            onClick={disconnectWallet}
                            variant="danger"
                            size="sm"
                            className="w-full"
                          >
                            Disconnect
                          </Button>
                          {isAuthenticated && (
                            <Button
                              onClick={logout}
                              variant="secondary"
                              size="sm"
                              className="w-full"
                            >
                              Logout
                            </Button>
                          )}
                        </div>
                      ) : (
                        <Button
                          onClick={connectWallet}
                          variant="primary"
                          size="sm"
                          className="w-full"
                        >
                          Connect Wallet
                        </Button>
                      )}
                    </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
