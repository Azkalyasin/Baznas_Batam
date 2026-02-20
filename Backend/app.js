import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import db from './src/config/database.js';
import Mustahiq from './src/models/mustahiqModel.js';
import Muzakki from './src/models/muzakkiModel.js';
import Distribusi from './src/models/distribusiModel.js';
import Penerimaan from './src/models/penerimaanModel.js';
import User from './src/models/userModel.js';
import setupTriggers from './src/utils/dbSetup.js';
import userRoute from './src/routes/userRoute.js';
import authRoute from './src/routes/authRoute.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Security & Performance Middleware
app.use(helmet()); // Secure HTTP headers
app.use(cors()); // Enable CORS
app.use(compression()); // Compress responses
app.use(morgan('dev')); // Log requests
app.use(express.json()); // Enable JSON body parsing

// Rate Limiting (Prevent Brute Force)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);
// Enable JSON body parsing

// Define Associations
Mustahiq.hasMany(Distribusi, { foreignKey: 'mustahiq_id' });
Distribusi.belongsTo(Mustahiq, { foreignKey: 'mustahiq_id' });

Muzakki.hasMany(Penerimaan, { foreignKey: 'muzakki_id' });
Penerimaan.belongsTo(Muzakki, { foreignKey: 'muzakki_id' });

// Routes
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);

import seedUser from './src/utils/seedUser.js';

// ... (imports)

// Connect to Database
(async () => {
    try {
        await db.authenticate();
        console.log('Database connected...');
        
        // Sync models (create tables)
        await db.sync({ alter: true }); // Using alter to update existing tables without dropping
        console.log('Tables synced...');

        // Setup Triggers & Procedures
        await setupTriggers();

        // Seed Superadmin
        await seedUser();
        
    } catch (error) {
        console.error('Connection error:', error);
    }
})();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

