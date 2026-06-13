# Production Deployment Guide

This guide will help you deploy the AI-Powered Order Management System to production.

## Prerequisites

- Ubuntu/Debian server (or any Linux distribution)
- Node.js 18+ and npm
- PostgreSQL 14+
- Nginx web server
- Domain name with DNS configured
- SSL certificate (Let's Encrypt recommended)

## Step 1: Server Setup

### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

### Install PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

## Step 2: Database Setup

### Create PostgreSQL Database
```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE eyewear_production;
CREATE USER eyewear_user WITH PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE eyewear_production TO eyewear_user;
\q
```

### Test Connection
```bash
psql -h localhost -U eyewear_user -d eyewear_production
```

## Step 3: Application Setup

### Clone Repository
```bash
cd /var/www
sudo git clone <your-repo-url> eyewear-oms
sudo chown -R $USER:$USER eyewear-oms
cd eyewear-oms
```

### Install Dependencies
```bash
npm install
cd backend
npm install
cd ../frontend
npm install
```

### Build Frontend
```bash
cd frontend
npm run build
cd ..
```

## Step 4: Environment Configuration

### Create Environment File
```bash
cd backend
cp .env.example .env
nano .env
```

### Configure .env
```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eyewear_production
DB_USER=eyewear_user
DB_PASSWORD=your_strong_password

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Twilio Configuration
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Frontend URL
FRONTEND_URL=https://your-domain.com

# Security
SESSION_SECRET=generate-random-secret-here
JWT_SECRET=generate-jwt-secret-here
```

### Generate Random Secrets
```bash
# Generate session secret
openssl rand -base64 32

# Generate JWT secret
openssl rand -base64 32
```

## Step 5: Update Server for PostgreSQL

### Update Backend Server
```bash
cd backend
# Replace server.js with server-pg.js or modify to use PostgreSQL
cp server.js server-sqlite.js
cp server-pg.js server.js
```

### Install PostgreSQL Dependencies
```bash
npm install pg
```

### Initialize Database
```bash
# The database will be initialized automatically on first run
# Or manually:
node -e "const { initDatabase } = require('./database-pg'); initDatabase();"
```

## Step 6: Setup Email (Gmail Example)

### Enable 2-Factor Authentication
1. Go to Google Account settings
2. Enable 2FA
3. Generate App Password at https://myaccount.google.com/apppasswords
4. Use the app password in EMAIL_PASS

### Alternative: Use SendGrid (Recommended for Production)
```bash
# In .env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=SG.your-sendgrid-api-key
```

## Step 7: Setup Twilio (WhatsApp)

### Get Twilio Credentials
1. Sign up at https://www.twilio.com
2. Get Account SID and Auth Token from Console
3. Get WhatsApp sandbox number or purchase number
4. Add credentials to .env

### Test WhatsApp
```bash
# In backend/routes/alerts.js, the WhatsApp function is currently simulated
# Uncomment the Twilio code and add your credentials
```

## Step 8: Setup Nginx

### Copy Nginx Config
```bash
sudo cp nginx.conf /etc/nginx/sites-available/eyewear-oms
sudo ln -s /etc/nginx/sites-available/eyewear-oms /etc/nginx/sites-enabled/
```

### Update Domain in Config
```bash
sudo nano /etc/nginx/sites-available/eyewear-oms
# Replace 'your-domain.com' with your actual domain
```

### Test Nginx Config
```bash
sudo nginx -t
```

### Restart Nginx
```bash
sudo systemctl restart nginx
```

## Step 9: SSL Certificate (Let's Encrypt)

### Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Obtain SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Auto-renewal (already configured)
```bash
sudo certbot renew --dry-run
```

## Step 10: Start Application with PM2

### Create PM2 Ecosystem File
```bash
cd /var/www/eyewear-oms
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'eyewear-backend',
      script: './backend/server.js',
      cwd: '/var/www/eyewear-oms',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    },
    {
      name: 'eyewear-frontend',
      script: 'serve',
      args: '-s frontend/dist -l 3000',
      cwd: '/var/www/eyewear-oms',
      instances: 1,
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
};
```

### Install Serve (for frontend)
```bash
sudo npm install -g serve
```

### Create Logs Directory
```bash
mkdir -p logs
```

### Start with PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Step 11: Firewall Configuration

### Configure UFW
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Step 12: Monitoring & Maintenance

### View Logs
```bash
pm2 logs eyewear-backend
pm2 logs eyewear-frontend
```

### Restart Application
```bash
pm2 restart eyewear-backend
pm2 restart eyewear-frontend
```

### Monitor System Resources
```bash
pm2 monit
```

### Database Backup
```bash
# Create backup script
sudo nano /usr/local/bin/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/eyewear"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -U eyewear_user eyewear_production > $BACKUP_DIR/backup_$DATE.sql
gzip $BACKUP_DIR/backup_$DATE.sql
# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

```bash
sudo chmod +x /usr/local/bin/backup-db.sh
# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-db.sh
```

## Step 13: Update Deployment

### To Update Application
```bash
cd /var/www/eyewear-oms
git pull
npm install
cd frontend
npm install
npm run build
cd ..
pm2 restart eyewear-backend eyewear-frontend
```

## Troubleshooting

### Backend Not Starting
```bash
pm2 logs eyewear-backend --lines 100
# Check database connection
# Check environment variables
```

### Database Connection Issues
```bash
sudo systemctl status postgresql
# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Nginx Issues
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### SSL Certificate Issues
```bash
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

## Security Best Practices

1. **Keep system updated**: `sudo apt update && sudo apt upgrade`
2. **Use strong passwords**: For database and environment variables
3. **Limit SSH access**: Use key-based authentication
4. **Regular backups**: Automated database backups
5. **Monitor logs**: Check for suspicious activity
6. **Update dependencies**: Regular security updates
7. **Use HTTPS**: SSL certificate is mandatory
8. **Firewall**: Only open necessary ports

## Performance Optimization

1. **Enable caching**: Redis for frequent queries
2. **CDN**: Cloudflare for static assets
3. **Load balancing**: Multiple backend instances
4. **Database indexing**: Already included in schema
5. **Gzip compression**: Enabled in nginx config

## Cost Estimation (Monthly)

- **VPS (2GB RAM, 1 CPU)**: $5-20
- **Domain**: $10-15/year
- **SSL**: Free (Let's Encrypt)
- **Email (SendGrid)**: Free tier available
- **Twilio WhatsApp**: $0.005/message
- **PostgreSQL**: Can use managed service ($15-50/month)

**Total**: ~$20-70/month for basic setup

---

**Support**: For issues, check logs first, then review this guide.
