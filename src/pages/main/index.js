import React, { useEffect, useState } from 'react';
import { api, socket } from '../../services/api';
import { Link } from 'react-router-dom';
import chatLogo from '../../assets/chat.png'
import userLogo from '../../assets/user.png'
import "./styles.css";

function Main() {
    const defaultState = {
        docs: [],
        productInfo: {},
        page: 1,
    };
    const [state, setState] = useState(defaultState);
    const [chat, setChat] = useState({open:false, name:null,newMsgs:[], insertNameMode: false});
    useEffect(()=>{
        const info = JSON.parse(localStorage.getItem('chat_info'))
        loadProducts()
        if (!info) {
            setChat({...chat, newMsgs: [{msg:"Por favor, insira seu nome", author: 'Default'}], insertNameMode: true})
            return
        }
        else {
        listenSocket(info)
        }
    },[]);

    const { docs, page, productInfo } = state;

    function listenSocket(info){
        socket.on('wellcome', newMsgs =>{
            let msgs = newMsgs[0].msgs;
            if (msgs.length === 0) {
                setChat({...chat, newMsgs: [{msg: 'Não há mensagens no momento.', author: 'Sistema', time: new Date()}], name: info.name});
            }
            else {
                setChat({...chat, newMsgs: [...msgs], name: info.name});
            }
        });
        socket.on('alert', err => {
            console.log(err)
        });
    };

    async function loadProducts (page = 1){
        await api.get(`/products?page=${page}`).then(response =>{
            var { docs = [], ...productInfo } = response.data;
            if (docs[0]._id) {
                docs.map((product,index) =>{
                    product.id = product._id;
                    docs.splice(index, 1, product);
                });
            };
            setState({ docs, productInfo, page});
            document.getElementsByClassName('loading')[0].classList.add('hidden')
        }).catch(err =>{
            console.log(err)
            alert("Não foi possível conectar a API!")
        })
    }
    function prevPage() {
        if (page === 1) return;

        const pageNumber = page - 1;

        loadProducts(pageNumber);
    };
    function nextPage (){
        if (page === productInfo.totalPages) return;
        
        const pageNumber = page + 1;

        loadProducts(pageNumber);
            
    };
    function openChat(){
        if (!chat.open) {
            document.getElementsByClassName('chatButton')[0].classList.add('displayNone');
            document.getElementsByClassName('chatBox')[0].animate([
                { width: '30px',
                    height: '30px',
                    right: '50px',
                    bottom: '100px',
                    zIndex: -1,
                    opacity: 0,
                },
                { width: '350px', height: '450px', zIndex: 9999, opacity: 1 }
            ], { fill:'forwards', duration: 200})
            document.getElementsByClassName('chatBox')[0].classList.remove('hidden');
            setChat({...chat, open: true});
        }
        else {
            document.getElementsByClassName('chatButton')[0].classList.remove('displayNone');
            document.getElementsByClassName('chatBox')[0].animate([
                { width: '350px', height: '450px', zIndex: '9999', opacity: '1' },
                { width: '30px',
                    height: '30px',
                    right: '50px',
                    bottom: '100px',
                    zIndex: -1,
                    opacity: 0
                }
            ], { fill:'forwards', duration: 200})
            setChat({...chat, open: false});
        };
    };
    function sendMsg(e){
        e.preventDefault();
        let sendMsg = e.target[0].value
        document.getElementById('inputId').value = ''
        if (chat.insertNameMode) {
            console.log('insertName')
            localStorage.setItem('chat_info', JSON.stringify({
                name: sendMsg
            }));
            setChat({...chat, name:sendMsg, insertNameMode: false, newMsgs: []});
            listenSocket();
            return
        }
        const msg = {
            msg: sendMsg,
            author: chat.name,
            time: Date.now()
        };
        socket.emit('sendMsg', msg);
    }
    function addZero(i){
        if (i < 10) {
            i = "0"+i
            return i
        }
        else {
            return i
        }
    }
    return (
        <div className='product-list'>
            {docs.map(product => (
                <article key={product.id}>
                    <strong>{product.title}</strong>
                    <p>{product.description}</p>
                    <Link to={`/products/${product.id}`}>Acessar</Link>
                </article>
            ))}
            <div className="actions">
                <button disabled={page === 1} onClick={prevPage}>Anterior</button>
                <button disabled={page === productInfo.totalPages} onClick={nextPage}>Próxima</button>
            </div>
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
            <div className="loading">
                <div className="loadingCircle"></div>
                <h1>Acessando a API</h1>
            </div>
        </div>
    )};
export default Main;