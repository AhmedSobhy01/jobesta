import { Server } from 'socket.io';
import { authenticateSocket } from '../middlewares/authMiddleware.js';

import { chatHandler } from './chatHandler.js';
import { notificationsHandler } from './notificationsHandler.js';

export function setupSocketHandlers(io: Server) {
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    notificationsHandler(socket);
    chatHandler(socket);
  });
}
