import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

const Web3Context = createContext();

export const useWeb3 = () => {
    const context = useContext(Web3Context);
    if (!context) {
        throw new Error('useWeb3 must be used within a Web3Provider');
    }
    return context;
};

export const Web3Provider = ({ children }) => {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [account, setAccount] = useState(null);
    const [chainId, setChainId] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [balance, setBalance] = useState('0');
    const [datBalance, setDatBalance] = useState('0');

    // Contract addresses (these would come from environment variables in production)
    const CONTRACT_ADDRESSES = {
        DataStreamNFT: process.env.REACT_APP_DATASTREAM_NFT_ADDRESS || '0x1868C3935B5A548C90d5660981FB866160382Da7',
        DATToken: process.env.REACT_APP_DAT_TOKEN_ADDRESS || '0x...', // Not used for ETH payments
    };

    // Contract ABIs (updated for deployed contract)
    const CONTRACT_ABIS = {
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
        DATToken: [
            "function transfer(address to, uint256 amount) external returns (bool)",
            "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
            "function approve(address spender, uint256 amount) external returns (bool)",
            "function balanceOf(address account) external view returns (uint256)",
            "function allowance(address owner, address spender) external view returns (uint256)"
        ]
    };

    // Network configuration
    const LAZAI_NETWORK = {
        chainId: '0x20A5A', // 133718 in hex
        chainName: 'LazAI Testnet',
        nativeCurrency: {
            name: 'LAZAI',
            symbol: 'LAZAI',
            decimals: 18,
        },
        rpcUrls: ['https://testnet.lazai.network'],
        blockExplorerUrls: ['https://testnet-explorer.lazai.network'],
    };

    // Check if MetaMask is installed
    const isMetaMaskInstalled = () => {
        return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
    };

    // Get provider
    const getProvider = useCallback(async () => {
        if (!isMetaMaskInstalled()) {
            throw new Error('MetaMask is not installed');
        }

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send('eth_requestAccounts', []);
            return provider;
        } catch (error) {
            console.error('Error getting provider:', error);
            throw error;
        }
    }, []);

    // Connect wallet
    const connectWallet = useCallback(async () => {
        if (!isMetaMaskInstalled()) {
            toast.error('Please install MetaMask to continue');
            return;
        }

        setIsConnecting(true);
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

            // Get balances
            await updateBalances(provider, address);

            toast.success('Wallet connected successfully');
        } catch (error) {
            console.error('Error connecting wallet:', error);
            toast.error('Failed to connect wallet');
        } finally {
            setIsConnecting(false);
        }
    }, [getProvider]);

    // Disconnect wallet
    const disconnectWallet = useCallback(() => {
        setProvider(null);
        setSigner(null);
        setAccount(null);
        setChainId(null);
        setIsConnected(false);
        setBalance('0');
        setDatBalance('0');
        toast.success('Wallet disconnected');
    }, []);

    // Update balances
    const updateBalances = useCallback(async (provider, address) => {
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
    }, []);

    // Switch network
    const switchNetwork = useCallback(async (targetChainId) => {
        if (!window.ethereum) return;

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${targetChainId.toString(16)}` }],
            });
        } catch (error) {
            if (error.code === 4902) {
                // Chain not added to MetaMask, add it
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [LAZAI_NETWORK],
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
    }, []);

    // Switch to LazAI network specifically
    const switchToLazAINetwork = useCallback(async () => {
        await switchNetwork(133718);
    }, [switchNetwork]);

    // Get contract instance
    const getContract = useCallback((contractName) => {
        if (!provider || !signer) return null;

        const address = CONTRACT_ADDRESSES[contractName];
        const abi = CONTRACT_ABIS[contractName];

        if (!address || address === '0x...' || !abi) return null;

        return new ethers.Contract(address, abi, signer);
    }, [provider, signer]);

    // Listen for account changes
    useEffect(() => {
        if (!window.ethereum) return;

        const handleAccountsChanged = (accounts) => {
            if (accounts.length === 0) {
                disconnectWallet();
            } else if (accounts[0] !== account) {
                setAccount(accounts[0]);
                if (provider) {
                    updateBalances(provider, accounts[0]);
                }
            }
        };

        const handleChainChanged = (chainId) => {
            setChainId(Number(chainId));
            if (provider && account) {
                updateBalances(provider, account);
            }
        };

        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        return () => {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            window.ethereum.removeListener('chainChanged', handleChainChanged);
        };
    }, [account, provider, disconnectWallet, updateBalances]);

    // Check if already connected on mount
    useEffect(() => {
        const checkConnection = async () => {
            if (isMetaMaskInstalled() && window.ethereum.selectedAddress) {
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
    }, [getProvider, updateBalances]);

    const value = {
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
