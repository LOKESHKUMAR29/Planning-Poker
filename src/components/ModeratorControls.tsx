import React from 'react';
import { Eye, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface ModeratorControlsProps {
  onReveal: () => void;
  onReset: () => void;
  revealed: boolean;
  hasVotes: boolean;
}

const ModeratorControls: React.FC<ModeratorControlsProps> = ({
  onReveal,
  onReset,
  revealed,
  hasVotes,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2 justify-center"
    >
      <button
        onClick={onReveal}
        disabled={revealed || !hasVotes}
        className={`bg-primary-500 hover:bg-primary-600 px-4 py-1.5 rounded-lg text-white text-sm font-bold flex items-center gap-2 transition-all ${
          revealed || !hasVotes ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <Eye className="w-4 h-4" />
        Reveal
      </button>

      <button
        onClick={onReset}
        className="bg-accent-500 hover:bg-accent-600 px-4 py-1.5 rounded-lg text-white text-sm font-bold flex items-center gap-2 transition-all"
      >
        <RotateCcw className="w-4 h-4" />
        Reset
      </button>
    </motion.div>
  );
};

export default ModeratorControls;
