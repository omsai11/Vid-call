const express = require('express');
const app = express();
const http = require('http');
const { v4: uuidV4 } = require('uuid');
const server = http.createServer(app);
const io = require('socket.io')(server);

// Set EJS as view engine for rendering HTML templates
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Route to render home page (or index page)
app.get('/', (req, res) => {
    res.render('index');
});

// Route to create a unique meeting room with a UUID
app.get('/create', (req, res) => {
    res.redirect(`/${uuidV4()}`);
});

// Room route that renders the room page with the unique room ID
app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});

// Socket.io event handling
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        // Join a room
        socket.join(roomId);
        // Notify others in the room that a new user has connected
        socket.to(roomId).emit('user-connected', userId);
    });
});

// Use dynamic PORT environment variable or fallback to 3000 for local development
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
