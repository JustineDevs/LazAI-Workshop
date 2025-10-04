'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface CommunityFeaturesProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommunityFeatures({ isOpen, onClose }: CommunityFeaturesProps) {
  const [activeTab, setActiveTab] = useState<'faq' | 'leaderboard' | 'discord' | 'achievements'>('faq');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Community</h2>
              <p className="text-sm text-gray-600 mt-1">Connect, learn, and grow with the DataStreamNFT community</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex space-x-8">
            {[
              { id: 'faq', label: 'FAQ', icon: '❓' },
              { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
              { id: 'discord', label: 'Discord', icon: '💬' },
              { id: 'achievements', label: 'Achievements', icon: '🎖️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'faq' | 'leaderboard' | 'discord' | 'achievements')}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
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

        {/* Content */}
        <div className="px-6 py-4">
          {activeTab === 'faq' && <FAQTab />}
          {activeTab === 'leaderboard' && <LeaderboardTab />}
          {activeTab === 'discord' && <DiscordTab />}
          {activeTab === 'achievements' && <AchievementsTab />}
        </div>
      </div>
    </div>
  );
}

// FAQ Tab Component
function FAQTab() {
  const faqs = [
    {
      id: 'what-is-datastreamnft',
      question: 'What is DataStreamNFT?',
      answer: 'DataStreamNFT is a platform that allows you to monetize your data by allowing AI to query it securely. You upload encrypted data, set a price per query, and earn ETH when AI systems query your data.',
      category: 'general'
    },
    {
      id: 'how-does-encryption-work',
      question: 'How does data encryption work?',
      answer: 'All data is encrypted using AES-256-GCM encryption with keys derived from your wallet signature. This ensures only you can decrypt your data, and it remains private even when stored on IPFS.',
      category: 'security'
    },
    {
      id: 'how-do-i-earn-money',
      question: 'How do I earn money from my data?',
      answer: 'When someone queries your data, they pay the price you set (in ETH). The payment is automatically processed through smart contracts, with a small platform fee deducted. You receive the rest directly to your wallet.',
      category: 'monetization'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {faqs.map((faq) => (
          <Card key={faq.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{faq.question}</CardTitle>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {faq.category}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-600">{faq.answer}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Leaderboard Tab Component
function LeaderboardTab() {
  const leaderboard = [
    {
      address: '0x1234...5678',
      totalEarnings: '12.5',
      totalQueries: 1250,
      performanceScore: 95,
      rank: 1
    },
    {
      address: '0x2345...6789',
      totalEarnings: '8.7',
      totalQueries: 870,
      performanceScore: 88,
      rank: 2
    },
    {
      address: '0x3456...7890',
      totalEarnings: '6.2',
      totalQueries: 620,
      performanceScore: 82,
      rank: 3
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>Users with the highest earnings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard.map((user) => (
              <div key={user.address} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      user.rank === 1 ? 'bg-yellow-500' : user.rank === 2 ? 'bg-gray-400' : user.rank === 3 ? 'bg-orange-500' : 'bg-gray-300'
                    }`}>
                      {user.rank}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {user.address}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.totalQueries} queries • {user.performanceScore}/100 score
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">{user.totalEarnings} ETH</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Discord Tab Component
function DiscordTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>💬</span>
            <span>Join Our Discord Community</span>
          </CardTitle>
          <CardDescription>
            Connect with other users, get support, and stay updated on the latest features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Join?</h3>
            <p className="text-gray-600 mb-4">
              Join our vibrant community of data creators, AI developers, and blockchain enthusiasts.
            </p>
            <Button
              onClick={() => window.open('https://discord.gg/datastreamnft', '_blank')}
              className="px-8"
            >
              Join Discord Server
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Achievements Tab Component
function AchievementsTab() {
  const achievements = [
    {
      id: 'first_upload',
      name: 'Data Pioneer',
      description: 'Upload your first dataset',
      icon: '🚀',
      completed: true
    },
    {
      id: 'first_earnings',
      name: 'First Earnings',
      description: 'Earn your first ETH from queries',
      icon: '💰',
      completed: true
    },
    {
      id: 'query_master',
      name: 'Query Master',
      description: 'Reach 100 total queries',
      icon: '🎯',
      completed: false
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Achievements</CardTitle>
          <CardDescription>Track your progress and unlock new achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 ${
                  achievement.completed
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`text-2xl ${achievement.completed ? 'opacity-100' : 'opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${achievement.completed ? 'text-green-800' : 'text-gray-700'}`}>
                      {achievement.name}
                    </h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    {achievement.completed && (
                      <div className="flex items-center mt-2">
                        <span className="text-green-600 text-sm font-medium">✓ Completed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}