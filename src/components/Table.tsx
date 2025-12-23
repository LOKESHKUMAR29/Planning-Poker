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
  const getParticipantPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    // Elliptical radius to better fit the rectangular (aspect-video) table
    const radiusX = 180;
    const radiusY = 110;
    const x = Math.cos(angle) * radiusX;
    const y = Math.sin(angle) * radiusY;
    return { x, y };
  };

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Poker Table */}
      <div className="relative w-full max-w-4xl aspect-video poker-table rounded-3xl p-8 flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Center Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="absolute text-white/20 text-6xl font-bold"
          >
            POKER
          </motion.div>

          {/* Participants' Cards in Circle */}
          {participants.map((participant, index) => {
            const pos = getParticipantPosition(index, participants.length);
            const isCurrentUser = participant.id === currentUserId;

            return (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="absolute flex flex-col items-center gap-2"
                style={{
                  left: `calc(50% + ${pos.x}px)`,
                  top: `calc(50% + ${pos.y}px)`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Participant Name */}
                <div className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap
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
                  <div className="w-16 h-24 rounded-xl border-2 border-dashed border-white/30 flex items-center justify-center text-white/30 text-xs">
                    Waiting...
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Card Selection */}
      <div className="w-full max-w-4xl">
        <h3 className="text-center text-lg font-semibold mb-4">Select Your Card</h3>
        <div className="flex flex-wrap justify-center gap-4">
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
