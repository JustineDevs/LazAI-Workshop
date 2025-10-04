'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface LeaderboardEntry {
  rank: number;
  address: string;
  username: string;
  earnings: string;
  queries: number;
  nfts: number;
  score: number;
}

interface LeaderboardProps {
  type?: 'earnings' | 'queries' | 'nfts' | 'score';
  limit?: number;
}

export default function Leaderboard({ type = 'earnings', limit = 10 }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState(type);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedType, limit]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/leaderboard?type=${selectedType}&limit=${limit}`);
      const data = await response.json();
      
      if (data.success) {
        setLeaderboard(data.data);
      } else {
        setError('Failed to fetch leaderboard');
      }
    } catch (err) {
      setError('Error fetching leaderboard data');
      console.error('Leaderboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      earnings: 'Earnings',
      queries: 'Queries',
      nfts: 'NFTs',
      score: 'Score'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatValue = (value: string | number, type: string) => {
    if (type === 'earnings') {
      return `${parseFloat(value.toString()).toFixed(4)} ETH`;
    }
    if (type === 'queries' || type === 'nfts') {
      return value.toLocaleString();
    }
    return value.toString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500 text-center">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>🏆 Leaderboard</CardTitle>
          <div className="flex space-x-2">
            {['earnings', 'queries', 'nfts', 'score'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t as any)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedType === t
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getTypeLabel(t)}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                entry.rank <= 3
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl font-bold">
                  {getRankIcon(entry.rank)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {entry.username}
                  </div>
                  <div className="text-sm text-gray-500 font-mono">
                    {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-lg">
                  {formatValue(entry[selectedType as keyof LeaderboardEntry], selectedType)}
                </div>
                <div className="text-sm text-gray-500">
                  {entry.queries} queries • {entry.nfts} NFTs
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {leaderboard.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No leaderboard data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
