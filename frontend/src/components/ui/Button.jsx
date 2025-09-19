import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import LoadingSpinner from './LoadingSpinner';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon = null,
    iconPosition = 'left',
    className = '',
    onClick,
    type = 'button',
    ...props
}) => {
    const baseClasses = 'btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    
    const variantClasses = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        outline: 'btn-outline',
        ghost: 'btn-ghost',
        danger: 'bg-error-600 text-white hover:bg-error-700 active:bg-error-800',
        success: 'bg-success-600 text-white hover:bg-success-700 active:bg-success-800',
    };

    const sizeClasses = {
        sm: 'btn-sm',
        md: 'btn-md',
        lg: 'btn-lg',
    };

    const classes = clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
    );

    const buttonContent = (
        <>
            {loading && (
                <motion.div
                    className="mr-2"
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear'
                    }}
                >
                    <LoadingSpinner size="sm" color="white" />
                </motion.div>
            )}
            {!loading && icon && iconPosition === 'left' && (
                <span className="mr-2">{icon}</span>
            )}
            {children}
            {!loading && icon && iconPosition === 'right' && (
                <span className="ml-2">{icon}</span>
            )}
        </>
    );

    return (
        <motion.button
            type={type}
            className={classes}
            disabled={disabled || loading}
            onClick={onClick}
            whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
            transition={{ duration: 0.1 }}
            {...props}
        >
            {buttonContent}
        </motion.button>
    );
};

export default Button;
