import { Server } from 'socket.io';
import { authenticateSocket } from '../middlewares/authMiddleware.js';

import { chatHandler } from './chatHandler.js';
import { notificationsHandler } from './notificationsHandler.js';

export function setupSocketHandlers(io: Server) {
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User ${socket.data.user.id} connected`);

    notificationsHandler(io, socket);
    chatHandler(io, socket);

    socket.on('disconnect', () => {
      console.log(`User ${socket.data.user.id} disconnected`);
    });
  });
}
