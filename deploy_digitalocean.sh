#!/bin/bash

#############################################
# Grade 5 Scholarship Exam Platform
# DigitalOcean Deployment Script
# Server: 157.245.63.192
# Domain: educationreforms.cloud
#############################################

echo "=========================================="
echo "Grade 5 Exam Platform - Deployment Script"
echo "=========================================="

# Exit on error
set -e

# Update system
echo ""
echo ">>> Step 1: Updating system..."
apt update && apt upgrade -y

# Install essential packages
echo ""
echo ">>> Step 2: Installing essential packages..."
apt install -y curl wget git nginx certbot python3-certbot-nginx ufw

# Install Node.js 20
echo ""
echo ">>> Step 3: Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g yarn pm2

# Install Python 3.11 and pip
echo ""
echo ">>> Step 4: Installing Python 3.11..."
apt install -y python3.11 python3.11-venv python3-pip

# Create app directory
echo ""
echo ">>> Step 5: Creating app directory..."
mkdir -p /var/www/grade5-exam
cd /var/www/grade5-exam

# Clone or create the application
echo ""
echo ">>> Step 6: Setting up application..."

# Create backend directory
mkdir -p backend
mkdir -p backend/uploads/papers
mkdir -p frontend

# Backend requirements
cat > backend/requirements.txt << 'EOF'
fastapi==0.109.0
uvicorn[standard]==0.27.0
motor==3.3.2
pymongo[srv]==4.6.1
python-dotenv==1.0.0
pydantic==2.5.3
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
cachetools==5.3.2
aiofiles==23.2.1
Pillow==10.2.0
EOF

# Create Python virtual environment and install dependencies
echo ""
echo ">>> Step 7: Setting up Python environment..."
cd /var/www/grade5-exam/backend
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate

# Backend .env file
echo ""
echo ">>> Step 8: Creating backend configuration..."
cat > /var/www/grade5-exam/backend/.env << 'EOF'
MONGO_URL="mongodb+srv://tecadmin:TecExam2024%21@cluster0.0cisjyt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME_EXAM="exam_bureau_db"
SECRET_KEY="grade5-scholarship-exam-secret-key-2026-very-secure"
CORS_ORIGINS="https://educationreforms.cloud,http://educationreforms.cloud,http://157.245.63.192"
EOF

# Frontend .env file
echo ""
echo ">>> Step 9: Creating frontend configuration..."
cat > /var/www/grade5-exam/frontend/.env << 'EOF'
REACT_APP_BACKEND_URL=https://educationreforms.cloud
EOF

echo ""
echo ">>> Step 10: Downloading application code..."
echo "NOTE: You need to upload your code. For now, creating placeholder."

# Configure Nginx
echo ""
echo ">>> Step 11: Configuring Nginx..."
cat > /etc/nginx/sites-available/grade5-exam << 'EOF'
server {
    listen 80;
    server_name educationreforms.cloud www.educationreforms.cloud 157.245.63.192;

    # Frontend
    location / {
        root /var/www/grade5-exam/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        client_max_body_size 50M;
    }

    # Uploads
    location /uploads/ {
        alias /var/www/grade5-exam/backend/uploads/;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/grade5-exam /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# Configure firewall
echo ""
echo ">>> Step 12: Configuring firewall..."
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

# Restart nginx
systemctl restart nginx

# Create PM2 ecosystem file
echo ""
echo ">>> Step 13: Creating PM2 configuration..."
cat > /var/www/grade5-exam/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'grade5-backend',
      cwd: '/var/www/grade5-exam/backend',
      script: 'venv/bin/uvicorn',
      args: 'server:app --host 0.0.0.0 --port 8001',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    }
  ]
};
EOF

# Set permissions
echo ""
echo ">>> Step 14: Setting permissions..."
chown -R www-data:www-data /var/www/grade5-exam
chmod -R 755 /var/www/grade5-exam

echo ""
echo "=========================================="
echo "Basic Setup Complete!"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. Upload your application code to /var/www/grade5-exam/"
echo "2. Build frontend: cd frontend && yarn install && yarn build"
echo "3. Start backend: pm2 start ecosystem.config.js"
echo "4. Setup SSL: certbot --nginx -d educationreforms.cloud"
echo ""
echo "Server IP: 157.245.63.192"
echo "Domain: educationreforms.cloud"
echo "=========================================="
