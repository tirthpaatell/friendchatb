
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  socket.on("join-room", ({ room, username }) => {
    socket.join(room);
    socket.to(room).emit("system", `${username} joined the room`);

    socket.on("chat-message", (msg) => {
      io.to(room).emit("chat-message", msg);
    });

    socket.on("disconnect", () => {
      socket.to(room).emit("system", `${username} left the room`);
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server running on", PORT));
