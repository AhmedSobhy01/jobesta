import { Socket } from 'socket.io';

export function chatHandler(socket: Socket) {
  socket.on('subscribe-chat', (jobId: string) => {
    socket.join(`job-chat-${jobId}`);
  });

  socket.on('unsubscribe-chat', (jobId: string) => {
    socket.leave(`job-chat-${jobId}`);
  });
}
