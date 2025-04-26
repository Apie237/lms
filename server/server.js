import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './configs/mongodb.js';
import { clerkWebhooks, stripeWebhooks } from './controllers/webHooks.js';
import educatorRouter from './routes/educatorRoute.js';
import { clerkMiddleware } from '@clerk/express';
import connectCloudinary from './configs/cloudinary.js';
import courseRouter from './routes/courseRoute.js';
import userRouter from './routes/userRoute.js';

dotenv.config();

// Initialize express app
const app = express();

// Global middleware
app.use(cors());
app.use(clerkMiddleware());


// Special route for Stripe webhooks - must come BEFORE express.json() middleware
app.post('/stripe', express.raw({type: 'application/json'}), stripeWebhooks);

// JSON parsing middleware for all other routes
app.use(express.json());

// Connect to MongoDB
const startServer = async () => {
  try {
    await connectDB();
    await connectCloudinary();
    
    // Regular routes
    app.get('/', (req, res) => {
      res.send('Hello World!');
    });
    app.post('/clerk', clerkWebhooks);
    app.use('/api/educator', educatorRouter);
    app.use('/api/course', courseRouter);
    app.use('/api/user', userRouter);
    
    const PORT = process.env.PORT || 5000;
    
    app.listen(PORT, () => 
      console.log(`Server is running on port ${PORT}`)
    );
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();