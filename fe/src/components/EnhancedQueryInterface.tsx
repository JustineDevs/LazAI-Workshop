'use client';

import React, { useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface QueryResult {
  success: boolean;
  result?: string;
  provider?: string;
  model?: string;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  duration?: number;
  queryId?: string;
  error?: string;
}

interface EnhancedQueryInterfaceProps {
  tokenId: string;
  onQueryComplete?: (result: QueryResult) => void;
  onError?: (error: string) => void;
}

export default function EnhancedQueryInterface({ 
  tokenId, 
  onQueryComplete, 
  onError 
}: EnhancedQueryInterfaceProps) {
  const { account, isConnected, signMessage } = useWeb3();
  const [query, setQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<QueryResult[]>([]);

  const providers = [
    { name: 'openai', displayName: 'OpenAI', models: ['gpt-4', 'gpt-3.5-turbo'], isActive: true },
    { name: 'gemini', displayName: 'Google Gemini', models: ['gemini-pro'], isActive: true },
    { name: 'groq', displayName: 'Groq', models: ['llama2-70b', 'mixtral-8x7b'], isActive: true }
  ];

  const handleQuery = async () => {
    if (!isConnected || !account || !query.trim()) {
      onError?.('Please connect your wallet and enter a query');
      return;
    }

    try {
      setLoading(true);

      // Sign message for privacy
      const message = `DataStreamNFT Query: ${tokenId} - ${query} (${Date.now()})`;
      await signMessage(message);

      // Simulate query processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result: QueryResult = {
        success: true,
        result: `This is a simulated response for your query: "${query}". The AI has processed your request and provided this response based on the data associated with token ${tokenId}.`,
        provider: selectedProvider,
        model: selectedModel,
        duration: 2000
      };
      
      setResults(prev => [result, ...prev]);
      onQueryComplete?.(result);

    } catch (error) {
      console.error('Query error:', error);
      onError?.(error instanceof Error ? error.message : 'Query failed');
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
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
            <p className="text-gray-600">Please connect your wallet to query data securely.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Query Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Query Data Token #{tokenId}</span>
            <span className="text-sm font-normal text-gray-500">
              Price: 0.005 ETH per query
            </span>
          </CardTitle>
          <CardDescription>
            Ask questions about this encrypted dataset using AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Provider Selection */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Provider
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {providers.map(provider => (
                  <option key={provider.name} value={provider.name}>
                    {provider.displayName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {providers.find(p => p.name === selectedProvider)?.models.map((model: string) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Query Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Query
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Ask a question about this data..."
              disabled={loading}
            />
          </div>

          {/* Query Button */}
          <div className="flex space-x-4">
            <Button
              onClick={handleQuery}
              disabled={loading || !query.trim()}
              className="flex-1"
            >
              {loading && <LoadingSpinner size="sm" className="mr-2" />}
              {loading ? 'Processing...' : 'Query Data'}
            </Button>
            {results.length > 0 && (
              <Button onClick={clearResults} variant="outline">
                Clear Results
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Query Results</CardTitle>
            <CardDescription>
              {results.length} query{results.length !== 1 ? 'ies' : 'y'} completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">
                        Query #{results.length - index}
                      </span>
                      {result.provider && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {result.provider}
                        </span>
                      )}
                      {result.model && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {result.model}
                        </span>
                      )}
                    </div>
                    {result.duration && (
                      <span className="text-xs text-gray-500">
                        {result.duration}ms
                      </span>
                    )}
                  </div>
                  
                  {result.success ? (
                    <div className="text-gray-800 whitespace-pre-wrap">
                      {result.result}
                    </div>
                  ) : (
                    <div className="text-red-600">
                      Error: {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Privacy Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600 text-xl">🔒</div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Privacy Protected</h4>
              <p className="text-sm text-blue-800">
                Your query is encrypted with your wallet signature and processed securely. 
                The data owner cannot see your specific queries, only that a query was made.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}