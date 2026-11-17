import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import { ALLOWED_ORIGINS } from '../config/envConfig.js';

const rawOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim().replace(/\/+$/, '')).filter(Boolean);
const allowedOrigins = Array.from(new Set([...ALLOWED_ORIGINS, ...rawOrigins]));

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle incoming messages
    socket.on('message', (data) => {
        console.log('Message received:', data);
        // Broadcast message to all clients
        io.emit('message', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });

    // Handle errors
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

export { io, server };
