# Grade 5 Scholarship Exam Platform
# DigitalOcean Deployment Guide
# ================================

## Server Details
- IP: 157.245.63.192
- Domain: educationreforms.cloud
- Password: niranjan9Nanayakkara

---

## STEP 1: Connect to Server

Open Terminal (Mac/Linux) or PowerShell (Windows) and run:

```bash
ssh root@157.245.63.192
```

Enter password: niranjan9Nanayakkara

---

## STEP 2: Run These Commands (Copy-Paste One by One)

### 2.1 Update System
```bash
apt update && apt upgrade -y
```

### 2.2 Install Required Software
```bash
apt install -y curl wget git nginx certbot python3-certbot-nginx ufw
```

### 2.3 Install Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g yarn pm2
```

### 2.4 Install Python 3.11
```bash
apt install -y python3.11 python3.11-venv python3-pip
```

### 2.5 Create App Directory
```bash
mkdir -p /var/www/grade5-exam
cd /var/www/grade5-exam
```

### 2.6 Clone Your Code from GitHub (or upload manually)
```bash
git clone https://github.com/tecsrilankaworldwide/grade5-scholarship-exam.git .
```

### 2.7 Setup Backend
```bash
cd /var/www/grade5-exam/backend
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate
```

### 2.8 Create Backend .env
```bash
cat > /var/www/grade5-exam/backend/.env << 'EOF'
MONGO_URL="mongodb+srv://tecadmin:TecExam2024%21@cluster0.0cisjyt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME_EXAM="exam_bureau_db"
SECRET_KEY="grade5-scholarship-exam-secret-key-2026-very-secure"
CORS_ORIGINS="https://educationreforms.cloud,http://educationreforms.cloud,http://157.245.63.192"
EOF
```

### 2.9 Setup Frontend
```bash
cd /var/www/grade5-exam/frontend
cat > .env << 'EOF'
REACT_APP_BACKEND_URL=https://educationreforms.cloud
EOF
yarn install
yarn build
```

### 2.10 Configure Nginx
```bash
cat > /etc/nginx/sites-available/grade5-exam << 'EOF'
server {
    listen 80;
    server_name educationreforms.cloud www.educationreforms.cloud 157.245.63.192;

    location / {
        root /var/www/grade5-exam/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        client_max_body_size 50M;
    }

    location /uploads/ {
        alias /var/www/grade5-exam/backend/uploads/;
    }
}
EOF
```

### 2.11 Enable Site
```bash
ln -sf /etc/nginx/sites-available/grade5-exam /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

### 2.12 Configure Firewall
```bash
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable
```

### 2.13 Start Backend with PM2
```bash
cd /var/www/grade5-exam/backend
source venv/bin/activate
pm2 start "uvicorn server:app --host 0.0.0.0 --port 8001" --name grade5-backend
pm2 save
pm2 startup
deactivate
```

### 2.14 Setup SSL (HTTPS)
First, point your domain to the IP:
- Go to your domain registrar
- Add A record: educationreforms.cloud -> 157.245.63.192

Then run:
```bash
certbot --nginx -d educationreforms.cloud -d www.educationreforms.cloud
```

---

## STEP 3: Test Your Site

1. Open browser: http://157.245.63.192
2. After SSL: https://educationreforms.cloud

---

## Useful Commands

### Check if backend is running:
```bash
pm2 status
```

### View backend logs:
```bash
pm2 logs grade5-backend
```

### Restart backend:
```bash
pm2 restart grade5-backend
```

### Restart nginx:
```bash
systemctl restart nginx
```

---

## Test Accounts
- Admin: admin@exam.lk / admin123
- Marker: marker@exam.lk / marker123

---

## Support
If you face any issues, share the error message!
