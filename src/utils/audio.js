export const SOUNDS = {
    music: '/music.mp3',
    bop: '/bop.mp3',
    win: '/win.mp3',
    podium: '/podium.mp3'
};

const audioInstances = {};

export const playSound = (soundKey, options = { loop: false, volume: 1 }) => {
    try {
        if (!SOUNDS[soundKey]) return null;

        const audio = new Audio(SOUNDS[soundKey]);
        audio.loop = options.loop || false;
        audio.volume = options.volume || 1;

        audio.play().catch(err => {
            // Browsers often block auto-playing audio without user interaction
            console.warn(`Audio play failed for ${soundKey}:`, err);
        });

        // Store persistent sounds like music to stop them later
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

export const playBop = () => playSound('bop', { volume: 0.5 });
export const playWin = () => playSound('win', { volume: 0.8 });
export const playPodium = () => playSound('podium', { volume: 1 });
export const startMusic = () => {
    if (!audioInstances['music']) {
        playSound('music', { loop: true, volume: 0.3 });
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
};
