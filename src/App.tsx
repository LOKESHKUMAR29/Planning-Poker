import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import RoomSetup from './components/RoomSetup';
import Table from './components/Table';
import ParticipantList from './components/ParticipantList';
import ModeratorControls from './components/ModeratorControls';
import { LogOut, Copy, Check, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GameView: React.FC = () => {
  const {
    gameState,
    connected,
    vote,
    revealVotes,
    resetTable,
    leaveRoom,
  } = useGame();

  const [copied, setCopied] = useState(false);

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(gameState.roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentUser = gameState.currentUser;
  const isModerator = currentUser?.isModerator || false;
  const hasVotes = gameState.participants.some(p => p.hasVoted);

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="glass-effect rounded-2xl p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                Planning Poker
              </h1>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                <span className="text-sm font-semibold">{connected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Room ID:</span>
                <code className="px-3 py-1 bg-white/10 rounded font-mono text-primary-300">
                  {gameState.roomId}
                </code>
                <button
                  onClick={handleCopyRoomId}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Copy Room ID"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <button
                onClick={leaveRoom}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Leave</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Participants Sidebar */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <ParticipantList
            participants={gameState.participants}
            currentUserId={currentUser?.id}
          />
        </div>

        {/* Game Area */}
        <div className="lg:col-span-3 order-1 lg:order-2 space-y-6">
          <Table
            participants={gameState.participants}
            currentUserId={currentUser?.id}
            revealed={gameState.revealed}
            onVote={vote}
            selectedVote={currentUser?.vote || null}
          />

          {/* Moderator Controls */}
          {isModerator && (
            <ModeratorControls
              onReveal={revealVotes}
              onReset={resetTable}
              revealed={gameState.revealed}
              hasVotes={hasVotes}
            />
          )}

          {/* Results Summary (when revealed) */}
          <AnimatePresence>
            {gameState.revealed && hasVotes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-effect rounded-2xl p-6"
              >
                <h3 className="text-xl font-bold mb-4">Voting Results</h3>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                    {(() => {
                      const voteCounts = gameState.participants
                        .filter(p => p.vote)
                        .reduce((acc, p) => {
                          acc[p.vote!] = (acc[p.vote!] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>);

                      return Object.entries(voteCounts).map(([vote, count]) => (
                        <div key={vote} className="bg-white/10 rounded-lg p-4 text-center">
                          <div className="text-3xl font-bold text-primary-400">{vote}</div>
                          <div className="text-sm text-gray-400">{count} vote{count !== 1 ? 's' : ''}</div>
                        </div>
                      ));
                    })()}
                  </div>

                  <div className="w-full md:w-auto min-w-[200px] bg-primary-500/20 rounded-lg p-6 flex flex-col items-center justify-center border border-primary-500/30">
                    <div className="text-sm text-primary-300 font-semibold mb-1 uppercase tracking-wider">Average</div>
                    <div className="text-5xl font-bold text-white">
                      {(() => {
                        const numericVotes = gameState.participants
                          .filter(p => p.vote && !isNaN(Number(p.vote)))
                          .map(p => Number(p.vote));
                        
                        if (numericVotes.length === 0) return '-';
                        const sum = numericVotes.reduce((a, b) => a + b, 0);
                        return (sum / numericVotes.length).toFixed(1);
                      })()}
                    </div>
                    <div className="text-xs text-primary-400 mt-2">
                      Based on {gameState.participants.filter(p => p.vote && !isNaN(Number(p.vote))).length} numeric votes
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
};

const AppContent: React.FC = () => {
  const { gameState, createRoom, joinRoom } = useGame();

  if (!gameState.roomId) {
    return <RoomSetup onCreateRoom={createRoom} onJoinRoom={joinRoom} />;
  }

  return <GameView />;
};

export default App;
