import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// Online users map: userId => socketId
const userSocketMap = {};

// Create socket.io server
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Get a user's socket ID
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// Socket.io connection logic
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} added to userSocketMap`);
  }

  // Notify all clients about current online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Disconnect event
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);

    // Remove user from map
    if (userId && userSocketMap[userId]) {
      delete userSocketMap[userId];
      console.log(`User ${userId} removed from userSocketMap`);
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
