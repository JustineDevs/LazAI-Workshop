'use client';

import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/Card';

interface DATStats {
  tokenId: string;
  creator: string;
  queryPrice: string;
  totalQueries: string;
  totalEarned: string;
  fileId: string;
  dataClass: string;
  dataValue: string;
  createdAt: string;
  isActive: boolean;
  performanceScore: number;
}

export default function DashboardPage() {
  const { account, dataStreamDATContract } = useWeb3();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [creatorDATs, setCreatorDATs] = useState<DATStats[]>([]);
  const [platformAnalytics, setPlatformAnalytics] = useState<{
    totalDATs: number;
    totalUsers: number;
    totalQueries: number;
    totalEarned: string;
  } | null>(null);
  const [creatorAnalytics, setCreatorAnalytics] = useState<{
    totalDATs: number;
    totalQueries: number;
    totalEarned: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated || !account || !dataStreamDATContract) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Mock data for demonstration
        const mockDATs: DATStats[] = [
          {
            tokenId: '1',
            creator: account,
            queryPrice: '0.005',
            totalQueries: '25',
            totalEarned: '0.125',
            fileId: 'QmExample1...',
            dataClass: 'dataset',
            dataValue: 'high',
            createdAt: new Date().toLocaleString(),
            isActive: true,
            performanceScore: 85
          },
          {
            tokenId: '2',
            creator: account,
            queryPrice: '0.003',
            totalQueries: '15',
            totalEarned: '0.045',
            fileId: 'QmExample2...',
            dataClass: 'model',
            dataValue: 'medium',
            createdAt: new Date().toLocaleString(),
            isActive: true,
            performanceScore: 72
          }
        ];

        setCreatorDATs(mockDATs);

        // Mock platform analytics
        setPlatformAnalytics({
          totalDATs: 150,
          totalUsers: 45,
          totalQueries: 1250,
          totalEarned: '6.25'
        });

        // Mock creator analytics
        setCreatorAnalytics({
          totalDATs: mockDATs.length,
          totalQueries: mockDATs.reduce((sum, dat) => sum + parseInt(dat.totalQueries), 0),
          totalEarned: mockDATs.reduce((sum, dat) => sum + parseFloat(dat.totalEarned), 0).toString()
        });

      } catch (err: unknown) {
        console.error('Error fetching dashboard data:', err);
        setError((err as Error).message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, account, dataStreamDATContract]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">Error: {error}</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-4xl font-bold text-primary-700 mb-6">Dashboard</h1>
        <p className="text-lg text-secondary-700">Please connect your wallet and log in to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-primary-700 mb-8 text-center">Your DataStreamNFT Dashboard</h1>

      {/* Overall Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-secondary-800 mb-3">Your Earnings</h2>
            <p className="text-3xl font-bold text-green-600">
              {creatorAnalytics ? creatorAnalytics.totalEarned : '0.00'} ETH
            </p>
            <p className="text-sm text-secondary-500 mt-1">Total earned from your DATs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-secondary-800 mb-3">Your Queries</h2>
            <p className="text-3xl font-bold text-primary-600">
              {creatorAnalytics ? creatorAnalytics.totalQueries : '0'}
            </p>
            <p className="text-sm text-secondary-500 mt-1">Total queries on your DATs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-secondary-800 mb-3">Your Active DATs</h2>
            <p className="text-3xl font-bold text-purple-600">
              {creatorDATs.filter(dat => dat.isActive).length} / {creatorDATs.length}
            </p>
            <p className="text-sm text-secondary-500 mt-1">Currently active for queries</p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Overview */}
      {platformAnalytics && (
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-10">
          <h2 className="text-2xl font-bold text-secondary-800 mb-4">Platform Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p className="text-secondary-700">Total DATs Minted: <span className="font-semibold">{platformAnalytics.totalDATs}</span></p>
            <p className="text-secondary-700">Total Users: <span className="font-semibold">{platformAnalytics.totalUsers}</span></p>
            <p className="text-secondary-700">Total Queries Across Platform: <span className="font-semibold">{platformAnalytics.totalQueries}</span></p>
            <p className="text-secondary-700">Total Platform Earnings: <span className="font-semibold">{platformAnalytics.totalEarned} ETH</span></p>
          </div>
        </div>
      )}

      {/* Your Data Anchoring Tokens (DATs) */}
      <h2 className="text-3xl font-bold text-primary-700 mb-6">Your Data Anchoring Tokens (DATs)</h2>
      {creatorDATs.length === 0 ? (
        <p className="text-lg text-secondary-700 text-center">You haven&apos;t minted any DATs yet. Go to the &quot;Create&quot; page to mint your first one!</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {creatorDATs.map((dat) => (
            <Card key={dat.tokenId} className="hover:shadow-xl transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-secondary-900">DAT #{dat.tokenId}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${dat.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {dat.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-secondary-700 mb-2"><strong>Creator:</strong> {dat.creator}</p>
                <p className="text-secondary-700 mb-2"><strong>Query Price:</strong> {dat.queryPrice} ETH</p>
                <p className="text-secondary-700 mb-2"><strong>Total Queries:</strong> {dat.totalQueries}</p>
                <p className="text-secondary-700 mb-2"><strong>Total Earned:</strong> {dat.totalEarned} ETH</p>
                <p className="text-secondary-700 mb-2"><strong>File ID:</strong> {dat.fileId.substring(0, 10)}...</p>
                <p className="text-secondary-700 mb-2"><strong>Data Class:</strong> {dat.dataClass}</p>
                <p className="text-secondary-700 mb-2"><strong>Data Value:</strong> {dat.dataValue}</p>
                <p className="text-secondary-700 mb-2"><strong>Minted On:</strong> {dat.createdAt}</p>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-lg font-semibold text-secondary-800">Performance Score:</span>
                  <span className={`text-2xl font-bold ${dat.performanceScore > 75 ? 'text-green-500' : dat.performanceScore > 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {dat.performanceScore}/100
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}