import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { playBop } from '../utils/audio';

export const Card = ({
    text,
    type = 'answer',
    onClick,
    isSelected,
    isFlipped: controlledFlip,
    startFlipped = false,
    showBack = true,
    style = {},
    className = '',
    selectionIndex,
    disabled = false
}) => {
    const isQuestion = type === 'question';
    const [internalFlipped, setInternalFlipped] = useState(startFlipped);

    // Use controlled flip if provided, otherwise internal state
    const isFlipped = controlledFlip !== undefined ? controlledFlip : internalFlipped;

    const handleClick = (e) => {
        if (disabled) return;
        playBop();

        // If card has a back and isn't flipped yet, flip it first
        if (showBack && !isFlipped && controlledFlip === undefined) {
            setInternalFlipped(true);
            return;
        }

        // If already flipped (or no back), trigger onClick
        if (onClick) {
            onClick(e);
        }
    };

    return (
        <motion.div
            className={`card-container ${className}`}
            layout
            whileHover={!disabled ? { y: -8, scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.96 } : {}}
            onClick={handleClick}
            style={{
                width: '100%',
                height: '100%',
                minHeight: '130px',
                ...style
            }}
        >
            <div className={`card-inner ${isFlipped ? 'flipped' : ''}`} style={{ width: '100%', height: '100%' }}>

                {/* BACK FACE */}
                {showBack && (
                    <div className={`card-face card-back ${isQuestion ? 'card-back-question' : 'card-back-answer'}`}>
                        {/* Decorative pattern */}
                        <div className="card-back-pattern" style={{ color: isQuestion ? '#fff' : '#000' }} />

                        {/* Center logo/branding */}
                        <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            gap: '6px', zIndex: 1
                        }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '10px',
                                background: isQuestion
                                    ? 'linear-gradient(135deg, var(--accent-pink), var(--accent-purple))'
                                    : 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: isQuestion
                                    ? '0 4px 15px rgba(255,0,127,0.4)'
                                    : '0 4px 15px rgba(0,229,255,0.4)'
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="white" opacity="0.9">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-7v4h4l-5 7z" />
                                </svg>
                            </div>
                            <span style={{
                                fontSize: '0.5rem', fontWeight: '900', letterSpacing: '2px',
                                textTransform: 'uppercase',
                                color: isQuestion ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)'
                            }}>
                                AU FOND
                            </span>
                            <span style={{
                                fontSize: '0.5rem', fontWeight: '900', letterSpacing: '2px',
                                textTransform: 'uppercase', marginTop: '-4px',
                                color: isQuestion ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)'
                            }}>
                                DU TROU
                            </span>
                        </div>

                        {/* Corner decorations */}
                        <div style={{
                            position: 'absolute', top: '8px', left: '8px',
                            width: '12px', height: '12px',
                            borderTop: `2px solid ${isQuestion ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
                            borderLeft: `2px solid ${isQuestion ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
                            borderRadius: '3px 0 0 0'
                        }} />
                        <div style={{
                            position: 'absolute', bottom: '8px', right: '8px',
                            width: '12px', height: '12px',
                            borderBottom: `2px solid ${isQuestion ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
                            borderRight: `2px solid ${isQuestion ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
                            borderRadius: '0 0 3px 0'
                        }} />
                    </div>
                )}

                {/* FRONT FACE */}
                <div className={`card-face card-front ${isQuestion ? 'card-front-question' : 'card-front-answer'} ${isSelected ? 'card-selected' : ''}`}>
                    {/* Card text */}
                    <div style={{
                        fontSize: '0.85rem',
                        fontWeight: '800',
                        lineHeight: '1.4',
                        letterSpacing: '-0.3px',
                        textAlign: 'center',
                        zIndex: 1,
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {text}
                    </div>

                    {/* Bottom branding */}
                    <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '12px',
                        right: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        opacity: 0.25,
                        fontSize: '0.45rem',
                        fontWeight: '900',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        borderTop: isQuestion ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                        paddingTop: '6px'
                    }}>
                        <span>AU FOND</span>
                        <span>DU TROU</span>
                    </div>

                    {/* Selection badge */}
                    {isSelected && selectionIndex !== undefined && (
                        <div style={{
                            position: 'absolute', top: '-6px', right: '-6px',
                            background: 'linear-gradient(135deg, var(--accent-pink), #cc0066)',
                            width: '24px', height: '24px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: '900', fontSize: '0.7rem', color: '#fff',
                            boxShadow: '0 2px 8px rgba(255,0,127,0.5)',
                            zIndex: 5
                        }}>
                            {selectionIndex + 1}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
