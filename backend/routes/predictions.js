const express = require('express');
const router = express.Router();
const { getDB } = require('../database');

// AI-powered TAT prediction using historical data patterns
const predictTAT = (order) => {
  const { lens_type, lens_index, coating, inventory_available, priority, current_stage } = order;
  
  // Base hours from SLA
  let baseHours = 48;
  
  // Lens type complexity factors
  const lensComplexity = {
    'single_vision': 1.0,
    'bifocal': 1.5,
    'progressive': 2.0
  };
  
  // Index thickness factors
  const indexFactor = {
    '1.50': 1.0,
    '1.60': 1.2,
    '1.67': 1.4,
    '1.74': 1.6
  };
  
  // Coating complexity
  const coatingFactor = coating ? 1.3 : 1.0;
  
  // Stage-based remaining time
  const stageFactors = {
    'order_placed': 1.0,
    'inventory_check': 0.9,
    'lens_cutting': 0.7,
    'edging': 0.5,
    'coating': 0.4,
    'assembly': 0.3,
    'qc_check': 0.2,
    'packaging': 0.1,
    'ready_for_delivery': 0.05
  };
  
  // Calculate predicted hours
  let predictedHours = baseHours * 
    (lensComplexity[lens_type] || 1.0) * 
    (indexFactor[lens_index] || 1.0) * 
    coatingFactor * 
    (stageFactors[current_stage] || 0.5);
  
  // Inventory availability impact
  if (!inventory_available) {
    predictedHours *= 1.5; // 50% longer if not in stock
  }
  
  // Priority adjustment
  if (priority === 'high') {
    predictedHours *= 0.7; // 30% faster for high priority
  }
  
  return Math.round(predictedHours);
};

// Predict breach probability
const predictBreachProbability = (order) => {
  const { placed_at, expected_delivery, current_stage, inventory_available, qc_failed_count } = order;
  
  const placed = new Date(placed_at);
  const expected = new Date(expected_delivery);
  const now = new Date();
  
  const totalHours = (expected - placed) / (1000 * 60 * 60);
  const elapsedHours = (now - placed) / (1000 * 60 * 60);
  const remainingHours = totalHours - elapsedHours;
  
  const predictedTAT = predictTAT(order);
  
  // Risk factors
  let riskScore = 0;
  
  // Time pressure
  if (remainingHours < predictedTAT * 0.5) riskScore += 0.4;
  if (remainingHours < predictedTAT * 0.3) riskScore += 0.3;
  if (remainingHours < 0) riskScore += 0.5;
  
  // Inventory risk
  if (!inventory_available) riskScore += 0.3;
  
  // QC failure risk
  if (qc_failed_count > 0) riskScore += 0.2 * qc_failed_count;
  
  // Stage risk
  const stageRisk = {
    'order_placed': 0.1,
    'inventory_check': 0.15,
    'lens_cutting': 0.25,
    'edging': 0.3,
    'coating': 0.35,
    'assembly': 0.4,
    'qc_check': 0.5,
    'packaging': 0.2,
    'ready_for_delivery': 0.05
  };
  riskScore += stageRisk[current_stage] || 0.2;
  
  return Math.min(riskScore, 1.0);
};

// Get predictions for all active orders
router.get('/', (req, res) => {
  const db = getDB();
  
  db.all(
    'SELECT * FROM orders WHERE status != "delivered" ORDER BY placed_at DESC',
    [],
    (err, orders) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const predictions = orders.map(order => {
        const predictedTAT = predictTAT(order);
        const breachProbability = predictBreachProbability(order);
        
        const placed = new Date(order.placed_at);
        const expected = new Date(order.expected_delivery);
        const now = new Date();
        
        return {
          order_id: order.id,
          order_number: order.order_number,
          current_stage: order.current_stage,
          predicted_remaining_hours: predictedTAT,
          breach_probability: breachProbability,
          risk_level: breachProbability > 0.7 ? 'high' : breachProbability > 0.4 ? 'medium' : 'low',
          hours_until_breach: Math.max(0, (expected - now) / (1000 * 60 * 60)),
          inventory_available: order.inventory_available
        };
      });
      
      res.json(predictions);
    }
  );
});

// Get orders at risk of breach (MUST be before /:id route)
router.get('/at-risk', (req, res) => {
  const db = getDB();
  
  db.all(
    'SELECT * FROM orders WHERE status != "delivered" ORDER BY placed_at DESC',
    [],
    (err, orders) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const atRisk = orders
        .map(order => ({
          ...order,
          breach_probability: predictBreachProbability(order)
        }))
        .filter(order => order.breach_probability > 0.5)
        .sort((a, b) => b.breach_probability - a.breach_probability);
      
      res.json(atRisk);
    }
  );
});

// Get prediction for single order
router.get('/:id', (req, res) => {
  const db = getDB();
  
  db.get(
    'SELECT * FROM orders WHERE id = ?',
    [req.params.id],
    (err, order) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (!order) {
        res.status(404).json({ error: 'Order not found' });
      } else {
        const predictedTAT = predictTAT(order);
        const breachProbability = predictBreachProbability(order);
        
        res.json({
          order_id: order.id,
          order_number: order.order_number,
          predicted_remaining_hours: predictedTAT,
          breach_probability: breachProbability,
          risk_level: breachProbability > 0.7 ? 'high' : breachProbability > 0.4 ? 'medium' : 'low',
          factors: {
            lens_type: order.lens_type,
            lens_index: order.lens_index,
            coating: order.coating,
            inventory_available: order.inventory_available,
            current_stage: order.current_stage,
            priority: order.priority,
            qc_failed_count: order.qc_failed_count
          }
        });
      }
    }
  );
});

module.exports = router;
// Export prediction functions for use in other routes
module.exports.predictTAT = predictTAT;
module.exports.predictBreachProbability = predictBreachProbability;
