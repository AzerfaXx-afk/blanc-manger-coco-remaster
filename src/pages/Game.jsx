import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const mockHand = [
    { id: 1, text: "Une pipe avec les dents." },
    { id: 2, text: "Le compte en banque de l'Abbé Pierre." },
    { id: 3, text: "Pleurer dans les toilettes du bureau." },
    { id: 4, text: "Mourir puceau." },
    { id: 5, text: "Un aller simple pour le Rwanda." },
    { id: 6, text: "Le râtelier de Papi." }
];

const Game = () => {
    const [hand, setHand] = useState(mockHand);
    const [playedCard, setPlayedCard] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null);

    const question = "Pour excuser mon retard au boulot, j'ai dit à mon boss que j'étais bloqué à cause de ____________.";

    const handlePlay = () => {
        if (selectedCard) {
            setPlayedCard(selectedCard);
            setHand(hand.filter(c => c.id !== selectedCard.id));
            setSelectedCard(null);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Top Section: Question */}
            <div style={{
                flex: '0 0 auto',
                padding: '20px',
                display: 'flex',
                justifyContent: 'center',
                paddingTop: '40px'
            }}>
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', bounce: 0.4 }}
                >
                    <Card
                        type="question"
                        text={question}
                        style={{ width: '90%', maxWidth: '350px', height: '220px', margin: '0 auto' }}
                    />
                </motion.div>
            </div>

            {/* Middle Section: Drop Zone / Status */}
            <div style={{
                flex: '1 1 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
            }}>
                <AnimatePresence>
                    {playedCard ? (
                        <motion.div
                            initial={{ scale: 0.5, y: 100, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1, rotate: Math.random() * 10 - 5 }}
                            transition={{ type: 'spring' }}
                        >
                            <Card text={playedCard.text} style={{ opacity: 0.5 }} />
                            <div style={{ textAlign: 'center', marginTop: '10px', color: 'var(--accent-neon)', fontWeight: 'bold' }}>
                                Carte jouée !
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            style={{
                                border: '2px dashed rgba(255,255,255,0.2)',
                                borderRadius: '16px',
                                width: '180px',
                                height: '250px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--text-muted)'
                            }}
                        >
                            Pose ta carte ici
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Section: Hand */}
            <div style={{
                flex: '0 0 auto',
                padding: '20px',
                paddingBottom: '40px',
                position: 'relative',
                zIndex: 10
            }}>
                {!playedCard && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '20px',
                        opacity: selectedCard ? 1 : 0,
                        transition: 'opacity 0.2s',
                        height: '48px'
                    }}>
                        <Button variant="primary" onClick={handlePlay} style={{ width: 'auto', padding: '10px 40px' }}>
                            JOUER CETTE CARTE
                        </Button>
                    </div>
                )}

                <div style={{
                    display: 'flex',
                    overflowX: 'auto',
                    gap: '15px',
                    padding: '20px 0',
                    scrollSnapType: 'x mandatory',
                    visibility: playedCard ? 'hidden' : 'visible'
                }}>
                    <AnimatePresence>
                        {hand.map((card, index) => (
                            <motion.div
                                key={card.id}
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, y: -100, scale: 0.5 }}
                                transition={{ delay: index * 0.1 }}
                                style={{ scrollSnapAlign: 'center' }}
                            >
                                <Card
                                    text={card.text}
                                    isSelected={selectedCard?.id === card.id}
                                    onClick={() => setSelectedCard(card)}
                                    style={{ shrink: 0 }}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Game;
