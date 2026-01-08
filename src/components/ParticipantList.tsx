import React from 'react';
import { Users, Check } from 'lucide-react';
import type { Participant } from '../context/GameContext';
import { motion } from 'framer-motion';

interface ParticipantListProps {
  participants: Participant[];
  currentUserId?: string;
}

const ParticipantList: React.FC<ParticipantListProps> = ({ participants, currentUserId }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (id: string) => {
    const colors = [
      'bg-gradient-to-br from-pink-500 to-rose-500',
      'bg-gradient-to-br from-purple-500 to-indigo-500',
      'bg-gradient-to-br from-blue-500 to-cyan-500',
      'bg-gradient-to-br from-green-500 to-emerald-500',
      'bg-gradient-to-br from-yellow-500 to-orange-500',
      'bg-gradient-to-br from-red-500 to-pink-500',
    ];
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <div className="glass-effect rounded-xl p-3">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-5 h-5 text-primary-400" />
        <h2 className="text-lg font-bold">Participants ({participants.length})</h2>
      </div>

      <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
        {participants.map((participant, index) => (
          <motion.div
            key={participant.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-2 p-2 rounded-lg transition-all relative overflow-hidden
              ${participant.id === currentUserId 
                ? 'bg-primary-500/20 ring-1 ring-primary-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                : 'bg-white/5 hover:bg-white/10'}`}
          >
            {participant.id === currentUserId && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent pointer-events-none" />
            )}
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full ${getAvatarColor(participant.id)} flex items-center justify-center text-white font-bold text-xs shadow-lg`}>
              {getInitials(participant.name)}
            </div>

            {/* Name and Status */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold truncate text-sm">{participant.name}</p>
                {participant.isModerator && (
                  <span className="px-1.5 py-0.5 bg-yellow-500 text-yellow-900 text-[10px] font-bold rounded">
                    MOD
                  </span>
                )}
              </div>
              {participant.id === currentUserId && (
                <p className="text-xs text-primary-300">You</p>
              )}
            </div>

            {/* Vote Status */}
            {participant.hasVoted && (
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {participants.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No participants yet</p>
        </div>
      )}
    </div>
  );
};

export default ParticipantList;
