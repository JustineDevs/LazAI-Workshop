import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Pages
import HomePage from './pages/HomePage';
import MarketplacePage from './pages/MarketplacePage';
import CreatePage from './pages/CreatePage';
import ProfilePage from './pages/ProfilePage';
import DataStreamDetailPage from './pages/DataStreamDetailPage';
import NotFoundPage from './pages/NotFoundPage';

// Hooks
import { useAuth } from './contexts/AuthContext';

function App() {
    const { isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            
            <main className="flex-1">
                <AnimatePresence mode="wait">
                    <Routes>
                        <Route 
                            path="/" 
                            element={
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <HomePage />
                                </motion.div>
                            } 
                        />
                        <Route 
                            path="/marketplace" 
                            element={
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <MarketplacePage />
                                </motion.div>
                            } 
                        />
                        <Route 
                            path="/create" 
                            element={
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <CreatePage />
                                </motion.div>
                            } 
                        />
                        <Route 
                            path="/profile" 
                            element={
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ProfilePage />
                                </motion.div>
                            } 
                        />
                        <Route 
                            path="/datastream/:id" 
                            element={
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <DataStreamDetailPage />
                                </motion.div>
                            } 
                        />
                        <Route 
                            path="*" 
                            element={
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <NotFoundPage />
                                </motion.div>
                            } 
                        />
                    </Routes>
                </AnimatePresence>
            </main>
            
            <Footer />
        </div>
    );
}

export default App;
