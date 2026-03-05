import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Trophy, Clock, Check, XCircle, Crown, Flag } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import cardsData from '../data/cards.json';
import { playWin, playPodium, stopMusic, startMusic, playBop } from '../utils/audio';
import useRoom from '../hooks/useRoom';

const PHASES = {
    PLAYING: 'PLAYING',
    VOTING: 'VOTING',
    REVEAL: 'REVEAL',
    END_GAME: 'END_GAME',
};

const Game = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const roomCode = location.state?.code || null;

    // Firebase room data
    const {
        players: firebasePlayers, gameState, playerId, isHost,
        joinRoom, submitCards, bossVote, nextRound: firebaseNextRound,
        endGame: firebaseEndGame, updateGameState, leaveRoom
    } = useRoom();

    // Connect to room on mount
    useEffect(() => {
        if (roomCode) {
            joinRoom(roomCode);
        }
    }, []);

    // Local UI state
    const [mySelection, setMySelection] = useState([]);
    const [flippedCards, setFlippedCards] = useState({});
    const [flipAnimating, setFlipAnimating] = useState({});
    const [flippedSubmissions, setFlippedSubmissions] = useState({});
    const [flipAnimatingSubs, setFlipAnimatingSubs] = useState({});
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [lastWinner, setLastWinner] = useState(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    // Derive game state from Firebase
    const phase = gameState?.phase || 'PLAYING';
    const round = gameState?.round || 1;
    const bossId = gameState?.bossId || null;
    const isBoss = bossId === playerId;
    const currentBlackCard = gameState?.blackCard || { text: 'Chargement...', pick: 1 };
    const maxSelections = Math.max(1, currentBlackCard?.pick || 1);
    const scores = gameState?.scores || {};
    const winner = gameState?.winner || null;
    const playedCards = gameState?.playedCards || {};

    // My hand from Firebase (array of card indices)
    const myHandIndices = gameState?.hands?.[playerId] || [];
    const hand = myHandIndices.map(idx => ({
        id: `w_${idx}`,
        text: cardsData.whiteCards[idx] || '???',
        index: idx
    }));

    // Player list
    const playerList = Object.entries(firebasePlayers || {}).map(([id, data]) => ({
        id, ...data
    }));

    // Submissions for voting (anonymized)
    const allSubmissions = Object.entries(playedCards).map(([pid, data]) => ({
        playerId: pid,
        cards: (data.cards || []).map(idx => ({
            id: `w_${idx}`,
            text: cardsData.whiteCards[idx] || '???'
        }))
    }));

    // Check if all non-boss players have submitted
    const nonBossPlayers = playerList.filter(p => p.id !== bossId);
    const allSubmitted = nonBossPlayers.length > 0 && nonBossPlayers.every(p => playedCards[p.id]);

    // Auto-transition: when all non-boss players submitted, move to VOTING (host triggers)
    useEffect(() => {
        if (phase === 'PLAYING' && allSubmitted && isHost) {
            const timer = setTimeout(() => {
                updateGameState({ phase: 'VOTING' });
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [phase, allSubmitted, isHost]);

    // Reset local state when round changes
    useEffect(() => {
        setMySelection([]);
        setFlippedCards({});
        setFlipAnimating({});
        setFlippedSubmissions({});
        setFlipAnimatingSubs({});
        setHasSubmitted(false);
    }, [round]);

    // Play win sound on reveal
    useEffect(() => {
        if (phase === 'REVEAL' && winner) {
            playWin();
            setLastWinner(winner);
            const timer = setTimeout(() => setLastWinner(null), 2000);
            return () => clearTimeout(timer);
        }
    }, [phase, winner]);

    // Play podium sound on end game
    useEffect(() => {
        if (phase === 'END_GAME') {
            stopMusic();
            playPodium();
        }
    }, [phase]);

    // --- Actions ---

    const flipCard = (cardId) => {
        if (flipAnimating[cardId]) return; // prevent double-tap
        playBop();
        setFlipAnimating(prev => ({ ...prev, [cardId]: true }));
        setFlippedCards(prev => ({ ...prev, [cardId]: true }));
        // Remove animation class after animation ends
        setTimeout(() => {
            setFlipAnimating(prev => ({ ...prev, [cardId]: false }));
        }, 850);
    };

    const toggleSelection = (card) => {
        if (phase !== 'PLAYING' || isBoss || hasSubmitted) return;

        // Flip first
        if (!flippedCards[card.id]) {
            flipCard(card.id);
            return;
        }

        playBop();
        if (mySelection.find(c => c.id === card.id)) {
            setMySelection(mySelection.filter(c => c.id !== card.id));
        } else if (mySelection.length < maxSelections) {
            setMySelection([...mySelection, card]);
        }
    };

    const flipSubmission = (subIdx) => {
        if (flipAnimatingSubs[subIdx]) return;
        playBop();
        setFlipAnimatingSubs(prev => ({ ...prev, [subIdx]: true }));
        setFlippedSubmissions(prev => ({ ...prev, [subIdx]: true }));
        setTimeout(() => {
            setFlipAnimatingSubs(prev => ({ ...prev, [subIdx]: false }));
        }, 850);
    };

    const handleConfirmPlay = async () => {
        if (mySelection.length !== maxSelections) return;

        // Submit card indices to Firebase
        const cardIndices = mySelection.map(c => c.index);
        await submitCards(cardIndices);
        setHasSubmitted(true);
    };

    const handleBossVote = async (submissionPlayerId) => {
        if (!isBoss) return;
        await bossVote(submissionPlayerId);
    };

    const handleNextRound = async () => {
        playBop();
        await firebaseNextRound();
    };

    const requestEndGame = () => {
        playBop();
        setShowEndConfirm(true);
    };

    const confirmEndGame = async () => {
        playBop();
        setShowEndConfirm(false);
        await firebaseEndGame();
    };

    const cancelEndGame = () => {
        playBop();
        setShowEndConfirm(false);
    };

    const handleExit = async () => {
        playBop();
        stopMusic();
        startMusic();
        await leaveRoom();
        navigate('/');
    };

    // --- Render Helpers ---

    const getPlayerInfo = (id) => {
        if (firebasePlayers && firebasePlayers[id]) {
            const fp = firebasePlayers[id];
            return { name: fp.name || 'Joueur', avatar: fp.avatar || null };
        }
        return { name: 'Joueur', avatar: null };
    };

    const renderBlackCardText = (answerCards = []) => {
        const parts = currentBlackCard.text.split('_____');
        if (parts.length === 1) {
            return (
                <React.Fragment>
                    {currentBlackCard.text}
                    {answerCards.length > 0 && (
                        <div style={{ color: 'var(--accent-cyan)', marginTop: '10px' }}>
                            {answerCards.map(c => c.text).join(' ')}
                        </div>
                    )}
                </React.Fragment>
            );
        }

        return parts.map((part, i, arr) => (
            <React.Fragment key={i}>
                <span>{part}</span>
                {i < arr.length - 1 && (
                    <span style={{ color: 'var(--accent-cyan)', textDecoration: 'underline', padding: '0 5px', fontWeight: '900' }}>
                        {answerCards[i] ? answerCards[i].text.replace('.', '') : '[___]'}
                    </span>
                )}
            </React.Fragment>
        ));
    };

    // Sorted scores for scoreboard
    const sortedScores = Object.entries(scores)
        .map(([id, score]) => ({ id, ...getPlayerInfo(id), score, isBoss: id === bossId }))
        .sort((a, b) => b.score - a.score);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100dvh',
                width: '100%',
                overflow: 'hidden',
                position: 'relative',
                maxWidth: '1000px',
                margin: '0 auto',
                fontFamily: "'Inter', sans-serif",
                backgroundColor: 'var(--bg-main)'
            }}
            className="game-container"
        >

            {/* Top Navigation / Status Board */}
            {phase !== PHASES.END_GAME && (
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px 20px', flexShrink: 0, width: '100%', minHeight: '70px' }}>
                    <div style={{ position: 'absolute', left: '20px', zIndex: 10 }}>
                        <div
                            className="glass-panel top-bar-btn"
                            onClick={handleExit}
                            style={{ padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                            <ArrowLeft color="var(--text-main)" size={20} />
                        </div>
                    </div>

                    {/* Scoreboard */}
                    <div className="scoreboard-container" style={{
                        display: 'flex', gap: '15px', alignItems: 'center', maxWidth: 'calc(100% - 140px)',
                        overflowX: 'auto', scrollbarWidth: 'none', padding: '0 10px',
                        maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
                    }}>
                        {sortedScores.slice(0, 5).map((player, idx) => (
                            <React.Fragment key={player.id}>
                                {idx > 0 && <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />}
                                <div className="score-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', flexShrink: 0 }}>
                                    {/* Boss badge */}
                                    {player.isBoss && (
                                        <div style={{
                                            position: 'absolute', top: '-8px', right: '-8px',
                                            background: 'linear-gradient(135deg, #FFD700, #f59e0b)',
                                            width: '16px', height: '16px', borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            zIndex: 5, boxShadow: '0 0 6px rgba(255,215,0,0.5)'
                                        }}>
                                            <Crown size={9} color="#fff" />
                                        </div>
                                    )}
                                    {/* Avatar */}
                                    <div style={{
                                        width: '24px', height: '24px', borderRadius: '50%', marginBottom: '2px',
                                        background: player.avatar ? `url(${player.avatar}) center/cover` : `linear-gradient(135deg, ${player.id === playerId ? 'var(--accent-cyan)' : '#ff007f'}, rgba(255,255,255,0.2))`,
                                        border: `1.5px solid ${player.id === playerId ? 'var(--accent-cyan)' : '#ff007f'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.5rem', fontWeight: '900', color: '#fff', overflow: 'hidden'
                                    }}>
                                        {!player.avatar && player.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span style={{ fontSize: '0.5rem', color: 'var(--text-muted)', maxWidth: '50px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>
                                        {player.name.toUpperCase()}
                                        {player.id === playerId && ' (toi)'}
                                    </span>
                                    <span style={{ fontWeight: '900', color: player.id === playerId ? 'var(--accent-cyan)' : '#ff007f', fontSize: '1.1rem' }}>{player.score}</span>
                                    <AnimatePresence>
                                        {lastWinner === player.id && (
                                            <motion.div initial={{ y: 0, opacity: 1, scale: 0.5 }} animate={{ y: -30, opacity: 0, scale: 1.5 }} transition={{ duration: 1 }} style={{ position: 'absolute', top: 0, color: 'var(--accent-cyan)', fontWeight: '900', textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>+1</motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </React.Fragment>
                        ))}
                        {sortedScores.length > 5 && (
                            <ArrowRight color="var(--text-muted)" size={16} style={{ flexShrink: 0, marginLeft: '5px' }} />
                        )}
                    </div>

                    <div style={{ position: 'absolute', right: '20px', zIndex: 10 }}>
                        {isHost && phase !== PHASES.END_GAME && (
                            <motion.div
                                className="top-bar-btn"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={requestEndGame}
                                style={{
                                    padding: '10px 14px', background: 'linear-gradient(135deg, var(--accent-pink) 0%, #cc0066 100%)', borderRadius: '20px',
                                    cursor: 'pointer', border: '1px solid rgba(255,0,127,0.5)',
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    boxShadow: '0 4px 15px rgba(255,0,127,0.4)'
                                }}
                                title="Mettre fin à la partie"
                            >
                                <XCircle size={16} color="#fff" style={{ margin: 0 }} />
                                <span style={{ color: '#fff', letterSpacing: '0.5px', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase' }}>TERMINER</span>
                            </motion.div>
                        )}
                    </div>
                </div>
            )}

            {/* Middle Section: Playground */}
            <div style={{
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '5px 15px 10px',
                position: 'relative'
            }}>

                {phase !== PHASES.END_GAME && (
                    <div style={{
                        fontSize: '0.7rem', letterSpacing: '3px', color: 'var(--text-muted)', textTransform: 'uppercase',
                        marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        Manche {round}
                        {isBoss && (
                            <span style={{
                                background: 'linear-gradient(135deg, #FFD700, #f59e0b)',
                                padding: '2px 8px', borderRadius: '20px',
                                fontSize: '0.55rem', fontWeight: '900', color: '#000',
                                display: 'flex', alignItems: 'center', gap: '4px'
                            }}>
                                <Crown size={10} /> BOSS
                            </span>
                        )}
                    </div>
                )}

                {/* Black Card */}
                <motion.div
                    className="black-card-wrapper"
                    layout
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    style={{ position: 'relative', width: '85%', maxWidth: '340px', minHeight: '150px', zIndex: 5 }}
                >
                    <div style={{
                        position: 'absolute', top: '6px', left: '6px', width: '100%', height: '100%',
                        borderRadius: '16px', border: '2px solid rgba(255, 0, 127, 0.4)',
                        boxShadow: '0 0 15px rgba(255, 0, 127, 0.2)', zIndex: 0
                    }} />
                    <div style={{
                        position: 'absolute', top: '-6px', left: '-6px', width: '100%', height: '100%',
                        borderRadius: '16px', border: '2px solid rgba(0, 229, 255, 0.4)',
                        boxShadow: '0 0 15px rgba(0, 229, 255, 0.2)', zIndex: 1
                    }} />

                    <div className="black-card-inner" style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        padding: '20px 15px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, rgba(30,34,43,1) 0%, rgba(20,23,28,1) 100%)',
                        boxShadow: '0 15px 30px rgba(0,0,0,0.8)',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', zIndex: 2
                    }}>
                        {phase === PHASES.END_GAME ? (
                            <>
                                <Trophy size={36} color="var(--accent-pink)" style={{ marginBottom: '10px' }} />
                                <h2 className="black-card-text" style={{ fontSize: '1.3rem', fontWeight: '900', lineHeight: '1.3', color: 'var(--accent-cyan)' }}>
                                    PARTIE TERMINÉE
                                </h2>
                                <div style={{ marginTop: '5px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Le podium est prêt !</div>
                            </>
                        ) : phase === PHASES.REVEAL ? (
                            <>
                                <Trophy size={30} color="var(--accent-pink)" style={{ marginBottom: '8px' }} />
                                <h2 className="black-card-text" style={{ fontSize: '1rem', fontWeight: '900', lineHeight: '1.3' }}>
                                    {renderBlackCardText(
                                        winner && playedCards[winner]
                                            ? playedCards[winner].cards.map(idx => ({ text: cardsData.whiteCards[idx] || '???' }))
                                            : []
                                    )}
                                </h2>
                                <div style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ color: winner === playerId ? 'var(--accent-cyan)' : 'var(--accent-pink)' }}>
                                        {winner === playerId ? '🎉 VOUS AVEZ GAGNÉ !' : `🏆 ${getPlayerInfo(winner).name.toUpperCase()} GAGNE !`}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '8px' }}>
                                    {phase === 'VOTING' ? 'VOTER POUR LA MEILLEURE' : 'CARTE QUESTION'}
                                </div>
                                <h2 className="black-card-text" style={{ fontSize: '1.05rem', fontWeight: '900', lineHeight: '1.3' }}>
                                    {renderBlackCardText(mySelection)}
                                </h2>
                                {phase === 'PLAYING' && !isBoss && (
                                    <div style={{ marginTop: '10px', color: 'var(--accent-blue)', fontWeight: 'bold', fontSize: '0.65rem', letterSpacing: '1px' }}>
                                        {maxSelections} CARTE{maxSelections > 1 ? 'S' : ''} REQUISE{maxSelections > 1 ? 'S' : ''}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Waiting messages */}
                <AnimatePresence>
                    {phase === 'PLAYING' && hasSubmitted && !isBoss && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ marginTop: '10px', fontWeight: 'bold', color: 'var(--accent-cyan)', textAlign: 'center', fontSize: '0.85rem' }}
                        >
                            EN ATTENTE DES AUTRES JOUEURS...
                        </motion.div>
                    )}
                    {phase === 'PLAYING' && isBoss && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ marginTop: '10px', textAlign: 'center' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <Crown size={18} color="#FFD700" />
                                <span style={{ fontWeight: '900', color: '#FFD700', fontSize: '0.9rem' }}>VOUS ÊTES LE BOSS</span>
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '6px' }}>
                                Attendez que les joueurs soumettent leurs cartes...
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '4px' }}>
                                {Object.keys(playedCards).length} / {nonBossPlayers.length} ont joué
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Section: Interactive Area */}
            <div className="glass-panel bottom-panel" style={{
                position: 'relative',
                zIndex: 10,
                padding: '12px 0 0',
                borderRadius: '24px 24px 0 0',
                borderBottom: 'none',
                boxShadow: '0 -10px 40px rgba(0,0,0,0.8)',
                flex: 1,
                minHeight: 0,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.7rem', letterSpacing: '2px', fontWeight: 'bold', marginBottom: '8px', flexShrink: 0 }}>
                    {phase === 'VOTING' ? 'RÉPONSES ANONYMES' : phase === PHASES.END_GAME ? 'RÉSULTATS FINAUX' : isBoss ? 'VOUS ÊTES LE BOSS — PAS DE CARTES' : `VOTRE MAIN (${hand.length} CARTES)`}
                </div>

                {/* Hand View — non-boss players only */}
                {(phase === 'PLAYING') && !isBoss && (
                    <div className="hand-container" style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '10px',
                        padding: '8px 15px',
                        paddingBottom: mySelection.length === maxSelections ? '80px' : '15px',
                        overflowY: 'auto',
                        flex: 1,
                        minHeight: 0,
                        width: '100%'
                    }}>
                        <AnimatePresence>
                            {hand.map((card, index) => {
                                const isSelected = !!mySelection.find(c => c.id === card.id);
                                const selectionIndex = mySelection.findIndex(c => c.id === card.id);
                                const isCardFlipped = !!flippedCards[card.id];

                                return (
                                    <motion.div
                                        key={card.id}
                                        initial={{ opacity: 0, y: 50, scale: 0.8, rotateZ: 5 }}
                                        animate={{
                                            opacity: hasSubmitted && !isSelected ? 0.3 : 1,
                                            y: 0, scale: 1, rotateZ: 0
                                        }}
                                        exit={{ opacity: 0, scale: 0.5, y: -20 }}
                                        transition={{
                                            delay: index * 0.06,
                                            type: 'spring', stiffness: 300, damping: 20
                                        }}
                                        onClick={() => !hasSubmitted && toggleSelection(card)}
                                        className="card-container white-card"
                                        style={{
                                            cursor: hasSubmitted ? 'default' : 'pointer',
                                            minHeight: '110px',
                                            position: 'relative'
                                        }}
                                    >
                                        <div className={`card-inner ${isCardFlipped ? 'flipped' : ''} ${flipAnimating[card.id] ? 'flip-animate' : ''}`} style={{ width: '100%', height: '100%', minHeight: '110px' }}>
                                            {/* Card Back */}
                                            <div className="card-face card-back card-back-answer" style={{ minHeight: '110px' }}>
                                                <div className="card-back-pattern" style={{ color: '#000' }} />
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 1 }}>
                                                    <div style={{
                                                        width: '32px', height: '32px', borderRadius: '8px',
                                                        background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        boxShadow: '0 4px 12px rgba(0,229,255,0.3)'
                                                    }}>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" opacity="0.9">
                                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-7v4h4l-5 7z" />
                                                        </svg>
                                                    </div>
                                                    <span style={{ fontSize: '0.4rem', fontWeight: '900', letterSpacing: '1.5px', color: 'rgba(0,0,0,0.3)' }}>AU FOND DU TROU</span>
                                                </div>
                                                <div style={{ position: 'absolute', top: '6px', left: '6px', width: '10px', height: '10px', borderTop: '2px solid rgba(0,0,0,0.1)', borderLeft: '2px solid rgba(0,0,0,0.1)', borderRadius: '2px 0 0 0' }} />
                                                <div style={{ position: 'absolute', bottom: '6px', right: '6px', width: '10px', height: '10px', borderBottom: '2px solid rgba(0,0,0,0.1)', borderRight: '2px solid rgba(0,0,0,0.1)', borderRadius: '0 0 2px 0' }} />
                                            </div>

                                            {/* Card Front */}
                                            <div
                                                className={`card-face card-front card-front-answer ${isSelected ? 'card-selected' : ''}`}
                                                style={{ minHeight: '110px', padding: '10px' }}
                                            >
                                                <div className="white-card-text" style={{
                                                    flex: 1, fontSize: '0.8rem', fontWeight: '700',
                                                    lineHeight: '1.3', textAlign: 'center',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    {card.text}
                                                </div>
                                                <div style={{
                                                    fontSize: '0.4rem', color: 'rgba(0,0,0,0.2)', textTransform: 'uppercase',
                                                    letterSpacing: '1px', marginTop: 'auto', textAlign: 'center', paddingTop: '4px',
                                                    borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex',
                                                    justifyContent: 'space-between', width: '100%'
                                                }}>
                                                    <span>AU FOND</span>
                                                    <span>DU TROU</span>
                                                </div>

                                                {isSelected && (
                                                    <div style={{
                                                        position: 'absolute', top: '-6px', right: '-6px',
                                                        background: 'linear-gradient(135deg, var(--accent-pink), #cc0066)',
                                                        width: '24px', height: '24px', borderRadius: '50%',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontWeight: '900', fontSize: '0.7rem', color: '#fff',
                                                        boxShadow: '0 2px 8px rgba(255,0,127,0.5)', zIndex: 5
                                                    }}>
                                                        {selectionIndex + 1}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}

                {/* Boss waiting view during PLAYING */}
                {phase === 'PLAYING' && isBoss && (
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', flex: 1, gap: '15px', padding: '30px'
                    }}>
                        <Crown size={50} color="#FFD700" />
                        <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#FFD700', textAlign: 'center' }}>
                            VOUS ÊTES LE BOSS
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                            Les joueurs choisissent leurs cartes...<br />
                            Vous voterez ensuite pour la meilleure réponse !
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--accent-cyan)' }}>
                            {Object.keys(playedCards).length} / {nonBossPlayers.length}
                        </div>
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FFD700' }}
                        />
                    </div>
                )}

                {/* Voting View — Boss Only */}
                {phase === 'VOTING' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 15px', overflowY: 'auto', flex: 1 }}>
                        {isBoss ? (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <Crown size={16} color="#FFD700" />
                                    <span style={{ fontSize: '0.7rem', color: '#FFD700', fontWeight: '800', letterSpacing: '1px' }}>
                                        CHOISISSEZ LA MEILLEURE RÉPONSE
                                    </span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    {allSubmissions.map((sub, idx) => {
                                        const isSubFlipped = !!flippedSubmissions[idx];
                                        return (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                className="card-container"
                                                onClick={() => {
                                                    if (!isSubFlipped) {
                                                        flipSubmission(idx);
                                                    } else {
                                                        handleBossVote(sub.playerId);
                                                    }
                                                }}
                                                style={{
                                                    minHeight: '130px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <div className={`card-inner ${isSubFlipped ? 'flipped' : ''} ${flipAnimatingSubs[idx] ? 'flip-animate' : ''}`} style={{ width: '100%', height: '100%', minHeight: '110px' }}>
                                                    {/* Back */}
                                                    <div className="card-face card-back card-back-answer" style={{ minHeight: '130px' }}>
                                                        <div className="card-back-pattern" style={{ color: '#000' }} />
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 1 }}>
                                                            <span style={{ fontSize: '0.6rem', fontWeight: '900', color: 'rgba(0,0,0,0.3)' }}>?</span>
                                                            <span style={{ fontSize: '0.4rem', fontWeight: '800', letterSpacing: '1px', color: 'rgba(0,0,0,0.25)' }}>RETOURNER</span>
                                                        </div>
                                                    </div>
                                                    {/* Front */}
                                                    <div className="card-face card-front card-front-answer" style={{ minHeight: '130px', padding: '12px' }}>
                                                        <div style={{ flex: 1, fontSize: '0.85rem', fontWeight: '800', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: '1.3' }}>
                                                            {sub.cards.map(c => c.text).join(' / ')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <div style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                justifyContent: 'center', flex: 1, gap: '15px', padding: '30px'
                            }}>
                                <Crown size={40} color="#FFD700" />
                                <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#fff', textAlign: 'center' }}>
                                    LE BOSS CHOISIT...
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                    {getPlayerInfo(bossId).name} lit les réponses et choisit sa préférée
                                </div>
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FFD700', marginTop: '10px' }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Reveal View */}
                {phase === PHASES.REVEAL && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '20px' }}>
                        {isHost ? (
                            <motion.button
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleNextRound}
                                style={{
                                    padding: '18px 40px', borderRadius: '30px', fontSize: '1.2rem', fontWeight: '900',
                                    background: 'linear-gradient(135deg, var(--accent-cyan) 0%, #0099ff 100%)',
                                    color: '#fff', border: 'none', cursor: 'pointer', textTransform: 'uppercase',
                                    boxShadow: '0 10px 25px rgba(0, 229, 255, 0.4)'
                                }}
                            >
                                MANCHE SUIVANTE
                            </motion.button>
                        ) : (
                            <div style={{ color: 'var(--text-muted)', fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '1px' }}>
                                EN ATTENTE DU CHEF...
                            </div>
                        )}
                    </div>
                )}

                {/* End Game / Podium View */}
                {phase === PHASES.END_GAME && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', flex: 1, padding: '20px 0', width: '100%', overflowY: 'auto' }}>
                        {(() => {
                            const podiumScores = Object.entries(scores)
                                .map(([id, score]) => ({ id, ...getPlayerInfo(id), score }))
                                .sort((a, b) => b.score - a.score);

                            const top3 = podiumScores.slice(0, 3);
                            const remaining = podiumScores.slice(3);

                            return (
                                <>
                                    {/* Podium Top 3 */}
                                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '15px', height: '180px', marginBottom: '30px', width: '100%' }}>
                                        {[1, 0, 2].map((idx) => {
                                            const player = top3[idx];
                                            if (!player) return null;
                                            const isFirst = idx === 0;
                                            const isSecond = idx === 1;
                                            return (
                                                <motion.div
                                                    key={player.id}
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: isFirst ? 160 : isSecond ? 120 : 90, opacity: 1 }}
                                                    transition={{ duration: 0.8, delay: isFirst ? 1.0 : isSecond ? 0.5 : 0 }}
                                                    style={{
                                                        width: '85px',
                                                        background: isFirst ? 'linear-gradient(180deg, #FFD700 0%, #D4AF37 100%)' :
                                                            isSecond ? 'linear-gradient(180deg, #E0E0E0 0%, #B0B0B0 100%)' :
                                                                'linear-gradient(180deg, #CD7F32 0%, #A0522D 100%)',
                                                        borderRadius: '16px 16px 0 0',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'flex-start',
                                                        paddingTop: '15px',
                                                        boxShadow: isFirst ? '0 -15px 40px rgba(255,215,0,0.4), inset 0 2px 10px rgba(255,255,255,0.8)' : 'inset 0 2px 10px rgba(255,255,255,0.4)',
                                                        border: '1px solid rgba(255,255,255,0.3)',
                                                        borderBottom: 'none',
                                                        position: 'relative'
                                                    }}
                                                >
                                                    <div style={{
                                                        position: 'absolute', top: '-50px',
                                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px'
                                                    }}>
                                                        <div style={{
                                                            width: '30px', height: '30px', borderRadius: '50%',
                                                            background: player.avatar ? `url(${player.avatar}) center/cover` : `linear-gradient(135deg, ${isFirst ? '#FFD700' : isSecond ? '#C0C0C0' : '#CD7F32'}, rgba(255,255,255,0.3))`,
                                                            border: '2px solid rgba(255,255,255,0.6)', overflow: 'hidden',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: '0.6rem', fontWeight: '900', color: '#fff'
                                                        }}>
                                                            {!player.avatar && player.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '8px', whiteSpace: 'nowrap' }}>
                                                            {player.name}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontWeight: '900', fontSize: '1.8rem', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                                        {idx + 1}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', fontWeight: '900', color: 'rgba(0,0,0,0.5)', marginTop: 'auto', marginBottom: '10px' }}>
                                                        {player.score} PTS
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>

                                    {/* Remaining Players */}
                                    {remaining.length > 0 && (
                                        <div style={{ width: '100%', maxWidth: '350px', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                                            {remaining.map((player, index) => (
                                                <motion.div
                                                    key={player.id}
                                                    initial={{ opacity: 0, x: -50 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 1.5 + (index * 0.1) }}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                        background: 'rgba(255,255,255,0.05)', padding: '15px 20px', borderRadius: '12px',
                                                        border: '1px solid rgba(255,255,255,0.1)'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                        <span style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-muted)' }}>{index + 4}.</span>
                                                        <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>{player.name}</span>
                                                    </div>
                                                    <div style={{ fontWeight: '900', color: 'var(--accent-cyan)' }}>{player.score} PTS</div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            );
                        })()}

                        <motion.button
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 2.0 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleExit}
                            style={{
                                marginTop: 'auto',
                                padding: '18px 40px', borderRadius: '30px', fontSize: '1.1rem', fontWeight: '900',
                                background: 'linear-gradient(135deg, var(--accent-pink) 0%, #cc0066 100%)',
                                color: '#fff', border: 'none', cursor: 'pointer', textTransform: 'uppercase',
                                boxShadow: '0 10px 25px rgba(255, 0, 127, 0.4)'
                            }}
                        >
                            RETOURNER AU LOBBY
                        </motion.button>
                    </div>
                )}

                {/* Play Button Overlay */}
                <AnimatePresence>
                    {phase === 'PLAYING' && !isBoss && !hasSubmitted && mySelection.length === maxSelections && (
                        <motion.div
                            className="confirm-panel"
                            initial={{ y: 60, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 60, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            style={{
                                position: 'absolute', bottom: '12px', left: 0, width: '100%',
                                display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 30
                            }}
                        >
                            <motion.button
                                className="confirm-btn"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { playBop(); handleConfirmPlay(); }}
                                style={{
                                    pointerEvents: 'auto', padding: '14px 30px', borderRadius: '30px', fontSize: '1rem', fontWeight: '900',
                                    display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textTransform: 'uppercase',
                                    background: 'linear-gradient(135deg, var(--accent-cyan) 0%, rgba(0, 168, 255, 0.8) 100%)',
                                    color: '#fff', border: 'none', boxShadow: '0 8px 25px rgba(0, 229, 255, 0.5)'
                                }}
                            >
                                CONFIRMER <Check size={18} />
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            {/* Confirm End Game Modal */}
            <AnimatePresence>
                {showEndConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', zIndex: 100,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="glass-panel"
                            style={{ padding: '30px', borderRadius: '24px', textAlign: 'center', maxWidth: '350px', width: '100%' }}
                        >
                            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '20px', fontWeight: '900' }}>
                                Mettre fin à la partie ?
                            </h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '30px', lineHeight: '1.5' }}>
                                Le classement actuel formera le podium final.
                            </p>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button onClick={cancelEndGame} style={{ flex: 1, padding: '15px', borderRadius: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                                    ANNULER
                                </button>
                                <button onClick={confirmEndGame} style={{ flex: 1, padding: '15px', borderRadius: '16px', background: 'var(--accent-pink)', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                                    OUI, TERMINER
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.div>
    );
};

export default Game;
