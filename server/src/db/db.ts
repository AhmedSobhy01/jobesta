import pg from 'pg';
import { configDotenv } from 'dotenv';

// Load environment variables from the .env file
configDotenv();

// Create a new PostgreSQL client using environment variables
const client = new pg.Client({
  host: process.env.POSTGRES_HOST || 'localhost', // Database host
  port: parseInt(process.env.POSTGRES_PORT || '5432'), // Database port, default to 5432 if not provided
  user: process.env.POSTGRES_USER, // Database user
  password: process.env.POSTGRES_PASSWORD, // Database password
  database: process.env.POSTGRES_DB, // Database name
});

// Connect to the PostgreSQL database
client
  .connect()
  .then(() => {
    console.log('Connected to PostgreSQL'); // Log success message if connection is successful
  })
  .catch((err) => {
    console.error('Failed to connect to PostgreSQL', err); // Log error message if connection fails
  });

// Export the client for use in other parts of the application
export default client;
