const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const redisClient = require('./redisClient');
const { sequelize } = require('./config/db');

const app = express();

// Load environment variables
require('dotenv').config();

// Validate environment variables
if (!process.env.MONGO_URI || !process.env.PORT) {
    throw new Error('Missing required environment variables. Check your .env file.');
}

// Middleware
app.use(cors());
app.use(express.json());


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
// handle the route to root of the server
app.get('/', (req, res) => {
  res.status(200).send('Server is running ...');
});

const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT_AUTH;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});