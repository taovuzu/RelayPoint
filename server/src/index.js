import 'dotenv/config';
import connectDB from './db/index.db.js';
import { app } from './app.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { SheetsTriggerPoller } from './jobs/sheets.trigger.poller.js';
import logger from './utils/logger.js';

let server;
let ioInstance;

async function start() {
  try {
    logger.info('Starting server initialization');
    await connectDB();
    logger.info('Database connected successfully');

    const PORT = process.env.PORT || 8080;
    const httpServer = createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        methods: ["GET", "POST"]
      }
    });

    io.on('connection', (socket) => {
      logger.info('Socket connected', { socketId: socket.id });
      socket.on('disconnect', () => {
        logger.info('Socket disconnected', { socketId: socket.id });
      });
      socket.on('join-user-room', (userId) => {
        socket.join(`user-${userId}`);
        logger.info('User joined room', { userId });
      });
    });

    global.io = io;
    ioInstance = io;

    SheetsTriggerPoller.start();

    server = httpServer.listen(PORT, () => {
      logger.info(`Server started successfully on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development'
      });
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

async function shutdown(signal) {
  logger.info(`Received ${signal}, shutting down gracefully`);
  
  try {
    SheetsTriggerPoller.stop();
    
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      logger.info('HTTP server closed');
    }
    if (ioInstance) {
      ioInstance.removeAllListeners();
    }
    logger.info('Server shutdown completed');
  } catch (err) {
    logger.error('Error during shutdown', {
      error: err.message,
      stack: err.stack
    });
  } finally {
    process.exit(0);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();