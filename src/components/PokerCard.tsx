import React from 'react';
import { motion } from 'framer-motion';

interface PokerCardProps {
  value: string;
  isRevealed: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
}

const PokerCard: React.FC<PokerCardProps> = ({
  value,
  isRevealed,
  isSelected = false,
  onClick,
  size = 'medium',
}) => {
  const sizeClasses = {
    small: 'w-16 h-24 text-xl',
    medium: 'w-20 h-28 text-2xl',
    large: 'w-24 h-36 text-3xl',
  };

  return (
    <motion.div
      className={`relative cursor-pointer ${sizeClasses[size]}`}
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="relative w-full h-full"
        initial={false}
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Card Back */}
        <div
          className={`absolute w-full h-full rounded-xl card-back flex items-center justify-center
            ${isSelected ? 'ring-4 ring-yellow-400' : ''}
            ${!isRevealed ? 'opacity-100' : 'opacity-0'}`}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)',
          }}
        >
          <div className="text-white/30 text-4xl font-bold">PP</div>
        </div>

        {/* Card Front */}
        <div
          className={`absolute w-full h-full rounded-xl bg-white shadow-2xl flex items-center justify-center
            ${isSelected ? 'ring-4 ring-yellow-400' : ''}
            ${isRevealed ? 'opacity-100' : 'opacity-0'}`}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <span className="font-bold text-gray-800">{value}</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PokerCard;
