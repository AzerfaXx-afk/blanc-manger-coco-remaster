import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Trophy, Clock, Check, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import cardsData from '../data/cards.json';
import { playWin, playPodium, stopMusic, startMusic, playBop } from '../utils/audio';

const PHASES = {
    DEALING: 'DEALING',
    PLAYING: 'PLAYING',
    WAITING: 'WAITING',
    VOTING: 'VOTING',
    REVEAL: 'REVEAL',
    END_GAME: 'END_GAME',
};

const BOTS = [
    { id: 'bot1', name: 'Alex', color: '#ff007f' },
    { id: 'bot2', name: 'Sarah', color: '#00f0ff' }
];

const Game = () => {
    const navigate = useNavigate();

    // Mock host for testing (in real app, get from router state)
    const isHost = true;

    // Game Core State
    const [phase, setPhase] = useState(PHASES.DEALING);
    const [round, setRound] = useState(1);
    const [scores, setScores] = useState({ me: 0, bot1: 0, bot2: 0 });

    // Cards State
    const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);
    const [deck, setDeck] = useState(() => shuffleArray(cardsData.whiteCards.map((text, i) => ({ id: `w_${i}`, text }))));
    const [hand, setHand] = useState([]);

    // Board State
    const [currentBlackCard, setCurrentBlackCard] = useState(() => cardsData.blackCards[Math.floor(Math.random() * cardsData.blackCards.length)]);
    const [mySelection, setMySelection] = useState([]);
    const [submissions, setSubmissions] = useState([]); // All players' submitted cards for voting
    const [votedFor, setVotedFor] = useState(null); // ID of the submission I voted for
    const [winner, setWinner] = useState(null);
    const [lastWinner, setLastWinner] = useState(null); // Used for +1 animation
    const [showEndConfirm, setShowEndConfirm] = useState(false);

    const maxSelections = Math.max(1, currentBlackCard.pick);

    // --- Phase Handlers ---

    // 1. DEALING -> PLAYING
    useEffect(() => {
        if (phase === PHASES.DEALING) {
            // Fill hand to 11 cards
            const cardsNeeded = 11 - hand.length;
            if (cardsNeeded > 0) {
                const newCards = deck.slice(0, cardsNeeded);
                setHand(prev => [...prev, ...newCards]);
                setDeck(prev => prev.slice(cardsNeeded));
            }

            setTimeout(() => {
                setPhase(PHASES.PLAYING);
            }, 1500);
        }
    }, [phase, deck, hand.length]);

    // 2. AUTO-REVEAL (No Timers)
    // Since timers are gone, the "PLAYING" -> "WAITING" happens when user clicks CONFIRMER.
    // The "WAITING" -> "VOTING" happens via timeouts (bot simulation below).
    // The "VOTING" -> "REVEAL" happens instantly when user votes.

    // 3. WAITING -> VOTING
    useEffect(() => {
        if (phase === PHASES.WAITING) {
            // Simulate bots playing
            setTimeout(() => {
                const newSubmissions = [
                    { id: 'sub_me', ownerId: 'me', cards: mySelection },
                    { id: 'sub_bot1', ownerId: 'bot1', cards: shuffleArray(deck).slice(0, maxSelections) },
                    { id: 'sub_bot2', ownerId: 'bot2', cards: shuffleArray(deck).slice(maxSelections, maxSelections * 2) }
                ];
                // Shuffle submissions so we don't know who played what
                setSubmissions(shuffleArray(newSubmissions));

                // Adjust deck for bots
                setDeck(prev => prev.slice(maxSelections * 2));

                setPhase(PHASES.VOTING);
            }, 2000); // 2s perceived waiting time
        }
    }, [phase, mySelection]);


    // --- Actions ---

    const toggleSelection = (card) => {
        if (phase !== PHASES.PLAYING) return;
        playBop();

        if (mySelection.find(c => c.id === card.id)) {
            setMySelection(mySelection.filter(c => c.id !== card.id));
        } else if (mySelection.length < maxSelections) {
            setMySelection([...mySelection, card]);
        }
    };

    const handleConfirmPlay = (finalSelection = mySelection) => {
        if (finalSelection.length !== maxSelections) return;
        setMySelection(finalSelection);

        // Remove played cards from hand immediately
        setHand(hand.filter(c => !finalSelection.find(fs => fs.id === c.id)));
        setPhase(PHASES.WAITING);
    };

    const handleConfirmVote = (submissionId) => {
        setVotedFor(submissionId);

        // Simulate bot votes and determine winner
        const allVotes = [submissionId]; // My vote
        // Bots vote randomly but not for themselves (simplified: just totally random for now)
        allVotes.push(submissions[Math.floor(Math.random() * submissions.length)].id);
        allVotes.push(submissions[Math.floor(Math.random() * submissions.length)].id);

        // Count votes
        const counts = {};
        allVotes.forEach(id => counts[id] = (counts[id] || 0) + 1);

        // Find winner submission id
        let winningId = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
        const winningSubmission = submissions.find(s => s.id === winningId);

        setWinner(winningSubmission.ownerId);
        setLastWinner(winningSubmission.ownerId); // Trigger +1 anim
        setScores(prev => ({
            ...prev,
            [winningSubmission.ownerId]: prev[winningSubmission.ownerId] + 1
        }));
        playWin();
        setPhase(PHASES.REVEAL);

        // Clear out the animation after 2 seconds
        setTimeout(() => setLastWinner(null), 2000);
    };

    const nextRound = () => {
        playBop();
        setRound(r => r + 1);
        setCurrentBlackCard(cardsData.blackCards[Math.floor(Math.random() * cardsData.blackCards.length)]);
        setMySelection([]);
        setSubmissions([]);
        setVotedFor(null);
        setWinner(null);
        setPhase(PHASES.DEALING);
    };

    const requestEndGame = () => {
        playBop();
        setShowEndConfirm(true);
    };

    const confirmEndGame = () => {
        playBop();
        setShowEndConfirm(false);
        stopMusic();
        playPodium();
        setPhase(PHASES.END_GAME);
    };

    const cancelEndGame = () => {
        playBop();
        setShowEndConfirm(false);
    };

    const handleExit = () => {
        playBop();
        stopMusic();
        startMusic(); // Restart proper loop if needed in lobby
        navigate('/lobby');
    };


    // --- Render Helpers ---

    const renderBlackCardText = (mockCards = mySelection) => {
        const parts = currentBlackCard.text.split('_____');
        if (parts.length === 1) {
            // No blanks, just append the answer
            return (
                <React.Fragment>
                    {currentBlackCard.text}
                    {mockCards.length > 0 && (
                        <div style={{ color: 'var(--accent-cyan)', marginTop: '10px' }}>
                            {mockCards.map(c => c.text).join(' ')}
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
                        {mockCards[i] ? mockCards[i].text.replace('.', '') : '[___]'}
                    </span>
                )}
            </React.Fragment>
        ));
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100dvh',
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

                    {/* Scoreboard (Gamified - Top 5 max with overflow indicator) */}
                    <div className="scoreboard-container" style={{
                        display: 'flex', gap: '15px', alignItems: 'center',
                        overflowX: 'auto', scrollbarWidth: 'none', padding: '0 10px',
                        maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
                    }}>
                        {(() => {
                            const sortedScores = Object.entries(scores)
                                .map(([id, score]) => ({ id, name: id === 'me' ? 'VOUS' : BOTS.find(b => b.id === id).name.toUpperCase(), score }))
                                .sort((a, b) => b.score - a.score);

                            const top5 = sortedScores.slice(0, 5);
                            const hasMore = sortedScores.length > 5;

                            return (
                                <>
                                    {top5.map((player, idx) => (
                                        <React.Fragment key={player.id}>
                                            {idx > 0 && <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />}
                                            <div className="score-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', flexShrink: 0 }}>
                                                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{player.name}</span>
                                                <span style={{ fontWeight: '900', color: player.id === 'me' ? 'var(--accent-cyan)' : player.id === 'bot1' ? '#ff007f' : '#00f0ff', fontSize: '1.2rem' }}>{player.score}</span>
                                                <AnimatePresence>
                                                    {lastWinner === player.id && (
                                                        <motion.div initial={{ y: 0, opacity: 1, scale: 0.5 }} animate={{ y: -30, opacity: 0, scale: 1.5 }} transition={{ duration: 1 }} style={{ position: 'absolute', top: 0, color: player.id === 'me' ? 'var(--accent-cyan)' : player.id === 'bot1' ? '#ff007f' : '#00f0ff', fontWeight: '900', textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>+1</motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </React.Fragment>
                                    ))}
                                    {hasMore && (
                                        <ArrowRight color="var(--text-muted)" size={16} style={{ flexShrink: 0, marginLeft: '5px' }} />
                                    )}
                                </>
                            );
                        })()}
                    </div>

                    <div style={{ position: 'absolute', right: '20px', zIndex: 10 }}>
                        {((phase === PHASES.DEALING || phase === PHASES.REVEAL || phase === PHASES.PLAYING || phase === PHASES.VOTING || phase === PHASES.WAITING) && isHost) && (
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
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 20px',
                position: 'relative'
            }}>

                {phase !== PHASES.END_GAME && (
                    <h3 style={{
                        position: 'absolute', top: '0px',
                        fontSize: '0.8rem', letterSpacing: '4px', color: 'var(--text-muted)', textTransform: 'uppercase'
                    }}>
                        Manche {round}
                    </h3>
                )}

                {/* Black Card (Always visible, changes content based on phase) */}
                <motion.div
                    className="black-card-wrapper"
                    layout
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    style={{ position: 'relative', width: '100%', maxWidth: '340px', minHeight: '260px', zIndex: 5 }}
                >
                    <div style={{
                        position: 'absolute', top: '10px', left: '10px', width: '100%', height: '100%',
                        borderRadius: '20px', border: '2px solid rgba(255, 0, 127, 0.4)',
                        boxShadow: '0 0 20px rgba(255, 0, 127, 0.2)', zIndex: 0
                    }} />
                    <div style={{
                        position: 'absolute', top: '-10px', left: '-10px', width: '100%', height: '100%',
                        borderRadius: '20px', border: '2px solid rgba(0, 229, 255, 0.4)',
                        boxShadow: '0 0 20px rgba(0, 229, 255, 0.2)', zIndex: 1
                    }} />

                    <div className="black-card-inner" style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        padding: '30px 20px', borderRadius: '20px',
                        background: 'linear-gradient(135deg, rgba(30,34,43,1) 0%, rgba(20,23,28,1) 100%)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', zIndex: 2
                    }}>
                        {phase === PHASES.END_GAME ? (
                            <>
                                <Trophy size={50} color="var(--accent-pink)" style={{ marginBottom: '15px' }} />
                                <h2 className="black-card-text" style={{ fontSize: '1.5rem', fontWeight: '900', lineHeight: '1.4', color: 'var(--accent-cyan)' }}>
                                    PARTIE TERMINÉE
                                </h2>
                                <div style={{ marginTop: '5px', color: 'var(--text-muted)' }}>Le podium est prêt !</div>
                            </>
                        ) : phase === PHASES.REVEAL ? (
                            <>
                                <Trophy size={40} color="var(--accent-pink)" style={{ marginBottom: '15px' }} />
                                <h2 className="black-card-text" style={{ fontSize: '1.2rem', fontWeight: '900', lineHeight: '1.4' }}>
                                    {renderBlackCardText(submissions.find(s => s.ownerId === winner)?.cards || [])}
                                </h2>
                                <div style={{ marginTop: '20px', color: winner === 'me' ? 'var(--accent-cyan)' : 'var(--text-muted)', fontWeight: 'bold' }}>
                                    {winner === 'me' ? 'VOUS AVEZ GAGNÉ LA MANCHE !' : `${winner.toUpperCase()} REMPORTE LE POINT`}
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '15px' }}>
                                    {phase === PHASES.VOTING ? 'VOTER POUR LA MEILLEURE' : 'CARTE QUESTION'}
                                </div>
                                <h2 className="black-card-text" style={{ fontSize: '1.2rem', fontWeight: '900', lineHeight: '1.4' }}>
                                    {renderBlackCardText(mySelection)}
                                </h2>
                                {(phase === PHASES.PLAYING || phase === PHASES.DEALING) && (
                                    <div style={{ marginTop: 'auto', paddingTop: '20px', color: 'var(--accent-blue)', fontWeight: 'bold', fontSize: '0.75rem', letterSpacing: '1px' }}>
                                        {maxSelections} CARTE{maxSelections > 1 ? 'S' : ''} REQUISE{maxSelections > 1 ? 'S' : ''}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Center message for waiting phase */}
                <AnimatePresence>
                    {phase === PHASES.WAITING && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ position: 'absolute', bottom: '20px', fontWeight: 'bold', color: 'var(--accent-cyan)', textAlign: 'center' }}
                        >
                            EN ATTENTE DES AUTRES JOUEURS...
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Section: Interactive Area (Hand or Voting Options) */}
            <div className="glass-panel bottom-panel" style={{
                position: 'relative',
                zIndex: 10,
                padding: '20px 0',
                borderRadius: '30px 30px 0 0',
                borderBottom: 'none',
                boxShadow: '0 -10px 40px rgba(0,0,0,0.8)',
                flexShrink: 0,
                minHeight: '280px',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '2px', fontWeight: 'bold', marginBottom: '15px' }}>
                    {phase === PHASES.VOTING ? 'RÉPONSES ANONYMES' : phase === PHASES.END_GAME ? 'RÉSULTATS FINAUX' : 'VOTRE MAIN (11 CARTES)'}
                </div>

                {/* Hand View */}
                {(phase === PHASES.DEALING || phase === PHASES.PLAYING || phase === PHASES.WAITING) && (
                    <div className="hand-container" style={{
                        display: 'flex', overflowX: 'auto', gap: '15px', padding: '35px 20px 100px 20px',
                        scrollSnapType: 'x mandatory', flex: 1, alignItems: 'center'
                    }}>
                        <AnimatePresence>
                            {hand.map((card, index) => {
                                const isSelected = mySelection.find(c => c.id === card.id);
                                const selectionIndex = mySelection.findIndex(c => c.id === card.id);

                                return (
                                    <motion.div
                                        key={card.id}
                                        initial={phase === PHASES.DEALING ? { opacity: 0, y: 50, scale: 0.8 } : { opacity: 1, y: 0, scale: 1 }}
                                        animate={{
                                            opacity: phase === PHASES.WAITING && !isSelected ? 0.3 : 1,
                                            y: isSelected ? -15 : 0,
                                            scale: 1
                                        }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        transition={{
                                            delay: phase === PHASES.DEALING ? index * 0.05 : 0,
                                            type: 'spring', stiffness: 300, damping: 20
                                        }}
                                        onClick={() => toggleSelection(card)}
                                        className="white-card"
                                        style={{
                                            background: isSelected ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                                            borderRadius: '16px', padding: '15px', minWidth: '130px', height: '190px',
                                            border: isSelected ? '2px solid var(--accent-pink)' : '1px solid rgba(255,255,255,0.1)',
                                            boxShadow: isSelected ? '0 0 15px rgba(255,0,127,0.4)' : 'none',
                                            cursor: phase === PHASES.PLAYING ? 'pointer' : 'default',
                                            display: 'flex', flexDirection: 'column', scrollSnapAlign: 'center', flexShrink: 0,
                                            position: 'relative'
                                        }}
                                    >
                                        <div className="white-card-text" style={{ flex: 1, fontSize: '0.9rem', fontWeight: '700', lineHeight: '1.3', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {card.text}
                                        </div>
                                        <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 'auto', textAlign: 'center' }}>
                                            Au Fond Du Trou
                                        </div>
                                        {isSelected && (
                                            <div style={{
                                                position: 'absolute', top: '-10px', right: '-10px', background: 'var(--accent-pink)',
                                                width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 'bold', fontSize: '0.8rem'
                                            }}>
                                                {selectionIndex + 1}
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}

                {/* Voting View */}
                {phase === PHASES.VOTING && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '0 20px', overflowY: 'auto' }}>
                        {submissions.map((sub) => {
                            const isMySub = sub.ownerId === 'me';
                            return (
                                <motion.div
                                    key={sub.id}
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onClick={() => !isMySub && handleConfirmVote(sub.id)}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px', padding: '15px',
                                        cursor: isMySub ? 'not-allowed' : 'pointer',
                                        opacity: isMySub ? 0.5 : 1,
                                        display: 'flex', alignItems: 'center', gap: '15px'
                                    }}
                                >
                                    <div style={{ flex: 1, fontSize: '0.95rem', fontWeight: '800', textAlign: 'center' }}>
                                        {sub.cards.map(c => c.text).join(' / ')}
                                    </div>
                                    {isMySub && <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', textAlign: 'center' }}>(VOTRE CARTE)</span>}
                                </motion.div>
                            );
                        })}
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
                                onClick={nextRound}
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
                            const sortedScores = Object.entries(scores)
                                .map(([id, score]) => ({ id, name: id === 'me' ? 'Vous' : BOTS.find(b => b.id === id).name, score }))
                                .sort((a, b) => b.score - a.score);

                            const top3 = sortedScores.slice(0, 3);
                            const remaining = sortedScores.slice(3);

                            return (
                                <>
                                    {/* Podium Top 3 */}
                                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '15px', height: '180px', marginBottom: '30px', width: '100%' }}>
                                        {[1, 0, 2].map((idx) => {
                                            const player = top3[idx];
                                            if (!player) return null;
                                            const isFirst = idx === 0;
                                            const isSecond = idx === 1;
                                            const isThird = idx === 2;
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
                                                        position: 'absolute', top: '-40px', background: 'rgba(0,0,0,0.5)',
                                                        padding: '4px 8px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 'bold'
                                                    }}>
                                                        {player.name}
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

                                    {/* Remaining Players List (Mario Kart Style) */}
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
                    {phase === PHASES.PLAYING && mySelection.length === maxSelections && (
                        <motion.div
                            className="confirm-panel"
                            initial={{ y: 80, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 80, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            style={{ position: 'absolute', bottom: '15px', left: 0, width: '100%', display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 20 }}
                        >
                            <motion.button
                                className="confirm-btn"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { playBop(); handleConfirmPlay(); }}
                                style={{
                                    pointerEvents: 'auto', padding: '16px 30px', borderRadius: '30px', fontSize: '1rem', fontWeight: '900',
                                    display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textTransform: 'uppercase',
                                    background: 'linear-gradient(135deg, var(--accent-cyan) 0%, rgba(0, 168, 255, 0.8) 100%)',
                                    color: '#fff', border: 'none', boxShadow: '0 10px 25px rgba(0, 229, 255, 0.4)'
                                }}
                            >
                                CONFIRMER <Check size={20} />
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
