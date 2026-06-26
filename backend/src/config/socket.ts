import type { Server as HttpServer } from "node:http";

import { Server } from "socket.io";

import { logger } from "./logger.js";

let io: Server | null = null;

export const createSocketServer = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    logger.debug({ socketId: socket.id }, "WebSocket client connected");

    socket.on("disconnect", () => {
      logger.debug({ socketId: socket.id }, "WebSocket client disconnected");
    });
  });

  return io;
};

export const getSocketServer = (): Server | null => io;
