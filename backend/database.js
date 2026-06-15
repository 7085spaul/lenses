const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'eyewear.db');
let db;

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('Connected to SQLite database');
        createTables().then(resolve).catch(reject);
      }
    });
  });
};

const createTables = () => {
  return new Promise((resolve, reject) => {
    const tables = [
      `CREATE TABLE IF NOT EXISTS lens_inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sphere_power REAL NOT NULL,
        cylinder_power REAL NOT NULL,
        axis INTEGER,
        lens_type TEXT NOT NULL,
        lens_index TEXT NOT NULL,
        coating TEXT,
        quantity INTEGER DEFAULT 0,
        location TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(sphere_power, cylinder_power, axis, lens_type, lens_index, coating)
      )`,
      
      `CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        customer_email TEXT,
        customer_phone TEXT,
        store_location TEXT NOT NULL,
        prescription_sphere REAL NOT NULL,
        prescription_cylinder REAL NOT NULL,
        prescription_axis INTEGER,
        lens_type TEXT NOT NULL,
        lens_index TEXT NOT NULL,
        coating TEXT,
        frame TEXT NOT NULL,
        status TEXT DEFAULT 'order_placed',
        priority TEXT DEFAULT 'normal',
        current_stage TEXT DEFAULT 'order_placed',
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
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        stage TEXT NOT NULL,
        notes TEXT,
        changed_by TEXT,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS sla_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lens_type TEXT NOT NULL,
        lens_index TEXT NOT NULL,
        coating TEXT,
        standard_sla_hours INTEGER NOT NULL,
        priority_sla_hours INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        alert_type TEXT NOT NULL,
        message TEXT NOT NULL,
        sent BOOLEAN DEFAULT false,
        sent_at TIMESTAMP,
        channel TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id)
      )`
    ];

    let completed = 0;
    tables.forEach(sql => {
      db.run(sql, (err) => {
        if (err) {
          console.error('Error creating table:', err);
          reject(err);
        } else {
          completed++;
          if (completed === tables.length) {
            seedInitialData().then(resolve).catch(reject);
          }
        }
      });
    });
  });
};

const seedInitialData = () => {
  return new Promise((resolve, reject) => {
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

    const insertSLA = db.prepare('INSERT OR IGNORE INTO sla_rules (lens_type, lens_index, coating, standard_sla_hours, priority_sla_hours) VALUES (?, ?, ?, ?, ?)');
    
    slaRules.forEach(rule => {
      insertSLA.run(rule);
    });
    insertSLA.finalize();

    // Seed initial inventory
    const inventory = [
      [0.00, 0.00, null, 'single_vision', '1.50', null, 50, 'warehouse'],
      [-1.00, 0.00, null, 'single_vision', '1.50', null, 30, 'warehouse'],
      [-2.00, 0.00, null, 'single_vision', '1.50', null, 25, 'warehouse'],
      [-3.00, 0.00, null, 'single_vision', '1.50', null, 20, 'warehouse'],
      [-4.00, 0.00, null, 'single_vision', '1.50', null, 15, 'warehouse'],
      [0.00, -0.50, 90, 'single_vision', '1.50', null, 15, 'warehouse'],
      [-1.50, -0.75, 180, 'single_vision', '1.60', 'anti_reflective', 10, 'warehouse'],
      [-2.50, -1.00, 90, 'single_vision', '1.67', 'anti_reflective', 8, 'warehouse'],
      [0.00, 0.00, null, 'progressive', '1.50', null, 15, 'warehouse'],
      [-1.00, -0.50, null, 'progressive', '1.67', 'anti_reflective', 5, 'warehouse'],
      [-2.00, -1.00, null, 'progressive', '1.74', 'anti_reflective', 3, 'warehouse'],
      [0.00, 0.00, null, 'bifocal', '1.50', null, 20, 'warehouse'],
      [-1.50, -0.50, null, 'bifocal', '1.60', null, 12, 'warehouse'],
      [-2.00, -1.00, null, 'bifocal', '1.67', 'anti_reflective', 8, 'warehouse'],
      [-1.00, 0.00, null, 'single_vision', '1.60', null, 25, 'warehouse'],
      [-2.00, -0.50, null, 'single_vision', '1.60', null, 20, 'warehouse'],
      [-3.00, -1.50, null, 'single_vision', '1.67', null, 10, 'warehouse'],
      [0.00, 0.00, null, 'single_vision', '1.74', 'anti_reflective', 5, 'warehouse'],
      [-1.50, -0.75, null, 'progressive', '1.50', null, 10, 'warehouse']
    ];

    const insertInv = db.prepare('INSERT OR IGNORE INTO lens_inventory (sphere_power, cylinder_power, axis, lens_type, lens_index, coating, quantity, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    
    inventory.forEach(item => {
      insertInv.run(item);
    });
    insertInv.finalize();

    // Seed sample orders
    const orders = [
      ['ORD-001', 'John Smith', 'john@email.com', '+1234567890', 'New York', -1.50, -0.75, 180, 'single_vision', '1.60', 'anti_reflective', 'Ray-Ban', 'in_production', 'normal', 'lens_cutting', 36],
      ['ORD-002', 'Jane Doe', 'jane@email.com', '+1234567891', 'Los Angeles', -2.00, 0.00, null, 'progressive', '1.67', 'anti_reflective', 'Oakley', 'order_placed', 'normal', 'order_placed', 96],
      ['ORD-003', 'Bob Johnson', 'bob@email.com', '+1234567892', 'Chicago', 0.00, -0.50, 90, 'single_vision', '1.50', null, 'Gucci', 'qc_check', 'high', 'qc_check', 24],
      ['ORD-004', 'Alice Brown', 'alice@email.com', '+1234567893', 'Miami', -3.00, -1.00, 180, 'bifocal', '1.60', 'anti_reflective', 'Prada', 'ready_for_delivery', 'normal', 'packaging', 48],
      ['ORD-005', 'Charlie Wilson', 'charlie@email.com', '+1234567894', 'Seattle', -1.00, 0.00, null, 'single_vision', '1.50', null, 'Versace', 'delivered', 'normal', 'delivered', 24]
    ];

    const insertOrder = db.prepare(`INSERT OR IGNORE INTO orders 
      (order_number, customer_name, customer_email, customer_phone, store_location, 
       prescription_sphere, prescription_cylinder, prescription_axis, lens_type, lens_index, 
       coating, frame, status, priority, current_stage, sla_hours, placed_at, expected_delivery) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-2 days'), datetime('now', '+1 day'))`);
    
    orders.forEach(order => {
      insertOrder.run(order);
    });
    insertOrder.finalize();

    setTimeout(resolve, 500);
  });
};

const getDB = () => db;

module.exports = { initDatabase, getDB };
