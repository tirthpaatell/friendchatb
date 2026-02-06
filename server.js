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

const rooms = {};

io.on("connection", socket => {

  socket.on("join-room", ({ room, username }) => {
    socket.join(room);
    socket.room = room;
    socket.username = username;

    if (!rooms[room]) rooms[room] = [];
    rooms[room].push(username);

    io.to(room).emit("users", rooms[room]);
    socket.to(room).emit("system", `${username} joined`);

    socket.on("chat-message", msg => {
      io.to(room).emit("chat-message", msg);
    });

    socket.on("typing", status => {
      socket.to(room).emit("typing", {
        user: username,
        status
      });
    });

    socket.on("disconnect", () => {
      rooms[room] = rooms[room].filter(u => u !== username);
      io.to(room).emit("users", rooms[room]);
      socket.to(room).emit("system", `${username} left`);
    });
  });

});

server.listen(process.env.PORT || 3000);
