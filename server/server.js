const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

// Health check endpoint for Render/uptime monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// In-memory storage for rooms
const rooms = new Map();

// Generate random room ID
function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Keep-alive mechanism for Render free tier
// Pings the health endpoint every 13 minutes to prevent service sleep
const SELF_PING_INTERVAL = 13 * 60 * 1000; // 13 minutes
const SERVER_URL = process.env.SERVER_URL || 'https://planning-poker-036o.onrender.com';

function startSelfPing() {
  setInterval(() => {
    const https = require('https');
    console.log(`[${new Date().toISOString()}] Sending self-ping to ${SERVER_URL}/health`);
    https.get(`${SERVER_URL}/health`, (res) => {
      console.log(`[${new Date().toISOString()}] Self-ping response: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error(`[${new Date().toISOString()}] Self-ping error:`, err.message);
    });
  }, SELF_PING_INTERVAL);
}

if (process.env.NODE_ENV === 'production') {
  startSelfPing();
}

// Clean up stale empty rooms every 10 minutes
// Rooms are deleted if empty for more than 60 minutes
setInterval(() => {
  const now = Date.now();
  const GRACE_PERIOD = 60 * 60 * 1000; // 60 minutes

  for (const [roomId, room] of rooms.entries()) {
    if (room.participants.length === 0 && room.emptySince && (now - room.emptySince > GRACE_PERIOD)) {
      rooms.delete(roomId);
      console.log(`[${new Date().toISOString()}] Stale room deleted: ${roomId}`);
    }
  }
}, 10 * 60 * 1000);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create a new room
  socket.on('create-room', ({ userName }) => {
    const roomId = generateRoomId();
    const user = {
      id: socket.id,
      name: userName,
      vote: null,
      hasVoted: false,
      isModerator: true,
    };

    rooms.set(roomId, {
      id: roomId,
      participants: [user],
      revealed: false,
      emptySince: null
    });

    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.userId = socket.id;

    socket.emit('room-joined', {
      roomId,
      user,
      participants: [user],
    });

    console.log(`[${new Date().toISOString()}] Room created: ${roomId} by ${userName}`);
  });

  // Join an existing room
  socket.on('join-room', ({ roomId, userName }) => {
    const room = rooms.get(roomId);

    if (!room) {
      socket.emit('error', { message: 'Room not found or expired' });
      return;
    }

    // Reset empty timer if someone joins
    room.emptySince = null;

    const user = {
      id: socket.id,
      name: userName,
      vote: null,
      hasVoted: false,
      isModerator: false,
    };

    room.participants.push(user);
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.userId = socket.id;

    // Notify the user who joined
    socket.emit('room-joined', {
      roomId,
      user,
      participants: room.participants,
    });

    // Notify all other participants
    socket.to(roomId).emit('participants-updated', room.participants);

    console.log(`[${new Date().toISOString()}] ${userName} joined room: ${roomId}`);
  });

  // Vote
  socket.on('vote', ({ roomId, vote }) => {
    const room = rooms.get(roomId);

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    const participant = room.participants.find(p => p.id === socket.id);
    if (participant) {
      participant.vote = vote;
      participant.hasVoted = true;

      // Broadcast updated participants
      io.to(roomId).emit('participants-updated', room.participants);

      console.log(`${participant.name} voted: ${vote}`);
    }
  });

  // Reveal votes
  socket.on('reveal-votes', ({ roomId }) => {
    const room = rooms.get(roomId);

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    const participant = room.participants.find(p => p.id === socket.id);
    if (!participant || !participant.isModerator) {
      socket.emit('error', { message: 'Only moderators can reveal votes' });
      return;
    }

    room.revealed = true;
    io.to(roomId).emit('votes-revealed', room.participants);

    console.log(`Votes revealed in room: ${roomId}`);
  });

  // Reset table
  socket.on('reset-table', ({ roomId }) => {
    const room = rooms.get(roomId);

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    const participant = room.participants.find(p => p.id === socket.id);
    if (!participant || !participant.isModerator) {
      socket.emit('error', { message: 'Only moderators can reset the table' });
      return;
    }

    // Reset all votes
    room.participants.forEach(p => {
      p.vote = null;
      p.hasVoted = false;
    });
    room.revealed = false;

    io.to(roomId).emit('table-reset');
    io.to(roomId).emit('participants-updated', room.participants);

    console.log(`Table reset in room: ${roomId}`);
  });

  // Leave room
  socket.on('leave-room', ({ roomId }) => {
    handleUserLeaving(socket, roomId);
  });

  // Disconnect
  socket.on('disconnect', () => {
    const roomId = socket.data.roomId;
    if (roomId) {
      handleUserLeaving(socket, roomId);
    }
    console.log('User disconnected:', socket.id);
  });

  function handleUserLeaving(socket, roomId) {
    const room = rooms.get(roomId);
    if (!room) return;

    const participantIndex = room.participants.findIndex(p => p.id === socket.id);
    if (participantIndex === -1) return;

    const participant = room.participants[participantIndex];
    room.participants.splice(participantIndex, 1);

    // If room is empty, don't delete immediately. Set a timestamp.
    if (room.participants.length === 0) {
      room.emptySince = Date.now();
      console.log(`[${new Date().toISOString()}] Room ${roomId} is now empty. Starting 60m grace period.`);
    } else {
      // If moderator left, assign new moderator
      if (participant.isModerator && room.participants.length > 0) {
        room.participants[0].isModerator = true;
      }

      // Notify remaining participants
      io.to(roomId).emit('participants-updated', room.participants);
    }

    socket.leave(roomId);
    console.log(`[${new Date().toISOString()}] ${participant.name} left room: ${roomId}`);
  }
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.io server running on port ${PORT}`);
});
