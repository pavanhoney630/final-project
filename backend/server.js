require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import CORS middleware
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes'); // Import authentication routes
const workspaceRoutes = require('./routes/WorkspaceRoutes'); // Import workspace routes

const app = express();

const allowedOrigins = ['https://final-project-api-dun.vercel.app','https://final-project-three-beige.vercel.app'];

// const corsOptions = {
//   origin: (origin, callback) => {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
// };

// Middleware

app.use(bodyParser.json()); // Middleware to parse incoming JSON requests
app.use(cors(allowedOrigins));
app.options('*', cors(corsOptions));

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`); // Log the HTTP method and request URL
  next();
});

const PORT = process.env.PORT || 5000;

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/auth', authRoutes); // Routes related to authentication
app.use('/auth/workspaces', workspaceRoutes); // Routes related to workspaces

// Health Check Route (Optional)
app.get('/', (req, res) => {
  res.send({ message: 'API is working' });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
