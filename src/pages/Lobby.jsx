import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost, Cat, Dog, Skull, Bot, Bird, Rabbit, Snail, ArrowLeft, Menu, Plus, Copy, Check, X } from 'lucide-react';
import QRCode from 'react-qr-code';
import MenuOverlay from '../components/MenuOverlay';
import { playBop } from '../utils/audio';
import useRoom from '../hooks/useRoom';

const iconMap = [Ghost, Cat, Dog, Skull, Bot, Bird, Rabbit, Snail];
const colors = ['#00f0ff', '#ff007f', '#8a2be2', '#f59e0b', '#10b981', '#ff6b35', '#c084fc', '#22d3ee'];

const Lobby = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const roomCode = location.state?.code || 'XXXX';
    const isHostFromState = location.state?.isHost ?? true;
    const inviteLink = `${window.location.origin}?code=${roomCode}`;

    const {
        players, gameState, playerId, isHost,
        joinRoom, toggleReady, startGame, leaveRoom
    } = useRoom();

    // Join the room if we came from Home (already joined in Home for host)
    useEffect(() => {
        // If we're not the host, we already joined in Home. But listen again:
        if (!isHostFromState) {
            joinRoom(roomCode);
        } else {
            // Host already created the room, just re-listen
            joinRoom(roomCode);
        }
    }, []);

    const handleCopy = () => {
        playBop();
        navigator.clipboard.writeText(inviteLink).catch(() => { });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleStart = async () => {
        playBop();
        await startGame();
        navigate('/game', { state: { code: roomCode } });
    };

    const handleLeave = async () => {
        playBop();
        await leaveRoom();
        navigate('/');
    };

    const playerList = Object.entries(players).map(([id, data], idx) => ({
        id,
        ...data,
        color: colors[idx % colors.length],
        icon: iconMap[idx % iconMap.length]
    }));

    const readyCount = playerList.filter(p => p.ready).length;
    const canStart = isHostFromState && playerList.length >= 2 && readyCount === playerList.length;

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };
    const itemVariants = {
        hidden: { scale: 0.8, y: 20, opacity: 0 },
        show: { scale: 1, y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    // If game started by host, navigate everyone to game
    useEffect(() => {
        if (gameState?.phase && gameState.phase !== 'LOBBY') {
            navigate('/game', { state: { code: roomCode } });
        }
    }, [gameState?.phase]);

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '20px', height: '100%', width: '100%',
            overflow: 'hidden', maxWidth: '600px', margin: '0 auto', position: 'relative'
        }}>
            <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

            {/* Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '15px', flexShrink: 0 }}>
                <div
                    className="glass-panel" onClick={handleLeave}
                    style={{ padding: '10px', borderRadius: '12px', display: 'flex', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    <ArrowLeft color="var(--text-main)" size={24} />
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    SALON D'ATTENTE
                </div>
                <div
                    className="glass-panel" onClick={() => { playBop(); setIsMenuOpen(true); }}
                    style={{ padding: '10px', borderRadius: '12px', display: 'flex', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    <Menu color="var(--text-main)" size={24} />
                </div>
            </div>

            {/* Room Code */}
            <motion.div
                initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="glass-panel"
                style={{ width: '100%', padding: '16px', borderRadius: '16px', textAlign: 'center', marginBottom: '15px', flexShrink: 0, boxShadow: '0 0 20px rgba(0, 240, 255, 0.1)' }}
            >
                <div className="lobby-code-title" style={{ fontSize: '1.5rem', fontWeight: '900', display: 'flex', justifyContent: 'center', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span>CODE :</span>
                    <span className="text-glow-pink lobby-code-value" style={{ color: 'var(--accent-pink)', letterSpacing: '4px' }}>
                        {roomCode}
                    </span>
                </div>
            </motion.div>

            {/* Players Grid */}
            <div style={{ flex: 1, width: '100%', overflowY: 'auto', paddingBottom: '10px' }}>
                <motion.div variants={containerVariants} initial="hidden" animate="show"
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}
                >
                    <AnimatePresence>
                        {playerList.map((player) => {
                            const Icon = player.icon;
                            const isMe = player.id === playerId;
                            return (
                                <motion.div
                                    layout key={player.id} variants={itemVariants}
                                    initial="hidden" animate="show" exit="hidden"
                                    className="glass-panel"
                                    onClick={isMe ? () => { playBop(); toggleReady(); } : undefined}
                                    style={{
                                        padding: '18px 10px', borderRadius: '16px',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        border: isMe ? '1px solid var(--accent-cyan)' : '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: isMe ? '0 0 15px rgba(0, 240, 255, 0.2) inset' : 'none',
                                        cursor: isMe ? 'pointer' : 'default'
                                    }}
                                >
                                    <div style={{
                                        width: '55px', height: '55px', borderRadius: '50%',
                                        background: player.avatar ? `url(${player.avatar}) center/cover` : 'rgba(255,255,255,0.05)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
                                        border: `2px solid ${player.color}`, boxShadow: `0 0 10px ${player.color}40`,
                                        overflow: 'hidden'
                                    }}>
                                        {!player.avatar && <Icon size={28} color={player.color} />}
                                    </div>

                                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '8px', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {player.name} {isMe && '(toi)'}
                                    </span>

                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.65rem',
                                        color: player.ready ? '#10b981' : 'var(--text-muted)'
                                    }}>
                                        <div style={{
                                            width: '7px', height: '7px', borderRadius: '50%',
                                            backgroundColor: player.ready ? '#10b981' : 'var(--text-muted)',
                                            boxShadow: player.ready ? '0 0 8px #10b981' : 'none'
                                        }} />
                                        {player.ready ? 'PRÊT' : 'EN ATTENTE'}
                                    </div>

                                    {!player.online && (
                                        <div style={{ fontSize: '0.55rem', color: '#ff4444', marginTop: '4px' }}>DÉCONNECTÉ</div>
                                    )}
                                </motion.div>
                            );
                        })}

                        {/* Invite Slot */}
                        <motion.div
                            layout variants={itemVariants} initial="hidden" animate="show"
                            onClick={() => { playBop(); setIsInviteOpen(true); }}
                            style={{
                                padding: '18px 10px', borderRadius: '16px',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                border: '1px dashed rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.02)',
                                cursor: 'pointer'
                            }}
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                        >
                            <div style={{
                                width: '55px', height: '55px', borderRadius: '50%',
                                background: 'rgba(255,0,127,0.1)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', marginBottom: '12px'
                            }}>
                                <Plus size={28} color="var(--accent-pink)" />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>INVITER</span>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Footer */}
            <motion.div
                initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', flexShrink: 0, paddingTop: '10px' }}
            >
                {isHostFromState ? (
                    <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className="btn-pink lobby-bottom-btn"
                        onClick={handleStart}
                        disabled={!canStart}
                        style={{
                            width: '100%', padding: '18px', borderRadius: '40px', fontSize: '1.3rem',
                            fontWeight: '900', textTransform: 'uppercase', cursor: canStart ? 'pointer' : 'not-allowed',
                            opacity: canStart ? 1 : 0.5
                        }}
                    >
                        LANCER LA PARTIE
                    </motion.button>
                ) : (
                    <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => { playBop(); toggleReady(); }}
                        style={{
                            width: '100%', padding: '18px', borderRadius: '40px', fontSize: '1.3rem',
                            fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer',
                            background: players[playerId]?.ready
                                ? 'linear-gradient(135deg, rgba(16,185,129,0.4), rgba(16,185,129,0.1))'
                                : 'linear-gradient(135deg, rgba(255,0,127,0.4), rgba(255,0,127,0.1))',
                            border: players[playerId]?.ready
                                ? '1px solid rgba(16,185,129,0.5)'
                                : '1px solid rgba(255,0,127,0.5)',
                            color: '#fff'
                        }}
                    >
                        {players[playerId]?.ready ? '✓ PRÊT !' : 'JE SUIS PRÊT'}
                    </motion.button>
                )}
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '1px' }}>
                    {readyCount} / {playerList.length} JOUEURS PRÊTS (MIN. 2)
                </div>
            </motion.div>

            {/* Invite Modal */}
            <AnimatePresence>
                {isInviteOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px'
                        }}
                        onClick={() => { playBop(); setIsInviteOpen(false); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="glass-panel"
                            style={{ width: '100%', maxWidth: '350px', padding: '25px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: '900', margin: 0, color: 'var(--accent-cyan)' }}>
                                    INVITER DES AMIS
                                </h2>
                                <X size={22} color="var(--text-muted)" onClick={() => setIsInviteOpen(false)} style={{ cursor: 'pointer' }} />
                            </div>

                            <div style={{ background: '#fff', padding: '12px', borderRadius: '16px', display: 'flex', justifyContent: 'center' }}>
                                <QRCode value={inviteLink} size={150} fgColor="#12141a" />
                            </div>

                            <div style={{ textAlign: 'center', width: '100%' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 'bold' }}>CODE DU SALON</div>
                                <div style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', letterSpacing: '6px' }}>{roomCode}</div>
                            </div>

                            <button
                                onClick={handleCopy}
                                style={{
                                    width: '100%', padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    background: copied ? '#10b981' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                                    color: '#fff', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease'
                                }}
                            >
                                {copied ? <><Check size={18} /> LIEN COPIÉ !</> : <><Copy size={18} /> COPIER LE LIEN</>}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Lobby;
