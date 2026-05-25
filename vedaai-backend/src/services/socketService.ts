import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { Assignment } from '../types';

let io: Server | null = null;

export const socketService = {
  initSocketServer(server: HttpServer) {
    io = new Server(server, {
      cors: {
        origin: '*', // Allow connections from Next.js server
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket: Socket) => {
      console.log(`🔌 Socket Connected: ${socket.id}`);

      // Handle joining an assignment channel
      socket.on('join-assignment', (assignmentId: string) => {
        const roomName = `assignment:${assignmentId}`;
        socket.join(roomName);
        console.log(`🔌 Socket ${socket.id} joined room: ${roomName}`);
        
        // Acknowledge join
        socket.emit('joined', { room: roomName });
      });

      socket.on('disconnect', () => {
        console.log(`🔌 Socket Disconnected: ${socket.id}`);
      });
    });

    console.log('✅ Socket.io server initialized successfully.');
    return io;
  },

  notifyCompletion(assignmentId: string, assignment: Assignment) {
    if (!io) {
      console.error('⚠️ Socket.io not initialized. Cannot broadcast completion.');
      return;
    }
    const roomName = `assignment:${assignmentId}`;
    console.log(`🔌 Broadcasting COMPLETED event to room: ${roomName}`);
    io.to(roomName).emit('assignment:completed', assignment);
  },

  notifyFailure(assignmentId: string, error: string) {
    if (!io) {
      console.error('⚠️ Socket.io not initialized. Cannot broadcast failure.');
      return;
    }
    const roomName = `assignment:${assignmentId}`;
    console.log(`🔌 Broadcasting FAILED event to room: ${roomName}`);
    io.to(roomName).emit('assignment:failed', { id: assignmentId, error });
  },
};
