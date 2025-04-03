const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const db = require('./models/db');
const userRoutes = require('./routes/userRoutes');
const socketHandler = require('./sockets/socketHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Routes
app.use('/api/users', userRoutes);
app.get('/users', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'users.html'));
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.io
io.on('connection', (socket) => {
    socketHandler(io, socket);
});

// Start server
server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
