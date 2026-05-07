const express = require('express');
const cors = require('cors');
const path = require('path');
const { PORT } = require('./config/env.config');
const proxyRoutes = require('./routes/proxy.routes');
const { errorHandler } = require('./middleware/error.middleware');
const { rateLimiter } = require('./middleware/rateLimit.middleware');

const app = express();

// Apply global middlewares
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Apply rate limiting to API routes
app.use('/api', rateLimiter);

/**
 * Robust Health Check Route
 * Useful for Render.com zero-downtime deployments
 */
app.get('/health', (req, res) => {
  const healthData = {
    status: 'Healthy',
    message: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memoryUsage: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(process.memoryUsage().external / 1024 / 1024)} MB`
    }
  };
  res.status(200).json(healthData);
});

// API Routes
app.use('/api', proxyRoutes);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
