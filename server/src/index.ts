import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { configDotenv } from 'dotenv';
import accountRoutes from './routes/accountRoutes.js';
import authRoutes from './routes/authRoutes.js';
import freelancerRoutes from './routes/freelancerRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import proposalRoutes from './routes/proposalRoutes.js';
import { getCategories } from './controllers/categoriesController.js';
import { FileUploadError } from './utils/errors.js';
import { MulterError } from 'multer';
import notificationRoutes from './routes/notificationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import milestoneRoutes from './routes/milestoneRoutes.js';

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
app.get('/categories', getCategories);

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

// Start the server and listen on the port defined in the environment variables
app.listen(process.env.PORT, () => {
  console.log('Started listening on port ' + process.env.PORT);
});
