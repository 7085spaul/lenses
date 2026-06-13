const express = require('express');
const router = express.Router();
const { getDB } = require('../database');
const nodemailer = require('nodemailer');
const { predictBreachProbability } = require('./predictions');

// Email configuration (using environment variables)
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'demo@example.com',
      pass: process.env.EMAIL_PASS || 'demo_password'
    },
    tls: {
      rejectUnauthorized: false // For testing - remove in production with proper SSL
    }
  });
};

// Send email alert
const sendEmailAlert = async (order, alertType, message) => {
  try {
    console.log('=== EMAIL ALERT DEBUG ===');
    console.log('Order:', order.order_number);
    console.log('Customer Email:', order.customer_email);
    console.log('Alert Type:', alertType);
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
    console.log('EMAIL_PASS set:', !!process.env.EMAIL_PASS);
    
    const transporter = createEmailTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'eyewear-system@example.com',
      to: order.customer_email || process.env.EMAIL_USER, // Send to your email if customer email not set
      subject: `Order Alert: ${order.order_number} - ${alertType}`,
      text: message
    };
    
    console.log('Mail Options:', mailOptions);
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully! Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    console.error('Full error:', error);
    return false;
  }
};

// Create alert
router.post('/', async (req, res) => {
  const { order_id, alert_type, message, channel } = req.body;
  const db = getDB();
  
  // Get order details
  db.get(
    'SELECT * FROM orders WHERE id = ?',
    [order_id],
    async (err, order) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      
      // Send email alert
      const sent = await sendEmailAlert(order, alert_type, message);
      
      // Log alert
      db.run(
        'INSERT INTO alerts (order_id, alert_type, message, sent, sent_at, channel) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)',
        [order_id, alert_type, message, sent, 'email'],
        function(err) {
          if (err) {
            res.status(500).json({ error: err.message });
          } else {
            res.json({ 
              id: this.lastID, 
              sent, 
              message: 'Alert created and sent successfully' 
            });
          }
        }
      );
    }
  );
});

// Get all alerts
router.get('/', (req, res) => {
  const db = getDB();
  
  db.all(
    'SELECT a.*, o.order_number, o.customer_name FROM alerts a JOIN orders o ON a.order_id = o.id ORDER BY a.created_at DESC LIMIT 50',
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

// Get alerts for specific order
router.get('/order/:order_id', (req, res) => {
  const db = getDB();
  
  db.all(
    'SELECT * FROM alerts WHERE order_id = ? ORDER BY created_at DESC',
    [req.params.order_id],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(rows);
      }
    }
  );
});

// Auto-generate breach alerts for at-risk orders
router.post('/auto-generate', async (req, res) => {
  const db = getDB();
  
  // Get predictions for all orders
  db.all(
    'SELECT * FROM orders WHERE status != "delivered"',
    [],
    async (err, orders) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const alertsCreated = [];
      
      for (const order of orders) {
        const breachProb = predictBreachProbability(order);
        
        if (breachProb > 0.7) {
          const message = `ALERT: Order ${order.order_number} is at high risk of breaching SLA. Current stage: ${order.current_stage}. Probability: ${(breachProb * 100).toFixed(0)}%. Please prioritize this order.`;
          
          // Send the alert via email
          const emailSent = await sendEmailAlert(order, 'breach_warning', message);
          
          // Create alert record
          await new Promise((resolve) => {
            db.run(
              'INSERT INTO alerts (order_id, alert_type, message, sent, sent_at, channel) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)',
              [order.id, 'breach_warning', message, emailSent, 'email'],
              function(err) {
                if (!err) {
                  alertsCreated.push({
                    order_id: order.id,
                    order_number: order.order_number,
                    breach_probability: breachProb,
                    sent: emailSent
                  });
                }
                resolve();
              }
            );
          });
        }
      }
      
      res.json({ 
        message: 'Auto-generated breach alerts', 
        alerts_created: alertsCreated.length,
        alerts: alertsCreated
      });
    }
  );
});

module.exports = router;
