const http = require("http");
const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");
require('dotenv').config();

const app = express();
const port = process.env.PORT

const users = [{}]
app.use(cors())
app.get("/", (req, res) => {
    res.send("SERVER is working")
})
const server = http.createServer(app);

const io = socketIO(server)

// this is circuit (on means we will receive from server)
io.on('connection', (socket) => {
    console.log("New Connection from server")

    // user will be joined
    socket.on('joined', ({ user }) => {
        users[socket.id] = user;
        console.log(`${user} has joined`)
        socket.broadcast.emit('userJoined', { user: "Admin", message: `${users[socket.id]} has joined!` })
        socket.emit('welcome', { user: "Admin", message: `Welcome to the chat, ${users[socket.id]}` })
    })

    socket.on('message', ({message, id}) => {
        io.emit('sendMessage', { user: users[id], message, id }) 
    })

    socket.on('disconnected', () => {
        socket.broadcast.emit('leave', { user: 'Admin', message: `${users[socket.id]} has left` })
        console.log(`${users[socket.id]} has left`)
    })

})

server.listen(port, () => {
    console.log(`server is working on http://localhost:${port}`)
})