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

io.on("connection", socket => {

  socket.on("join-room", ({ room, username }) => {
    socket.join(room);

    socket.to(room).emit("system", {
      text: `${username} joined the room`,
      time: new Date().toLocaleTimeString()
    });

    socket.on("chat-message", msg => {
      io.to(room).emit("chat-message", {
        ...msg,
        time: new Date().toLocaleTimeString()
      });
    });

    socket.on("reaction", data => {
      io.to(room).emit("reaction", data);
    });

    socket.on("disconnect", () => {
      socket.to(room).emit("system", {
        text: `${username} left the room`,
        time: new Date().toLocaleTimeString()
      });
    });
  });

});

server.listen(process.env.PORT || 3000);
