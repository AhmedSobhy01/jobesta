import { Server, Socket } from 'socket.io';

export function chatHandler(io: Server, socket: Socket) {
  socket.on('subscribe-to-chat', (jobId: string) => {
    socket.join(`job-chat-${jobId}`);
  });

  socket.on('subscribe-to-chat', (jobId: string) => {
    socket.leave(`job-chat-${jobId}`);
  });
}
