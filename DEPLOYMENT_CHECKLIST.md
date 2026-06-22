# MiNaP PTSD System - Production Deployment Checklist

## Pre-Deployment Security & Configuration

### ✅ Critical Security Settings

#### 1. Django Settings (minap/settings.py)

- [ ] **DEBUG = False**
  ```python
  DEBUG = False
  ```

- [ ] **SECRET_KEY from Environment**
  ```python
  SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')
  # Generate new key: python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
  ```

- [ ] **ALLOWED_HOSTS configured**
  ```python
  ALLOWED_HOSTS = [
      'minap.ac.ke',
      'www.minap.ac.ke',
      'ptsd.minap.ac.ke',
      # Add your production domains
  ]
  ```

- [ ] **HTTPS/SSL Settings**
  ```python
  SECURE_SSL_REDIRECT = True
  SESSION_COOKIE_SECURE = True
  CSRF_COOKIE_SECURE = True
  SECURE_HSTS_SECONDS = 31536000  # 1 year
  SECURE_HSTS_INCLUDE_SUBDOMAINS = True
  SECURE_HSTS_PRELOAD = True
  ```

- [ ] **CORS Settings**
  ```python
  CORS_ALLOWED_ORIGINS = [
      'https://minap.ac.ke',
      'https://www.minap.ac.ke',
      # Add your production frontend URLs
  ]
  CORS_ALLOW_CREDENTIALS = True
  ```

#### 2. Database Configuration

- [ ] **Switch to PostgreSQL**
  ```python
  DATABASES = {
      'default': {
          'ENGINE': 'django.db.backends.postgresql',
          'NAME': os.environ.get('DB_NAME'),
          'USER': os.environ.get('DB_USER'),
          'PASSWORD': os.environ.get('DB_PASSWORD'),
          'HOST': os.environ.get('DB_HOST'),
          'PORT': os.environ.get('DB_PORT', '5432'),
      }
  }
  ```

- [ ] **Install psycopg2**
  ```bash
  pip install psycopg2-binary
  ```

- [ ] **Run migrations on production DB**
  ```bash
  python manage.py migrate
  ```

- [ ] **Set up automated backups**
  - Daily database backups
  - Retain for 30 days minimum
  - Test restore procedure

#### 3. Static & Media Files

- [ ] **Configure static files**
  ```python
  STATIC_ROOT = '/var/www/minap/static/'
  MEDIA_ROOT = '/var/www/minap/media/'
  ```

- [ ] **Collect static files**
  ```bash
  python manage.py collectstatic --noinput
  ```

- [ ] **Set up CDN** (optional but recommended)
  - CloudFlare
  - AWS CloudFront
  - Or similar

#### 4. Email Configuration

- [ ] **Configure email backend**
  ```python
  EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
  EMAIL_HOST = os.environ.get('EMAIL_HOST')
  EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
  EMAIL_USE_TLS = True
  EMAIL_HOST_USER = os.environ.get('EMAIL_USER')
  EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_PASSWORD')
  DEFAULT_FROM_EMAIL = 'noreply@minap.ac.ke'
  ```

- [ ] **Test email sending**

---

## Infrastructure Setup

### ✅ Server Requirements

#### 1. Server Specifications (Minimum)
- [ ] **Operating System**: Ubuntu 20.04 LTS or newer
- [ ] **CPU**: 2+ cores
- [ ] **RAM**: 4GB minimum, 8GB recommended
- [ ] **Storage**: 50GB SSD
- [ ] **Network**: Static IP address
- [ ] **Firewall**: Configured (ports 80, 443 open)

#### 2. Software Installation

- [ ] **Python 3.8+**
  ```bash
  sudo apt update
  sudo apt install python3 python3-pip python3-venv
  ```

- [ ] **PostgreSQL**
  ```bash
  sudo apt install postgresql postgresql-contrib
  ```

- [ ] **Nginx**
  ```bash
  sudo apt install nginx
  ```

- [ ] **Gunicorn**
  ```bash
  pip install gunicorn
  ```

- [ ] **Supervisor** (for process management)
  ```bash
  sudo apt install supervisor
  ```

