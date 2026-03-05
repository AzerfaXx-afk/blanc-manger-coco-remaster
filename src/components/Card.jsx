import React from 'react';
import { motion } from 'framer-motion';
import { playBop } from '../utils/audio';

export const Card = ({ text, type = 'answer', onClick, isSelected, style = {}, className = '' }) => {
    const isQuestion = type === 'question';

    const handleInteraction = (e) => {
        if (onClick) {
            playBop();
            onClick(e);
        }
    };

    const cardStyle = {
        minWidth: '150px',
        maxWidth: '200px',
        flex: '1 0 150px', // Flexible sizing for mobile horizontal scroll
        height: '240px',
        borderRadius: '20px',
        padding: '25px', // Changed from 20px
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', // Added
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        background: isQuestion ? '#1a1a1a' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        color: isQuestion ? '#f8fafc' : '#0f172a',
        border: isQuestion ? '2px solid rgba(255,255,255,0.05)' : '1px solid #ffffff',
        boxShadow: isQuestion ? '0 10px 30px rgba(0,0,0,0.5)' : 'inset 0 4px 6px rgba(255,255,255,0.8), 0 10px 25px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        ...style
    };

    return (
        <motion.div
            layout
            whileHover={onClick ? { y: -15, scale: 1.02, boxShadow: 'inset 0 2px 4px rgba(255,255,255,1), 0 20px 40px rgba(0,0,0,0.6)', rotate: -1 } : {}}
            whileTap={onClick ? { scale: 0.95, rotate: 0 } : {}}
            animate={isSelected ? { y: -20, scale: 1.05, border: '2px solid var(--accent-cyan)', boxShadow: '0 0 25px rgba(0, 229, 255, 0.4)', zIndex: 10 } : {}}
            style={cardStyle}
            onClick={handleInteraction}
            className={className}
        >
            <div style={{
                position: 'absolute', top: '15px', right: '15px',
                opacity: isQuestion ? 0.05 : 0.03, pointerEvents: 'none'
            }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z" />
                </svg>
            </div>

            <div style={{
                fontSize: '1rem',
                fontWeight: '800',
                lineHeight: '1.4',
                letterSpacing: '-0.3px',
                color: isQuestion ? '#ffffff' : 'var(--text-main)', // Adjusted based on isQuestion
                textAlign: 'center', // Added
                zIndex: 1
            }}>
                {text}
            </div>

            {!isQuestion && (
                <div style={{
                    position: 'absolute',
                    bottom: '15px',
                    left: '15px',
                    right: '15px',
                    opacity: 0.3,
                    fontSize: '0.65rem',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    borderTop: '1px solid rgba(0,0,0,0.2)',
                    paddingTop: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span>AU FOND</span>
                    <span>DU TROU</span>
                </div>
            )}
        </motion.div>
    );
};
