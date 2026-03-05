// === Audio Engine with localStorage persistence ===

export const SOUNDS = {
    music: '/music.mp3',
    bop: '/bop.mp3',
    win: '/win.mp3',
    podium: '/podium.mp3'
};

const audioInstances = {};

// --- Volume getters from localStorage ---
export const getMusicVolume = () => {
    const v = localStorage.getItem('audio_music_volume');
    return v !== null ? parseInt(v, 10) : 50;
};

export const getSfxVolume = () => {
    const v = localStorage.getItem('audio_sfx_volume');
    return v !== null ? parseInt(v, 10) : 80;
};

export const isMusicMuted = () => localStorage.getItem('audio_music_muted') === 'true';
export const isSfxMuted = () => localStorage.getItem('audio_sfx_muted') === 'true';

// --- Volume setters ---
export const setMusicVolume = (val) => {
    localStorage.setItem('audio_music_volume', val);
    // Apply to running music immediately
    if (audioInstances['music']) {
        audioInstances['music'].volume = Math.max(0, Math.min(1, val / 100));
    }
};

export const setSfxVolume = (val) => {
    localStorage.setItem('audio_sfx_volume', val);
};

export const setMusicMuted = (muted) => {
    localStorage.setItem('audio_music_muted', muted);
    if (audioInstances['music']) {
        audioInstances['music'].muted = muted;
    }
};

export const setSfxMuted = (muted) => {
    localStorage.setItem('audio_sfx_muted', muted);
};

// --- Core playback ---
export const playSound = (soundKey, options = { loop: false, volume: 1 }) => {
    try {
        if (!SOUNDS[soundKey]) return null;

        const audio = new Audio(SOUNDS[soundKey]);
        audio.loop = options.loop || false;
        audio.volume = Math.max(0, Math.min(1, options.volume || 1));

        audio.play().catch(err => {
            console.warn(`Audio play failed for ${soundKey}:`, err);
        });

        if (options.loop) {
            audioInstances[soundKey] = audio;
        }

        return audio;
    } catch (error) {
        console.error("Error playing sound:", error);
        return null;
    }
};

export const stopSound = (soundKey) => {
    if (audioInstances[soundKey]) {
        audioInstances[soundKey].pause();
        audioInstances[soundKey].currentTime = 0;
        delete audioInstances[soundKey];
    }
};

// --- Convenience functions (respect volume settings) ---
export const playBop = () => {
    if (isSfxMuted()) return;
    playSound('bop', { volume: (getSfxVolume() / 100) * 0.5 });
};

export const playWin = () => {
    if (isSfxMuted()) return;
    playSound('win', { volume: (getSfxVolume() / 100) * 0.8 });
};

export const playPodium = () => {
    if (isSfxMuted()) return;
    playSound('podium', { volume: getSfxVolume() / 100 });
};

export const startMusic = () => {
    if (isMusicMuted()) return;
    if (!audioInstances['music']) {
        playSound('music', { loop: true, volume: (getMusicVolume() / 100) * 0.3 });
    }
};

export const stopMusic = () => stopSound('music');

// Centralize click handling for the whole app
export const initGlobalAudio = () => {
    const handleFirstInteraction = () => {
        startMusic();
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    // Global bop sound on interactive element clicks
    document.addEventListener('click', (e) => {
        const target = e.target;
        const isInteractive = target.closest('button, a, [role="button"], [data-clickable]') ||
            (target.closest && target.closest('[style*="cursor: pointer"], [style*="cursor:pointer"]'));

        // Also check computed style for cursor: pointer
        let el = target;
        let found = !!isInteractive;
        while (el && !found && el !== document.body) {
            const style = window.getComputedStyle(el);
            if (style.cursor === 'pointer') {
                found = true;
            }
            el = el.parentElement;
        }

        if (found) {
            playBop();
        }
    }, { capture: true });
};
