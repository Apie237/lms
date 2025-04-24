import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './configs/mongodb.js';

dotenv.config();
//initialize express app
const app = express();

//connect to mongodb
await connectDB()



// middlewares
app.use(cors());

//routes
app.get('/', (req, res) => {
    res.send('Hello World!');
})

const PORT = process.env.PORT || 5000;

app.listen((PORT),() => 
    console.log(`Server is running on port ${PORT}`)
)