# 📦 OPTION A: Docker Package Installation Guide

## Grade 5 Scholarship Exam Platform - One-Click Installation

**For:** Academic Board Directors & IT Staff  
**Time Required:** 15 minutes  
**Difficulty:** Easy ⭐

---

## 📋 WHAT YOU GET

✅ Complete examination platform running on your computer  
✅ No internet required after installation  
✅ All data stored locally  
✅ Professional and secure  
✅ One-click start and stop  

---

## 🔧 STEP 1: Install Docker Desktop (ONE-TIME SETUP)

### **For Windows:**

1. Download Docker Desktop:
   - Visit: https://www.docker.com/products/docker-desktop
   - Click "Download for Windows"
   - File size: ~500 MB

2. Install Docker Desktop:
   - Double-click the downloaded file
   - Follow the installation wizard
   - Restart computer when prompted

3. Start Docker Desktop:
   - Find "Docker Desktop" in Start Menu
   - Double-click to open
   - Wait for Docker to start (whale icon in system tray)

### **For Mac:**

1. Download Docker Desktop:
   - Visit: https://www.docker.com/products/docker-desktop
   - Click "Download for Mac"
   - Choose: Intel chip OR Apple chip (M1/M2)

2. Install Docker Desktop:
   - Open the downloaded `.dmg` file
   - Drag Docker to Applications folder
   - Open Docker from Applications

3. Start Docker Desktop:
   - Docker icon appears in menu bar
   - Wait until it says "Docker Desktop is running"

### **For Linux:**

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
```

---

## 🚀 STEP 2: Install the Exam Platform

### **Windows Users:**

1. **Extract the ZIP file:**
   - Right-click `grade5-exam-platform.zip`
   - Click "Extract All"
   - Choose a location (e.g., Desktop)

2. **Start the Application:**
   - Open the extracted folder
   - Double-click: `START_APPLICATION.bat`
   - Wait 30-60 seconds

3. **Application Opens Automatically:**
   - Browser opens to: http://localhost:3000
   - Platform is ready to use!

### **Mac/Linux Users:**

1. **Extract the ZIP file:**
   ```bash
   unzip grade5-exam-platform.zip
   cd grade5-exam-platform
   ```

2. **Start the Application:**
   ```bash
   ./START_APPLICATION.sh
   ```

3. **Application Opens Automatically:**
   - Browser opens to: http://localhost:3000
   - Platform is ready to use!

---

## 🔑 DEFAULT LOGIN CREDENTIALS

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@test.com | admin123 |
| **Teacher** | teacher@test.com | teacher123 |
| **Student** | student@test.com | student123 |
| **Parent** | parent@test.com | parent123 |

**⚠️ IMPORTANT:** Change these passwords after first login!

---

## 🎯 USING THE APPLICATION

### **Starting the Platform:**
- **Windows:** Double-click `START_APPLICATION.bat`
- **Mac/Linux:** Run `./START_APPLICATION.sh`
- Platform opens in your browser automatically
- URL: http://localhost:3000

### **Stopping the Platform:**
- **Windows:** Double-click `STOP_APPLICATION.bat`
- **Mac/Linux:** Run `./STOP_APPLICATION.sh`
- All services stop safely

### **Accessing Anytime:**
- As long as the application is running
- Open browser and go to: http://localhost:3000
- No internet connection needed!

---

## 💾 DATA STORAGE

**All data is stored locally on your computer:**
- Student records
- Exam results
- Progress reports
- Uploaded PDFs

**Location:** Docker volumes (managed automatically)

**Backup:** Data persists even after stopping the application

---

## ⚙️ SYSTEM REQUIREMENTS

### **Minimum:**
- **OS:** Windows 10/11, macOS 10.15+, Ubuntu 20.04+
- **RAM:** 4 GB
- **Disk Space:** 5 GB free
- **Processor:** Dual-core CPU

### **Recommended:**
- **RAM:** 8 GB
- **Disk Space:** 10 GB free
- **Processor:** Quad-core CPU

---

## 🔧 TROUBLESHOOTING

### **Problem: "Docker is not running"**
**Solution:**
- Start Docker Desktop application
- Wait for whale icon to appear (Windows) or menu bar icon (Mac)
- Try starting the exam platform again

### **Problem: "Port already in use"**
**Solution:**
- Close any applications using ports 3000 or 8001
- Or modify `docker-compose.production.yml` to use different ports

### **Problem: Application won't start**
**Solution:**
```bash
# Windows (Command Prompt)
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d

# Mac/Linux (Terminal)
./STOP_APPLICATION.sh
./START_APPLICATION.sh
```

### **Problem: Browser doesn't open automatically**
**Solution:**
- Manually open browser
- Go to: http://localhost:3000

### **Problem: "Cannot connect to database"**
**Solution:**
- Wait 30 more seconds (services starting up)
- Refresh browser page
- If still not working, restart application

---

## 🔄 UPDATING THE APPLICATION

1. Stop current application:
   - Run `STOP_APPLICATION.bat` (Windows)
   - Run `./STOP_APPLICATION.sh` (Mac/Linux)

2. Delete old files

3. Extract new ZIP file

4. Start application again

**Note:** Your data is preserved in Docker volumes!

---

## 📊 CHECKING STATUS

### **Windows:**
```cmd
docker ps
```

### **Mac/Linux:**
```bash
docker ps
```

**You should see 3 containers running:**
- `exam-frontend`
- `exam-backend`
- `exam-mongodb`

---

## 🆘 GETTING HELP

### **View Logs:**

**Windows:**
```cmd
docker-compose -f docker-compose.production.yml logs
```

**Mac/Linux:**
```bash
docker-compose -f docker-compose.production.yml logs
```

### **Contact Support:**
- **Email:** exams@tecsrilanka.com.lk
- **Developer:** TEC Sri Lanka Worldwide (Pvt.) Ltd

---

## ✅ VERIFICATION CHECKLIST

After installation, verify everything works:

- [ ] Docker Desktop is installed and running
- [ ] Application starts without errors
- [ ] Browser opens to login page
- [ ] Can login with test credentials
- [ ] Dashboard loads correctly
- [ ] Can navigate between pages
- [ ] Application stops cleanly

---

## 🎉 SUCCESS!

Your Grade 5 Scholarship Exam Platform is now installed and ready!

**Features Available:**
- ✅ 60-question MCQ exams
- ✅ 10 skill area tracking
- ✅ Mobile-responsive design
- ✅ Email notifications
- ✅ Excel/PDF reports
- ✅ Multi-language (Sinhala/Tamil/English)
- ✅ Progress analytics

**Next Steps:**
1. Login as Admin
2. Change default passwords
3. Create teacher accounts
4. Add student data
5. Create exams
6. Begin testing!

---

**Installation Complete! The platform is ready for the Academic Board.** ✅
