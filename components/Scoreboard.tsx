import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Game, Player, Round, GameStatus } from '../types';
import { PlusCircleIcon, ShareIcon, CheckCircleIcon, RestartIcon, CrownIcon } from './icons';

interface ScoreboardProps {
    game: Game;
    onGameUpdate: (game: Game) => void;
    onNewGame: () => void;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ game, onGameUpdate, onNewGame }) => {
    const [shareMessage, setShareMessage] = useState('');

    // --- Chimp Sound Logic ---
    const chimpSoundDataUrl = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
    const chimpAudio = useMemo(() => new Audio(chimpSoundDataUrl), []);
    const prevRoundCountRef = useRef(game.rounds.length);

    useEffect(() => {
        const currentRoundCount = game.rounds.length;
        // Play sound only when a round is added, not on initial load
        if (currentRoundCount > prevRoundCountRef.current && currentRoundCount > 0 && currentRoundCount % 10 === 0) {
            chimpAudio.play().catch(e => console.error("Error playing sound:", e));
        }
        prevRoundCountRef.current = currentRoundCount;
    }, [game.rounds.length, chimpAudio]);


    const handleScoreChange = (roundIndex: number, playerId: number, score: string) => {
        const newRounds = [...game.rounds];
        const newScore = score === '' ? '' : parseInt(score, 10);
        
        if (isNaN(newScore as number) && score !== '') return;

        newRounds[roundIndex] = {
            ...newRounds[roundIndex],
            scores: {
                ...newRounds[roundIndex].scores,
                [playerId]: newScore,
            },
        };
        onGameUpdate({ ...game, rounds: newRounds });
    };

    const addRound = () => {
        if (game.status === GameStatus.FINISHED) return;
        const newRounds = [...game.rounds, { scores: {} }];
        onGameUpdate({ ...game, rounds: newRounds });
    };

    const finishGame = () => {
        onGameUpdate({ ...game, status: GameStatus.FINISHED });
    };
    
    const generateShareText = (totals: Record<number, number>) => {
        const sortedPlayers = [...game.players].sort((a, b) => totals[a.id] - totals[b.id]);

        let text = `*Domino Game Results*\n`;
        text += `*Date:* ${game.date}\n`;
        text += `*Location:* ${game.location}\n\n`;
        text += `*Final Scores:*\n`;
        sortedPlayers.forEach((p, index) => {
            text += `${index + 1}. *${p.name}:* ${totals[p.id]}${index === 0 ? ' (Winner 🏆)' : ''}\n`;
        });
        text += `\nThanks for playing!`;
        return text;
    };

    const shareResults = async (totals: Record<number, number>) => {
        const textToShare = generateShareText(totals);
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Domino Game Results',
                    text: textToShare,
                });
                setShareMessage('Shared successfully!');
            } catch (error) {
                console.error('Error sharing:', error);
                setShareMessage('Could not share.');
            }
        } else {
            navigator.clipboard.writeText(textToShare);
            setShareMessage('Results copied to clipboard!');
        }
        setTimeout(() => setShareMessage(''), 3000);
    };

    const totalScores = useMemo(() => {
        const totals: Record<number, number> = {};
        game.players.forEach(p => totals[p.id] = 0);
        game.rounds.forEach(round => {
            game.players.forEach(player => {
                totals[player.id] += Number(round.scores[player.id] || 0);
            });
        });
        return totals;
    }, [game.rounds, game.players]);

    const { minTotal, maxTotal, isTie } = useMemo(() => {
        // Fix: Cast scores to number[] to resolve type inference issue with Object.values.
        const scores = Object.values(totalScores) as number[];
        if (scores.length === 0) return { minTotal: 0, maxTotal: 0, isTie: true };
        const min = Math.min(...scores);
        const max = Math.max(...scores);
        const uniqueScores = new Set(scores);
        return { minTotal: min, maxTotal: max, isTie: uniqueScores.size === 1 };
    }, [totalScores]);

    const getScoreCellStyle = (score: number | '', scoresInRound: (number | '')[]) => {
        // Only consider non-empty, numeric scores for highlighting.
        const numericScores = scoresInRound.filter(s => typeof s === 'number') as number[];
        
        // We need at least two scores to compare. The score to be styled must also be a number.
        if (numericScores.length < 2 || typeof score !== 'number') {
            return '';
        }
        
        const minScore = Math.min(...numericScores);
        const maxScore = Math.max(...numericScores);

        // Don't highlight if all entered scores are the same.
        if (minScore === maxScore) {
            return '';
        }

        // Highlight the smallest score (including 0) in green.
        if (score === minScore) {
            return 'bg-green-800/50 text-green-300';
        }
        
        // Highlight the largest score in red.
        if (score === maxScore) {
            return 'bg-red-800/50 text-red-300';
        }

        return '';
    };

    return (
        <div className="min-h-screen p-4 pt-6 md:p-8 bg-gradient-to-br from-gray-800 via-gray-900 to-black bg-fixed">
            <header className="max-w-4xl mx-auto mb-6">
                <h1 className="text-3xl font-bold text-white text-center">Scoreboard</h1>
                <p className="text-gray-400 text-center">{game.location} - {game.date}</p>
            </header>
            
            <main className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-2xl">
                <table className="w-full text-center table-fixed">
                    <thead className="sticky top-0 z-20 bg-gray-700 shadow-md">
                        <tr>
                            <th className="p-2 md:p-4 font-semibold text-gray-300 w-1/5">Round</th>
                            {game.players.map(player => (
                                <th key={player.id} className="p-2 md:p-4 font-semibold text-gray-300 w-1/5">
                                    <span className="break-words">{player.name}</span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="sticky top-10 md:top-14 z-10 bg-gray-900 shadow-md">
                            <td className="p-2 md:p-3 font-bold text-lg text-white">Total</td>
                            {game.players.map(player => {
                                const total = totalScores[player.id];
                                const isWinner = game.status === GameStatus.FINISHED && !isTie && total === minTotal;
                                let cellStyle = '';
                                if (!isTie) {
                                    if (total === minTotal) cellStyle = 'bg-green-500 text-white font-bold';
                                    if (total === maxTotal) cellStyle = 'bg-red-500 text-white font-bold';
                                }
                                return (
                                    <td key={player.id} className={`p-2 md:p-3 font-bold text-lg transition-colors duration-300 ${cellStyle}`}>
                                        <div className="flex items-center justify-center gap-2">
                                            {isWinner && <CrownIcon className="h-5 w-5 text-yellow-300"/>}
                                            {total}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                        {game.rounds.map((round, roundIndex) => (
                            <tr key={roundIndex} className="border-b border-gray-700 last:border-b-0">
                                <td className="p-2 md:p-4 font-semibold text-gray-400">{roundIndex + 1}</td>
                                {game.players.map(player => (
                                    <td key={player.id} className={`p-1 md:p-2 transition-colors duration-300 ${getScoreCellStyle(round.scores[player.id], Object.values(round.scores))}`}>
                                        <input
                                            type="number"
                                            value={round.scores[player.id] || ''}
                                            onChange={e => handleScoreChange(roundIndex, player.id, e.target.value)}
                                            disabled={game.status === GameStatus.FINISHED || roundIndex < game.rounds.length - 1}
                                            className="w-full bg-transparent text-center text-lg text-white font-mono p-1 md:p-2 rounded-md focus:outline-none focus:bg-gray-700/50 disabled:cursor-not-allowed disabled:opacity-70"
                                            placeholder="-"
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>

            <footer className="max-w-4xl mx-auto mt-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {game.status === GameStatus.PLAYING && (
                        <>
                            <button onClick={addRound} className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-200 bg-indigo-900/50 hover:bg-indigo-800/50 transition-colors">
                                <PlusCircleIcon className="h-5 w-5" />
                                Add Round
                            </button>
                            <button onClick={finishGame} className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md text-green-200 bg-green-900/50 hover:bg-green-800/50 transition-colors">
                                <CheckCircleIcon className="h-5 w-5" />
                                Finish Game
                            </button>
                        </>
                    )}
                    {game.status === GameStatus.FINISHED && (
                        <>
                            <button onClick={() => shareResults(totalScores)} className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md text-cyan-200 bg-cyan-900/50 hover:bg-cyan-800/50 transition-colors">
                                <ShareIcon className="h-5 w-5" />
                                {shareMessage ? shareMessage : 'Share Results'}
                            </button>
                             <button onClick={onNewGame} className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md text-yellow-200 bg-yellow-900/50 hover:bg-yellow-800/50 transition-colors">
                                <RestartIcon className="h-5 w-5" />
                                New Game
                            </button>
                        </>
                    )}
                </div>
            </footer>
        </div>
    );
};

export default Scoreboard;