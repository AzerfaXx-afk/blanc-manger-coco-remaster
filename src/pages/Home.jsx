import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Skull } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState('');

    const handleCreate = () => {
        navigate('/lobby', { state: { code: 'XD42', isHost: true } });
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
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px'
        }}>
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ textAlign: 'center', marginBottom: '60px' }}
            >
                <Skull size={80} color="var(--accent-red)" style={{ marginBottom: '20px', filter: 'drop-shadow(0 0 10px rgba(225,29,72,0.5))' }} />
                <h1 className="text-glow" style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '10px' }}>
                    AU FOND<br />DU TROU
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Le jeu pour tes potes horribles.</p>
            </motion.div>

            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="glass"
                style={{
                    padding: '40px',
                    borderRadius: '24px',
                    width: '100%',
                    maxWidth: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px'
                }}
            >
                <Button onClick={handleCreate} variant="primary">
                    CRÉER UNE PARTIE
                </Button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                    <span>OU</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Input
                        placeholder="CODE"
                        maxLength={4}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                    <Button onClick={handleJoin} variant="secondary" disabled={code.length < 4}>
                        REJOINDRE
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

export default Home;
