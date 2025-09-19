import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ 
    size = 'md', 
    color = 'primary', 
    className = '',
    text = null 
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12',
    };

    const colorClasses = {
        primary: 'border-primary-600',
        secondary: 'border-secondary-600',
        white: 'border-white',
        gray: 'border-gray-600',
    };

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <motion.div
                className={`spinner ${sizeClasses[size]} ${colorClasses[color]}`}
                animate={{ rotate: 360 }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'linear'
                }}
            />
            {text && (
                <motion.p
                    className="mt-2 text-sm text-secondary-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {text}
                </motion.p>
            )}
        </div>
    );
};

export default LoadingSpinner;
