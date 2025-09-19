import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Menu, 
    X, 
    Wallet, 
    User, 
    LogOut, 
    Settings,
    BarChart3,
    Plus,
    Search
} from 'lucide-react';

import { useWeb3 } from '../../contexts/Web3Context';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

const Navbar = () => {
    const location = useLocation();
    const { account, isConnected, connectWallet, disconnectWallet, isConnecting } = useWeb3();
    const { user, isAuthenticated, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const navigation = [
        { name: 'Home', href: '/', current: location.pathname === '/' },
        { name: 'Marketplace', href: '/marketplace', current: location.pathname === '/marketplace' },
        { name: 'Create', href: '/create', current: location.pathname === '/create' },
        { name: 'LazAI', href: '/lazai', current: location.pathname === '/lazai' },
    ];

    const handleConnectWallet = async () => {
        try {
            await connectWallet();
        } catch (error) {
            console.error('Failed to connect wallet:', error);
        }
    };

    const handleDisconnect = async () => {
        try {
            await disconnectWallet();
            await logout();
            setIsUserMenuOpen(false);
        } catch (error) {
            console.error('Failed to disconnect:', error);
        }
    };

    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="container-custom">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">DS</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">DataStreamNFT</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    item.current
                                        ? 'text-primary-600 bg-primary-50'
                                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                                }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isConnected ? (
                            <div className="flex items-center space-x-4">
                                {/* Search Button */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    icon={<Search className="w-4 h-4" />}
                                >
                                    Search
                                </Button>

                                {/* Create Button */}
                                <Link to="/create">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        icon={<Plus className="w-4 h-4" />}
                                    >
                                        Create
                                    </Button>
                                </Link>

                                {/* User Menu */}
                                <div className="relative">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        icon={<User className="w-4 h-4" />}
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    >
                                        {user?.username || formatAddress(account)}
                                    </Button>

                                    <AnimatePresence>
                                        {isUserMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                                            >
                                                <Link
                                                    to="/profile"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <User className="w-4 h-4 mr-3" />
                                                    Profile
                                                </Link>
                                                <Link
                                                    to="/profile?tab=stats"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <BarChart3 className="w-4 h-4 mr-3" />
                                                    Statistics
                                                </Link>
                                                <Link
                                                    to="/profile?tab=settings"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <Settings className="w-4 h-4 mr-3" />
                                                    Settings
                                                </Link>
                                                <hr className="my-1" />
                                                <button
                                                    onClick={handleDisconnect}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    <LogOut className="w-4 h-4 mr-3" />
                                                    Disconnect
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ) : (
                            <Button
                                variant="primary"
                                size="sm"
                                icon={<Wallet className="w-4 h-4" />}
                                onClick={handleConnectWallet}
                                loading={isConnecting}
                            >
                                Connect Wallet
                            </Button>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        />
                    </div>
                </div>

                {/* Mobile Navigation */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t border-gray-200"
                        >
                            <div className="px-2 pt-2 pb-3 space-y-1">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`block px-3 py-2 rounded-md text-base font-medium ${
                                            item.current
                                                ? 'text-primary-600 bg-primary-50'
                                                : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                                        }`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                                
                                <div className="pt-4 border-t border-gray-200">
                                    {isConnected ? (
                                        <div className="space-y-2">
                                            <div className="px-3 py-2 text-sm text-gray-500">
                                                {user?.username || formatAddress(account)}
                                            </div>
                                            <Link
                                                to="/profile"
                                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                Profile
                                            </Link>
                                            <button
                                                onClick={handleDisconnect}
                                                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                                            >
                                                Disconnect
                                            </button>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="primary"
                                            size="md"
                                            icon={<Wallet className="w-4 h-4" />}
                                            onClick={handleConnectWallet}
                                            loading={isConnecting}
                                            className="w-full"
                                        >
                                            Connect Wallet
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
};

export default Navbar;
