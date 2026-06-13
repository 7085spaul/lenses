# Production Setup - Quick Start Guide

I've created all the production-ready files for you. Here's what you need to do:

## ✅ What I've Already Done

1. **Environment Configuration Template** (`backend/.env.example`)
   - All production variables documented
   - Email and Twilio configuration options
   - Database settings for both SQLite and PostgreSQL

2. **PostgreSQL Support** (`backend/database-pg.js`)
   - Full PostgreSQL implementation
   - Connection pooling
   - Automatic table creation with indexes
   - Seed data migration

3. **Database Schema** (`backend/schema.sql`)
   - Complete PostgreSQL schema
   - Performance indexes
   - Auto-update triggers
   - Foreign key constraints

4. **Nginx Configuration** (`nginx.conf`)
   - Reverse proxy setup
   - SSL/HTTPS configuration
   - Security headers
   - Gzip compression
   - Static file caching

5. **Deployment Guide** (`DEPLOYMENT.md`)
   - Complete step-by-step instructions
   - Server setup commands
   - Database configuration
   - SSL certificate setup
   - PM2 process management
   - Monitoring and maintenance

6. **Database Adapter** (`backend/db-adapter.js`)
   - Works with both SQLite and PostgreSQL
   - Unified query interface
   - Automatic parameter handling

## 📋 What You Need to Do

### Option 1: Quick Production Setup (Recommended)

**Follow the DEPLOYMENT.md file step by step:**

1. **Get a server** (DigitalOcean, AWS, Linode, etc.)
   - Minimum: 2GB RAM, 1 CPU, 20GB SSD
   - Cost: ~$5-20/month

2. **Set up the server** (commands in DEPLOYMENT.md)
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js, PostgreSQL, Nginx, PM2
   # (All commands in DEPLOYMENT.md)
   ```

3. **Configure your credentials**
   - Email: Get Gmail app password or SendGrid API key
   - Twilio: Get account SID and auth token (optional)
   - Database: Create PostgreSQL database and user

4. **Deploy the application**
   ```bash
   # Clone your repository
   # Install dependencies
   # Configure .env file
   # Start with PM2
   # Setup SSL certificate
   ```

### Option 2: Keep Using SQLite (Simpler)

If you don't want to set up PostgreSQL right now:

1. Keep using the current setup (SQLite)
2. Just configure email in `.env`
3. Deploy with PM2
4. Use nginx for SSL

**Note:** SQLite is fine for small-scale deployments (up to 1000 orders/day)

## 🔑 Get Your Credentials

### Email (Required for alerts)

**Option A: Gmail (Free)**
1. Enable 2FA on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Generate an app password
4. Use it in `EMAIL_PASS`

**Option B: SendGrid (Better for production)**
1. Sign up at https://sendgrid.com
2. Get API key
3. Use in `.env` with SMTP settings

### Twilio WhatsApp (Optional)

1. Sign up at https://www.twilio.com
2. Get Account SID and Auth Token from console
3. Get WhatsApp sandbox number
4. Add to `.env`

**Note:** WhatsApp alerts will work in simulation mode without credentials

### Database Passwords

For PostgreSQL:
```bash
sudo -u postgres psql
CREATE DATABASE eyewear_production;
CREATE USER eyewear_user WITH PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE eyewear_production TO eyewear_user;
```

## 🚀 Quick Deploy Commands

After setting up your server:

```bash
# 1. Clone repository
cd /var/www
git clone <your-repo> eyewear-oms
cd eyewear-oms

# 2. Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && npm run build && cd ..

# 3. Configure environment
cd backend
cp .env.example .env
nano .env  # Add your credentials

# 4. Switch to PostgreSQL (optional)
cp server.js server-sqlite.js
cp server-pg.js server.js
npm install pg

# 5. Setup nginx
sudo cp nginx.conf /etc/nginx/sites-available/eyewear-oms
sudo ln -s /etc/nginx/sites-available/eyewear-oms /etc/nginx/sites-enabled/
# Edit domain in nginx config
sudo nano /etc/nginx/sites-available/eyewear-oms
sudo nginx -t
sudo systemctl restart nginx

# 6. Get SSL certificate
sudo certbot --nginx -d your-domain.com

# 7. Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 📁 Files Created

- `backend/.env.example` - Environment template
- `backend/database-pg.js` - PostgreSQL implementation
- `backend/schema.sql` - Database schema
- `backend/server-pg.js` - PostgreSQL server
- `backend/db-adapter.js` - Database adapter
- `nginx.conf` - Nginx configuration
- `DEPLOYMENT.md` - Complete deployment guide

## 💰 Cost Estimate

**Minimum Setup:**
- VPS: $5/month (DigitalOcean)
- Domain: $10/year
- Email: Free (Gmail) or $15/month (SendGrid)
- WhatsApp: $0.005/message
- SSL: Free (Let's Encrypt)

**Total:** ~$15-30/month

## 🎯 Next Steps

1. **Choose your hosting provider** and create a server
2. **Follow DEPLOYMENT.md** step by step
3. **Get your email credentials** (Gmail app password is easiest)
4. **Get a domain name** and point DNS to your server
5. **Deploy and test**

## 🆘 Need Help?

- Check `DEPLOYMENT.md` for detailed instructions
- Review `ARCHITECTURE.md` for system overview
- Check logs: `pm2 logs eyewear-backend`
- Test locally first with: `npm run dev`

---

**Current Status:** Development system running locally at http://localhost:3000
**Production Ready:** Yes, all files created
**Time to Deploy:** ~30-60 minutes following the guide
