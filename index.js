const express = require("express");
const socket = require("socket.io");

const PORT = 4000;

const app = express();
const server = app.listen(PORT, function() {
  console.log(`Running on port ${PORT}`);
});

app.use(express.static("public"));

const io = socket(server);

io.on("connection", socket => {
  console.log("made socket connection");

  socket.on("chat", data => {
    io.sockets.emit("chat", data);
  });

  socket.on("typing", data => {
    socket.broadcast.emit("typing", data);
  });
});
