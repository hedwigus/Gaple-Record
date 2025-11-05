import React, { useState } from 'react';
import { PREDEFINED_NAMES } from '../constants';
import { Game, GameStatus, Player } from '../types';
import { LocationIcon, UsersIcon } from './icons';

interface GameSetupProps {
    onGameStart: (game: Game) => void;
}

const GameSetup: React.FC<GameSetupProps> = ({ onGameStart }) => {
    const [location, setLocation] = useState('');
    const [numPlayers] = useState(4);
    const [players, setPlayers] = useState<Player[]>(
        Array.from({ length: 4 }, (_, i) => ({ id: i + 1, name: '' }))
    );

    const handlePlayerNameChange = (index: number, name: string) => {
        const newPlayers = [...players];
        newPlayers[index].name = name;
        setPlayers(newPlayers);
    };

    const handleStartGame = () => {
        const gamePlayers = players.slice(0, numPlayers).map((p, i) => ({
            ...p,
            name: p.name.trim() || `Player ${i + 1}`,
        }));
        onGameStart({
            status: GameStatus.PLAYING,
            location: location.trim() || 'Unknown Location',
            date: new Date().toISOString().split('T')[0],
            players: gamePlayers,
            rounds: [{ scores: {} }],
        });
    };
    
    const canStart = players.slice(0, numPlayers).every(p => p.name.trim() !== "");

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white">Gaple Scorekeeper</h1>
                    <p className="text-gray-400">Set up your 4-player game</p>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-300">Match Location</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LocationIcon className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                                type="text"
                                id="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g., Home"
                                className="bg-gray-700 text-white block w-full pl-10 pr-3 py-2 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        {players.slice(0, numPlayers).map((player, index) => (
                            <div key={player.id}>
                                <label htmlFor={`player-${index}`} className="block text-sm font-medium text-gray-300">
                                    Player {index + 1} Name
                                </label>
                                 <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <UsersIcon className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        id={`player-${index}`}
                                        value={player.name}
                                        onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                                        list="predefined-names"
                                        placeholder={`Enter name`}
                                        className="bg-gray-700 text-white block w-full pl-10 pr-3 py-2 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                        ))}
                        <datalist id="predefined-names">
                            {PREDEFINED_NAMES.map(name => <option key={name} value={name} />)}
                        </datalist>
                    </div>
                </div>

                <button
                    onClick={handleStartGame}
                    disabled={!canStart}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                    Start Game
                </button>
            </div>
        </div>
    );
};

export default GameSetup;