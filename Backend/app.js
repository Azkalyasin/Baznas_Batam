import express from 'express';
import dotenv from 'dotenv';
import db from './src/config/database.js';
import Mustahiq from './src/models/mustahiqModel.js';
import Muzakki from './src/models/muzakkiModel.js';
import Distribusi from './src/models/distribusiModel.js';
import Penerimaan from './src/models/penerimaanModel.js';
import User from './src/models/userModel.js';
import setupTriggers from './src/utils/dbSetup.js';
import userRoute from './src/routes/userRoute.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json()); // Enable JSON body parsing

// Define Associations
Mustahiq.hasMany(Distribusi, { foreignKey: 'mustahiq_id' });
Distribusi.belongsTo(Mustahiq, { foreignKey: 'mustahiq_id' });

Muzakki.hasMany(Penerimaan, { foreignKey: 'muzakki_id' });
Penerimaan.belongsTo(Muzakki, { foreignKey: 'muzakki_id' });

// Routes
app.use('/api/users', userRoute);

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
        
    } catch (error) {
        console.error('Connection error:', error);
    }
})();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

