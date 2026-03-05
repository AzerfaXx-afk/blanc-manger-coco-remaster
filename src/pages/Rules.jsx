import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Users, Gamepad2, Crown, Sparkles, AlertTriangle } from 'lucide-react';

const rulesSections = [
    {
        icon: Zap,
        title: "C'EST QUOI CE JEU ?",
        color: 'var(--accent-cyan)',
        gradient: 'linear-gradient(135deg, rgba(0,229,255,0.15) 0%, rgba(0,229,255,0.03) 100%)',
        border: 'rgba(0,229,255,0.25)',
        content: "Un joueur lit une carte noire à trou. Les autres joueurs complètent avec leurs cartes blanches les plus drôles, absurdes ou choquantes. Le but ? Faire rire le Boss et récolter le plus de points."
    },
    {
        icon: Users,
        title: 'PRÉPARATION',
        color: 'var(--accent-pink)',
        gradient: 'linear-gradient(135deg, rgba(255,0,127,0.15) 0%, rgba(255,0,127,0.03) 100%)',
        border: 'rgba(255,0,127,0.25)',
        content: "Créez un salon et partagez le code à vos amis. Minimum 2 joueurs. Chaque joueur pioche 11 cartes blanches dans sa main au début de la partie."
    },
    {
        icon: Gamepad2,
        title: 'DÉROULEMENT',
        color: '#10b981',
        gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.03) 100%)',
        border: 'rgba(16,185,129,0.25)',
        steps: [
            "Une carte noire (question) apparaît pour tout le monde",
            "Retournez vos cartes blanches pour les lire",
            "Choisissez la carte la plus drôle en contexte",
            "Confirmez votre choix — pas de retour en arrière !",
            "Après avoir joué, vous repiochez automatiquement"
        ]
    },
    {
        icon: Crown,
        title: 'LE BOSS CHOISIT',
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.03) 100%)',
        border: 'rgba(245,158,11,0.25)',
        content: "Le Boss (l'hôte) retourne les cartes anonymes une par une, les lit à voix haute, et choisit sa préférée. Le vainqueur gagne 1 point. Le Boss change à chaque manche."
    },
    {
        icon: Sparkles,
        title: 'VICTOIRE',
        color: 'var(--accent-purple)',
        gradient: 'linear-gradient(135deg, rgba(157,0,255,0.15) 0%, rgba(157,0,255,0.03) 100%)',
        border: 'rgba(157,0,255,0.25)',
        content: "La partie continue tant que l'hôte le souhaite. Quand il termine, le podium final s'affiche avec les scores. Celui qui a le plus de points est couronné roi des gens atroces. 👑"
    }
];

const Rules = () => {
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } }
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100dvh',
            overflow: 'hidden', padding: '12px', maxWidth: '500px', margin: '0 auto',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Header */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', width: '100%',
                alignItems: 'center', marginBottom: '10px', flexShrink: 0
            }}>
                <motion.div
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="glass-panel" onClick={() => navigate(-1)}
                    style={{
                        padding: '10px', borderRadius: '12px', display: 'flex',
                        cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)'
                    }}
                >
                    <ArrowLeft color="var(--text-main)" size={24} />
                </motion.div>

                <div style={{ textAlign: 'center' }}>
                    <h1 style={{
                        fontWeight: '900', fontSize: '1.1rem', letterSpacing: '3px',
                        textTransform: 'uppercase', margin: 0
                    }}>
                        <span style={{ color: 'var(--accent-cyan)' }}>RÈGLES </span>
                        <span style={{ color: 'var(--accent-pink)' }}>DU JEU</span>
                    </h1>
                    <div style={{
                        fontSize: '0.5rem', color: 'var(--text-muted)', letterSpacing: '2px',
                        marginTop: '4px', textTransform: 'uppercase'
                    }}>
                        Au Fond Du Trou
                    </div>
                </div>

                <div style={{ width: '44px' }}></div>
            </div>

            {/* 18+ Warning Banner */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    width: '100%', padding: '8px 12px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(255,0,127,0.12) 0%, rgba(255,0,127,0.04) 100%)',
                    border: '1px solid rgba(255,0,127,0.2)',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    marginBottom: '8px', flexShrink: 0
                }}
            >
                <AlertTriangle size={16} color="var(--accent-pink)" />
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>
                    Jeu réservé aux adultes — humour noir et contenus décalés
                </span>
            </motion.div>

            {/* Scrollable Rules Content */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                style={{
                    width: '100%', flex: 1, overflowY: 'auto',
                    display: 'flex', flexDirection: 'column', gap: '8px',
                    paddingBottom: '15px', paddingRight: '4px'
                }}
            >
                {rulesSections.map((section, index) => {
                    const Icon = section.icon;
                    return (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            style={{
                                padding: '14px', borderRadius: '14px',
                                background: section.gradient,
                                border: `1px solid ${section.border}`,
                                backdropFilter: 'blur(10px)',
                                position: 'relative', overflow: 'hidden'
                            }}
                        >
                            {/* Subtle corner accent */}
                            <div style={{
                                position: 'absolute', top: 0, right: 0,
                                width: '60px', height: '60px',
                                background: `radial-gradient(circle at top right, ${section.border}, transparent 70%)`,
                                opacity: 0.4, pointerEvents: 'none'
                            }} />

                            {/* Step number badge */}
                            <div style={{
                                position: 'absolute', top: '12px', right: '14px',
                                fontSize: '2rem', fontWeight: '900',
                                color: section.color, opacity: 0.08,
                                lineHeight: 1
                            }}>
                                {String(index + 1).padStart(2, '0')}
                            </div>

                            {/* Header */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                marginBottom: '10px'
                            }}>
                                <div style={{
                                    width: '28px', height: '28px', borderRadius: '8px',
                                    background: `linear-gradient(135deg, ${section.color}33, ${section.color}11)`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: `1px solid ${section.border}`,
                                    flexShrink: 0
                                }}>
                                    <Icon size={16} color={section.color} />
                                </div>
                                <h3 style={{
                                    margin: 0, fontSize: '0.75rem', fontWeight: '900',
                                    color: section.color, letterSpacing: '1px'
                                }}>
                                    {section.title}
                                </h3>
                            </div>

                            {/* Content */}
                            {section.content && (
                                <p style={{
                                    color: 'rgba(255,255,255,0.75)', fontSize: '0.73rem',
                                    lineHeight: '1.5', margin: 0
                                }}>
                                    {section.content}
                                </p>
                            )}

                            {/* Steps list */}
                            {section.steps && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {section.steps.map((step, i) => (
                                        <div key={i} style={{
                                            display: 'flex', alignItems: 'flex-start', gap: '10px'
                                        }}>
                                            <div style={{
                                                width: '20px', height: '20px', borderRadius: '6px',
                                                background: `${section.color}22`,
                                                border: `1px solid ${section.border}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0, marginTop: '1px'
                                            }}>
                                                <span style={{
                                                    fontSize: '0.6rem', fontWeight: '900',
                                                    color: section.color
                                                }}>
                                                    {i + 1}
                                                </span>
                                            </div>
                                            <span style={{
                                                color: 'rgba(255,255,255,0.75)',
                                                fontSize: '0.8rem', lineHeight: '1.5'
                                            }}>
                                                {step}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
};

export default Rules;
