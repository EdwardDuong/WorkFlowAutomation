# Deployment Guide

Complete guide for deploying the Workflow Automation Platform to production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Docker Deployment](#docker-deployment)
- [Manual Deployment](#manual-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Database Setup](#database-setup)
- [Security Configuration](#security-configuration)
- [Monitoring & Logging](#monitoring--logging)
- [Backup & Recovery](#backup--recovery)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

**Minimum:**
- 2 CPU cores
- 4GB RAM
- 20GB disk space
- Docker 20.10+ or .NET 8 SDK
- PostgreSQL 15+
- Redis 7+ (optional but recommended)

**Recommended for Production:**
- 4+ CPU cores
- 8GB+ RAM
- 50GB+ SSD storage
- Load balancer (for high availability)
- SSL/TLS certificates

### Software Requirements

- **Docker & Docker Compose** (for containerized deployment)
- **.NET 8 SDK** (for manual deployment)
- **Node.js 20+** (for frontend build)
- **PostgreSQL 15+**
- **Redis 7+** (optional)
- **Nginx** (for reverse proxy)

---

## Environment Configuration

### Environment Variables

Create `.env` file in project root:

```bash
# Application
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080

# Database
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=workflowautomation
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT Settings
JWT_SECRET=your-very-long-secret-key-min-32-characters
JWT_ISSUER=WorkflowAutomation.API
JWT_AUDIENCE=WorkflowAutomation.Client
JWT_ACCESS_TOKEN_EXPIRATION_MINUTES=60
JWT_REFRESH_TOKEN_EXPIRATION_DAYS=30

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Frontend
VITE_API_URL=https://api.yourdomain.com
```

### Generate Secure Secrets

**JWT Secret (minimum 32 characters):**
```bash
# Linux/Mac
openssl rand -base64 32

# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**PostgreSQL Password:**
```bash
# Linux/Mac
openssl rand -base64 24

# PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 24 | ForEach-Object {[char]$_})
```

---

## Docker Deployment

### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: workflow-postgres
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - workflow-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: workflow-redis
    volumes:
      - redis_data:/data
    networks:
      - workflow-network
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: workflow-api
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Host=postgres;Port=5432;Database=${POSTGRES_DB};Username=${POSTGRES_USER};Password=${POSTGRES_PASSWORD}
      - ConnectionStrings__Redis=redis:6379,password=${REDIS_PASSWORD}
      - JwtSettings__Secret=${JWT_SECRET}
      - JwtSettings__Issuer=${JWT_ISSUER}
      - JwtSettings__Audience=${JWT_AUDIENCE}
      - JwtSettings__AccessTokenExpirationMinutes=${JWT_ACCESS_TOKEN_EXPIRATION_MINUTES}
      - JwtSettings__RefreshTokenExpirationDays=${JWT_REFRESH_TOKEN_EXPIRATION_DAYS}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - workflow-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8080/api/health/live || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    labels:
      - "com.centurylinklabs.watchtower.enable=true"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - VITE_API_URL=${VITE_API_URL}
    container_name: workflow-frontend
    depends_on:
      api:
        condition: service_healthy
    networks:
      - workflow-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:80/ || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
    labels:
      - "com.centurylinklabs.watchtower.enable=true"

  nginx:
    image: nginx:alpine
    container_name: workflow-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - certbot_data:/var/www/certbot
    depends_on:
      - api
      - frontend
    networks:
      - workflow-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  certbot_data:

networks:
  workflow-network:
    driver: bridge
```

### Deploy with Docker Compose

```bash
# 1. Clone repository
git clone https://github.com/yourusername/WorkFlowAutomation.git
cd WorkFlowAutomation

# 2. Create .env file with production values
cp .env.example .env
nano .env  # Edit with your values

# 3. Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# 4. Check status
docker-compose -f docker-compose.prod.yml ps

# 5. View logs
docker-compose -f docker-compose.prod.yml logs -f

# 6. Stop services
docker-compose -f docker-compose.prod.yml down
```

### Auto-Update with Watchtower

```yaml
# Add to docker-compose.prod.yml
watchtower:
  image: containrrr/watchtower
  container_name: watchtower
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
  command: --interval 300 --cleanup
  restart: unless-stopped
```

---

## Manual Deployment

### Backend Deployment

```bash
# 1. Navigate to API project
cd backend/src/WorkflowAutomation.API

# 2. Restore dependencies
dotnet restore

# 3. Build for production
dotnet publish -c Release -o /var/www/workflow-api

# 4. Run migrations
dotnet ef database update --project ../WorkflowAutomation.Infrastructure

# 5. Start application
cd /var/www/workflow-api
dotnet WorkflowAutomation.API.dll
```

### Frontend Deployment

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm ci --production

# 3. Build for production
npm run build

# 4. Copy to web server
cp -r dist/* /var/www/workflow-frontend/

# 5. Configure Nginx (see below)
```

### Systemd Service (Backend)

Create `/etc/systemd/system/workflow-api.service`:

```ini
[Unit]
Description=Workflow Automation API
After=network.target postgresql.service

[Service]
Type=notify
User=www-data
WorkingDirectory=/var/www/workflow-api
ExecStart=/usr/bin/dotnet /var/www/workflow-api/WorkflowAutomation.API.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=workflow-api
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable workflow-api
sudo systemctl start workflow-api
sudo systemctl status workflow-api

# View logs
sudo journalctl -u workflow-api -f
```

---

## Cloud Deployment

### AWS Deployment

**Using ECS (Elastic Container Service):**

1. **Push Docker images to ECR:**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and tag
docker build -t workflow-api ./backend
docker tag workflow-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/workflow-api:latest

# Push
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/workflow-api:latest
```

2. **Create RDS PostgreSQL instance**
3. **Create ElastiCache Redis cluster**
4. **Create ECS task definition**
5. **Create ECS service with load balancer**
6. **Configure auto-scaling**

**Using Elastic Beanstalk:**

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p docker workflow-automation --region us-east-1

# Create environment
eb create production --database.engine postgres

# Deploy
eb deploy
```

### Azure Deployment

**Using Azure Container Instances:**

```bash
# Login
az login

# Create resource group
az group create --name workflow-automation --location eastus

# Create container registry
az acr create --resource-group workflow-automation --name workflowacr --sku Basic

# Create PostgreSQL
az postgres server create --resource-group workflow-automation --name workflow-db --admin-user dbadmin --admin-password <password>

# Deploy containers
az container create --resource-group workflow-automation --file docker-compose.prod.yml
```

### Google Cloud Platform

**Using Cloud Run:**

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/project-id/workflow-api ./backend

# Deploy
gcloud run deploy workflow-api \
  --image gcr.io/project-id/workflow-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Create Cloud SQL PostgreSQL
gcloud sql instances create workflow-db --tier=db-f1-micro --region=us-central1
```

### Heroku Deployment

```bash
# Login
heroku login

# Create app
heroku create workflow-automation

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Add Redis
heroku addons:create heroku-redis:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main
```

---

## Database Setup

### Initialize Database

```bash
# Connect to PostgreSQL
psql -h localhost -U postgres

# Create database
CREATE DATABASE workflowautomation;

# Create user
CREATE USER workflowapp WITH ENCRYPTED PASSWORD 'secure-password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE workflowautomation TO workflowapp;

# Exit
\q
```

### Run Migrations

```bash
# From API project directory
dotnet ef database update --project ../WorkflowAutomation.Infrastructure
```

### Database Backup

**Automated Backup Script:**

```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/workflow"
DB_NAME="workflowautomation"

mkdir -p $BACKUP_DIR

pg_dump -h localhost -U postgres -d $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

**Cron Job (daily at 2 AM):**
```bash
0 2 * * * /usr/local/bin/backup-db.sh
```

---

## Security Configuration

### SSL/TLS Setup with Let's Encrypt

**Install Certbot:**
```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
```

**Obtain Certificate:**
```bash
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

**Auto-Renewal:**
```bash
# Test renewal
sudo certbot renew --dry-run

# Add to cron (automatically configured by certbot)
```

### Nginx Configuration

Create `/etc/nginx/sites-available/workflow-automation`:

```nginx
# HTTP - Redirect to HTTPS
server {
    listen 80;
    server_name yourdomain.com api.yourdomain.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# Frontend
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# API
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
    limit_req zone=api_limit burst=20 nodelay;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/workflow-automation /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Only allow PostgreSQL from localhost
sudo ufw deny 5432/tcp
```

### Environment Security

- **Never commit .env files** - Add to .gitignore
- **Use secrets manager** - AWS Secrets Manager, Azure Key Vault
- **Rotate credentials** - Regularly update passwords and tokens
- **Limit database access** - Read-only users where possible
- **Enable audit logging** - Track all database changes

---

## Monitoring & Logging

### Application Logging

**Serilog Configuration (appsettings.Production.json):**

```json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    },
    "WriteTo": [
      {
        "Name": "Console",
        "Args": {
          "outputTemplate": "[{Timestamp:yyyy-MM-dd HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}"
        }
      },
      {
        "Name": "File",
        "Args": {
          "path": "/var/log/workflow/app-.log",
          "rollingInterval": "Day",
          "retainedFileCountLimit": 30,
          "outputTemplate": "[{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} {Level:u3}] {Message:lj}{NewLine}{Exception}"
        }
      }
    ]
  }
}
```

### Health Checks

Access health endpoints:
- `https://api.yourdomain.com/api/health` - Overall health
- `https://api.yourdomain.com/api/health/ready` - Readiness
- `https://api.yourdomain.com/api/health/live` - Liveness

### Monitoring Tools

**Recommended:**
- **Prometheus + Grafana** - Metrics and dashboards
- **ELK Stack** - Log aggregation and search
- **Application Insights** - Azure monitoring
- **CloudWatch** - AWS monitoring
- **UptimeRobot** - Uptime monitoring

**Docker Monitoring:**
```bash
# Container stats
docker stats

# Container logs
docker logs -f workflow-api

# All container logs
docker-compose logs -f
```

---

## Backup & Recovery

### Backup Strategy

**What to Backup:**
1. PostgreSQL database
2. Redis data (optional)
3. Application logs
4. Environment configuration
5. SSL certificates

**Backup Schedule:**
- **Database:** Daily full backup, hourly incremental
- **Logs:** Weekly archive
- **Configuration:** On each change

### Restore Procedure

**Database Restore:**
```bash
# Restore from backup
gunzip -c /var/backups/workflow/backup_20251228.sql.gz | psql -h localhost -U postgres -d workflowautomation
```

**Application Restore:**
```bash
# Pull latest code
git pull origin main

# Rebuild containers
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker exec workflow-api dotnet ef database update
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs workflow-api

# Check health
docker inspect workflow-api | grep Health

# Restart container
docker restart workflow-api
```

### Database Connection Fails

```bash
# Test connection
docker exec workflow-api psql -h postgres -U postgres -d workflowautomation -c "SELECT 1"

# Check environment variables
docker exec workflow-api env | grep CONNECTION
```

### High Memory Usage

```bash
# Check container memory
docker stats workflow-api

# Increase memory limit
# In docker-compose.prod.yml:
# services:
#   api:
#     deploy:
#       resources:
#         limits:
#           memory: 2G
```

### SSL Certificate Issues

```bash
# Renew certificate
sudo certbot renew

# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Production Checklist

Before going live:

- [ ] Environment variables configured
- [ ] SSL/TLS certificates installed
- [ ] Firewall rules configured
- [ ] Database backups automated
- [ ] Monitoring and alerts set up
- [ ] Log rotation configured
- [ ] Health checks passing
- [ ] Performance tested
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Disaster recovery plan created
- [ ] Team trained on deployment process

---

## Scaling Considerations

### Horizontal Scaling

**Load Balancing:**
- Deploy multiple API instances
- Use Nginx or cloud load balancer
- Session state in Redis (already configured)

**Database Scaling:**
- Read replicas for queries
- Connection pooling (configured in EF Core)
- Database partitioning for large datasets

### Vertical Scaling

**Increase Resources:**
```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
```

---

## Support

For deployment issues:
1. Check logs: `docker-compose logs -f`
2. Review health checks: `/api/health`
3. Verify environment variables
4. Test database connectivity
5. Check firewall rules

Good luck with your deployment! 🚀
