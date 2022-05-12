const express = require('express')
const app = express()
const http = require('http')
const cors = require('cors')
const { Server, Socket } = require('socket.io')
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
    socket.on('join', ({ name, room }) => {
        const { user, error } = addUser({ id: socket.id, name, room })

        if(error) return(error)
        console.log(user)

        socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}` })
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` })

        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })

        socket.join(user.room)
    })

    socket.on('sendMessage', (message) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('message', { user: user.name, text: message})
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