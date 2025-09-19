import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

import Button from '../components/ui/Button';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="text-9xl font-bold text-primary-600 mb-4">404</div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Page Not Found
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
                        Sorry, we couldn't find the page you're looking for. 
                        It might have been moved or doesn't exist.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/">
                            <Button
                                size="lg"
                                icon={<Home className="w-5 h-5" />}
                            >
                                Go Home
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            size="lg"
                            icon={<ArrowLeft className="w-5 h-5" />}
                            onClick={() => window.history.back()}
                        >
                            Go Back
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default NotFoundPage;
