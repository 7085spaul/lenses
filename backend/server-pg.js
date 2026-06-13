const express = require('express');
const cors = require('cors');
const { initDatabase: initPostgresDB } = require('./database-pg');
const { initDatabase: initSQLiteDB } = require('./database');
const orderRoutes = require('./routes/orders');
const inventoryRoutes = require('./routes/inventory');
const predictionRoutes = require('./routes/predictions');
const alertRoutes = require('./routes/alerts');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_TYPE = process.env.DB_TYPE || 'sqlite';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/alerts', alertRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: DB_TYPE,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Initialize appropriate database
const initApp = async () => {
  try {
    if (DB_TYPE === 'postgresql') {
      await initPostgresDB();
      console.log('Using PostgreSQL database');
    } else {
      await initSQLiteDB();
      console.log('Using SQLite database');
    }
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Database: ${DB_TYPE}`);
    });
  } catch (err) {
    console.error('Failed to initialize application:', err);
    process.exit(1);
  }
};

initApp();
