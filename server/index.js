const http = require('http')
const express = require('express')
const app = express()
const cors = require('cors')
const {Server}  = require('socket.io')
const router = require('./router/ServerRouter')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users')

app.use(cors())
app.use(router)

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
})

io.on('connection', (socket) => {
    socket.on('join', ({ name, room }, callback) => {
        const { user, error } = addUser({ id: socket.id, name, room })
        console.log(socket.id)
        if(error) return callback(error)
        
        socket.join(user.room)

        socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}` })
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` })

        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })
        callback()
    })
    

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        console.log(socket.id)
        io.to(user.room).emit('message', { user: user.name, text: message})
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left!`})
            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)})
        }
    })
})

server.listen(3002, () => {
    console.log(`SERVER RUINNING`)
})