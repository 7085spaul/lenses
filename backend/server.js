require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./database');
const orderRoutes = require('./routes/orders');
const inventoryRoutes = require('./routes/inventory');
const predictionRoutes = require('./routes/predictions');
const alertRoutes = require('./routes/alerts');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/alerts', alertRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'AI-Powered Order Management System API',
    version: '1.0.0',
    endpoints: {
      orders: '/api/orders',
      inventory: '/api/inventory',
      predictions: '/api/predictions',
      alerts: '/api/alerts',
      health: '/health'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
