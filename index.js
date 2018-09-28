const express = require("express");
const socket = require("socket.io");
const mongo = require('mongodb').MongoClient;
const PORT = process.env.PORT || 4000;
const app = express();
const server = app.listen(PORT, function() {
    console.log(`Running on port ${PORT}`);
});
const io = socket(server);

app.use(express.static("public"));

mongo.connect('mongodb://localhost/mongochat', {
  useNewUrlParser: true
}, (err, client) => {
  if (err) throw err;

  console.log('Mongodb connected...');

  io.on("connection", socket => {
    console.log('someone connected')
    const db = client.db('chatroom-db');
    const chat = db.collection('chats');

    const sendStatus = (s) => {
      socket.emit('status', s)
    };
    // chat.
    chat.find({}).limit(100).sort({_id:1}).toArray((err, res) => {
      if (err) throw err;
      socket.emit('output', res)
    });

    socket.on('input', (data) => {
        let name = data.name;
        let message = data.message;

        if (name === '' || message === '') {
            sendStatus('Please enter a name and message')
        } else {
            chat.insertOne({name, message}, () => {
                console.log(data);
                io.emit('output', [data]);
                sendStatus({
                    message: 'Message sent',
                    clear: true
                })
            })
        }
    })

    socket.on('clear', () => {
        chat.removeMany({}, () => {
				socket.emit('cleared')
        })
    })
    socket.on('disconnect', () => {
        console.log('someone disconnected')
    })
  });
});
