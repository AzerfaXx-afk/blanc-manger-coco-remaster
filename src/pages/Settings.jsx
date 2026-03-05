import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Volume2, VolumeX, Music, Music2 } from 'lucide-react';
import {
    getMusicVolume, getSfxVolume,
    isMusicMuted, isSfxMuted,
    setMusicVolume as setMusicVol,
    setSfxVolume as setSfxVol,
    setMusicMuted, setSfxMuted,
    startMusic, stopMusic,
    playBop
} from '../utils/audio';

const Settings = () => {
    const navigate = useNavigate();
    const [fxVolume, setFxVolume] = useState(getSfxVolume());
    const [musicVolume, setMusicVolume] = useState(getMusicVolume());
    const [musicMuted, setMusicMutedLocal] = useState(isMusicMuted());
    const [sfxMuted, setSfxMutedLocal] = useState(isSfxMuted());

    const handleFxChange = (val) => {
        setFxVolume(val);
        setSfxVol(val);
    };

    const handleMusicChange = (val) => {
        setMusicVolume(val);
        setMusicVol(val);
    };

    const toggleMusicMute = () => {
        const newVal = !musicMuted;
        setMusicMutedLocal(newVal);
        setMusicMuted(newVal);
        if (newVal) {
            stopMusic();
        } else {
            startMusic();
        }
    };

    const toggleSfxMute = () => {
        const newVal = !sfxMuted;
        setSfxMutedLocal(newVal);
        setSfxMuted(newVal);
        if (!newVal) playBop();
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%',
            overflow: 'hidden', padding: '20px', maxWidth: '500px', margin: '0 auto', fontFamily: "'Inter', sans-serif"
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '30px', flexShrink: 0 }}>
                <div
                    className="glass-panel" onClick={() => navigate(-1)}
                    style={{ padding: '10px', borderRadius: '12px', display: 'flex', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    <ArrowLeft color="var(--text-main)" size={24} />
                </div>
                <div style={{ fontWeight: '900', fontSize: '1.2rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                    PARAMÈTRES
                </div>
                <div style={{ width: '44px' }}></div>
            </div>

            {/* Content */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>

                {/* SFX Volume */}
                <div className="glass-panel" style={{ padding: '20px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-cyan)' }}>
                            <Volume2 size={22} />
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>Effets Sonores</h3>
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleSfxMute}
                            style={{
                                background: sfxMuted ? 'rgba(255,0,0,0.2)' : 'rgba(0,229,255,0.2)',
                                border: sfxMuted ? '1px solid rgba(255,0,0,0.4)' : '1px solid rgba(0,229,255,0.4)',
                                borderRadius: '12px', padding: '8px 14px', cursor: 'pointer',
                                color: '#fff', fontWeight: '700', fontSize: '0.75rem',
                                display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                        >
                            {sfxMuted ? <><VolumeX size={16} /> MUET</> : <><Volume2 size={16} /> ACTIF</>}
                        </motion.button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: sfxMuted ? 0.4 : 1 }}>
                        <input
                            type="range" min="0" max="100" value={fxVolume}
                            onChange={(e) => handleFxChange(parseInt(e.target.value))}
                            disabled={sfxMuted}
                            style={{ flex: 1, accentColor: 'var(--accent-cyan)', height: '6px' }}
                        />
                        <span style={{ color: '#fff', fontWeight: 'bold', width: '40px', textAlign: 'right', fontSize: '0.9rem' }}>{fxVolume}%</span>
                    </div>
                </div>

                {/* Music Volume */}
                <div className="glass-panel" style={{ padding: '20px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-pink)' }}>
                            <Music size={22} />
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>Musique</h3>
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleMusicMute}
                            style={{
                                background: musicMuted ? 'rgba(255,0,0,0.2)' : 'rgba(255,0,127,0.2)',
                                border: musicMuted ? '1px solid rgba(255,0,0,0.4)' : '1px solid rgba(255,0,127,0.4)',
                                borderRadius: '12px', padding: '8px 14px', cursor: 'pointer',
                                color: '#fff', fontWeight: '700', fontSize: '0.75rem',
                                display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                        >
                            {musicMuted ? <><Music2 size={16} /> MUET</> : <><Music size={16} /> ACTIF</>}
                        </motion.button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: musicMuted ? 0.4 : 1 }}>
                        <input
                            type="range" min="0" max="100" value={musicVolume}
                            onChange={(e) => handleMusicChange(parseInt(e.target.value))}
                            disabled={musicMuted}
                            style={{ flex: 1, accentColor: 'var(--accent-pink)', height: '6px' }}
                        />
                        <span style={{ color: '#fff', fontWeight: 'bold', width: '40px', textAlign: 'right', fontSize: '0.9rem' }}>{musicVolume}%</span>
                    </div>
                </div>

                {/* Info */}
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '10px', lineHeight: '1.5' }}>
                    Les réglages sont sauvegardés automatiquement.
                </div>
            </div>
        </div>
    );
};

export default Settings;
