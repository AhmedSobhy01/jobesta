import { Server, Socket } from 'socket.io';

export function chatHandler(io: Server, socket: Socket) {
  socket.on('subscribe-chat', (jobId: string) => {
    socket.join(`job-chat-${jobId}`);
    console.log(`User ${socket.data.user.id} subscribed to job chat ${jobId}`);
  });

  socket.on('unsubscribe-chat', (jobId: string) => {
    socket.leave(`job-chat-${jobId}`);
    console.log(`User ${socket.data.user.id} unsubscribed to job chat ${jobId}`);
  });
}
