require('dotenv').config();

const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
const morgan     = require('morgan');
const connectDB  = require('./config/db');


// 1. Connect to the database
connectDB();

// 2. Create the Express app
const app = express();

// 3. Wrap it in a plain HTTP server (needed for Socket.IO)
const server = http.createServer(app);

// 4. Attach Socket.IO to the HTTP server
const io = new Server(server, {
  cors: { origin: '*' } // Allow all origins in development
});

// 5. Middleware — these run on EVERY request before your routes
app.use(cors());             // Allow frontend to call this server
app.use(morgan('dev'));      // Log every request to the terminal (for debugging)
app.use(express.json());     // Parse JSON request bodies

// 6. Routes — we'll add these one by one in Phase 3 & 4
// app.use('/api/auth',      require('./routes/auth'));
// app.use('/api/emergency', require('./routes/emergency'));
// app.use('/api/admin',     require('./routes/admin'));

// 7. Health check — visit http://localhost:5000/health to confirm it's running
app.get('/health', (req, res) => res.json({ status: 'Server is running ✅' }));

// 8. Socket.IO logic lives in its own file
// require('./socket/socketHandler')(io);

// 9. Make `io` accessible inside controllers (needed to emit real-time events)
// app.set('io', io);

// 10. Start listening
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});