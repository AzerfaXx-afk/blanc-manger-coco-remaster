import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
    const baseStyle = {
        padding: '12px 24px',
        borderRadius: '12px',
        border: 'none',
        fontWeight: 'bold',
        fontSize: '1.1rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        transition: 'all 0.2s ease',
        backgroundColor: variant === 'primary' ? 'var(--accent-neon)' : 'rgba(255, 255, 255, 0.05)',
        color: variant === 'primary' ? '#000' : 'var(--text-main)',
        border: variant === 'secondary' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        width: '100%'
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
            whileTap={{ scale: 0.98 }}
            style={baseStyle}
            onClick={onClick}
            className={variant === 'primary' ? 'neon-glow ' + className : 'glass ' + className}
            {...props}
        >
            {children}
        </motion.button>
    );
};
