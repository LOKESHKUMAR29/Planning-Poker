const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

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
    });

    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.userId = socket.id;

    socket.emit('room-joined', {
      roomId,
      user,
      participants: [user],
    });

    console.log(`Room created: ${roomId} by ${userName}`);
  });

  // Join an existing room
  socket.on('join-room', ({ roomId, userName }) => {
    const room = rooms.get(roomId);

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

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

    console.log(`${userName} joined room: ${roomId}`);
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

    // If room is empty, delete it
    if (room.participants.length === 0) {
      rooms.delete(roomId);
      console.log(`Room deleted: ${roomId}`);
    } else {
      // If moderator left, assign new moderator
      if (participant.isModerator && room.participants.length > 0) {
        room.participants[0].isModerator = true;
      }

      // Notify remaining participants
      io.to(roomId).emit('participants-updated', room.participants);
    }

    socket.leave(roomId);
    console.log(`${participant.name} left room: ${roomId}`);
  }
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.io server running on port ${PORT}`);
});
