import axios from 'axios';
import socketIOClient from "socket.io-client";

//const baseURL = 'http://localhost:3001'
const baseURL = 'https://api-rest-node-mongodb.herokuapp.com'
const api = axios.create({baseURL: `${baseURL}/`});

const socket = socketIOClient(baseURL);

export {api, socket};