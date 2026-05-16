// backend/src/Socket.ts
import { Server } from "socket.io";

export const userSockets = new Map<string, string>();

export function initSocket(server: any) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("register", (studentId: string) => {
  // remove previous socket if exists
  const existing = userSockets.get(studentId);

  if (existing && existing !== socket.id) {
    io.sockets.sockets.get(existing)?.disconnect(true);
  }

  userSockets.set(studentId, socket.id);
});

    socket.on("disconnect", () => {
      for (const [studentId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(studentId);
          break;
        }
      }
    });
  });

  return io;
}