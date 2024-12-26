import { Server, Socket } from 'socket.io';

export function notificationsHandler(io: Server, socket: Socket) {
  socket.on('subscribe-notifications', () => {
    socket.join(`notifications-${socket.data.user.id}`);
    console.log(`User ${socket.data.user.id} subscribed to notifications`);
  });

  socket.on('unsubscribe-notifications', () => {
    socket.leave(`notifications-${socket.data.user.id}`);
  });
}
