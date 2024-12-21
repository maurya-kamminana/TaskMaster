const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { sequelize } = require('./config/db');
// const projectRoutes = require('./src/routes/projectRoutes');
// const taskRoutes = require('./src/routes/taskRoutes');
// const userRoutes = require('./src/routes/userRoutes');
// const notificationRoutes = require('./src/routes/notificationRoutes');
const { start : consumerStart } = require('./src/services/notificationService');
const cookieParser = require('cookie-parser');

const app = express();

// Load environment variables
require('dotenv').config();

// Validate environment variables
if (!process.env.MONGO_URI || !process.env.PORT) {
    throw new Error('Missing required environment variables. Check your .env file.');
}

// Middleware
// app.use(cors());
app.use(cors({
  origin: 'http://localhost:5173', // Specify exact origin
  credentials: true // Allow credentials
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

// Start Kafka consumer
consumerStart()
.catch((err) => console.error('Failed to start Consumer :', err));

// Routes


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT_NOTIFICATION;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});