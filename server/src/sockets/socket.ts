import { Server } from 'socket.io';
import { authenticateSocket } from '../middlewares/authMiddleware';

import { chatHandler } from './chatHandler';
import { notificationsHandler } from './notificationsHandler';

export function setupSocketHandlers(io: Server) {
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log('User connected');

	notificationsHandler(io,socket);
	chatHandler(io,socket);

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
}
