import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, UserPlus, PlaySquare, Trophy } from 'lucide-react';

const Rules = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh', height: '100dvh',
            overflow: 'hidden', padding: '20px', maxWidth: '500px', margin: '0 auto', fontFamily: "'Inter', sans-serif"
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '20px' }}>
                <div
                    className="glass-panel" onClick={() => navigate(-1)}
                    style={{ padding: '10px', borderRadius: '12px', display: 'flex', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    <ArrowLeft color="var(--text-main)" size={24} />
                </div>
                <div style={{ fontWeight: '900', fontSize: '1.2rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                    RÈGLES DU JEU
                </div>
                <div style={{ width: '44px' }}></div>
            </div>

            {/* Scrollable Rules Content */}
            <div style={{
                width: '100%', flex: 1, overflowY: 'auto', paddingRight: '5px',
                display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px'
            }}>
                <div className="glass-panel" style={{ padding: '20px', borderRadius: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-cyan)', marginBottom: '10px' }}>
                        <BookOpen size={24} />
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900' }}>BUT DU JEU</h3>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                        Être le joueur avec le plus de mémorables (et horribles) associations de cartes. Un joueur lit une carte bleue (à trou) et les autres complètent avec leurs cartes blanches.
                    </p>
                </div>

                <div className="glass-panel" style={{ padding: '20px', borderRadius: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-pink)', marginBottom: '10px' }}>
                        <UserPlus size={24} />
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900' }}>PRÉPARATION</h3>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                        Rejoins un salon avec tes amis via le code de la partie. Au début de la partie, chacun pioche des cartes blanches dans sa main (normalement 3 ou plus, selon les options).
                    </p>
                </div>

                <div className="glass-panel" style={{ padding: '20px', borderRadius: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', marginBottom: '10px' }}>
                        <PlaySquare size={24} />
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900' }}>DÉROULEMENT</h3>
                    </div>
                    <ul style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
                        <li style={{ marginBottom: '8px' }}>Un <strong>Question Master</strong> est désigné au hasard (ou c'est celui qui a gagné le tour précédent).</li>
                        <li style={{ marginBottom: '8px' }}>Il lit la carte noire à voix haute.</li>
                        <li style={{ marginBottom: '8px' }}>Les autres joueurs choisissent secrètement la/les carte(s) blanche(s) de leur main pour combler les trous de la manière la plus drôle ou choquante.</li>
                        <li>Dès qu'on a joué, on repioche pour toujours avoir le ventre plein de cartes.</li>
                    </ul>
                </div>

                <div className="glass-panel" style={{ padding: '20px', borderRadius: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f59e0b', marginBottom: '10px' }}>
                        <Trophy size={24} />
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900' }}>RÉSOLUTION</h3>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                        Le Question Master lit toutes les propositions à voix haute (sans savoir qui a mis quoi) et choisit sa préférée. Le vainqueur remporte 1 point et devient le prochain Question Master !
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Rules;
