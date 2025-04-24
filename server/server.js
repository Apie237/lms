import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './configs/mongodb.js';
import { clerkWebhooks } from './controllers/webHooks.js';

dotenv.config();

// Initialize express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Add this global middleware for JSON parsing

// Connect to MongoDB
// This should be in an async function, not at the top level with await
const startServer = async () => {
  try {
    await connectDB();
    
    // Routes
    app.get('/', (req, res) => {
      res.send('Hello World!');
    });
    
    app.post('/clerk', clerkWebhooks); // No need to add express.json() here since it's global now
    
    const PORT = process.env.PORT || 5000;
    
    app.listen(PORT, () => 
      console.log(`Server is running on port ${PORT}`)
    );
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();