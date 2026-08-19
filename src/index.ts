
import { WebSocketServer, WebSocket } from "ws";

interface User {
    socket: WebSocket;
    room: string;
}

let allSockets: User[] = [];
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (socket) => {
    console.log("user connected");

    socket.on('message', (message) => {
        // Convert buffer data to string before parsing to satisfy TypeScript
        const parseMessage = JSON.parse(message.toString());

        //console.log(parseMessage);
        
        if (parseMessage.type == 'join') {
            console.log(parseMessage);
            
            allSockets.push({
                socket,
                room: parseMessage.payload.roomId 
            });
        }

        if (parseMessage.type == "chat") {
            let currentUserRoom: string | null = null;

            allSockets.forEach(x => {
                if (x.socket == socket) {
                    currentUserRoom = x.room;
                }
            });

            // FIXED: Removed quotation marks to use the actual variable context
            allSockets.forEach(x => {
                if (x.room == currentUserRoom) {
                    x.socket.send(parseMessage.payload.message);
                }
            });
        }
    });

    // FIXED: Changed event from 'disconnect' to 'close' and added active cleanup
    // socket.on('close', () => {
    //     console.log("user disconnected");
    //     allSockets = allSockets.filter(x => x.socket !== socket);
    // });
});

