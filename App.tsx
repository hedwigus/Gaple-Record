
import React, { useState, useEffect, useCallback } from 'react';
import GameSetup from './components/GameSetup';
import Scoreboard from './components/Scoreboard';
import { Game, GameStatus } from './types';

const App: React.FC = () => {
    const [game, setGame] = useState<Game | null>(null);

    useEffect(() => {
        try {
            const savedGame = localStorage.getItem('dominoGame');
            if (savedGame) {
                setGame(JSON.parse(savedGame));
            }
        } catch (error) {
            console.error("Failed to load game from local storage", error);
            setGame(null);
        }
    }, []);

    useEffect(() => {
        if (game) {
            try {
                localStorage.setItem('dominoGame', JSON.stringify(game));
            } catch (error) {
                console.error("Failed to save game to local storage", error);
            }
        }
    }, [game]);

    const handleGameStart = useCallback((newGame: Game) => {
        setGame(newGame);
    }, []);

    const handleGameUpdate = useCallback((updatedGame: Game) => {
        setGame(updatedGame);
    }, []);

    const handleNewGame = useCallback(() => {
        localStorage.removeItem('dominoGame');
        setGame(null);
    }, []);

    if (!game || game.status === GameStatus.SETUP) {
        return <GameSetup onGameStart={handleGameStart} />;
    }

    return <Scoreboard game={game} onGameUpdate={handleGameUpdate} onNewGame={handleNewGame} />;
};

export default App;
