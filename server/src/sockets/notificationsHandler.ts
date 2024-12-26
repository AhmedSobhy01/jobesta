import { Socket } from 'socket.io';

export function notificationsHandler(socket: Socket) {
  socket.on('subscribe-notifications', () => {
    socket.join(`notifications-${socket.data.user.id}`);
  });

  socket.on('unsubscribe-notifications', () => {
    socket.leave(`notifications-${socket.data.user.id}`);
  });
}
