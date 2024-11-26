import express, { Request, Response } from 'express';
import cors from 'cors';
import { configDotenv } from 'dotenv';

// Load environment variables from the .env file
configDotenv();

// Create an instance of the Express application
const app = express();

// CORS Configuration
app.use(
  cors({
    origin: '*', // Allow all domains for cross-origin requests
    methods: ['GET', 'POST', 'DELETE', 'PUT'], // Allow specific HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
  }),
);

// Middleware to parse incoming URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Middleware to parse incoming JSON data
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// 404 Fallback Middleware: Handles requests to undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false, // Indicate failure
    message: 'Resource not found', // Inform the user that the resource was not found
  });
});

// Error Handling Middleware: Catches any errors and sends a response

// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((err: any, req: Request, res: Response) => {
  res.status(err.status || 500).json({
    success: false, // Indicate failure
    message: err.message || 'Internal Server Error', // Provide the error message or a generic error message
  });
});

// Start the server and listen on the port defined in the environment variables
app.listen(process.env.PORT, () => {
  console.log('Started listening on port ' + process.env.PORT); // Log a message indicating the server has started
});
