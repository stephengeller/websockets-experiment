const express = require("express");
const socket = require("socket.io");
const mongo = require('mongodb').MongoClient;
require('dotenv').config();
const PORT = process.env.PORT || 4000;
const MONGO_TABLE = process.env.MONGO_TABLE || "development";
const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASS = process.env.MONGO_PASS;
const DB_NAME = process.env.DB_NAME;
const app = express();
const server = app.listen(PORT, function() {
    console.log(`Running on port ${PORT}`);
});
const io = socket(server);
let users = 0;
let usernames = [];

app.use(express.static("public"));

mongo.connect(`mongodb://${MONGO_USER}:${MONGO_PASS}@${DB_NAME}`, {
  useNewUrlParser: true
}, (err, client) => {
  if (err) throw err;

  console.log('Mongodb connected...');


  io.on("connection", socket => {
    users += 1;
    io.emit('currentUsers', users);
    io.emit('updateUsers', usernames);
      console.log(`Connect, ${users} users online`);

    const db = client.db('chatroom-db');
    const chat = db.collection(MONGO_TABLE);

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
    });

    socket.on('clear', () => {
        chat.removeMany({}, () => {
            socket.emit('cleared')
        })
    });

    socket.on('updateUser', userObject => {
         const index = usernames.indexOf(userObject.old);
         if (index === -1) {
             console.log(`adding ${userObject.new} to usernames`);
             usernames.push(userObject.new)
         } else {
             console.log(`changing user ${userObject.old} to ${userObject.new}`);
             usernames[index] = userObject.new
         }
         io.emit('updateUsers', usernames)
    });

    socket.on('typing', function (data) {
        if (data) {
            console.log(`${data.username} is typing...`);
        } else {
            console.log(`${data.username} is no longer typing.`)
        }
        socket.broadcast.emit('typing', data);
    });

    socket.on('disconnect', d => {
        console.log(d);
        users -= 1;
        io.emit('currentUsers', users);
        console.log(`Disconnect, ${users} users online`);
        // const index = usernames.indexOf(userObject.old);
        // if (index > -1) {
        //     console.log(`removing ${userObject.new} from usernames`);
        //     usernames.splice(index, 1);
        //     io.emit('updateUsers', usernames)
        // }
    });
  });
});
