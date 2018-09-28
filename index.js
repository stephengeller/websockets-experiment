const express = require("express");
const socket = require("socket.io");
const mongo = require('mongodb').MongoClient;
const PORT = process.env.PORT || 4000;
const MONGO_USER = process.env.MONGO_USER
const MONGO_PASS = process.env.MONGO_PASS
const app = express();
const server = app.listen(PORT, function() {
    console.log(`Running on port ${PORT}`);
});
const io = socket(server);
let users = 0

app.use(express.static("public"));

mongo.connect(`mongodb://${MONGO_USER}:${MONGO_PASS}@ds245687.mlab.com:45687/chatroom-db`, {
  useNewUrlParser: true
}, (err, client) => {
  if (err) throw err;

  console.log('Mongodb connected...');


  io.on("connection", socket => {
    users += 1
    io.emit('currentUsers', users)
    console.log(`Connect, ${users} users online`)

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
        users -= 1
        io.emit('currentUsers', users)
        console.log(`Disconnect, ${users} users online`)
    })
  });
});
