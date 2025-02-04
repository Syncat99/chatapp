import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import axios from "axios";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`${socket.id} joined room: ${room}`);
  });

  async function storeMessageInDB(messageData) {
    try {
      const response = await axios.post("http://localhost:8000/api/createMessage", messageData, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {}
  }

  socket.on("sendMessage", (messageData) => {
    if (!messageData || !messageData.room || !messageData.content) {
      return;
    }

    io.to(messageData.room).emit("receiveMessage", messageData);
    storeMessageInDB(messageData);
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected`);
  });
});

server.listen(3001, () => {
  console.log("running on port 3001");
});
