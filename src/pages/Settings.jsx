import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Volume2, Music } from 'lucide-react';

const Settings = () => {
    const navigate = useNavigate();
    const [fxVolume, setFxVolume] = useState(80);
    const [musicVolume, setMusicVolume] = useState(50);

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh', height: '100dvh',
            overflow: 'hidden', padding: '20px', maxWidth: '500px', margin: '0 auto', fontFamily: "'Inter', sans-serif"
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '30px' }}>
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
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '30px', flex: 1 }}>

                {/* FX Volume */}
                <div className="glass-panel" style={{ padding: '25px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-cyan)' }}>
                        <Volume2 size={24} />
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Effets Sonores (FX)</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <input
                            type="range" min="0" max="100" value={fxVolume}
                            onChange={(e) => setFxVolume(e.target.value)}
                            style={{ flex: 1, accentColor: 'var(--accent-cyan)' }}
                        />
                        <span style={{ color: '#fff', fontWeight: 'bold', width: '40px', textAlign: 'right' }}>{fxVolume}%</span>
                    </div>
                </div>

                {/* Music Volume */}
                <div className="glass-panel" style={{ padding: '25px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-pink)' }}>
                        <Music size={24} />
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Musique</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <input
                            type="range" min="0" max="100" value={musicVolume}
                            onChange={(e) => setMusicVolume(e.target.value)}
                            style={{ flex: 1, accentColor: 'var(--accent-pink)' }}
                        />
                        <span style={{ color: '#fff', fontWeight: 'bold', width: '40px', textAlign: 'right' }}>{musicVolume}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
