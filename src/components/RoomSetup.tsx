import React, { useState } from 'react';
import { Sparkles, LogIn} from 'lucide-react';
import { motion } from 'framer-motion';

interface RoomSetupProps {
  onCreateRoom: (userName: string) => void;
  onJoinRoom: (roomId: string, userName: string) => void;
  initialRoomId?: string;
}

const RoomSetup: React.FC<RoomSetupProps> = ({ onCreateRoom, onJoinRoom, initialRoomId }) => {
  const [mode, setMode] = useState<'select' | 'create' | 'join'>(initialRoomId ? 'join' : 'select');
  const [userName, setUserName] = useState('');
  const [roomId, setRoomId] = useState(initialRoomId || '');

  React.useEffect(() => {
    if (initialRoomId) {
      setMode('join');
      setRoomId(initialRoomId);
    }
  }, [initialRoomId]);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      onCreateRoom(userName.trim());
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim() && roomId.trim()) {
      onJoinRoom(roomId.trim(), userName.trim());
    }
  };

  if (mode === 'select') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-8">
            <motion.h1
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent"
            >
              Planning Poker
            </motion.h1>
            <p className="text-gray-300">Collaborative estimation made easy</p>
          </div>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode('create')}
              className="w-full glass-effect p-6 rounded-2xl hover:bg-white/20 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold">Create New Room</h3>
                  <p className="text-sm text-gray-400">Start a new planning session</p>
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode('join')}
              className="w-full glass-effect p-6 rounded-2xl hover:bg-white/20 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <LogIn className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold">Join Existing Room</h3>
                  <p className="text-sm text-gray-400">Enter a room code to join</p>
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md w-full glass-effect rounded-2xl p-8"
        >
          <h2 className="text-3xl font-bold mb-6">Create New Room</h2>
          <form onSubmit={handleCreateRoom} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Your Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMode('select')}
                className="flex-1 px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 font-semibold transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
              >
                Create Room
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-md w-full glass-effect rounded-2xl p-8"
      >
        <h2 className="text-3xl font-bold mb-6">Join Room</h2>
        <form onSubmit={handleJoinRoom} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Room ID</label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room ID"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Your Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setMode('select')}
              className="flex-1 px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 font-semibold transition-all"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
            >
              Join Room
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RoomSetup;
