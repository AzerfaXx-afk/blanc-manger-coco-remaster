import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Camera, Save, Image, X } from 'lucide-react';
import { playBop } from '../utils/audio';

const Profile = () => {
    const navigate = useNavigate();
    const [pseudo, setPseudo] = useState(() => localStorage.getItem('profile_pseudo') || 'Capitaine Zgueg');
    const [saved, setSaved] = useState(false);
    const [profileImage, setProfileImage] = useState(() => localStorage.getItem('profile_image') || null);
    const [showImagePicker, setShowImagePicker] = useState(false);
    const cameraInputRef = useRef(null);
    const galleryInputRef = useRef(null);

    const handleSave = () => {
        playBop();
        localStorage.setItem('profile_pseudo', pseudo);
        if (profileImage) {
            localStorage.setItem('profile_image', profileImage);
        } else {
            localStorage.removeItem('profile_image');
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const compressImage = (file, callback) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX = 200;
                let w = img.width, h = img.height;
                if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
                else { w = Math.round(w * MAX / h); h = MAX; }
                canvas.width = w;
                canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                callback(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            compressImage(file, (dataUrl) => {
                setProfileImage(dataUrl);
                setShowImagePicker(false);
            });
        }
        e.target.value = '';
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100vh',
            height: '100dvh',
            overflow: 'hidden',
            padding: '20px',
            maxWidth: '500px',
            margin: '0 auto',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '30px' }}>
                <div
                    className="glass-panel"
                    onClick={() => navigate(-1)}
                    style={{ padding: '10px', borderRadius: '12px', display: 'flex', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    <ArrowLeft color="var(--text-main)" size={24} />
                </div>
                <div style={{ fontWeight: '900', fontSize: '1.2rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                    MON PROFIL
                </div>
                <div style={{ width: '44px' }}></div> {/* Spacer */}
            </div>

            {/* Hidden file inputs */}
            <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleImageChange} style={{ display: 'none' }} />
            <input type="file" accept="image/*" ref={galleryInputRef} onChange={handleImageChange} style={{ display: 'none' }} />

            {/* Profile Picture */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ position: 'relative', marginBottom: '40px' }}
            >
                <div
                    onClick={() => { playBop(); setShowImagePicker(true); }}
                    style={{
                        width: '120px', height: '120px', borderRadius: '50%',
                        background: profileImage ? `url(${profileImage}) center/cover` : 'linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(255, 0, 127, 0.2))',
                        border: '2px solid rgba(0, 229, 255, 0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 30px rgba(0, 229, 255, 0.3)',
                        overflow: 'hidden', cursor: 'pointer'
                    }}
                >
                    {!profileImage && <User color="rgba(255,255,255,0.8)" size={50} />}
                </div>
                <button
                    onClick={() => { playBop(); setShowImagePicker(true); }}
                    style={{
                        position: 'absolute', bottom: 0, right: 0,
                        background: 'var(--accent-pink)', border: 'none',
                        borderRadius: '50%', width: '40px', height: '40px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', boxShadow: '0 0 15px rgba(255, 0, 127, 0.5)'
                    }}
                >
                    <Camera color="#fff" size={20} />
                </button>
            </motion.div>

            {/* Image Picker Bottom Sheet */}
            <AnimatePresence>
                {showImagePicker && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowImagePicker(false)}
                        style={{
                            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                            background: 'rgba(0,0,0,0.7)', zIndex: 100,
                            display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
                        }}
                    >
                        <motion.div
                            initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-panel"
                            style={{
                                width: '100%', maxWidth: '500px', padding: '24px',
                                borderRadius: '24px 24px 0 0',
                                display: 'flex', flexDirection: 'column', gap: '12px'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontWeight: '900', fontSize: '1rem', letterSpacing: '1px' }}>PHOTO DE PROFIL</span>
                                <X size={22} color="var(--text-muted)" onClick={() => setShowImagePicker(false)} style={{ cursor: 'pointer' }} />
                            </div>
                            <button
                                onClick={() => cameraInputRef.current?.click()}
                                style={{
                                    width: '100%', padding: '16px', borderRadius: '14px',
                                    background: 'linear-gradient(135deg, rgba(0,229,255,0.3), rgba(0,168,255,0.1))',
                                    border: '1px solid rgba(0,229,255,0.4)',
                                    color: '#fff', fontWeight: '800', fontSize: '0.95rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer'
                                }}
                            >
                                <Camera size={20} /> PRENDRE UNE PHOTO
                            </button>
                            <button
                                onClick={() => galleryInputRef.current?.click()}
                                style={{
                                    width: '100%', padding: '16px', borderRadius: '14px',
                                    background: 'linear-gradient(135deg, rgba(255,0,127,0.3), rgba(255,0,204,0.1))',
                                    border: '1px solid rgba(255,0,127,0.4)',
                                    color: '#fff', fontWeight: '800', fontSize: '0.95rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer'
                                }}
                            >
                                <Image size={20} /> CHOISIR DEPUIS LA GALERIE
                            </button>
                            {profileImage && (
                                <button
                                    onClick={() => { setProfileImage(null); setShowImagePicker(false); }}
                                    style={{
                                        width: '100%', padding: '14px', borderRadius: '14px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.85rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    SUPPRIMER LA PHOTO
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pseudo Input */}
            <div style={{ width: '100%', marginBottom: '30px' }}>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '10px', fontWeight: 'bold' }}>
                    PSEUDONYME
                </label>
                <input
                    type="text"
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    style={{
                        width: '100%',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '16px',
                        color: 'white',
                        padding: '18px 20px',
                        fontSize: '1.2rem',
                        outline: 'none',
                        transition: 'border 0.3s ease',
                        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
                    }}
                    onFocus={(e) => e.target.style.border = '1px solid var(--accent-cyan)'}
                    onBlur={(e) => e.target.style.border = '1px solid rgba(255,255,255,0.2)'}
                />
            </div>

            {/* Save Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                style={{
                    width: '100%', padding: '18px', borderRadius: '16px',
                    background: saved ? '#10b981' : 'linear-gradient(135deg, rgba(0, 229, 255, 0.4) 0%, rgba(0, 168, 255, 0.1) 100%)',
                    border: saved ? '1px solid #10b981' : '1px solid rgba(0, 229, 255, 0.5)',
                    color: '#fff', fontSize: '1.1rem', fontWeight: '900', letterSpacing: '2px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    cursor: 'pointer', transition: 'all 0.3s ease', marginTop: 'auto', marginBottom: '20px',
                    boxShadow: saved ? '0 0 20px rgba(16, 185, 129, 0.4)' : '0 10px 30px rgba(0, 229, 255, 0.2)'
                }}
            >
                {saved ? 'SAUVEGARDÉ !' : <> SAUVEGARDER <Save size={20} /> </>}
            </motion.button>
        </div>
    );
};

export default Profile;