#### 3. SSL Certificate

- [ ] **Install Certbot**
  ```bash
  sudo apt install certbot python3-certbot-nginx
  ```

- [ ] **Obtain SSL certificate**
  ```bash
  sudo certbot --nginx -d minap.ac.ke -d www.minap.ac.ke
  ```

- [ ] **Set up auto-renewal**
  ```bash
  sudo certbot renew --dry-run
  ```

---

## Application Deployment

### ✅ Code Deployment

#### 1. Project Setup

- [ ] **Create deployment user**
  ```bash
  sudo adduser minap
  sudo usermod -aG sudo minap
  ```

- [ ] **Clone repository**
  ```bash
  cd /home/minap
  git clone <repository-url> minap-system
  cd minap-system/backend
  ```

- [ ] **Create virtual environment**
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```

- [ ] **Install dependencies**
  ```bash
  pip install -r requirements.txt
  pip install gunicorn psycopg2-binary
  ```

#### 2. Environment Variables

- [ ] **Create .env file**
  ```bash
  sudo nano /home/minap/minap-system/backend/.env
  ```

  ```env
  DJANGO_SECRET_KEY=<generate-new-secret-key>
  DJANGO_DEBUG=False
  ALLOWED_HOSTS=minap.ac.ke,www.minap.ac.ke
  
  DB_NAME=minap_db
  DB_USER=minap_user
  DB_PASSWORD=<secure-password>
  DB_HOST=localhost
  DB_PORT=5432
  
  EMAIL_HOST=smtp.gmail.com
  EMAIL_PORT=587
  EMAIL_USER=noreply@minap.ac.ke
  EMAIL_PASSWORD=<app-password>
  ```

- [ ] **Secure .env file**
  ```bash
  chmod 600 .env
  ```

#### 3. Database Setup

- [ ] **Create PostgreSQL database**
  ```bash
  sudo -u postgres psql
  ```
  ```sql
  CREATE DATABASE minap_db;
  CREATE USER minap_user WITH PASSWORD '<secure-password>';
  ALTER ROLE minap_user SET client_encoding TO 'utf8';
  ALTER ROLE minap_user SET default_transaction_isolation TO 'read committed';
  ALTER ROLE minap_user SET timezone TO 'Africa/Nairobi';
  GRANT ALL PRIVILEGES ON DATABASE minap_db TO minap_user;
  \q
  ```

- [ ] **Run migrations**
  ```bash
  python manage.py migrate
  ```

- [ ] **Create superuser**
  ```bash
  python manage.py createsuperuser
  ```

- [ ] **Load initial data** (if any)
  ```bash
  python manage.py loaddata initial_data.json
  ```

---

## Web Server Configuration

### ✅ Gunicorn Setup

- [ ] **Create Gunicorn config**
  ```bash
  sudo nano /home/minap/minap-system/backend/gunicorn_config.py
  ```

  ```python
  bind = "127.0.0.1:8000"
  workers = 3
  worker_class = "sync"
  accesslog = "/var/log/minap/gunicorn-access.log"
  errorlog = "/var/log/minap/gunicorn-error.log"
  loglevel = "info"
  ```

- [ ] **Create log directory**
  ```bash
  sudo mkdir -p /var/log/minap
  sudo chown minap:minap /var/log/minap
  ```

- [ ] **Test Gunicorn**
  ```bash
  cd /home/minap/minap-system/backend
  source venv/bin/activate
  gunicorn minap.wsgi:application -c gunicorn_config.py
  ```

### ✅ Supervisor Configuration

- [ ] **Create Supervisor config**
  ```bash
  sudo nano /etc/supervisor/conf.d/minap.conf
  ```

  ```ini
  [program:minap]
  command=/home/minap/minap-system/backend/venv/bin/gunicorn minap.wsgi:application -c /home/minap/minap-system/backend/gunicorn_config.py
  directory=/home/minap/minap-system/backend
  user=minap
  autostart=true
  autorestart=true
  redirect_stderr=true
  stdout_logfile=/var/log/minap/supervisor.log
  ```

- [ ] **Update Supervisor**
  ```bash
  sudo supervisorctl reread
  sudo supervisorctl update
  sudo supervisorctl start minap
  ```

- [ ] **Check status**
  ```bash
  sudo supervisorctl status minap
  ```

### ✅ Nginx Configuration

- [ ] **Create Nginx config**
  ```bash
  sudo nano /etc/nginx/sites-available/minap
  ```

  ```nginx
  upstream minap_app {
      server 127.0.0.1:8000;
  }

  server {
      listen 80;
      server_name minap.ac.ke www.minap.ac.ke;
      return 301 https://$server_name$request_uri;
  }

  server {
      listen 443 ssl http2;
      server_name minap.ac.ke www.minap.ac.ke;

      ssl_certificate /etc/letsencrypt/live/minap.ac.ke/fullchain.pem;
      ssl_certificate_key /etc/letsencrypt/live/minap.ac.ke/privkey.pem;
      ssl_protocols TLSv1.2 TLSv1.3;
      ssl_ciphers HIGH:!aNULL:!MD5;

      client_max_body_size 10M;

      location /static/ {
          alias /var/www/minap/static/;
          expires 30d;
          add_header Cache-Control "public, immutable";
      }

      location /media/ {
          alias /var/www/minap/media/;
          expires 30d;
      }

      location / {
          proxy_pass http://minap_app;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
      }
  }
  ```

- [ ] **Enable site**
  ```bash
  sudo ln -s /etc/nginx/sites-available/minap /etc/nginx/sites-enabled/
  ```

- [ ] **Test Nginx config**
  ```bash
  sudo nginx -t
  ```

- [ ] **Restart Nginx**
  ```bash
  sudo systemctl restart nginx
  ```

---

## Monitoring & Logging

### ✅ Logging Setup

- [ ] **Configure Django logging**
  ```python
  LOGGING = {
      'version': 1,
      'disable_existing_loggers': False,
      'formatters': {
          'verbose': {
              'format': '{levelname} {asctime} {module} {message}',
              'style': '{',
          },
      },
      'handlers': {
          'file': {
              'level': 'INFO',
              'class': 'logging.handlers.RotatingFileHandler',
              'filename': '/var/log/minap/django.log',
              'maxBytes': 10485760,  # 10MB
              'backupCount': 10,
              'formatter': 'verbose',
          },
      },
      'root': {
          'handlers': ['file'],
          'level': 'INFO',
      },
  }
  ```

- [ ] **Set up log rotation**
  ```bash
  sudo nano /etc/logrotate.d/minap
  ```

  ```
  /var/log/minap/*.log {
      daily
      missingok
      rotate 14
      compress
      delaycompress
      notifempty
      create 0640 minap minap
      sharedscripts
  }
  ```

### ✅ Monitoring

- [ ] **Install monitoring tools**
  - Sentry (error tracking)
  - New Relic / DataDog (APM)
  - Uptime Robot (availability)

- [ ] **Set up health check endpoint**
  ```python
  # In urls.py
  path('health/', health_check, name='health-check'),
  ```

- [ ] **Configure alerting**
  - Email notifications
  - SMS for critical issues
  - Slack/Discord webhooks

---

## Security Hardening

### ✅ Server Security

- [ ] **Configure firewall (UFW)**
  ```bash
  sudo ufw allow OpenSSH
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw enable
  ```

- [ ] **Disable root SSH login**
  ```bash
  sudo nano /etc/ssh/sshd_config
  # Set: PermitRootLogin no
  sudo systemctl restart sshd
  ```

- [ ] **Set up fail2ban**
  ```bash
  sudo apt install fail2ban
  sudo systemctl enable fail2ban
  sudo systemctl start fail2ban
  ```

- [ ] **Keep system updated**
  ```bash
  sudo apt update && sudo apt upgrade -y
  ```

### ✅ Application Security

- [ ] **Run security check**
  ```bash
  python manage.py check --deploy
  ```

- [ ] **Review security settings**
  - Content Security Policy (CSP)
  - X-Frame-Options
  - X-Content-Type-Options
  - Referrer-Policy

- [ ] **Implement rate limiting**
  ```bash
  pip install django-ratelimit
  ```

---

## Performance Optimization

### ✅ Caching

- [ ] **Install Redis**
  ```bash
  sudo apt install redis-server
  pip install django-redis
  ```

- [ ] **Configure Django caching**
  ```python
  CACHES = {
      'default': {
          'BACKEND': 'django_redis.cache.RedisCache',
          'LOCATION': 'redis://127.0.0.1:6379/1',
          'OPTIONS': {
              'CLIENT_CLASS': 'django_redis.client.DefaultClient',
          }
      }
  }
  ```

### ✅ Database Optimization

- [ ] **Enable connection pooling**
- [ ] **Set up read replicas** (if needed)
- [ ] **Configure database indexes**
- [ ] **Enable query optimization**

---

## Testing in Production

### ✅ Pre-Launch Testing

- [ ] **Test all user flows**
  - Anonymous screening
  - Student registration
  - Student login
  - Authenticated screening
  - Dashboard access
  - Counsellor login
  - Referral management

- [ ] **Test security**
  - HTTPS redirects
  - CSRF protection
  - XSS prevention
  - SQL injection prevention

- [ ] **Performance testing**
  - Load testing (100+ concurrent users)
  - Response time monitoring
  - Database query optimization

- [ ] **Browser testing**
  - Chrome
  - Firefox
  - Safari
  - Edge
  - Mobile browsers

---

## Launch Checklist

### ✅ Go-Live

- [ ] **Final code review**
- [ ] **Final security audit**
- [ ] **Backup current system** (if replacing existing)
- [ ] **DNS configuration**
- [ ] **SSL certificate verified**
- [ ] **Monitoring enabled**
- [ ] **Team training completed**
- [ ] **Documentation finalized**
- [ ] **Support channels ready**

### ✅ Post-Launch

- [ ] **Monitor for errors** (first 24 hours)
- [ ] **Check system performance**
- [ ] **Review user feedback**
- [ ] **Verify backups running**
- [ ] **Test recovery procedures**

---

## Maintenance Schedule

### Daily
- [ ] Monitor error logs
- [ ] Check system performance
- [ ] Review security alerts

### Weekly
- [ ] Database backup verification
- [ ] Performance metrics review
- [ ] User activity analysis

### Monthly
- [ ] Security updates
- [ ] Dependency updates
- [ ] Full system audit

### Quarterly
- [ ] Disaster recovery drill
- [ ] Security penetration testing
- [ ] User satisfaction survey

---

## Rollback Plan

### If Issues Arise

1. **Immediate Actions**
   - [ ] Stop new deployments
   - [ ] Assess impact
   - [ ] Notify stakeholders

2. **Rollback Steps**
   ```bash
   # Stop application
   sudo supervisorctl stop minap
   
   # Restore previous code
   git checkout <previous-stable-commit>
   
   # Restore database (if needed)
   psql minap_db < backup.sql
   
   # Restart application
   sudo supervisorctl start minap
   ```

3. **Post-Rollback**
   - [ ] Verify system functionality
   - [ ] Investigate root cause
   - [ ] Plan fix
   - [ ] Document incident

---

## Contact Information

### Emergency Contacts
- **System Administrator**: [Phone/Email]
- **Database Administrator**: [Phone/Email]
- **Security Team**: [Phone/Email]
- **Project Owner**: Stella Mwaura - [Email]

### Service Providers
- **Hosting**: [Provider + Support Contact]
- **Domain**: [Registrar + Support Contact]
- **Email**: [Provider + Support Contact]
- **Monitoring**: [Service + Support Contact]

---

## Sign-Off

### Deployment Approval

- [ ] **Technical Lead**: ________________ Date: ________
- [ ] **Security Officer**: ________________ Date: ________
- [ ] **Project Manager**: ________________ Date: ________
- [ ] **Institution Admin**: ________________ Date: ________

---

**Deployment Version**: 1.0.0  
**Target Launch Date**: ________________  
**Actual Launch Date**: ________________  
**Status**: ☐ Ready  ☐ In Progress  ☐ Complete
