-- PostgreSQL Schema for Eyewear Order Management System

-- Enable UUID extension if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Lens Inventory Table
CREATE TABLE IF NOT EXISTS lens_inventory (
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
  CONSTRAINT unique_lens UNIQUE(sphere_power, cylinder_power, axis, lens_type, lens_index, coating)
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
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
);

-- Order History Table
CREATE TABLE IF NOT EXISTS order_history (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL,
  stage VARCHAR(50) NOT NULL,
  notes TEXT,
  changed_by VARCHAR(100),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- SLA Rules Table
CREATE TABLE IF NOT EXISTS sla_rules (
  id SERIAL PRIMARY KEY,
  lens_type VARCHAR(50) NOT NULL,
  lens_index VARCHAR(10) NOT NULL,
  coating VARCHAR(50),
  standard_sla_hours INTEGER NOT NULL,
  priority_sla_hours INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  alert_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP,
  channel VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_alert_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_stage ON orders(current_stage);
CREATE INDEX IF NOT EXISTS idx_orders_placed_at ON orders(placed_at);
CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(store_location);
CREATE INDEX IF NOT EXISTS idx_orders_lens_type ON orders(lens_type);
CREATE INDEX IF NOT EXISTS idx_inventory_type ON lens_inventory(lens_type, lens_index);
CREATE INDEX IF NOT EXISTS idx_inventory_power ON lens_inventory(sphere_power, cylinder_power);
CREATE INDEX IF NOT EXISTS idx_alerts_order ON alerts(order_id);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_history_order ON order_history(order_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON lens_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
