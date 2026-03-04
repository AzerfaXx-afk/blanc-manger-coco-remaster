import React from 'react';

export const Input = ({ className = '', ...props }) => {
    return (
        <input
            className={`glass ${className}`}
            style={{
                padding: '14px 20px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.2)',
                backgroundColor: 'rgba(0,0,0,0.4)',
                color: 'var(--text-main)',
                fontSize: '1.5rem',
                outline: 'none',
                width: '100%',
                textAlign: 'center',
                letterSpacing: '4px',
                textTransform: 'uppercase',
                transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent-neon)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
            {...props}
        />
    );
};
