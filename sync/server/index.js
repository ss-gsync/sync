require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const ephemerisRoutes = require('./routes/ephemeris');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS with safer settings
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CORS_ORIGIN || 'https://tau-core.io' 
    : '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  credentials: process.env.NODE_ENV !== 'production'
}));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', ephemerisRoutes);

// Add a simple route for the root path to show API is running
app.get('/api', (req, res) => {
  res.json({
    name: 'G-sync API',
    description: 'API for astronomical timepiece',
    endpoints: [
      { path: '/api/ephemeris', description: 'Get astronomical data' },
      { path: '/api/health', description: 'Health check' },
      { path: '/api/security/status', description: 'Security status' }
    ],
    version: process.env.npm_package_version || '0.4.0'
  });
});

// Add a route for the dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../dist/dashboard.html'));
});

// Add a route for the overview page
app.get('/overview', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../dist/overview.html'));
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, '../dist');
  app.use(express.static(staticPath));
  
  // Serve index.html for all routes not handled by the API
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ error: message });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://0.0.0.0:${PORT}/api`);
  if (process.env.NODE_ENV === 'development') {
    console.log('Running in development mode');
  }
});

module.exports = app; // Export for testing