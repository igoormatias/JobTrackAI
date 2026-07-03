import type { Server as HttpServer } from "node:http";

import { Server, type Socket } from "socket.io";

import { env, getCorsOrigins } from "./env.js";
import { logger } from "./logger.js";
import { tokenService } from "../modules/auth/services/token.service.js";
import { ACCESS_COOKIE } from "../modules/auth/services/auth.service.js";

let io: Server | null = null;

const parseCookie = (cookieHeader: string | undefined, name: string): string | undefined => {
  if (!cookieHeader) return undefined;

  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  if (!match) return undefined;

  return decodeURIComponent(match.slice(name.length + 1));
};

const authenticateSocket = (socket: Socket, next: (error?: Error) => void): void => {
  try {
    const token =
      parseCookie(socket.handshake.headers.cookie, ACCESS_COOKIE) ??
      (typeof socket.handshake.auth?.token === "string" ? socket.handshake.auth.token : undefined);

    if (!token) {
      next(new Error("Unauthorized"));
      return;
    }

    const payload = tokenService.verifyToken(token, "access");
    socket.data.userId = payload.userId;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
};

export const createSocketServer = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: getCorsOrigins(),
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingInterval: 25_000,
    pingTimeout: 20_000,
  });

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string | undefined;

    if (userId) {
      socket.join(`user:${userId}`);
    }

    logger.debug({ socketId: socket.id, userId }, "WebSocket client connected");

    socket.on("disconnect", () => {
      logger.debug({ socketId: socket.id, userId }, "WebSocket client disconnected");
    });
  });

  return io;
};

export const getSocketServer = (): Server | null => io;

export const emitToUser = (userId: string, event: string, payload?: unknown): void => {
  io?.to(`user:${userId}`).emit(event, payload ?? {});
};
