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

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/${gameState.roomId}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentUser = gameState.currentUser;
  const isModerator = currentUser?.isModerator || false;
  const hasVotes = gameState.participants.some(p => p.hasVoted);

  return (
    <div className="h-screen flex flex-col p-2 md:p-4 overflow-hidden">
      {/* Header */}
      <div className="max-w-7xl w-full mx-auto mb-2">
        <div className="glass-effect rounded-xl p-2 md:px-4 md:py-2">
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                Planning Poker
              </h1>
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                <span className="text-xs font-semibold">{connected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center bg-primary-500/5 rounded-xl border border-primary-500/20 overflow-hidden shadow-inner group">
                <div className="px-3 py-1 flex flex-col items-start leading-none border-r border-primary-500/20 bg-primary-500/10 transition-colors group-hover:bg-primary-500/20">
                  <span className="text-[7px] text-primary-300 font-black uppercase tracking-widest mb-0.5">Room ID</span>
                   <code className="text-[11px] font-mono font-bold text-white ring-offset-2 ring-primary-400/30">
                    {gameState.roomId}
                  </code>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-primary-500 hover:bg-primary-600 transition-all flex items-center gap-2 relative group"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
                  <span className="text-[10px] font-black text-white uppercase tracking-tighter">Copy link</span>
                  {copied && (
                    <motion.span 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-primary-600 font-bold text-[10px] rounded-lg shadow-[0_4px_15px_rgba(0,0,0,0.3)] pointer-events-none whitespace-nowrap z-50 border border-primary-100"
                    >
                      Copied!
                    </motion.span>
                  )}
                </button>
              </div>

              <button
                onClick={leaveRoom}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Leave</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl w-full mx-auto flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-hidden">
        {/* Participants Sidebar */}
        <div className="lg:col-span-1 order-2 lg:order-1 h-fit">
          <ParticipantList
            participants={gameState.participants}
            currentUserId={currentUser?.id}
          />
        </div>

        {/* Game Area */}
        <div className="lg:col-span-3 order-1 lg:order-2 flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-effect rounded-xl p-2.5"
              >
                <div className="flex flex-row items-center justify-between gap-4">
                  <div className="flex flex-row flex-1 gap-2 overflow-x-auto pb-0.5 custom-scrollbar">
                    {(() => {
                      const voteCounts = gameState.participants
                        .filter(p => p.vote)
                        .reduce((acc, p) => {
                          acc[p.vote!] = (acc[p.vote!] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>);

                      return Object.entries(voteCounts).map(([vote, count]) => (
                        <div key={vote} className="bg-white rounded-lg px-3 py-1.5 flex flex-col items-center justify-center min-w-[45px] shadow-lg border border-white/20">
                          <div className="text-xl font-bold text-slate-800 leading-tight">{vote}</div>
                          <div className="text-[9px] font-bold text-primary-600 uppercase tracking-tighter">{count} {count !== 1 ? 'votes' : 'vote'}</div>
                        </div>
                      ));
                    })()}
                  </div>

                  <div className="bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-lg px-4 py-1.5 flex flex-row items-center gap-2 border border-primary-500/30">
                    <div className="flex flex-col items-center leading-none">
                      <span className="text-[9px] text-primary-300 font-bold uppercase tracking-widest">Avg</span>
                      <div className="text-2xl font-black text-white">
                        {(() => {
                          const numericVotes = gameState.participants
                            .filter(p => p.vote && !isNaN(Number(p.vote)))
                            .map(p => Number(p.vote));
                          
                          if (numericVotes.length === 0) return '-';
                          const sum = numericVotes.reduce((a, b) => a + b, 0);
                          return (sum / numericVotes.length).toFixed(1);
                        })()}
                      </div>
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
  const [initialRoomId, setInitialRoomId] = React.useState('');

  React.useEffect(() => {
    const path = window.location.pathname.slice(1);
    if (path && path.length >= 4) { // Basic validation for room ID
      setInitialRoomId(path);
    }
  }, []);

  if (!gameState.roomId) {
    return <RoomSetup onCreateRoom={createRoom} onJoinRoom={joinRoom} initialRoomId={initialRoomId} />;
  }

  return <GameView />;
};

export default App;
