import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Share2, Users, Layers, Menu, User } from 'lucide-react';
import MenuOverlay from '../components/MenuOverlay';

const Home = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleCreate = () => {
        navigate('/lobby', { state: { code: 'A2B7', isHost: true } });
    };

    const handleJoin = () => {
        if (code.length >= 4) {
            navigate('/lobby', { state: { code: code.toUpperCase(), isHost: false } });
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100vh',
            height: '100dvh',
            overflow: 'hidden',
            padding: '15px 20px',
            maxWidth: '500px',
            margin: '0 auto',
            fontFamily: "'Inter', sans-serif"
        }}>
            <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

            {/* Top Bar matching mockup */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '30px' }}>
                <Menu onClick={() => setIsMenuOpen(true)} color="var(--text-main)" size={28} style={{ cursor: 'pointer' }} />

                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                    <h1 style={{
                        fontSize: '1.8rem',
                        fontWeight: '900',
                        lineHeight: '1',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        margin: 0
                    }}>
                        <span style={{ color: 'var(--accent-cyan)' }}>AU FOND</span><br />
                        <span style={{ color: 'var(--accent-pink)' }}>DU TROU</span>
                    </h1>
                    <span style={{ fontSize: '0.6rem', letterSpacing: '2px', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase' }}>Jeu de Soirée</span>
                </div>

                <div
                    onClick={() => navigate('/profile')}
                    style={{
                        padding: '8px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        border: '1px solid rgba(0, 229, 255, 0.4)',
                        background: '#161923',
                        boxShadow: '0 0 15px rgba(0, 229, 255, 0.15)'
                    }}
                >
                    <User color="var(--accent-cyan)" size={24} />
                </div>
            </div>

            {/* Header Text */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{ textAlign: 'center', marginBottom: '25px', marginTop: '10px' }}
            >
                <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '10px' }}>
                    Prêt à afficher tes potes ?
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                    Le jeu d'humour noir pour les gens irrécupérables
                </p>
            </motion.div>

            {/* Glowing Card Centerpiece */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{ position: 'relative', flex: '0 1 280px', width: '210px', marginBottom: '35px', marginTop: '10px' }}
            >
                {/* Pink outline (bottom right) */}
                <div style={{
                    position: 'absolute', top: '15px', left: '15px', width: '100%', height: '100%',
                    borderRadius: '16px', border: '2px solid rgba(255, 0, 127, 0.6)',
                    boxShadow: '0 0 25px rgba(255, 0, 127, 0.5), inset 0 0 15px rgba(255, 0, 127, 0.3)',
                    zIndex: 0
                }} />

                {/* Cyan outline (top left) */}
                <div style={{
                    position: 'absolute', top: '-15px', left: '-15px', width: '100%', height: '100%',
                    borderRadius: '16px', border: '2px solid rgba(0, 229, 255, 0.6)',
                    boxShadow: '0 0 25px rgba(0, 229, 255, 0.5), inset 0 0 15px rgba(0, 229, 255, 0.3)',
                    zIndex: 1
                }} />

                {/* Main Front Card (Dark solid center, glass edge) */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '24px', border: '2px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.9)', zIndex: 2,
                    background: 'linear-gradient(135deg, rgba(30, 34, 43, 0.95) 0%, rgba(20, 23, 28, 0.95) 100%)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)'
                }}>
                    <span style={{
                        fontWeight: '900',
                        fontSize: '1.7rem',
                        color: '#fff',
                        letterSpacing: '2px',
                        lineHeight: '1.4',
                        textAlign: 'center'
                    }}>
                        CARTES<br />POUR<br />GENS<br />ATROCES
                    </span>
                    <span style={{
                        fontSize: '0.75rem',
                        color: 'rgba(255,255,255,0.6)',
                        position: 'absolute',
                        bottom: '30px',
                        textTransform: 'uppercase',
                        letterSpacing: '3px',
                        fontWeight: 'bold'
                    }}>
                        18+ SEULEMENT
                    </span>

                    {/* Inner glowing border effect to mimic thick glass bevel */}
                    <div style={{
                        position: 'absolute', top: '2px', left: '2px', right: '2px', bottom: '2px',
                        borderRadius: '13px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        pointerEvents: 'none'
                    }} />
                </div>
            </motion.div>

            {/* Actions Panel */}
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="glass-panel"
                style={{
                    width: '100%',
                    padding: '24px',
                    borderRadius: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '20px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    flex: '1 0 auto'
                }}
            >
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreate}
                    style={{
                        width: '100%', padding: '16px', borderRadius: '12px',
                        fontWeight: '800', fontSize: '1.2rem', cursor: 'pointer',
                        textTransform: 'uppercase', letterSpacing: '1px',
                        background: 'linear-gradient(180deg, rgba(20, 80, 100, 0.6) 0%, rgba(15, 30, 40, 0.8) 100%)',
                        border: '1px solid rgba(0, 229, 255, 0.4)',
                        borderTop: '1px solid rgba(0, 229, 255, 0.8)',
                        boxShadow: '0 10px 30px rgba(0, 229, 255, 0.2), inset 0 2px 10px rgba(255, 255, 255, 0.1)',
                        color: '#fff',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)'
                    }}
                >
                    CRÉER UNE PARTIE
                </motion.button>

                <div style={{ position: 'relative', textAlign: 'center', margin: '0' }}>
                    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>
                    <span style={{
                        background: '#161923',
                        padding: '0 15px',
                        color: 'rgba(255,255,255,0.4)',
                        fontSize: '0.75rem',
                        letterSpacing: '2px',
                        position: 'relative',
                        fontWeight: 'bold'
                    }}>
                        OU REJOINDRE
                    </span>
                </div>

                <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '8px', marginLeft: '5px' }}>
                        Entrer le code à 4 lettres
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            placeholder="A 2 B 7"
                            maxLength={4}
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            style={{
                                flex: 2,
                                background: '#161923',
                                border: '1px solid #332130',
                                borderRadius: '12px',
                                color: 'white',
                                padding: '0 20px',
                                fontSize: '1.2rem',
                                textTransform: 'uppercase',
                                outline: 'none',
                                letterSpacing: '4px',
                                transition: 'border 0.2s ease',
                                boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.3)'
                            }}
                            onFocus={(e) => e.target.style.border = '1px solid var(--accent-pink)'}
                            onBlur={(e) => e.target.style.border = '1px solid #332130'}
                        />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleJoin}
                            disabled={code.length < 4}
                            style={{
                                flex: 1,
                                padding: '16px 0',
                                borderRadius: '12px',
                                fontWeight: '800',
                                fontSize: '0.9rem',
                                cursor: code.length < 4 ? 'not-allowed' : 'pointer',
                                opacity: code.length < 4 ? 0.5 : 1,
                                textTransform: 'uppercase',
                                background: '#1c151e',
                                border: '1px solid #4a1c32',
                                color: 'rgba(255,255,255,0.7)',
                                boxShadow: '0 4px 15px rgba(255, 0, 127, 0.1)'
                            }}
                        >
                            REJOINDRE
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* How it works Panel */}
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="glass-panel"
                style={{
                    width: '100%',
                    marginTop: '25px',
                    marginBottom: '10px',
                    padding: '20px',
                    borderRadius: '20px',
                    boxShadow: '0 15px 40px rgba(0,0,0,0.4)'
                }}
            >
                <h3 style={{ textAlign: 'center', fontSize: '0.85rem', marginBottom: '20px', letterSpacing: '1px', fontWeight: 'bold' }}>COMMENT ÇA MARCHE</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '30%' }}>
                        <Share2 color="var(--accent-cyan)" size={24} />
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>1. Créer salon</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Partagez le code</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '30%' }}>
                        <Users color="var(--accent-purple)" size={24} />
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>2. Les potes ici</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Entrez le code</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '30%' }}>
                        <Layers color="var(--accent-pink)" size={24} />
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>3. Jouez vos cartes</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Mélangez le tout</div>
                    </div>
                </div>
            </motion.div>

        </div>
    );
};

export default Home;
