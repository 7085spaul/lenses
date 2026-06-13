const express = require('express');
const router = express.Router();
const { getDB } = require('../database');

// Get all inventory
router.get('/', (req, res) => {
  const { lens_type, lens_index, coating } = req.query;
  const db = getDB();
  
  let sql = 'SELECT * FROM lens_inventory WHERE quantity > 0';
  const params = [];
  
  if (lens_type) {
    sql += ' AND lens_type = ?';
    params.push(lens_type);
  }
  if (lens_index) {
    sql += ' AND lens_index = ?';
    params.push(lens_index);
  }
  if (coating) {
    sql += ' AND coating = ?';
    params.push(coating);
  }
  
  sql += ' ORDER BY quantity DESC';
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Check availability for specific prescription
router.post('/check', (req, res) => {
  const { sphere_power, cylinder_power, axis, lens_type, lens_index, coating } = req.body;
  const db = getDB();
  
  db.get(
    'SELECT * FROM lens_inventory WHERE sphere_power = ? AND cylinder_power = ? AND (axis = ? OR axis IS NULL) AND lens_type = ? AND lens_index = ? AND (coating = ? OR coating IS NULL)',
    [sphere_power, cylinder_power, axis, lens_type, lens_index, coating],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({
          available: row && row.quantity > 0,
          quantity: row ? row.quantity : 0,
          location: row ? row.location : null
        });
      }
    }
  );
});

// Add inventory
router.post('/', (req, res) => {
  const { sphere_power, cylinder_power, axis, lens_type, lens_index, coating, quantity, location } = req.body;
  const db = getDB();
  
  const sql = `INSERT INTO lens_inventory 
    (sphere_power, cylinder_power, axis, lens_type, lens_index, coating, quantity, location)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [sphere_power, cylinder_power, axis, lens_type, lens_index, coating, quantity, location], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ id: this.lastID, message: 'Inventory added successfully' });
    }
  });
});

// Update inventory quantity
router.put('/:id', (req, res) => {
  const { quantity } = req.body;
  const db = getDB();
  
  db.run(
    'UPDATE lens_inventory SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [quantity, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: 'Inventory updated successfully' });
      }
    }
  );
});

// Get low stock alerts
router.get('/alerts/low-stock', (req, res) => {
  const db = getDB();
  
  db.all(
    'SELECT * FROM lens_inventory WHERE quantity < 10 ORDER BY quantity ASC',
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(rows);
      }
    }
  );
});

module.exports = router;
