import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { Users, Crown } from 'lucide-react';

const mockPlayers = [
    { id: 1, name: 'Toi', isHost: true },
    { id: 2, name: 'Jean-Mich', isHost: false },
    { id: 3, name: 'La Grosse', isHost: false },
    { id: 4, name: 'Victime', isHost: false }
];

const Lobby = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const roomCode = location.state?.code || 'WTF?';
    const isHost = location.state?.isHost ?? true;

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '40px 20px',
            minHeight: '100vh',
            maxWidth: '600px',
            margin: '0 auto'
        }}>
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ textAlign: 'center', marginBottom: '40px' }}
            >
                <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '10px' }}>CODE DU SALON</div>
                <div className="text-glow" style={{
                    fontSize: '4rem',
                    fontWeight: '900',
                    letterSpacing: '8px',
                    padding: '10px 40px',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {roomCode}
                </div>
            </motion.div>

            <div style={{ width: '100%', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--text-muted)' }}>
                    <Users size={24} />
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>JOUEURS ({mockPlayers.length}/8)</h2>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                    {mockPlayers.map(player => (
                        <motion.div
                            key={player.id}
                            variants={itemVariants}
                            className="glass"
                            style={{
                                padding: '20px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderLeft: player.isHost ? '4px solid var(--accent-neon)' : '4px solid transparent'
                            }}
                        >
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{player.name}</span>
                            {player.isHost && <Crown size={20} color="var(--accent-neon)" />}
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ width: '100%', marginTop: '40px' }}
            >
                <Button
                    variant="primary"
                    onClick={() => navigate('/game')}
                    style={{ padding: '20px', fontSize: '1.4rem' }}
                >
                    {isHost ? 'LANCER LA PARTIE' : 'EN ATTENTE DE L\'HÔTE...'}
                </Button>
            </motion.div>
        </div>
    );
};

export default Lobby;
