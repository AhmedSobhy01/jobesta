import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import { configDotenv } from 'dotenv';
import accountRoutes from './routes/accountRoutes.js';
import authRoutes from './routes/authRoutes.js';
import freelancerRoutes from './routes/freelancerRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import proposalRoutes from './routes/proposalRoutes.js';
import { getCategories } from './controllers/categoriesController.js';
import { getStatistics } from './controllers/statisticsController.js';
import { FileUploadError } from './utils/errors.js';
import { MulterError } from 'multer';
import notificationRoutes from './routes/notificationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import milestoneRoutes from './routes/milestoneRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import paymentRoutes from './routes/paymentsRoutes.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js';
import { Server } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';
import db from './db/db.js';
// Load environment variables from the .env file
configDotenv();

// Create an instance of the Express application
const app = express();
const server = http.createServer(app);

// CORS Configuration
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Middleware to parse incoming URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Middleware to parse incoming JSON data
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Register the routes
app.use('/account', accountRoutes);
app.use('/freelancer', freelancerRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/jobs', jobRoutes);
app.use('/messages', messageRoutes);
app.use('/milestones', milestoneRoutes);
app.use('/notifications', notificationRoutes);
app.use('/proposals', proposalRoutes);
app.use('/withdrawals', withdrawalRoutes);
app.get('/categories', getCategories);
app.get('/statistics', getStatistics);
app.use('/reviews', reviewRoutes);
app.use('/payments', paymentRoutes);
// Default Route: Sends a welcome message to the user (for health-checks)
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to Jobesta API',
  });
});

// 404 Fallback Middleware: Handles requests to undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found',
  });
});

// Error Handling Middleware: Catches any errors and sends a response
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof FileUploadError) {
    res.status(422).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });

    return;
  } else if (err instanceof MulterError) {
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(422).json({
        success: false,
        message: 'Invalid file field value',
        errors: {
          file: 'Invalid file field value',
        },
      });

      return;
    } else if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(422).json({
        success: false,
        message: 'File size too large',
        errors: {
          file: 'File size too large',
        },
      });

      return;
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      res.status(422).json({
        success: false,
        message: 'Too many files uploaded',
        errors: {
          file: 'Too many files uploaded',
        },
      });

      return;
    }
  }

  console.error(err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
});

// Create an instance of the Socket.io server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
});

io.use(async (socket, next) => {
  const token = socket.handshake.query.token as string;
  if (!token) return;
  const { id } = jwt.verify(
    token,
    process.env.JWT_SECRET as string,
  ) as JwtPayload;
  const query = await db.query('SELECT * FROM Accounts WHERE id = $1', [id]);
  if (query.rowCount == 0) return;

  const job = await db.query(
    'SELECT * FROM Jobs WHERE id = $1',
    [socket.handshake.query.jobId],
  );

  if (job.rowCount == 0) return;

  next();
});

io.on('connection', async (socket) => {

  if (!socket.handshake.query.jobId) return;
  socket.join(socket.handshake.query.jobId);

  socket.on('sendMessage', (data) => {
    if (!socket.handshake.query.jobId) return;
    io.to(socket.handshake.query.jobId).emit('recieveMessage', data);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// io.attach(server);
io.listen(4000);

// Start the server and listen on the port defined in the environment variables
server.listen(process.env.PORT, () => {
  console.log('Started listening on port ' + process.env.PORT);
});
