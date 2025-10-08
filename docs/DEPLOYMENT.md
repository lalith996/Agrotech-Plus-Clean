# AgroTrack+ Deployment Guide

This guide covers the deployment process for the AgroTrack+ platform across different environments.

## Prerequisites

### System Requirements
- Node.js 18+ 
- Docker and Docker Compose
- PostgreSQL 15+
- Redis 7+
- Nginx (for production)

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/agrotrack"
POSTGRES_DB=agrotrack
POSTGRES_USER=agrotrack
POSTGRES_PASSWORD=your_secure_password

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret_key_here
NEXTAUTH_URL=http://localhost:3000

# AWS S3 (for file storage)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-west-2
AWS_S3_BUCKET=agrotrack-uploads

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token

# Payment (Stripe)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Redis
REDIS_PASSWORD=your_redis_password

# Security
ENCRYPTION_KEY=your_encryption_key_for_sensitive_data
CSRF_SECRET=your_csrf_secret_key
```

## Development Deployment

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd agrotrack-mvp-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
npx prisma migrate dev
npx prisma db seed

# Start development server
npm run dev
```

### Using Docker for Development
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## Staging Deployment

### Manual Deployment
```bash
# Build the application
npm run build

# Run database migrations
npx prisma migrate deploy

# Start the application
npm start
```

### Using Deployment Script
```bash
# Deploy to staging
./scripts/deploy.sh latest staging
```

### Docker Deployment
```bash
# Build and deploy
docker-compose -f docker-compose.staging.yml up -d

# Check status
docker-compose -f docker-compose.staging.yml ps

# View logs
docker-compose -f docker-compose.staging.yml logs -f app
```

## Production Deployment

### Pre-deployment Checklist
- [ ] Environment variables configured
- [ ] Database backup created
- [ ] SSL certificates installed
- [ ] DNS records configured
- [ ] Monitoring setup
- [ ] Load balancer configured (if applicable)

### Using Deployment Script
```bash
# Deploy to production
./scripts/deploy.sh v1.0.0 production
```

### Manual Production Deployment

1. **Prepare the environment:**
```bash
# Create production directory
mkdir -p /opt/agrotrack
cd /opt/agrotrack

# Clone the repository
git clone <repository-url> .
git checkout v1.0.0  # Use specific version tag
```

2. **Install dependencies:**
```bash
npm ci --only=production
```

3. **Build the application:**
```bash
npm run build
```

4. **Set up database:**
```bash
npx prisma generate
npx prisma migrate deploy
```

5. **Start services:**
```bash
# Using Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Or using PM2
npm install -g pm2
pm2 start ecosystem.config.js --env production
```

### Docker Production Deployment

1. **Build the Docker image:**
```bash
docker build -t agrotrack:v1.0.0 .
```

2. **Deploy with Docker Compose:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. **Verify deployment:**
```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# Check application health
curl http://localhost:3000/api/health

# View logs
docker-compose -f docker-compose.prod.yml logs -f app
```

## Kubernetes Deployment

### Prerequisites
- Kubernetes cluster
- kubectl configured
- Helm (optional)

### Deploy to Kubernetes
```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check deployment status
kubectl rollout status deployment/agrotrack-app

# Get service URL
kubectl get service agrotrack-service
```

### Using Helm
```bash
# Install with Helm
helm install agrotrack ./helm/agrotrack

# Upgrade deployment
helm upgrade agrotrack ./helm/agrotrack
```

## Database Management

### Migrations
```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Deploy migrations to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Backups
```bash
# Create backup using API
curl -X POST http://localhost:3000/api/admin/backup \
  -H "Content-Type: application/json" \
  -d '{"includeDatabase": true, "includeFiles": true}'

# Manual database backup (PostgreSQL)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql $DATABASE_URL < backup_file.sql
```

## Monitoring and Logging

### Health Checks
The application provides a health check endpoint at `/api/health`:

```bash
# Check application health
curl http://localhost:3000/api/health
```

Response format:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "database": {
      "status": "up",
      "responseTime": 15
    },
    "memory": {
      "used": 128,
      "total": 512,
      "percentage": 25
    },
    "uptime": 3600
  }
}
```

### Logging
Logs are available through:
- Docker: `docker-compose logs -f app`
- PM2: `pm2 logs agrotrack`
- Kubernetes: `kubectl logs -f deployment/agrotrack-app`

### Monitoring Setup
Consider setting up:
- Application Performance Monitoring (APM)
- Error tracking (Sentry)
- Uptime monitoring
- Database monitoring
- Server monitoring

## SSL/TLS Configuration

### Using Let's Encrypt with Nginx
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Manual SSL Configuration
1. Obtain SSL certificates from your provider
2. Place certificates in `nginx/ssl/`
3. Update `nginx/nginx.conf` with SSL configuration
4. Restart Nginx

## Performance Optimization

### Production Optimizations
- Enable gzip compression
- Set up CDN for static assets
- Configure Redis for caching
- Optimize database queries
- Set up connection pooling

### Scaling Considerations
- Horizontal scaling with load balancer
- Database read replicas
- Redis clustering
- File storage on CDN
- Container orchestration

## Troubleshooting

### Common Issues

1. **Database connection errors:**
```bash
# Check database status
docker-compose exec db pg_isready

# Check connection string
echo $DATABASE_URL
```

2. **Memory issues:**
```bash
# Check memory usage
docker stats

# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
```

3. **File upload issues:**
```bash
# Check file permissions
ls -la public/uploads/

# Fix permissions
chmod 755 public/uploads/
```

4. **SSL certificate issues:**
```bash
# Check certificate validity
openssl x509 -in certificate.crt -text -noout

# Test SSL configuration
curl -I https://yourdomain.com
```

### Rollback Procedure

1. **Stop current deployment:**
```bash
docker-compose -f docker-compose.prod.yml down
```

2. **Restore from backup:**
```bash
# Restore database
psql $DATABASE_URL < backups/latest_backup.sql

# Restore files
cp -r backups/uploads/* public/uploads/
```

3. **Deploy previous version:**
```bash
git checkout previous-version-tag
./scripts/deploy.sh previous-version production
```

## Security Considerations

### Production Security Checklist
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] SSL/TLS enabled
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] File upload restrictions
- [ ] Regular security updates
- [ ] Backup encryption
- [ ] Access logging enabled

### Security Headers (Nginx)
```nginx
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'" always;
```

## Maintenance

### Regular Maintenance Tasks
- Database backups (daily)
- Log rotation
- Security updates
- Performance monitoring
- Disk space cleanup
- SSL certificate renewal

### Update Procedure
1. Create backup
2. Test updates in staging
3. Deploy during maintenance window
4. Verify functionality
5. Monitor for issues

## Support and Documentation

### Additional Resources
- [API Documentation](./API.md)
- [Database Schema](./DATABASE.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Contributing Guide](./CONTRIBUTING.md)

### Getting Help
- Check logs for error messages
- Review health check endpoint
- Consult troubleshooting section
- Contact development team

---

For questions or issues with deployment, please refer to the troubleshooting section or contact the development team.