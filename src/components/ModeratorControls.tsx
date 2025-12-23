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
      className="flex gap-4 justify-center"
    >
      <button
        onClick={onReveal}
        disabled={revealed || !hasVotes}
        className={`btn-primary flex items-center gap-2 ${
          revealed || !hasVotes ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <Eye className="w-5 h-5" />
        Reveal Votes
      </button>

      <button
        onClick={onReset}
        className="btn-secondary flex items-center gap-2"
      >
        <RotateCcw className="w-5 h-5" />
        Reset Table
      </button>
    </motion.div>
  );
};

export default ModeratorControls;
