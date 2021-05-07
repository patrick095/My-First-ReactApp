import React, { useEffect, useState } from 'react';
import { socket } from '../../services/api';
import chatLogo from '../../assets/chat.png'

import "./styles.css";

function Chat(){
    
    const [chat, setChat] = useState({open:false, name:null,newMsgs:[], insertNameMode: false});
    useEffect(()=>{
        const info = JSON.parse(localStorage.getItem('chat_info'));
        if (!info) {
            return setChat({...chat, newMsgs: [{msg:"Por favor, insira seu nome", author: 'Sistema'}], insertNameMode: true});
        }
        else {
        listenSocket(info)
        }
    },[]);

    function listenSocket(info){
        if (info === 0) {
            return socket.emit('update')
        }
        socket.on('wellcome', newMsgs =>{
            let msgs = newMsgs.msgs;
            if (msgs.length === 0) {
                setChat({...chat, newMsgs: [
                    {msg: 'Não há mensagens no momento.', author: 'Sistema', time: new Date()},
                    {msg: ' Para ajuda digite "/ajuda"', author: 'Sistema', time: new Date()}
                ], name: info.name});
            }
            else {
                setChat({...chat, newMsgs: [...msgs], name: info.name});
            }
        });
        socket.on('newMensages', newMsgs =>{
            console.log(newMsgs)
            let msgs = newMsgs.msgs;
            if (msgs.length === 0) {
                setChat({...chat, newMsgs: [
                    {msg: 'Não há mensagens no momento.', author: 'Sistema', time: new Date()},
                    {msg: ' Para ajuda digite "/ajuda"', author: 'Sistema', time: new Date()}
                ]});
            }
            else {
                setChat({...chat, newMsgs: [...msgs], name: info.name});
            }
        });
    };

    function openChat(){
        if (!chat.open) {
            let width = window.innerWidth;
            var hiddeChat;
            if (width <= 800) {
                hiddeChat = { 
                    width: '30px',
                    height: '30px',
                    right: '10px',
                    bottom: '10px',
                    zIndex: -1,
                    opacity: 0,
            };
            }
            else {
                hiddeChat = { 
                    width: '30px',
                    height: '30px',
                    right: '10px',
                    bottom: '10px',
                    zIndex: -1,
                    opacity: 0,
            };
            };
            document.getElementsByClassName('chatButton')[0].classList.add('displayNone');
            document.getElementsByClassName('chatBox')[0].animate([
                hiddeChat,
                { width: '350px', height: '450px', zIndex: 9999, opacity: 1 }
            ], { fill:'forwards', duration: 200});
            document.getElementsByClassName('chatBox')[0].classList.remove('hidden');
            setChat({...chat, open: true});
        }
        else {
            document.getElementsByClassName('chatButton')[0].classList.remove('displayNone');
            document.getElementsByClassName('chatBox')[0].animate([
                { width: '350px', height: '450px', zIndex: '9999', opacity: '1' },
                { 
                    width: '30px',
                    height: '30px',
                    right: '10px',
                    bottom: '10px',
                    zIndex: -1,
                    opacity: 0,
            }
            ], { fill:'forwards', duration: 200});
            setChat({...chat, open: false});
        };
    };
    console.log(chat);
    function sendMsg(e){
        e.preventDefault();
        let sendMsg = e.target[0].value;
        document.getElementById('inputId').value = '';
        if (sendMsg === '/delName') {
            localStorage.removeItem('chat_info');
            return setChat({...chat, newMsgs: [{msg:"Por favor, insira seu nome", author: 'Sistema'}], insertNameMode: true, name: null});
        }
        else if (chat.insertNameMode) {
            localStorage.setItem('chat_info', JSON.stringify({
                name: sendMsg
            }));
            setChat({...chat, newMsgs: [{msg:"digite alguma mensagem para iniciar...", author:'Sistema'}], insertNameMode: false, name: sendMsg});
        }
        else {
            const msg = {
                msg: sendMsg,
                author: chat.name,
                time: Date.now()
            };
            socket.emit('sendMsg', msg);
        }
    }
    function addZero(i){
        if (i < 10) {
            i = "0"+i;
            return i;
        }
        else {
            return i
        }
    }
    
    return(
    <>
    <div className="chatButton" onClick={openChat}>
                <img src={chatLogo} alt="chatLogo" id="chatLogo" />
            </div>
            <div className="chatBox hidden">
                <div className="chatHeader">
                    <span id="chatId"></span>
                    <button onClick={openChat}></button>
                </div>
                <div className="chatBody">
                    {chat.newMsgs.map(msg =>{
                        let hour
                        if (!msg.time) {
                            hour = ''
                        }
                        else {
                            let time = new Date(msg.time)
                            hour = addZero(time.getHours()) +":"+ addZero(time.getMinutes())
                        }
                        if (msg.author !== chat.name) {
                            return (<span key={msg.msg+msg.time}><p>~ {msg.author}</p>{ msg.msg } <label className="msgTime"> {hour} </label></span>)
                        }
                        else {
                            return (<span key={msg.msg+msg.time} className="myMsg"> { msg.msg }  <label className="msgTime"> {hour} </label></span>)
                        }
                    })}
                </div>
                <div className="inputMsg">
                    <form onSubmit={sendMsg} autoComplete="off">
                        <input type="text" placeholder="Digite uma mensagem" id="inputId" />
                        <button type="submit"><div></div></button>
                    </form>
                </div>
            </div>
    </>
)};

export default Chat;