import { Server } from 'socket.io';
import { authenticateSocket } from '../middlewares/authMiddleware';

export function setupSocketHandlers(io: Server) {
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
}
