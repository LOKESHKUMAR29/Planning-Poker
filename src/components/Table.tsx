import React from 'react';
import PokerCard from './PokerCard';
import { CARD_VALUES } from '../context/GameContext';
import type { Participant } from '../context/GameContext';
import { motion } from 'framer-motion';

interface TableProps {
  participants: Participant[];
  currentUserId?: string;
  revealed: boolean;
  onVote: (value: string) => void;
  selectedVote: string | null;
}

const Table: React.FC<TableProps> = ({
  participants,
  currentUserId,
  revealed,
  onVote,
  selectedVote,
}) => {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Poker Table */}
      <div className="relative w-full max-w-2xl min-h-[160px] poker-table rounded-3xl p-4 flex flex-col items-center justify-center overflow-hidden">
        {/* Center Logo/Text - Branded behind cards */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white/5 text-6xl font-black italic tracking-tighter"
          >
            POKER
          </motion.div>
        </div>

        <div className="relative w-full flex flex-wrap justify-center items-center gap-4 z-10">
          {participants.map((participant, index) => {
            const isCurrentUser = participant.id === currentUserId;

            return (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${
                  isCurrentUser ? 'bg-primary-500/10 ring-1 ring-primary-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : ''
                }`}
              >
                {/* Participant Name */}
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap
                  ${isCurrentUser ? 'bg-primary-500 text-white' : 'bg-white/10 text-white'}`}>
                  {participant.name}
                  {participant.isModerator && ' 👑'}
                </div>

                {/* Card */}
                {participant.hasVoted ? (
                  <PokerCard
                    value={participant.vote || '?'}
                    isRevealed={revealed}
                    size="small"
                  />
                ) : (
                  <div className="w-16 h-24 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center text-white/20 text-[10px] bg-white/5">
                    Waiting...
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Card Selection */}
      <div className="w-full max-w-2xl">
        <h3 className="text-center text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">Select Card</h3>
        <div className="flex flex-wrap justify-center gap-2">
          {CARD_VALUES.map((value, index) => (
            <motion.div
              key={value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <PokerCard
                value={value}
                isRevealed={true}
                isSelected={selectedVote === value}
                onClick={() => onVote(value)}
                size="medium"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Table;
