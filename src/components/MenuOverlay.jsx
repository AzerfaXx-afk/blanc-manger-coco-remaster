import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, User, Settings, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MenuOverlay = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    const menuItems = [
        { icon: Home, label: 'ACCUEIL', path: '/' },
        { icon: User, label: 'MON PROFIL', path: '/profile' },
        { icon: Settings, label: 'PARAMÈTRES', path: '/settings' },
        { icon: Info, label: 'RÈGLES DU JEU', path: '/rules' }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            zIndex: 40
                        }}
                    />

                    {/* Menu Drawer */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{
                            position: 'fixed',
                            top: 0, left: 0, bottom: 0,
                            width: '280px',
                            background: '#12141a',
                            borderRight: '1px solid rgba(255,255,255,0.1)',
                            zIndex: 50,
                            padding: '30px',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
                            <div style={{ fontWeight: '900', fontSize: '1.2rem', color: 'var(--accent-cyan)' }}>MENU</div>
                            <div onClick={onClose} style={{ cursor: 'pointer', padding: '5px' }}>
                                <X color="#fff" size={28} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {menuItems.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ x: 10, color: 'var(--accent-pink)' }}
                                    onClick={() => {
                                        if (item.path !== '#') {
                                            navigate(item.path);
                                            onClose();
                                        }
                                    }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '15px',
                                        color: '#fff', fontSize: '1.1rem', fontWeight: 'bold',
                                        cursor: 'pointer', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)'
                                    }}
                                >
                                    <item.icon size={22} style={{ opacity: 0.8 }} />
                                    {item.label}
                                </motion.div>
                            ))}
                        </div>

                        <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '2px' }}>
                            V 1.0.0
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MenuOverlay;
