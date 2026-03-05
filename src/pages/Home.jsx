import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Users, Layers, Menu, User, ScanLine, X } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import MenuOverlay from '../components/MenuOverlay';
import useRoom from '../hooks/useRoom';

const Home = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [joinError, setJoinError] = useState('');
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const scannerRef = useRef(null);
    const scannerInstanceRef = useRef(null);
    const { createRoom, joinRoom } = useRoom();

    // Auto-join from URL parameter ?code=XXXX
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlCode = params.get('code');
        if (urlCode && urlCode.length >= 4) {
            const cleanCode = urlCode.toUpperCase().slice(0, 4);
            setCode(cleanCode);
            // Auto-join after a short delay for UX
            setTimeout(async () => {
                setLoading(true);
                const success = await joinRoom(cleanCode);
                setLoading(false);
                if (success) {
                    // Clean URL
                    window.history.replaceState({}, '', window.location.pathname);
                    navigate('/lobby', { state: { code: cleanCode, isHost: false } });
                } else {
                    setJoinError('Room introuvable ou partie déjà commencée');
                }
            }, 500);
        }
    }, []);

    const handleCreate = async () => {
        setLoading(true);
        const roomCode = await createRoom();
        setLoading(false);
        if (roomCode) {
            navigate('/lobby', { state: { code: roomCode, isHost: true } });
        }
    };

    const handleJoin = async (joinCode) => {
        const c = joinCode || code;
        if (c.length < 4) return;
        setLoading(true);
        setJoinError('');
        const success = await joinRoom(c);
        setLoading(false);
        if (success) {
            navigate('/lobby', { state: { code: c.toUpperCase(), isHost: false } });
        } else {
            setJoinError('Room introuvable ou partie déjà commencée');
        }
    };

    // QR Scanner logic
    const extractCodeFromScan = (decodedText) => {
        // Try to extract ?code=XXXX from URL
        try {
            const url = new URL(decodedText);
            const codeParam = url.searchParams.get('code');
            if (codeParam && codeParam.length >= 4) return codeParam.toUpperCase();
        } catch {
            // Not a URL — try raw code
        }
        // If raw 4-char code
        if (decodedText.length >= 4) return decodedText.trim().toUpperCase().slice(0, 4);
        return null;
    };

    const openScanner = () => {
        setIsScannerOpen(true);
    };

    const closeScanner = () => {
        if (scannerInstanceRef.current) {
            scannerInstanceRef.current.stop().catch(() => { });
            scannerInstanceRef.current = null;
        }
        setIsScannerOpen(false);
    };

    useEffect(() => {
        if (isScannerOpen && scannerRef.current) {
            const html5QrCode = new Html5Qrcode("qr-reader");
            scannerInstanceRef.current = html5QrCode;

            html5QrCode.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 220, height: 220 } },
                (decodedText) => {
                    const extractedCode = extractCodeFromScan(decodedText);
                    if (extractedCode) {
                        html5QrCode.stop().catch(() => { });
                        scannerInstanceRef.current = null;
                        setIsScannerOpen(false);
                        setCode(extractedCode);
                        // Auto-join
                        handleJoin(extractedCode);
                    }
                },
                () => { } // ignore errors (no QR found in frame)
            ).catch((err) => {
                console.error("QR Scanner error:", err);
                setJoinError("Impossible d'accéder à la caméra");
                setIsScannerOpen(false);
            });
        }

        return () => {
            if (scannerInstanceRef.current) {
                scannerInstanceRef.current.stop().catch(() => { });
                scannerInstanceRef.current = null;
            }
        };
    }, [isScannerOpen]);

    const profileImage = localStorage.getItem('profile_image') || null;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            height: '100%',
            width: '100%',
            overflow: 'hidden',
            padding: '8px 20px',
            maxWidth: '500px',
            margin: '0 auto',
            fontFamily: "'Inter', sans-serif"
        }}>
            <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

            {/* Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', flexShrink: 0 }}>
                <Menu onClick={() => setIsMenuOpen(true)} color="var(--text-main)" size={28} style={{ cursor: 'pointer' }} />

                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                    <h1 className="home-title" style={{
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
                        width: '40px', height: '40px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        border: '1px solid rgba(0, 229, 255, 0.4)',
                        background: profileImage ? `url(${profileImage}) center/cover` : '#161923',
                        boxShadow: '0 0 15px rgba(0, 229, 255, 0.15)',
                        overflow: 'hidden'
                    }}
                >
                    {!profileImage && <User color="var(--accent-cyan)" size={22} />}
                </div>
            </div>

            {/* Header Text */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{ textAlign: 'center', flexShrink: 0 }}
            >
                <h2 className="home-subtitle" style={{ fontWeight: '800', marginBottom: '4px', fontSize: '1.1rem' }}>
                    Prêt à afficher tes potes ?
                </h2>
                <p className="home-desc" style={{ color: 'var(--text-muted)', lineHeight: '1.3', fontSize: '0.75rem' }}>
                    Le jeu d'humour noir pour les gens irrécupérables
                </p>
            </motion.div>

            {/* Glowing Card Centerpiece */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="hero-card-container"
                style={{ position: 'relative', flex: '0 0 auto', width: '140px', height: '180px' }}
            >
                {/* Pink outline (bottom right) */}
                <div style={{
                    position: 'absolute', top: '10px', left: '10px', width: '100%', height: '100%',
                    borderRadius: '16px', border: '2px solid rgba(255, 0, 127, 0.6)',
                    boxShadow: '0 0 20px rgba(255, 0, 127, 0.4)',
                    zIndex: 0
                }} />

                {/* Cyan outline (top left) */}
                <div style={{
                    position: 'absolute', top: '-10px', left: '-10px', width: '100%', height: '100%',
                    borderRadius: '16px', border: '2px solid rgba(0, 229, 255, 0.6)',
                    boxShadow: '0 0 20px rgba(0, 229, 255, 0.4)',
                    zIndex: 1
                }} />

                {/* Main Front Card (Dark solid center, glass edge) */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '20px', border: '2px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.9)', zIndex: 2,
                    background: 'linear-gradient(135deg, rgba(30, 34, 43, 0.95) 0%, rgba(20, 23, 28, 0.95) 100%)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)'
                }}>
                    <span className="hero-card-text" style={{
                        fontWeight: '900',
                        color: '#fff',
                        fontSize: '1rem',
                        letterSpacing: '2px',
                        lineHeight: '1.2',
                        textAlign: 'center'
                    }}>
                        CARTES<br />POUR<br />GENS<br />ATROCES
                    </span>
                    <span className="hero-card-badge" style={{
                        color: 'rgba(255,255,255,0.6)',
                        position: 'absolute',
                        bottom: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        fontWeight: 'bold',
                        fontSize: '0.5rem'
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
                    padding: '16px',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '12px',
                    boxShadow: '0 15px 40px rgba(0,0,0,0.5)',
                    flexShrink: 0
                }}
            >
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreate}
                    style={{
                        width: '100%', padding: '14px', borderRadius: '12px',
                        fontWeight: '800', fontSize: '1rem', cursor: loading ? 'wait' : 'pointer',
                        opacity: loading ? 0.6 : 1,
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
                    {loading ? 'CRÉATION...' : 'CRÉER UNE PARTIE'}
                </motion.button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '2px 0' }}>
                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,0,127,0.4), transparent)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-pink)', boxShadow: '0 0 8px var(--accent-pink)' }} />
                        <span style={{
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: '0.65rem',
                            letterSpacing: '3px',
                            fontWeight: '800',
                            textTransform: 'uppercase'
                        }}>
                            OU REJOINDRE
                        </span>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-pink)', boxShadow: '0 0 8px var(--accent-pink)' }} />
                    </div>
                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,0,127,0.4), transparent)' }} />
                </div>

                <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '8px', marginLeft: '5px' }}>
                        Entrer le code à 4 lettres
                    </div>
                    <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                        <input
                            placeholder="A 2 B 7"
                            maxLength={4}
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            style={{
                                flex: 1,
                                minWidth: 0,
                                background: '#161923',
                                border: '1px solid #332130',
                                borderRadius: '12px',
                                color: 'white',
                                padding: '14px 15px',
                                fontSize: '1.1rem',
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
                            onClick={() => handleJoin()}
                            disabled={code.length < 4}
                            style={{
                                flexShrink: 0,
                                padding: '14px 20px',
                                borderRadius: '12px',
                                fontWeight: '800',
                                fontSize: '0.8rem',
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

                    {/* QR Scanner Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={openScanner}
                        style={{
                            width: '100%', marginTop: '10px', padding: '12px',
                            borderRadius: '12px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: '8px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'var(--accent-cyan)', fontSize: '0.8rem',
                            fontWeight: '700', cursor: 'pointer', letterSpacing: '1px',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <ScanLine size={18} />
                        SCANNER UN QR CODE
                    </motion.button>

                    {joinError && (
                        <div style={{ color: '#ff4444', fontSize: '0.7rem', marginTop: '6px', textAlign: 'center' }}>
                            {joinError}
                        </div>
                    )}
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
                    marginTop: '0px',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                    flexShrink: 0
                }}
            >
                <h3 style={{ textAlign: 'center', fontSize: '0.7rem', marginBottom: '10px', letterSpacing: '1px', fontWeight: 'bold' }}>COMMENT ÇA MARCHE</h3>
                <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', width: '100%' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Share2 color="var(--accent-cyan)" size={18} />
                        </div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 'bold', marginTop: '2px' }}>1. Créer</div>
                        <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>Partagez code</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(157,0,255,0.1)', border: '1px solid rgba(157,0,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users color="var(--accent-purple)" size={18} />
                        </div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 'bold', marginTop: '2px' }}>2. Les potes</div>
                        <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>Entrez code</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,0,127,0.1)', border: '1px solid rgba(255,0,127,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Layers color="var(--accent-pink)" size={18} />
                        </div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 'bold', marginTop: '2px' }}>3. Jouez</div>
                        <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>Lâchez-vous</div>
                    </div>
                </div>
            </motion.div>

            {/* QR Scanner Modal */}
            <AnimatePresence>
                {isScannerOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                            background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            zIndex: 200, padding: '20px'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            style={{
                                width: '100%', maxWidth: '350px', display: 'flex', flexDirection: 'column',
                                alignItems: 'center', gap: '20px'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--accent-cyan)', letterSpacing: '1px' }}>
                                    SCANNER QR CODE
                                </h2>
                                <X size={24} color="var(--text-muted)" onClick={closeScanner} style={{ cursor: 'pointer' }} />
                            </div>

                            <div
                                ref={scannerRef}
                                id="qr-reader"
                                style={{
                                    width: '100%', maxWidth: '300px', borderRadius: '16px',
                                    overflow: 'hidden', border: '2px solid rgba(0, 229, 255, 0.3)',
                                    boxShadow: '0 0 30px rgba(0, 229, 255, 0.15)'
                                }}
                            />

                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>
                                Dirigez la caméra vers le QR code d'invitation
                            </p>

                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={closeScanner}
                                style={{
                                    padding: '12px 30px', borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                                    color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem'
                                }}
                            >
                                ANNULER
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default Home;
