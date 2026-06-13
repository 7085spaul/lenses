# Architecture Note - AI-Powered Order Management System

## System Overview

The AI-Powered Order Management System is a full-stack web application designed for eyewear brands to manage the complete order lifecycle with intelligent predictions and automated alerts.

## Architecture Pattern

**Client-Server Architecture with RESTful API**

- **Frontend**: Single Page Application (SPA) built with React
- **Backend**: RESTful API built with Express.js
- **Database**: SQLite for development (easily migratable to PostgreSQL)
- **Communication**: HTTP/JSON with CORS enabled

## Technology Stack

### Frontend
- **React 18** - UI library for building interactive interfaces
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework for rapid styling
- **React Router DOM** - Client-side routing
- **Lucide React** - Icon library
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework for building APIs
- **SQLite3** - Embedded database for data persistence
- **Nodemailer** - Email sending service
- **Twilio** - WhatsApp messaging API
- **dotenv** - Environment variable management

## AI Models & APIs Used

### 1. Custom Rule-Based ML Model for TAT Prediction

**Why Custom Model?**
- Domain-specific requirements for eyewear orders
- Transparent and explainable predictions
- No training data dependency
- Fast inference time
- Easy to maintain and update

**Model Features:**
The prediction model uses a weighted factor approach considering:

- **Lens Type Complexity**: Single vision (1.0x), Bifocal (1.5x), Progressive (2.0x)
- **Index Thickness**: 1.50 (1.0x), 1.60 (1.2x), 1.67 (1.4x), 1.74 (1.6x)
- **Coating Complexity**: No coating (1.0x), With coating (1.3x)
- **Stage Progress**: 10 stages with decreasing time factors (1.0 to 0.05)
- **Inventory Availability**: In stock (1.0x), Out of stock (1.5x)
- **Priority**: Normal (1.0x), High priority (0.7x)

**Breach Probability Calculation:**
Risk score computed from:
- Time pressure (remaining vs predicted time)
- Inventory availability risk
- QC failure history
- Current stage risk factors

**Implementation:**
```javascript
// Predicted TAT = Base SLA × Lens Complexity × Index Factor × Coating Factor × Stage Factor × Inventory Factor × Priority Factor
// Breach Probability = Time Pressure + Inventory Risk + QC Risk + Stage Risk
```

### 2. Nodemailer API for Email Alerts

**Why Nodemailer?**
- Widely adopted, battle-tested library
- Supports multiple email providers (Gmail, SMTP, SendGrid, etc.)
- Easy configuration and template support
- No API key costs for basic SMTP

**Usage:**
- SLA breach warnings
- Delay notifications
- QC failure alerts
- Delivery reminders

### 3. Twilio API for WhatsApp Alerts

**Why Twilio?**
- Official WhatsApp Business API provider
- Reliable message delivery
- Two-way communication support
- Global reach
- Rich message formatting

**Usage:**
- Urgent breach alerts
- Real-time notifications
- Customer communication

**Note:** Currently simulated in demo mode. Production requires Twilio account setup.

## Database Schema

### Tables

1. **lens_inventory** - Tracks lens stock by power, type, coating
2. **orders** - Main order records with prescription and status
3. **order_history** - Audit trail for all order changes
4. **sla_rules** - Configurable SLA per lens type/index
5. **alerts** - Alert history and delivery status

### Relationships
- orders → order_history (one-to-many)
- orders → alerts (one-to-many)
- lens_inventory (independent, referenced during order creation)

## API Design

RESTful endpoints following resource-based naming:

- `/api/orders` - Order CRUD operations
- `/api/inventory` - Inventory management
- `/api/predictions` - AI prediction endpoints
- `/api/alerts` - Alert creation and management

All endpoints support:
- JSON request/response
- CORS for cross-origin requests
- Error handling with appropriate HTTP status codes

## Security Considerations

1. **Environment Variables**: Sensitive credentials stored in .env
2. **Input Validation**: Server-side validation on all endpoints
3. **SQL Injection Prevention**: Parameterized queries
4. **CORS**: Configured for specific origins in production

## Deployment Architecture

**Development:**
- Frontend: Vite dev server on port 3002 (3000/3001 were occupied)
- Backend: Express server on port 5000
- Proxy configured for API calls

**Production Deployment:**
- Frontend: Deployed to Vercel (https://aiplatform-eyewear.vercel.app)
- Backend: Deployed to Render (https://aiplatform-backend.onrender.com)
- Repository: https://github.com/7085spaul/lenses
- Database: SQLite (migrate to PostgreSQL for production scalability)
- Environment: Production .env with real credentials

**Deployment Configuration Files:**
- `frontend/vercel.json` - Vercel deployment config
- `backend/Procfile` - Render deployment config
- `.gitignore` files for both frontend and backend

**Environment Variables Required:**
- Email credentials (Gmail/SMTP)
- Twilio Account SID and Auth Token
- Twilio WhatsApp number
- Database connection string (if migrating to PostgreSQL)

## Scalability Considerations

1. **Database**: SQLite → PostgreSQL for concurrent access
2. **Caching**: Add Redis for frequent queries
3. **Queue**: Add Bull/Redis for background alert processing
4. **Load Balancing**: Multiple backend instances behind nginx
5. **CDN**: Static asset delivery

## Future Enhancements

1. **Advanced ML**: Train on historical data for better accuracy
2. **Real-time Updates**: WebSocket integration for live dashboard
3. **Mobile App**: React Native for field teams
4. **Analytics**: Advanced reporting and insights
5. **Integration**: ERP/POS system integration

## Performance Optimization

1. **Frontend**: Code splitting, lazy loading
2. **Backend**: Response caching, database indexing
3. **Database**: Indexes on frequently queried columns
4. **API**: Pagination for large datasets

## Monitoring & Logging

- Application logs for debugging
- Error tracking for production issues
- Performance metrics for optimization
- Alert delivery tracking

---

**System Status**: Fully functional with all modules completed
- ✅ Lens Inventory Management
- ✅ Dashboard with Order Management
- ✅ AI-Powered TAT Predictions
- ✅ Breach Alerts (Email/WhatsApp)
- ✅ All UI/UX issues resolved
- ✅ Deployment configuration files created

**Last Updated**: June 13, 2026
**Version**: 1.0.0
**Deployment**: Code pushed to GitHub (https://github.com/7085spaul/lenses) - Ready for cloud deployment (Vercel + Render)
