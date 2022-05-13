import { useState, useEffect, useMemo, useCallback } from "react";
import io from 'socket.io-client';
import { useLocation } from "react-router-dom";

import TextContainer from '../TextContainer/TextContainer';
import Messages from '../Messages/Messages';
import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';


import './Chat.css'
let socket;

function useQuery() {
    const { search } = useLocation()

    return useMemo(() => new URLSearchParams(search), [search])
}

function Chat() {
    let query = useQuery();
    const [name, setName] = useState(query.get("name"));
    const [room, setRoom] = useState(query.get("room"));
    const [users, setUsers] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);


    useEffect(() => {
        /* const name = query.get("name")
        const room = query.get("room") */


        socket = io('http://localhost:3002/')

        socket.emit('join', { name, room }, (error) => {
            if (error) {
                alert(error);
            }
        });
    }, [])

    useEffect(() => {
        socket.on('message', message => {
            setMessages(messages => [...messages, message]);
        });

        socket.on("roomData", ({ users }) => {
            setUsers(users);
        });
    }, []);

    const sendMessage = (event) => {
        event.preventDefault();

        if (message) {
            socket.emit('sendMessage', message, () => setMessage(''));
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