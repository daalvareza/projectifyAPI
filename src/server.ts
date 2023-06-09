import express, { Express, NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from './api/routes/usersRoutes';
import projectsRoutes from './api/routes/projectsRoutes';
import reportsRoutes from './api/routes/reportsRoutes';

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// Create an instance of Express
const router: Express = express();

// Set the port number
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
const mongoDBURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/projectify';
mongoose.connect(mongoDBURI);

// Get the MongoDB connection
const db = mongoose.connection;

// Event handlers for MongoDB connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to the database successfully!')
});

router.use(cors({
    origin: 'https://projectify-ui.herokuapp.com' // restrict calls to those this address
}));

// Middleware for parsing JSON
router.use(express.json());

// Routes for handling user-related operations
router.use('/user', userRoutes);

// Routes for handling project-related operations
router.use('/projects', projectsRoutes);

// Routes for handling reports-related operations
router.use('/reports', reportsRoutes);

// Middleware for handling 404 errors
router.use((req: Request, res: Response) => {
    const error = new Error('Not found');
    return res.status(404).json({
        error: error.message
    });
});

// Middleware for handling authorization errors
router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err.name === "UnauthorizedError") {
        res.status(401).json({
            error: "You need a valid token to access this route"
        });
    } else {
        next(err);
    }
});

// Start the server
router.listen(PORT, () => {
    console.log(`Server listening at port: ${PORT}`);
});
