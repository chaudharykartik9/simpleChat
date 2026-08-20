import { WebSocketServer, WebSocket } from "ws";

interface User {
  socket: WebSocket;
  room: string;
}

const allSockets: User[] = [];
const rooms = new Set<string>();

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (socket) => {
  console.log("User connected");

  socket.on("message", (message) => {
    try {
      const parseMessage = JSON.parse(message.toString());

      // =========================
      // CREATE ROOM
      // =========================

      if (parseMessage.type === "create") {
        const roomId = parseMessage.payload.roomId;

        if (!roomId || typeof roomId !== "string") {
          socket.send(
            JSON.stringify({
              type: "error",
              message: "Room name is required",
            })
          );

          return;
        }

        if (rooms.has(roomId)) {
          socket.send(
            JSON.stringify({
              type: "error",
              message: "Room already exists",
            })
          );

          return;
        }

        rooms.add(roomId);

        socket.send(
          JSON.stringify({
            type: "room_created",
            roomId,
            message: `Room "${roomId}" created successfully`,
          })
        );

        console.log(`Room created: ${roomId}`);
      }

      // =========================
      // JOIN ROOM
      // =========================

      if (parseMessage.type === "join") {
        const roomId = parseMessage.payload.roomId;

        if (!roomId || typeof roomId !== "string") {
          socket.send(
            JSON.stringify({
              type: "error",
              message: "Room name is required",
            })
          );

          return;
        }

        if (!rooms.has(roomId)) {
          socket.send(
            JSON.stringify({
              type: "error",
              message: "Room does not exist",
            })
          );

          return;
        }

        // Remove the user from their previous room
        const existingUser = allSockets.find(
          (user) => user.socket === socket
        );

        if (existingUser) {
          existingUser.room = roomId;
        } else {
          allSockets.push({
            socket,
            room: roomId,
          });
        }

        socket.send(
          JSON.stringify({
            type: "joined",
            roomId,
            message: `Joined room "${roomId}"`,
          })
        );

        console.log(`User joined room: ${roomId}`);
      }

      // =========================
      // CHAT
      // =========================

      if (parseMessage.type === "chat") {
        const currentUser = allSockets.find(
          (user) => user.socket === socket
        );

        if (!currentUser) {
          socket.send(
            JSON.stringify({
              type: "error",
              message: "You must join a room first",
            })
          );

          return;
        }

        const messageText = parseMessage.payload.message;

        if (!messageText || typeof messageText !== "string") {
          socket.send(
            JSON.stringify({
              type: "error",
              message: "Message cannot be empty",
            })
          );

          return;
        }

        allSockets.forEach((user) => {
          if (
            user.room === currentUser.room &&
            user.socket.readyState === WebSocket.OPEN
          ) {
            user.socket.send(
              JSON.stringify({
                type: "chat",
                message: messageText,
              })
            );
          }
        });
      }
    } catch (error) {
      console.error("Invalid message:", error);

      socket.send(
        JSON.stringify({
          type: "error",
          message: "Invalid message format",
        })
      );
    }
  });

  // =========================
  // DISCONNECT
  // =========================

  socket.on("close", () => {
    console.log("User disconnected");

    const userIndex = allSockets.findIndex(
      (user) => user.socket === socket
    );

    if (userIndex !== -1) {
        //@ts-ignore
      const roomId = allSockets[userIndex].room;

      allSockets.splice(userIndex, 1);

      console.log(`User removed from room: ${roomId}`);
    }
  });
});

console.log("WebSocket server running on ws://localhost:8080");