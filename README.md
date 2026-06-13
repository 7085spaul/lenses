# AI-Powered Eyewear Order Management System

A comprehensive order management system for eyewear brands with AI-powered predictions, inventory management, and automated alerts.

## Features

### 1. Lens Inventory Management
- Real-time inventory tracking for lenses with different powers, types, and coatings
- Quick availability check for customer prescriptions
- Low stock alerts and notifications
- Multi-location inventory support

### 2. Order Dashboard
- Complete order lifecycle management from intake to delivery
- Real-time status tracking across all stages
- SLA monitoring with breach detection
- Filterable by status, lens type, and store location
- Order history and audit trail

### 3. AI-Powered TAT Prediction
- Machine learning model predicts order completion time
- Breach probability calculation based on multiple factors:
  - Lens type complexity (single vision, bifocal, progressive)
  - Index thickness multipliers
  - Coating complexity
  - Current stage progress
  - Inventory availability
  - Historical QC failure patterns
- Risk level categorization (high, medium, low)

### 4. Breach Alert System
- Automated alerts for orders at risk of SLA breach
- Email notifications via Nodemailer
- WhatsApp alerts via Twilio API
- Custom alert creation for any order
- Alert history and tracking

## Tech Stack

### Backend
- **Node.js** with Express.js
- **SQLite** database for data persistence
- **Nodemailer** for email alerts
- **Twilio** for WhatsApp notifications

### Frontend
- **React** with Vite
- **TailwindCSS** for styling
- **React Router** for navigation
- **Lucide React** for icons

### AI/ML
- Custom rule-based ML model for TAT prediction
- Historical data pattern analysis
- Multi-factor risk assessment

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. Configure environment variables:
   - Copy `backend/.env.example` to `backend/.env`
   - Add your email credentials for alerts
   - Add Twilio credentials for WhatsApp (optional)

4. Start the application:
   ```bash
   npm run dev
   ```

5. Access the application at `http://localhost:3000`

## API Endpoints

### Orders
- `GET /api/orders` - Get all orders (with filters)
- `GET /api/orders/:id` - Get single order with history
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/orders/stats/overview` - Get order statistics

### Inventory
- `GET /api/inventory` - Get all inventory
- `POST /api/inventory/check` - Check availability
- `POST /api/inventory` - Add inventory
- `PUT /api/inventory/:id` - Update inventory
- `GET /api/inventory/alerts/low-stock` - Get low stock alerts

### Predictions
- `GET /api/predictions` - Get predictions for all orders
- `GET /api/predictions/:id` - Get prediction for single order
- `GET /api/predictions/at-risk` - Get orders at risk of breach

### Alerts
- `POST /api/alerts` - Create alert
- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/order/:order_id` - Get alerts for order
- `POST /api/alerts/auto-generate` - Auto-generate breach alerts

## Order Stages

1. order_placed
2. inventory_check
3. lens_cutting
4. edging
5. coating
6. assembly
7. qc_check
8. packaging
9. ready_for_delivery
10. delivered

## SLA Rules

Different lens types have different SLAs based on complexity:

- Single Vision 1.50: 24 hours (12 hours priority)
- Single Vision 1.60: 36 hours (18 hours priority)
- Single Vision 1.67: 48 hours (24 hours priority)
- Bifocal 1.50: 48 hours (24 hours priority)
- Bifocal 1.60: 72 hours (36 hours priority)
- Progressive 1.50: 72 hours (36 hours priority)
- Progressive 1.67: 96 hours (48 hours priority)
- Progressive 1.74: 120 hours (60 hours priority)

## Demo Data

The system comes pre-seeded with:
- Sample inventory items
- SLA rules for different lens types
- 5 sample orders in various stages

## Deployment

For production deployment:
1. Use a production database (PostgreSQL recommended)
2. Configure proper email/WhatsApp credentials
3. Set up environment variables
4. Use a process manager like PM2
5. Configure reverse proxy (nginx)
6. Enable HTTPS

## License

MIT
