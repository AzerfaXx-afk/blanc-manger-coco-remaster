import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost, Cat, Dog, Skull, Bot, Bird, Rabbit, Snail, ArrowLeft, Menu, Plus, Copy, Check, QrCode } from 'lucide-react';
import QRCode from 'react-qr-code';
import MenuOverlay from '../components/MenuOverlay';
import { playBop } from '../utils/audio';

const availableIcons = [Ghost, Cat, Dog, Skull, Bot, Bird, Rabbit, Snail];
const colors = ['#00f0ff', '#ff007f', '#8a2be2', '#f59e0b', '#10b981'];

const Lobby = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Invite Modal State
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const roomCode = location.state?.code || 'X7B9';
    const isHost = location.state?.isHost ?? true;
    const inviteLink = `https://blancmangecoco.app/join/${roomCode}`; // Mock URL

    // Get real pseudo and avatar from localStorage
    const myPseudo = localStorage.getItem('profile_pseudo') || 'Capitaine Zgueg';
    const myAvatar = localStorage.getItem('profile_image') || null;

    // Players state (starts empty except host)
    const [players, setPlayers] = useState([
        { id: 'me', name: myPseudo, icon: Ghost, ready: true, host: isHost, color: colors[0] }
    ]);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { scale: 0.8, y: 20, opacity: 0 },
        show: { scale: 1, y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    const readyCount = players.filter(p => p.ready).length;

    const handleCopy = () => {
        playBop();
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleInviteClick = () => {
        playBop();
        setIsInviteOpen(true);
    };

    const handleStart = () => {
        playBop();
        navigate('/game');
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px',
            height: '100vh', /* Fixed height */
            height: '100dvh',
            width: '100%',
            overflow: 'hidden', /* Prevent global scrolling */
            maxWidth: '600px',
            margin: '0 auto',
            position: 'relative'
        }}>
            <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

            {/* Top Bar with Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '20px' }}>
                <div
                    className="glass-panel"
                    onClick={() => { playBop(); navigate('/'); }}
                    style={{ padding: '10px', borderRadius: '12px', display: 'flex', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    <ArrowLeft color="var(--text-main)" size={24} />
                </div>

                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    SALON : LE CAFÉ
                </div>

                <div
                    className="glass-panel"
                    onClick={() => { playBop(); setIsMenuOpen(true); }}
                    style={{ padding: '10px', borderRadius: '12px', display: 'flex', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    <Menu color="var(--text-main)" size={24} />
                </div>
            </div>

            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="glass-panel"
                style={{
                    width: '100%',
                    padding: '20px',
                    borderRadius: '16px',
                    textAlign: 'center',
                    marginBottom: '20px',
                    boxShadow: '0 0 20px rgba(0, 240, 255, 0.1)'
                }}
            >
                <div className="lobby-code-title" style={{ fontSize: '2rem', fontWeight: '900', display: 'flex', justifyContent: 'center', gap: '15px' }}>
                    <span>CODE DU SALON :</span>
                    <span className="text-glow-pink lobby-code-value" style={{ color: 'var(--accent-pink)', letterSpacing: '4px' }}>
                        {roomCode}
                    </span>
                </div>
            </motion.div>

            {/* Grid - Scrollable internally, fitting the remaining space */}
            <div style={{
                flex: 1,
                width: '100%',
                overflowY: 'auto',
                paddingBottom: '20px',
                paddingRight: '5px' // For custom scrollbar
            }}>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                        gap: '15px'
                    }}
                >
                    <AnimatePresence>
                        {players.map((player) => {
                            const Icon = player.icon;
                            const iconColor = player.color;
                            return (
                                <motion.div
                                    layout
                                    key={player.id}
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="show"
                                    exit="hidden"
                                    className="glass-panel"
                                    style={{
                                        padding: '20px 10px',
                                        borderRadius: '16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: player.host ? '1px solid var(--accent-cyan)' : '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: player.host ? '0 0 15px rgba(0, 240, 255, 0.2) inset' : 'none'
                                    }}
                                >
                                    <div style={{
                                        width: '60px', height: '60px', borderRadius: '50%',
                                        background: (player.id === 'me' && myAvatar)
                                            ? `url(${myAvatar}) center/cover`
                                            : 'rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', marginBottom: '15px',
                                        border: `2px solid ${iconColor}`,
                                        boxShadow: `0 0 10px ${iconColor}40`,
                                        overflow: 'hidden'
                                    }}>
                                        {(player.id === 'me' && myAvatar) ? null : <Icon size={32} color={iconColor} />}
                                    </div>

                                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px', minHeight: '36px' }}>
                                        {player.name}
                                    </span>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: player.ready ? '#10b981' : 'var(--text-muted)' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: player.ready ? '#10b981' : 'var(--text-muted)', boxShadow: player.ready ? '0 0 8px #10b981' : 'none' }} />
                                        {player.ready ? 'PRÊT' : 'EN ATTENTE'}
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* Single Invite Slot */}
                        <motion.div
                            layout
                            variants={itemVariants}
                            initial="hidden"
                            animate="show"
                            onClick={handleInviteClick}
                            style={{
                                padding: '20px 10px',
                                borderRadius: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px dashed rgba(255,255,255,0.2)',
                                background: 'rgba(255,255,255,0.02)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px dashed var(--accent-pink)' }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div style={{
                                width: '60px', height: '60px', borderRadius: '50%',
                                background: 'rgba(255,0,127,0.1)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', marginBottom: '15px',
                            }}>
                                <Plus size={32} color="var(--accent-pink)" />
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', textAlign: 'center' }}>
                                INVITER
                            </span>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Footer / Actions */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}
            >
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-pink lobby-bottom-btn"
                    onClick={handleStart}
                    style={{ width: '100%', padding: '20px', borderRadius: '40px', fontSize: '1.5rem', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer' }}
                >
                    LANCER LA PARTIE
                </motion.button>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '1px' }}>
                    {readyCount} / {players.length} JOUEURS PRÊTS (MIN. 3)
                </div>
            </motion.div>

            {/* Invite Modal */}
            <AnimatePresence>
                {isInviteOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px'
                        }}
                        onClick={() => { playBop(); setIsInviteOpen(false); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="glass-panel"
                            style={{
                                width: '100%', maxWidth: '350px', padding: '30px', borderRadius: '24px',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px', position: 'relative'
                            }}
                        >
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0, color: 'var(--accent-cyan)' }}>
                                INVITER DES AMIS
                            </h2>

                            <div style={{
                                background: '#fff', padding: '15px', borderRadius: '16px', display: 'flex', justifyContent: 'center', width: '200px', height: '200px'
                            }}>
                                <QRCode value={inviteLink} size={170} fgColor="#12141a" />
                            </div>

                            <div style={{ textAlign: 'center', width: '100%' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 'bold' }}>CODE DU SALON</div>
                                <div style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', letterSpacing: '4px' }}>{roomCode}</div>
                            </div>

                            <button
                                onClick={handleCopy}
                                style={{
                                    width: '100%', padding: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                    background: copied ? '#10b981' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                                    color: '#fff', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease'
                                }}
                            >
                                {copied ? (
                                    <> <Check size={20} /> LIEN COPIÉ ! </>
                                ) : (
                                    <> <Copy size={20} /> COPIER LE LIEN </>
                                )}
                            </button>

                            <button
                                onClick={() => { playBop(); setIsInviteOpen(false); }}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline' }}>
                                Fermer
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Lobby;
