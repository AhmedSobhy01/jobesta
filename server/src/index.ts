import express, { Request, Response } from 'express';
import cors from 'cors';
import { configDotenv } from 'dotenv';
import usersRouter from './routes/usersRoutes.js';
import authRouter from './routes/authRoutes.js';

// Load environment variables from the .env file
configDotenv();

// Create an instance of the Express application
const app = express();

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

app.use('/users', usersRouter);

app.use('/auth', authRouter);

// 404 Fallback Middleware: Handles requests to undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found',
  });
});

// Error Handling Middleware: Catches any errors and sends a response

// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((err: any, req: Request, res: Response) => {
  res.status(err.status || 500).json({
    success: false,
    message: 'Internal Server Error',
  });
});

// Start the server and listen on the port defined in the environment variables
app.listen(process.env.PORT, () => {
  console.log('Started listening on port ' + process.env.PORT);
});
