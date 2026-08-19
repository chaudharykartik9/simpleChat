import { WebSocketServer,  WebSocket } from "ws";

const wss = new WebSocketServer({port:8080});

let userCount = 0 ;
let allSocket : WebSocket[] = [];

wss.on('connection' , (socket)=>{
    allSocket.push(socket) ;
    console.log("user connected " + userCount);
    userCount++ ;


    socket.on('message', (message)=>{
        console.log("message received " + message.toString());
        // for(let i = 0 ; i<allSocket.length; i++){
        //const s = allSocket[i];
        // s.send(message.toString())
        //}
        allSocket.forEach((s)=>{
            s.send(message.toString());
        })
    })
    
});

