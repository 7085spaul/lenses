const express = require('express');
const router = express.Router();
const { getDB } = require('../database');

// Get all orders with filters
router.get('/', (req, res) => {
  const { status, lens_type, store_location, priority } = req.query;
  const db = getDB();
  
  let sql = `SELECT * FROM orders WHERE status != 'delivered'`;
  const params = [];
  
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (lens_type) {
    sql += ' AND lens_type = ?';
    params.push(lens_type);
  }
  if (store_location) {
    sql += ' AND store_location = ?';
    params.push(store_location);
  }
  if (priority) {
    sql += ' AND priority = ?';
    params.push(priority);
  }
  
  sql += ' ORDER BY placed_at DESC';
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Get single order
router.get('/:id', (req, res) => {
  const db = getDB();
  db.get('SELECT * FROM orders WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: 'Order not found' });
    } else {
      // Get order history
      db.all('SELECT * FROM order_history WHERE order_id = ? ORDER BY changed_at DESC', [req.params.id], (err, history) => {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.json({ ...row, history });
        }
      });
    }
  });
});

// Create new order
router.post('/', (req, res) => {
  const {
    order_number, customer_name, customer_email, customer_phone,
    store_location, prescription_sphere, prescription_cylinder, prescription_axis,
    lens_type, lens_index, coating, frame, priority
  } = req.body;
  
  const db = getDB();
  
  // Get SLA for this lens type
  db.get(
    'SELECT standard_sla_hours, priority_sla_hours FROM sla_rules WHERE lens_type = ? AND lens_index = ? AND (coating = ? OR coating IS NULL)',
    [lens_type, lens_index, coating],
    (err, sla) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const sla_hours = sla ? (priority === 'high' ? sla.priority_sla_hours : sla.standard_sla_hours) : 48;
      
      // Check inventory availability
      db.get(
        'SELECT quantity FROM lens_inventory WHERE sphere_power = ? AND cylinder_power = ? AND (axis = ? OR axis IS NULL) AND lens_type = ? AND lens_index = ? AND (coating = ? OR coating IS NULL)',
        [prescription_sphere, prescription_cylinder, prescription_axis, lens_type, lens_index, coating],
        (err, inv) => {
          const inventory_available = inv && inv.quantity > 0;
          
          const sql = `INSERT INTO orders 
            (order_number, customer_name, customer_email, customer_phone, store_location,
             prescription_sphere, prescription_cylinder, prescription_axis, lens_type, lens_index,
             coating, frame, priority, sla_hours, inventory_available, expected_delivery)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '+' || ? || ' hours'))`;
          
          const params = [
            order_number, customer_name, customer_email, customer_phone, store_location,
            prescription_sphere, prescription_cylinder, prescription_axis, lens_type, lens_index,
            coating, frame, priority, sla_hours, inventory_available, sla_hours
          ];
          
          db.run(sql, params, function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
            } else {
              // Log initial history
              db.run(
                'INSERT INTO order_history (order_id, status, stage, notes, changed_by) VALUES (?, ?, ?, ?, ?)',
                [this.lastID, 'order_placed', 'order_placed', 'Order created', 'system']
              );
              
              res.json({ id: this.lastID, message: 'Order created successfully' });
            }
          });
        }
      );
    }
  );
});

// Update order status
router.put('/:id/status', (req, res) => {
  const { status, stage, notes, changed_by, delay_reason } = req.body;
  const db = getDB();
  
  const updates = ['status = ?', 'current_stage = ?', 'updated_at = CURRENT_TIMESTAMP'];
  const params = [status, stage];
  
  if (delay_reason) {
    updates.push('delay_reason = ?');
    params.push(delay_reason);
  }
  
  if (status === 'delivered') {
    updates.push('actual_delivery = CURRENT_TIMESTAMP');
  }
  
  if (status === 'qc_check') {
    updates.push('qc_passed = ?');
    params.push(req.body.qc_passed || false);
    
    if (!req.body.qc_passed) {
      updates.push('qc_failed_count = qc_failed_count + 1');
    }
  }
  
  params.push(req.params.id);
  
  db.run(
    `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
    params,
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        // Log history
        db.run(
          'INSERT INTO order_history (order_id, status, stage, notes, changed_by) VALUES (?, ?, ?, ?, ?)',
          [req.params.id, status, stage, notes, changed_by || 'system']
        );
        
        res.json({ message: 'Status updated successfully' });
      }
    }
  );
});

// Get order statistics
router.get('/stats/overview', (req, res) => {
  const db = getDB();
  
  const queries = [
    'SELECT COUNT(*) as total FROM orders WHERE status != "delivered"',
    'SELECT COUNT(*) as critical FROM orders WHERE status != "delivered" AND priority = "high"',
    'SELECT COUNT(*) as breached FROM orders WHERE status != "delivered" AND expected_delivery < datetime("now")',
    'SELECT status, COUNT(*) as count FROM orders WHERE status != "delivered" GROUP BY status',
    'SELECT lens_type, COUNT(*) as count FROM orders WHERE status != "delivered" GROUP BY lens_type'
  ];
  
  Promise.all(queries.map(q => new Promise((resolve, reject) => {
    db.all(q, [], (err, rows) => err ? reject(err) : resolve(rows));
  }))).then(results => {
    res.json({
      total_orders: results[0][0].total,
      critical_orders: results[1][0].critical,
      breached_orders: results[2][0].breached,
      by_status: results[3],
      by_lens_type: results[4]
    });
  }).catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;
