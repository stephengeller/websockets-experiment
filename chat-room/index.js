const express = require("express");
const socket = require("socket.io");
const PORT = process.env.PORT || 4000;

const app = express();
const server = app.listen(PORT, function() {
  console.log(`Running on port ${PORT}`);
});

app.use(express.static("public"));

const io = socket(server);

const connections = [];
const users = [];

io.on("connection", socket => {
  connections.push(socket);
  console.log(`Connections: ${connections.length} number of connections`);

  socket.on("chat", data => {
    io.sockets.emit("chat", data);
  });

  socket.on("typing", data => {
    socket.broadcast.emit("typing", data);
  });

  connections.splice(connections.indexOf(socket), 1)
    console.log(`Disconnected: ${connections.length} number of connections`)
});
