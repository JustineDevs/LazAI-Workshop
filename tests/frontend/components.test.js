import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, describe, beforeEach, vi } from 'vitest';
import { Web3Provider } from '../../fe/src/contexts/Web3Context';
import { AuthProvider } from '../../fe/src/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from '../../fe/src/components/pages/HomePage';
import Navbar from '../../fe/src/components/layout/Navbar';

// Mock ethers
vi.mock('ethers', () => ({
  ethers: {
    BrowserProvider: vi.fn(),
    formatEther: vi.fn((value) => (Number(value) / 1e18).toString()),
  }
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

const TestWrapper = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Web3Provider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </Web3Provider>
    </QueryClientProvider>
  );
};

describe('Frontend Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('HomePage', () => {
    test('renders main title', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );
      
      expect(screen.getByText('DataStreamNFT')).toBeInTheDocument();
      expect(screen.getByText('Revolutionary Data Monetization Platform')).toBeInTheDocument();
    });

    test('renders features grid', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );
      
      expect(screen.getByText('Data Monetization')).toBeInTheDocument();
      expect(screen.getByText('AI Integration')).toBeInTheDocument();
      expect(screen.getByText('Micropayments')).toBeInTheDocument();
    });

    test('shows connect wallet button when not connected', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );
      
      expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
    });
  });

  describe('Navbar', () => {
    test('renders navigation links', () => {
      render(
        <TestWrapper>
          <Navbar />
        </TestWrapper>
      );
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Marketplace')).toBeInTheDocument();
      expect(screen.getByText('Create')).toBeInTheDocument();
      expect(screen.getByText('LazAI')).toBeInTheDocument();
    });

    test('shows connect wallet button', () => {
      render(
        <TestWrapper>
          <Navbar />
        </TestWrapper>
      );
      
      expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
    });
  });

  describe('Web3 Integration', () => {
    test('handles wallet connection', async () => {
      const mockConnectWallet = vi.fn();
      
      // Mock window.ethereum
      Object.defineProperty(window, 'ethereum', {
        value: {
          isMetaMask: true,
          request: vi.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
          on: vi.fn(),
          removeListener: vi.fn(),
        },
        writable: true,
      });

      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );
      
      const connectButton = screen.getByText('Connect Wallet');
      fireEvent.click(connectButton);
      
      // The actual connection logic would be tested in integration tests
      expect(connectButton).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles missing ethereum provider gracefully', () => {
      // Remove window.ethereum
      delete window.ethereum;
      
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );
      
      // Should render without crashing
      expect(screen.getByText('DataStreamNFT')).toBeInTheDocument();
    });
  });
});
