import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({ text, type = 'answer', onClick, isSelected, style = {}, className = '' }) => {
    const isQuestion = type === 'question';

    const cardStyle = {
        width: '180px',
        height: '250px',
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        backgroundColor: isQuestion ? '#1a1a1a' : '#f8fafc',
        color: isQuestion ? '#f8fafc' : '#0f172a',
        border: isQuestion ? '2px solid rgba(255,255,255,0.05)' : '2px solid #e2e8f0',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        ...style
    };

    return (
        <motion.div
            layout
            whileHover={onClick ? { y: -15, boxShadow: '0 20px 40px rgba(0,0,0,0.6)', rotate: -2 } : {}}
            whileTap={onClick ? { scale: 0.95 } : {}}
            animate={isSelected ? { y: -20, scale: 1.05, border: '2px solid var(--accent-neon)', zIndex: 10 } : {}}
            style={cardStyle}
            onClick={onClick}
            className={className}
        >
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', lineHeight: '1.4' }}>
                {text}
            </div>
            {!isQuestion && (
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    opacity: 0.3,
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>
                    Au Fond<br />Du Trou
                </div>
            )}
        </motion.div>
    );
};
