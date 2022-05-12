import { useState, useEffect, useMemo } from "react";
import socket from 'socket.io-client';
import { useLocation } from "react-router-dom";

import TextContainer from '../TextContainer/TextContainer';
import Messages from '../Messages/Messages';
import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';


import './Chat.css'
let io;

function useQuery() {
    const { search } = useLocation()

    return useMemo(() => new URLSearchParams(search), [search])
}

function Chat() {
    let query = useQuery();
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [users, setUsers] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const ENDPOINT = 'http://localhost:3002/';


    const chat = (() => {
        const name = query.get("name")
        const room = query.get("room")

        setName(name)
        setRoom(room)

        io = socket('http://localhost:3002/')

        io.emit('join', { name, room });

    })
    useEffect(() => {
        chat()
       /*  return () => {
            socket.emit('disconnect')

            socket.off()
        } */

    }, [])

   /*  useEffect(() => {
        socket = io(ENDPOINT)

        socket.emit('join', { name, room }, () => {

        });
        return () => {
            socket.emit('disconnect')

            socket.off()
        }

    }, [ENDPOINT])
 */
     useEffect(() => {
        socket.on('message', (message) => {
            setMessages([...messages, message])
        })
    }, [messages])

    const sendMessage = (e) => {
        e.preventDefault();
        
        if (message) {
            io.emit('sendMessage', message, () => setMessage(''));
        } 
    }

    return (
        <div className="outerContainer">
            <div className="container">
                <InfoBar room={room} />
                <Messages messages={messages} name={name} />
                <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
            </div>
            <TextContainer users={users} />
        </div>
    );
}

export default Chat;