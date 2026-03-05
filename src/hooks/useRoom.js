import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../utils/firebase';
import {
    ref, set, push, onValue, off, update, remove, get, onDisconnect
} from 'firebase/database';
import cardsData from '../data/cards.json';

// Generate a random 4-char room code
const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
};

// Get or create a persistent player ID
const getPlayerId = () => {
    let id = localStorage.getItem('player_id');
    if (!id) {
        id = 'p_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('player_id', id);
    }
    return id;
};

// Shuffle helper
const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

export const useRoom = () => {
    const [roomCode, setRoomCode] = useState(null);
    const [players, setPlayers] = useState({});
    const [gameState, setGameState] = useState(null);
    const [error, setError] = useState(null);
    const [isHost, setIsHost] = useState(false);
    const playerId = useRef(getPlayerId()).current;
    const roomRef = useRef(null);

    // Get player profile from localStorage
    const getMyProfile = () => ({
        name: localStorage.getItem('profile_pseudo') || 'Joueur',
        avatar: localStorage.getItem('profile_image') || null
    });

    // Listen to room changes
    const listenToRoom = useCallback((code) => {
        const rRef = ref(db, `rooms/${code}`);
        roomRef.current = rRef;

        // Listen to players
        const playersRef = ref(db, `rooms/${code}/players`);
        onValue(playersRef, (snapshot) => {
            const data = snapshot.val();
            setPlayers(data || {});
        });

        // Listen to game state
        const stateRef = ref(db, `rooms/${code}/state`);
        onValue(stateRef, (snapshot) => {
            const data = snapshot.val();
            setGameState(data || null);
        });
    }, []);

    // Create a new room
    const createRoom = useCallback(async () => {
        try {
            let code = generateCode();

            // Check if room exists, regenerate if needed
            const snapshot = await get(ref(db, `rooms/${code}`));
            if (snapshot.exists()) {
                code = generateCode();
            }

            const profile = getMyProfile();

            await set(ref(db, `rooms/${code}`), {
                host: playerId,
                createdAt: Date.now(),
                state: {
                    phase: 'LOBBY',
                    round: 0,
                    bossId: null,
                    blackCard: null,
                    hands: {},
                    playedCards: {},
                    scores: {},
                    winner: null
                },
                players: {
                    [playerId]: {
                        name: profile.name,
                        avatar: profile.avatar || '',
                        score: 0,
                        ready: true,
                        online: true,
                        joinedAt: Date.now()
                    }
                }
            });

            // Set up disconnect handler
            const playerOnlineRef = ref(db, `rooms/${code}/players/${playerId}/online`);
            onDisconnect(playerOnlineRef).set(false);

            setRoomCode(code);
            setIsHost(true);
            listenToRoom(code);

            return code;
        } catch (err) {
            setError('Erreur lors de la création de la room');
            console.error(err);
            return null;
        }
    }, [playerId, listenToRoom]);

    // Join an existing room (or re-listen if already in it)
    const joinRoom = useCallback(async (code) => {
        try {
            code = code.toUpperCase();
            const snapshot = await get(ref(db, `rooms/${code}`));

            if (!snapshot.exists()) {
                setError('Room introuvable');
                return false;
            }

            const roomData = snapshot.val();

            // Check if player is already in the room
            const alreadyInRoom = roomData.players && roomData.players[playerId];

            if (!alreadyInRoom) {
                // Check if game already started
                if (roomData.state?.phase !== 'LOBBY') {
                    setError('La partie a déjà commencé');
                    return false;
                }

                const profile = getMyProfile();

                // Add player to room
                await set(ref(db, `rooms/${code}/players/${playerId}`), {
                    name: profile.name,
                    avatar: profile.avatar || '',
                    score: 0,
                    ready: false,
                    online: true,
                    joinedAt: Date.now()
                });
            } else {
                // Already in room, just mark online
                await update(ref(db, `rooms/${code}/players/${playerId}`), {
                    online: true
                });
            }

            // Set up disconnect handler
            const playerOnlineRef = ref(db, `rooms/${code}/players/${playerId}/online`);
            onDisconnect(playerOnlineRef).set(false);

            setRoomCode(code);
            setIsHost(roomData.host === playerId);
            listenToRoom(code);

            return true;
        } catch (err) {
            setError('Erreur lors de la connexion');
            console.error(err);
            return false;
        }
    }, [playerId, listenToRoom]);

    // Toggle ready state
    const toggleReady = useCallback(async () => {
        if (!roomCode) return;
        const currentReady = players[playerId]?.ready || false;
        await update(ref(db, `rooms/${roomCode}/players/${playerId}`), {
            ready: !currentReady
        });
    }, [roomCode, playerId, players]);

    // Update game state (any keyed updates)
    const updateGameState = useCallback(async (newState) => {
        if (!roomCode) return;
        await update(ref(db, `rooms/${roomCode}/state`), newState);
    }, [roomCode]);

    // Update player data
    const updatePlayer = useCallback(async (data, targetPlayerId = null) => {
        if (!roomCode) return;
        const pid = targetPlayerId || playerId;
        await update(ref(db, `rooms/${roomCode}/players/${pid}`), data);
    }, [roomCode, playerId]);

    // =========================================
    // GAME FUNCTIONS
    // =========================================

    // Start the game — host calls this from Lobby
    const startGame = useCallback(async () => {
        if (!roomCode) return;

        const snapshot = await get(ref(db, `rooms/${roomCode}`));
        if (!snapshot.exists()) return;
        const roomData = snapshot.val();
        const playerIds = Object.keys(roomData.players || {});

        if (playerIds.length < 2) return;

        // Pick random boss for round 1
        const bossId = playerIds[Math.floor(Math.random() * playerIds.length)];

        // Pick a random black card
        const blackCard = cardsData.blackCards[Math.floor(Math.random() * cardsData.blackCards.length)];

        // Shuffle all white cards and deal 11 to each non-boss player
        const allWhites = shuffleArray(cardsData.whiteCards.map((text, i) => i));
        const hands = {};
        let cardIndex = 0;

        // Non-boss players get 11 cards each
        const nonBossPlayers = playerIds.filter(id => id !== bossId);
        for (const pid of nonBossPlayers) {
            hands[pid] = allWhites.slice(cardIndex, cardIndex + 11);
            cardIndex += 11;
        }
        // Boss gets no cards (empty hand)
        hands[bossId] = [];

        // Initialize scores if first round
        const scores = {};
        playerIds.forEach(pid => {
            scores[pid] = roomData.players[pid]?.score || 0;
        });

        await update(ref(db, `rooms/${roomCode}/state`), {
            phase: 'PLAYING',
            round: 1,
            bossId,
            blackCard,
            hands,
            playedCards: {},
            scores,
            winner: null,
            deckOffset: cardIndex
        });
    }, [roomCode]);

    // Submit cards — non-boss player submits their selection
    const submitCards = useCallback(async (cardIndices) => {
        if (!roomCode) return;
        await set(ref(db, `rooms/${roomCode}/state/playedCards/${playerId}`), {
            cards: cardIndices,
            timestamp: Date.now()
        });
    }, [roomCode, playerId]);

    // Boss votes for winner — submissionPlayerId is the player whose card won
    const bossVote = useCallback(async (winnerPlayerId) => {
        if (!roomCode || !gameState) return;

        // Update score
        const currentScore = (gameState.scores?.[winnerPlayerId] || 0) + 1;
        await update(ref(db, `rooms/${roomCode}/state`), {
            winner: winnerPlayerId,
            phase: 'REVEAL',
            [`scores/${winnerPlayerId}`]: currentScore
        });

        // Also update player score
        await update(ref(db, `rooms/${roomCode}/players/${winnerPlayerId}`), {
            score: currentScore
        });
    }, [roomCode, gameState]);

    // Next round — winner becomes new boss
    const nextRound = useCallback(async () => {
        if (!roomCode || !gameState) return;

        const snapshot = await get(ref(db, `rooms/${roomCode}`));
        if (!snapshot.exists()) return;
        const roomData = snapshot.val();
        const playerIds = Object.keys(roomData.players || {});

        // Winner becomes the new boss, if no winner use random
        const newBossId = gameState.winner || playerIds[Math.floor(Math.random() * playerIds.length)];

        // Pick new black card
        const blackCard = cardsData.blackCards[Math.floor(Math.random() * cardsData.blackCards.length)];

        // Deal new hands — shuffle and deal 11 to each non-boss
        const allWhites = shuffleArray(cardsData.whiteCards.map((text, i) => i));
        const hands = {};
        let cardIndex = 0;

        const nonBossPlayers = playerIds.filter(id => id !== newBossId);
        for (const pid of nonBossPlayers) {
            hands[pid] = allWhites.slice(cardIndex, cardIndex + 11);
            cardIndex += 11;
        }
        hands[newBossId] = [];

        const newRound = (gameState.round || 1) + 1;

        await update(ref(db, `rooms/${roomCode}/state`), {
            phase: 'PLAYING',
            round: newRound,
            bossId: newBossId,
            blackCard,
            hands,
            playedCards: {},
            winner: null,
            deckOffset: cardIndex
        });
    }, [roomCode, gameState]);

    // End game
    const endGame = useCallback(async () => {
        if (!roomCode) return;
        await update(ref(db, `rooms/${roomCode}/state`), {
            phase: 'END_GAME'
        });
    }, [roomCode]);

    // Leave room
    const leaveRoom = useCallback(async () => {
        if (!roomCode) return;
        await remove(ref(db, `rooms/${roomCode}/players/${playerId}`));

        // If host leaves, delete room
        if (isHost) {
            await remove(ref(db, `rooms/${roomCode}`));
        }

        // Clean up listeners
        if (roomRef.current) {
            off(roomRef.current);
        }

        setRoomCode(null);
        setPlayers({});
        setGameState(null);
        setIsHost(false);
    }, [roomCode, playerId, isHost]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (roomRef.current) {
                off(roomRef.current);
            }
        };
    }, []);

    return {
        // State
        roomCode,
        players,
        gameState,
        error,
        isHost,
        playerId,

        // Room Actions
        createRoom,
        joinRoom,
        toggleReady,
        updateGameState,
        updatePlayer,
        leaveRoom,

        // Game Actions
        startGame,
        submitCards,
        bossVote,
        nextRound,
        endGame,

        // Helpers
        playerCount: Object.keys(players).length,
        readyCount: Object.values(players).filter(p => p.ready).length,
        allReady: Object.values(players).length >= 2 && Object.values(players).every(p => p.ready),
        clearError: () => setError(null)
    };
};

export default useRoom;
