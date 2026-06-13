const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'eyewear_production',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const initDatabase = async () => {
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('Connected to PostgreSQL database');
    
    // Create tables
    await createTables();
    await seedInitialData();
  } catch (err) {
    console.error('Failed to initialize database:', err);
    throw err;
  }
};

const createTables = async () => {
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('Database schema created');
  } else {
    // Create tables programmatically
    await createTablesProgrammatically();
  }
};

const createTablesProgrammatically = async () => {
  const tables = [
    `CREATE TABLE IF NOT EXISTS lens_inventory (
      id SERIAL PRIMARY KEY,
      sphere_power REAL NOT NULL,
      cylinder_power REAL NOT NULL,
      axis INTEGER,
      lens_type VARCHAR(50) NOT NULL,
      lens_index VARCHAR(10) NOT NULL,
      coating VARCHAR(50),
      quantity INTEGER DEFAULT 0,
      location VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(sphere_power, cylinder_power, axis, lens_type, lens_index, coating)
    )`,
    
    `CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_number VARCHAR(50) UNIQUE NOT NULL,
      customer_name VARCHAR(200) NOT NULL,
      customer_email VARCHAR(200),
      customer_phone VARCHAR(50),
      store_location VARCHAR(100) NOT NULL,
      prescription_sphere REAL NOT NULL,
      prescription_cylinder REAL NOT NULL,
      prescription_axis INTEGER,
      lens_type VARCHAR(50) NOT NULL,
      lens_index VARCHAR(10) NOT NULL,
      coating VARCHAR(50),
      frame VARCHAR(100) NOT NULL,
      status VARCHAR(50) DEFAULT 'order_placed',
      priority VARCHAR(20) DEFAULT 'normal',
      current_stage VARCHAR(50) DEFAULT 'order_placed',
      sla_hours INTEGER NOT NULL,
      placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expected_delivery TIMESTAMP,
      actual_delivery TIMESTAMP,
      delay_reason TEXT,
      inventory_available BOOLEAN DEFAULT false,
      qc_passed BOOLEAN,
      qc_failed_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS order_history (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      status VARCHAR(50) NOT NULL,
      stage VARCHAR(50) NOT NULL,
      notes TEXT,
      changed_by VARCHAR(100),
      changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS sla_rules (
      id SERIAL PRIMARY KEY,
      lens_type VARCHAR(50) NOT NULL,
      lens_index VARCHAR(10) NOT NULL,
      coating VARCHAR(50),
      standard_sla_hours INTEGER NOT NULL,
      priority_sla_hours INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS alerts (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      alert_type VARCHAR(50) NOT NULL,
      message TEXT NOT NULL,
      sent BOOLEAN DEFAULT false,
      sent_at TIMESTAMP,
      channel VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const sql of tables) {
    await pool.query(sql);
  }
  
  // Create indexes for better performance
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)',
    'CREATE INDEX IF NOT EXISTS idx_orders_stage ON orders(current_stage)',
    'CREATE INDEX IF NOT EXISTS idx_orders_placed_at ON orders(placed_at)',
    'CREATE INDEX IF NOT EXISTS idx_inventory_type ON lens_inventory(lens_type, lens_index)',
    'CREATE INDEX IF NOT EXISTS idx_alerts_order ON alerts(order_id)'
  ];

  for (const sql of indexes) {
    await pool.query(sql);
  }
  
  console.log('Database tables and indexes created');
};

const seedInitialData = async () => {
  // Check if data already exists
  const result = await pool.query('SELECT COUNT(*) FROM sla_rules');
  if (parseInt(result.rows[0].count) > 0) {
    console.log('Database already seeded');
    return;
  }

  // Seed SLA rules
  const slaRules = [
    ['single_vision', '1.50', null, 24, 12],
    ['single_vision', '1.60', null, 36, 18],
    ['single_vision', '1.67', null, 48, 24],
    ['bifocal', '1.50', null, 48, 24],
    ['bifocal', '1.60', null, 72, 36],
    ['progressive', '1.50', null, 72, 36],
    ['progressive', '1.67', null, 96, 48],
    ['progressive', '1.74', null, 120, 60]
  ];

  for (const rule of slaRules) {
    await pool.query(
      'INSERT INTO sla_rules (lens_type, lens_index, coating, standard_sla_hours, priority_sla_hours) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
      rule
    );
  }

  // Seed initial inventory
  const inventory = [
    [0.00, 0.00, null, 'single_vision', '1.50', null, 50, 'warehouse'],
    [-1.00, 0.00, null, 'single_vision', '1.50', null, 30, 'warehouse'],
    [-2.00, 0.00, null, 'single_vision', '1.50', null, 25, 'warehouse'],
    [-3.00, 0.00, null, 'single_vision', '1.50', null, 20, 'warehouse'],
    [0.00, -0.50, 90, 'single_vision', '1.50', null, 15, 'warehouse'],
    [-1.50, -0.75, 180, 'single_vision', '1.60', 'anti_reflective', 10, 'warehouse'],
    [-2.50, -1.00, 90, 'single_vision', '1.67', 'anti_reflective', 8, 'warehouse'],
    [0.00, 0.00, null, 'progressive', '1.50', null, 15, 'warehouse'],
    [-1.00, -0.50, null, 'progressive', '1.67', 'anti_reflective', 5, 'warehouse']
  ];

  for (const item of inventory) {
    await pool.query(
      'INSERT INTO lens_inventory (sphere_power, cylinder_power, axis, lens_type, lens_index, coating, quantity, location) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING',
      item
    );
  }

  console.log('Database seeded with initial data');
};

const getDB = () => pool;

const query = (text, params) => pool.query(text, params);

module.exports = { initDatabase, getDB, query };
