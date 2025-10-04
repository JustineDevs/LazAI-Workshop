'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      selectedAddress?: string;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
      send: (method: string, params?: unknown[]) => Promise<unknown>;
    };
  }
}

// Global error handler for browser extensions
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    // Suppress common browser extension errors
    if (
      event.message?.includes('Cannot destructure property') ||
      event.message?.includes('register') ||
      event.message?.includes('chrome-extension://') ||
      event.message?.includes('Failed to fetch') ||
      event.message?.includes('Unchecked runtime.lastError')
    ) {
      event.preventDefault();
      console.warn('Suppressed browser extension error:', event.message);
      return false;
    }
  });

  // Suppress unhandled promise rejections from extensions
  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason?.message?.includes('Cannot destructure property') ||
      event.reason?.message?.includes('register') ||
      event.reason?.message?.includes('chrome-extension://') ||
      event.reason?.message?.includes('Failed to fetch')
    ) {
      event.preventDefault();
      console.warn('Suppressed browser extension promise rejection:', event.reason);
      return false;
    }
  });
}

interface Web3ContextType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string;
  datBalance: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  switchToLazAINetwork: () => Promise<void>;
  getContract: (contractName: string) => ethers.Contract | null;
  updateBalances: (provider: ethers.BrowserProvider, address: string) => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  dataStreamDATContract: ethers.Contract | null;
  CONTRACT_ADDRESSES: Record<string, string>;
  CONTRACT_ABIS: Record<string, string[]>;
  LAZAI_NETWORK: {
    chainId: number;
    name: string;
    rpcUrl: string;
    blockExplorerUrl: string;
  };
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState('0');
  const [datBalance, setDatBalance] = useState('0');

  // Contract addresses (these would come from environment variables in production)
  const CONTRACT_ADDRESSES = useMemo(() => ({
    DataStreamNFT: process.env.NEXT_PUBLIC_DATASTREAM_NFT_ADDRESS || '0x1868C3935B5A548C90d5660981FB866160382Da7',
    DataStreamDAT: process.env.NEXT_PUBLIC_DATASTREAM_DAT_ADDRESS || '0x1868C3935B5A548C90d5660981FB866160382Da7',
    DATToken: process.env.NEXT_PUBLIC_DAT_TOKEN_ADDRESS || '0x...', // Not used for ETH payments
  }), []);

  // Contract ABIs (updated for deployed contract)
  const CONTRACT_ABIS = useMemo(() => ({
    DataStreamNFT: [
      "function mintDataNFT(string memory tokenURI, uint256 queryPriceInWei) external returns (uint256)",
      "function payForQuery(uint256 tokenId) external payable",
      "function updateQueryPrice(uint256 tokenId, uint256 newPriceInWei) external",
      "function dataNFTs(uint256 tokenId) external view returns (address creator, uint256 queryPrice, uint256 totalQueries, uint256 totalEarned)",
      "function ownerOf(uint256 tokenId) external view returns (address)",
      "function tokenURI(uint256 tokenId) external view returns (string memory)",
      "function name() external view returns (string memory)",
      "function symbol() external view returns (string memory)",
      "function platformTreasury() external view returns (address)",
      "function platformFeeBps() external view returns (uint256)",
      "event DataNFTMinted(uint256 indexed tokenId, address indexed creator, string uri, uint256 queryPrice)",
      "event QueryPaid(uint256 indexed tokenId, address indexed payer, uint256 amount)",
      "event QueryPriceUpdated(uint256 indexed tokenId, uint256 newPrice)"
    ],
    DataStreamDAT: [
      "function mintDataDAT(string memory tokenURI, uint256 queryPriceInWei, string memory fileId, string memory dataClass, string memory dataValue) external returns (uint256)",
      "function payForQuery(uint256 tokenId) external payable",
      "function updateQueryPrice(uint256 tokenId, uint256 newPriceInWei) external",
      "function dataDATs(uint256) view returns (address creator, uint256 queryPrice, uint256 totalQueries, uint256 totalEarned, uint256 createdAt, bool isActive, string fileId, string dataClass, string dataValue)",
      "function ownerOf(uint256 tokenId) view returns (address)",
      "function tokenURI(uint256 tokenId) view returns (string)",
      "function balanceOf(address owner) view returns (uint256)",
      "function totalSupply() view returns (uint256)",
      "function getCreatorTokens(address creator) view returns (uint256[])",
      "event DataDATMinted(uint256 indexed tokenId, address indexed creator, string uri, uint256 queryPrice, string fileId, string dataClass, string dataValue)",
      "event QueryPaid(uint256 indexed tokenId, address indexed payer, uint256 amount)",
      "event QueryPriceUpdated(uint256 indexed tokenId, uint256 newPrice)"
    ],
    DATToken: [
      "function transfer(address to, uint256 amount) external returns (bool)",
      "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
      "function approve(address spender, uint256 amount) external returns (bool)",
      "function balanceOf(address account) external view returns (uint256)",
      "function allowance(address owner, address spender) external view returns (uint256)"
    ]
  }), []);

  // Network configuration
  const LAZAI_NETWORK = {
    chainId: 133718,
    name: 'LazAI Testnet',
    rpcUrl: 'https://testnet.lazai.network',
    blockExplorerUrl: 'https://testnet-explorer.lazai.network',
  };

  // Check if MetaMask is installed
  const isMetaMaskInstalled = useCallback(() => {
    if (typeof window === 'undefined') return false;
    try {
      return !!(window.ethereum && window.ethereum.isMetaMask);
    } catch (error) {
      console.warn('Error checking MetaMask installation:', error);
      return false;
    }
  }, []);

  // Safe ethereum access
  const getEthereum = useCallback(() => {
    if (typeof window === 'undefined') return null;
    try {
      return window.ethereum;
    } catch (error) {
      console.warn('Error accessing ethereum object:', error);
      return null;
    }
  }, []);

  // Network configuration for MetaMask
  const LAZAI_NETWORK_METAMASK = useMemo(() => ({
    chainId: '0x20A5A', // 133718 in hex
    chainName: 'LazAI Testnet',
    nativeCurrency: {
      name: 'LAZAI',
      symbol: 'LAZAI',
      decimals: 18,
    },
    rpcUrls: ['https://testnet.lazai.network'],
    blockExplorerUrls: ['https://testnet-explorer.lazai.network'],
  }), []);

  // Get provider
  const getProvider = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const ethereum = getEthereum();
      if (!ethereum) {
        throw new Error('No ethereum provider found');
      }
      const provider = new ethers.BrowserProvider(ethereum as ethers.Eip1193Provider);
      await provider.send('eth_requestAccounts', []);
      return provider;
    } catch (error) {
      console.error('Error getting provider:', error);
      throw error;
    }
  }, [isMetaMaskInstalled, getEthereum]);

  // Update balances
  const updateBalances = useCallback(async (provider: ethers.BrowserProvider, address: string) => {
    try {
      // Get ETH balance
      const ethBalance = await provider.getBalance(address);
      setBalance(ethers.formatEther(ethBalance));

      // Get DAT token balance
      if (CONTRACT_ADDRESSES.DATToken && CONTRACT_ADDRESSES.DATToken !== '0x...') {
        const datTokenContract = new ethers.Contract(
          CONTRACT_ADDRESSES.DATToken,
          CONTRACT_ABIS.DATToken,
          provider
        );
        const datBalance = await datTokenContract.balanceOf(address);
        setDatBalance(ethers.formatEther(datBalance));
      }
    } catch (error) {
      console.error('Error updating balances:', error);
    }
  }, [CONTRACT_ADDRESSES.DATToken, CONTRACT_ABIS.DATToken]);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    console.log('🔗 Connect wallet button clicked');
    
    if (!isMetaMaskInstalled()) {
      console.log('❌ MetaMask not installed');
      toast.error('Please install MetaMask to continue');
      return;
    }

    if (isConnecting) {
      console.log('⏳ Already connecting, skipping...');
      return;
    }

    setIsConnecting(true);
    console.log('🚀 Starting wallet connection...');
    
    try {
      console.log('📡 Getting provider...');
      const provider = await getProvider();
      console.log('✅ Provider obtained:', provider);
      
      console.log('🔑 Getting signer...');
      const signer = await provider.getSigner();
      console.log('✅ Signer obtained:', signer);
      
      console.log('📍 Getting address...');
      const address = await signer.getAddress();
      console.log('✅ Address obtained:', address);
      
      console.log('🌐 Getting network...');
      const network = await provider.getNetwork();
      console.log('✅ Network obtained:', network);

      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setChainId(Number(network.chainId));
      setIsConnected(true);

      console.log('💰 Updating balances...');
      // Get balances
      await updateBalances(provider, address);

      console.log('🎉 Wallet connected successfully!');
      toast.success('Wallet connected successfully');
    } catch (error) {
      console.error('❌ Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [getProvider, updateBalances, isMetaMaskInstalled, isConnecting]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    console.log('🔌 Disconnect wallet button clicked');
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
    setBalance('0');
    setDatBalance('0');
    console.log('✅ Wallet disconnected successfully');
    toast.success('Wallet disconnected');
  }, []);


  // Switch network
  const switchNetwork = useCallback(async (targetChainId: number) => {
    if (typeof window === 'undefined') return;
    
    try {
      const ethereum = getEthereum();
      if (!ethereum) return;

      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 4902) {
        // Chain not added to MetaMask, add it
        try {
          const ethereum = getEthereum();
          if (!ethereum) return;
          
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [LAZAI_NETWORK_METAMASK],
          });
        } catch (addError) {
          console.error('Error adding network:', addError);
          toast.error('Failed to add LazAI network to MetaMask');
        }
      } else {
        console.error('Error switching network:', error);
        toast.error('Failed to switch network');
      }
    }
  }, [getEthereum, LAZAI_NETWORK_METAMASK]);

  // Switch to LazAI network specifically
  const switchToLazAINetwork = useCallback(async () => {
    await switchNetwork(133718);
  }, [switchNetwork]);

  // Get contract instance
  const getContract = useCallback((contractName: string) => {
    if (!provider || !signer) return null;

    const address = CONTRACT_ADDRESSES[contractName as keyof typeof CONTRACT_ADDRESSES];
    const abi = CONTRACT_ABIS[contractName as keyof typeof CONTRACT_ABIS];

    if (!address || address === '0x...' || !abi) return null;

    return new ethers.Contract(address, abi, signer);
  }, [provider, signer, CONTRACT_ADDRESSES, CONTRACT_ABIS]);

  // Listen for account changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const ethereum = getEthereum();
    if (!ethereum) return;

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        if (provider) {
          updateBalances(provider, accounts[0]);
        }
      }
    };

    const handleChainChanged = (...args: unknown[]) => {
      const chainId = args[0] as string;
      setChainId(Number(chainId));
      if (provider && account) {
        updateBalances(provider, account);
      }
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      const ethereum = getEthereum();
      if (ethereum) {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [account, provider, disconnectWallet, updateBalances, getEthereum]);

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      const ethereum = getEthereum();
      if (isMetaMaskInstalled() && ethereum?.selectedAddress) {
        try {
          const provider = await getProvider();
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const network = await provider.getNetwork();

          setProvider(provider);
          setSigner(signer);
          setAccount(address);
          setChainId(Number(network.chainId));
          setIsConnected(true);

          await updateBalances(provider, address);
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };

    checkConnection();
  }, [getProvider, updateBalances, isMetaMaskInstalled, getEthereum]);

  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!signer) {
      throw new Error('No signer available');
    }
    
    try {
      const signature = await signer.signMessage(message);
      return signature;
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw new Error('Failed to sign message');
    }
  }, [signer]);

  const dataStreamDATContract = useMemo(() => {
    if (!provider || !signer) return null;
    
    const address = CONTRACT_ADDRESSES.DataStreamDAT;
    const abi = CONTRACT_ABIS.DataStreamDAT;
    
    if (!address || address === '0x...') return null;
    
    return new ethers.Contract(address, abi, signer);
  }, [provider, signer, CONTRACT_ADDRESSES.DataStreamDAT, CONTRACT_ABIS.DataStreamDAT]);

  const value: Web3ContextType = {
    // State
    provider,
    signer,
    account,
    chainId,
    isConnected,
    isConnecting,
    balance,
    datBalance,
    
    // Methods
    connectWallet,
    disconnectWallet,
    switchNetwork,
    switchToLazAINetwork,
    getContract,
    updateBalances,
    signMessage,
    dataStreamDATContract,
    
    // Constants
    CONTRACT_ADDRESSES,
    CONTRACT_ABIS,
    LAZAI_NETWORK,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};
