# Planning Poker

A real-time, collaborative Planning Poker application built with React, Vite, Tailwind CSS, and Socket.io.

## Features

- 🎴 **Real-time Voting** - Vote using Fibonacci sequence cards (0, 1, 2, 3, 5, 8, 13, 21, ?, ☕)
- 🔒 **Hidden Votes** - Votes remain hidden until the moderator reveals them
- 👥 **Participant Tracking** - See all participants and their voting status
- 👑 **Moderator Controls** - Reveal votes and reset the table
- 🎨 **Modern UI** - Beautiful, responsive design with smooth animations
- 📱 **Mobile Friendly** - Works seamlessly on all devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Real-time**: Socket.io
- **Backend**: Node.js, Express, Socket.io

## Project Structure

```
planning-poker/
├── src/                      # React frontend
│   ├── components/          # UI components
│   │   ├── PokerCard.tsx
│   │   ├── Table.tsx
│   │   ├── ParticipantList.tsx
│   │   ├── ModeratorControls.tsx
│   │   └── RoomSetup.tsx
│   ├── context/
│   │   └── GameContext.tsx  # State management
│   ├── App.tsx
│   └── main.tsx
├── server/                   # Socket.io backend
│   ├── server.js
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd planning-poker
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Set up environment variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   
   For local development, the default `VITE_SOCKET_URL=http://localhost:3001` works fine.

### Running Locally

1. **Start the backend server** (in one terminal):
   ```bash
   cd server
   npm start
   ```
   Server will run on http://localhost:3001

2. **Start the frontend** (in another terminal):
   ```bash
   npm run dev
   ```
   Frontend will run on http://localhost:5173

3. **Open your browser** and navigate to http://localhost:5173

## Deployment

### Deploy to Vercel

#### Frontend Deployment

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy the frontend**:
   ```bash
   vercel
   ```

3. **Set environment variable** in Vercel dashboard:
   - `VITE_SOCKET_URL` = Your Socket.io server URL

#### Backend Deployment

The Socket.io server can be deployed separately to:
- **Vercel** (as a serverless function)
- **Heroku**
- **Railway**
- **DigitalOcean**
- Any Node.js hosting platform

For Vercel deployment of the backend:
1. Create a separate Vercel project for the `server` folder
2. Deploy using `vercel --prod`

**Note**: For production, you'll need to update the `VITE_SOCKET_URL` environment variable to point to your deployed Socket.io server.

## How to Use

1. **Create a Room**
   - Click "Create New Room"
   - Enter your name
   - Share the Room ID with your team

2. **Join a Room**
   - Click "Join Existing Room"
   - Enter the Room ID and your name

3. **Vote**
   - Select a card from the bottom row
   - Your vote is hidden from others

4. **Reveal (Moderator Only)**
   - Click "Reveal Votes" to show all votes
   - View the voting summary

5. **Reset (Moderator Only)**
   - Click "Reset Table" to start a new round

## Features in Detail

### Room System
- Unique room IDs for each session
- Easy room creation and joining
- Automatic moderator assignment (first person in room)
- Moderator transfer if original moderator leaves

### Voting
- Fibonacci sequence: 0, 1, 2, 3, 5, 8, 13, 21
- Special cards: ? (unknown), ☕ (break)
- Real-time vote status indicators
- Hidden votes until reveal

### UI/UX
- Glassmorphism design
- Smooth card flip animations
- Circular participant layout around poker table
- Responsive design for all screen sizes
- Connection status indicator
- Copy room ID functionality

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
