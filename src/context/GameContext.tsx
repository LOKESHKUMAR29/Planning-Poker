import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

// Card values for Planning Poker
export const CARD_VALUES = ['1', '2', '3', '5'];

export interface Participant {
  id: string;
  name: string;
  vote: string | null;
  hasVoted: boolean;
  isModerator: boolean;
}

export interface GameState {
  roomId: string;
  participants: Participant[];
  revealed: boolean;
  currentUser: Participant | null;
}

interface GameContextType {
  gameState: GameState;
  socket: Socket | null;
  connected: boolean;
  createRoom: (userName: string) => void;
  joinRoom: (roomId: string, userName: string) => void;
  vote: (value: string) => void;
  revealVotes: () => void;
  resetTable: () => void;
  leaveRoom: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Use environment variable or fallback to localhost for development
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    roomId: '',
    participants: [],
    revealed: false,
    currentUser: null,
  });

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    // Room joined successfully
    newSocket.on('room-joined', (data: { roomId: string; user: Participant; participants: Participant[] }) => {
      console.log('Room joined:', data);
      setGameState(prev => ({
        ...prev,
        roomId: data.roomId,
        currentUser: data.user,
        participants: data.participants,
      }));
      // Update URL to include room ID
      window.history.pushState({}, '', `/${data.roomId}`);
    });

    // Participants updated
    newSocket.on('participants-updated', (participants: Participant[]) => {
      console.log('Participants updated:', participants);
      setGameState(prev => ({
        ...prev,
        participants,
      }));
    });

    // Votes revealed
    newSocket.on('votes-revealed', (participants: Participant[]) => {
      console.log('Votes revealed');
      setGameState(prev => ({
        ...prev,
        revealed: true,
        participants,
      }));
    });

    // Table reset
    newSocket.on('table-reset', () => {
      console.log('Table reset');
      setGameState(prev => ({
        ...prev,
        revealed: false,
        participants: prev.participants.map(p => ({
          ...p,
          vote: null,
          hasVoted: false,
        })),
      }));
    });

    // Error handling
    newSocket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error.message);
      alert(error.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const createRoom = (userName: string) => {
    if (socket) {
      socket.emit('create-room', { userName });
    }
  };

  const joinRoom = (roomId: string, userName: string) => {
    if (socket) {
      socket.emit('join-room', { roomId, userName });
    }
  };

  const vote = (value: string) => {
    if (socket && gameState.roomId) {
      socket.emit('vote', { roomId: gameState.roomId, vote: value });
    }
  };

  const revealVotes = () => {
    if (socket && gameState.roomId) {
      socket.emit('reveal-votes', { roomId: gameState.roomId });
    }
  };

  const resetTable = () => {
    if (socket && gameState.roomId) {
      socket.emit('reset-table', { roomId: gameState.roomId });
    }
  };

  const leaveRoom = () => {
    if (socket && gameState.roomId) {
      socket.emit('leave-room', { roomId: gameState.roomId });
      setGameState({
        roomId: '',
        participants: [],
        revealed: false,
        currentUser: null,
      });
      // Reset URL
      window.history.pushState({}, '', '/');
    }
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        socket,
        connected,
        createRoom,
        joinRoom,
        vote,
        revealVotes,
        resetTable,
        leaveRoom,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

