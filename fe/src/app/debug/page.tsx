'use client'

import { useWeb3 } from '@/contexts/Web3Context';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export default function DebugPage() {
  const { isConnected, account, connectWallet, disconnectWallet, balance, isConnecting } = useWeb3();
  const { isAuthenticated, user, login, logout } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logMessage]);
    console.log(logMessage);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testBasicClick = () => {
    addLog('✅ Basic button click test - SUCCESS');
  };

  const testWeb3Connection = async () => {
    addLog('🔗 Testing Web3 connection...');
    try {
      await connectWallet();
      addLog('✅ Web3 connection test completed');
    } catch (error) {
      addLog(`❌ Web3 connection failed: ${error}`);
    }
  };

  const testWeb3Disconnection = () => {
    addLog('🔌 Testing Web3 disconnection...');
    try {
      disconnectWallet();
      addLog('✅ Web3 disconnection test completed');
    } catch (error) {
      addLog(`❌ Web3 disconnection failed: ${error}`);
    }
  };

  const testAuthLogin = async () => {
    addLog('🔐 Testing auth login...');
    try {
      // This would normally require credentials
      addLog('ℹ️ Auth login test requires credentials - skipping');
    } catch (error) {
      addLog(`❌ Auth login failed: ${error}`);
    }
  };

  const testAuthLogout = async () => {
    addLog('🚪 Testing auth logout...');
    try {
      await logout();
      addLog('✅ Auth logout test completed');
    } catch (error) {
      addLog(`❌ Auth logout failed: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Page - Button Functionality Test</h1>
        
        {/* Status Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Web3 Status</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Connected:</span>
                <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                  {isConnected ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Account:</span>
                <span className="font-mono text-sm">
                  {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Balance:</span>
                <span>{balance} LAZAI</span>
              </div>
              <div className="flex justify-between">
                <span>Connecting:</span>
                <span className={isConnecting ? 'text-yellow-600' : 'text-gray-600'}>
                  {isConnecting ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Auth Status</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Authenticated:</span>
                <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                  {isAuthenticated ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>User:</span>
                <span>{user?.username || 'None'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Button Tests</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={testBasicClick} variant="primary">
              Basic Click
            </Button>
            <Button onClick={testWeb3Connection} variant="primary" disabled={isConnecting}>
              {isConnecting ? 'Connecting...' : 'Connect Web3'}
            </Button>
            <Button onClick={testWeb3Disconnection} variant="danger" disabled={!isConnected}>
              Disconnect Web3
            </Button>
            <Button onClick={testAuthLogin} variant="secondary">
              Test Auth Login
            </Button>
            <Button onClick={testAuthLogout} variant="secondary" disabled={!isAuthenticated}>
              Test Auth Logout
            </Button>
            <Button onClick={clearLogs} variant="secondary">
              Clear Logs
            </Button>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Logs</h2>
          <div className="bg-gray-100 rounded p-4 h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Click a button to start testing.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="font-mono text-sm mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
