# 📦 OPTION C: Portable Package Installation Guide

## Grade 5 Scholarship Exam Platform - Portable Version

**For:** Users who cannot install Docker  
**Time Required:** 20-30 minutes  
**Difficulty:** Medium ⭐⭐

---

## 📋 WHAT YOU GET

✅ Complete platform without Docker  
✅ Direct installation on your computer  
✅ All data stored locally  
✅ No containers required  

---

## 🔧 PREREQUISITES (ONE-TIME SETUP)

### **1. Install Python 3.11:**

**Windows:**
- Visit: https://www.python.org/downloads/
- Download Python 3.11.x
- **IMPORTANT:** Check "Add Python to PATH" during installation

**Mac:**
```bash
brew install python@3.11
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install python3.11 python3.11-venv
```

### **2. Install Node.js 18:**

**Windows/Mac:**
- Visit: https://nodejs.org/
- Download LTS version (18.x)
- Run installer

**Linux:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### **3. Install Yarn:**

**All Platforms:**
```bash
npm install -g yarn
```

---

## 🚀 INSTALLATION STEPS

### **Windows:**

1. **Extract ZIP file:**
   - Right-click `grade5-exam-platform-portable.zip`
   - Click "Extract All"
   - Choose location (e.g., `C:\exam-platform`)

2. **Run Setup:**
   - Open the extracted folder
   - Double-click: `START_PORTABLE.bat`
   - First run will install dependencies (takes 5-10 min)

3. **Application Starts:**
   - Browser opens to http://localhost:3000
   - Platform is ready!

### **Mac/Linux:**

1. **Extract ZIP:**
   ```bash
   unzip grade5-exam-platform-portable.zip
   cd grade5-exam-platform
   ```

2. **Make scripts executable:**
   ```bash
   chmod +x START_PORTABLE.sh STOP_PORTABLE.sh
   ```

3. **Run Setup:**
   ```bash
   ./START_PORTABLE.sh
   ```
   - First run installs dependencies (5-10 min)
   - Browser opens automatically

---

## 🎯 USING THE APPLICATION

### **Starting:**
- **Windows:** Double-click `START_PORTABLE.bat`
- **Mac/Linux:** Run `./START_PORTABLE.sh`

### **Stopping:**
- **Windows:** Double-click `STOP_PORTABLE.bat`
- **Mac/Linux:** Run `./STOP_PORTABLE.sh`

### **Accessing:**
- Open browser: http://localhost:3000

---

## 💾 DATA STORAGE

**Location:** `portable_mongodb/data/`

**Backup:**
- Copy entire `portable_mongodb/data/` folder
- Paste to safe location

**Restore:**
- Replace `portable_mongodb/data/` with backup folder

---

## ⚙️ SYSTEM REQUIREMENTS

### **Minimum:**
- **OS:** Windows 10+, macOS 10.15+, Ubuntu 20.04+
- **RAM:** 4 GB
- **Disk:** 5 GB free
- **Python:** 3.11+
- **Node.js:** 18+

### **Recommended:**
- **RAM:** 8 GB
- **Disk:** 10 GB free

---

## 🔧 TROUBLESHOOTING

### **"Python not found"**
- Install Python from https://www.python.org/
- Windows: Make sure "Add to PATH" was checked
- Restart computer after installation

### **"Node.js not found"**
- Install Node.js from https://nodejs.org/
- Restart terminal/command prompt

### **"Port already in use"**
- Close applications using ports 3000, 8001, or 27017
- Or modify ports in `.env` files

### **Application won't start**
1. Stop all services: `STOP_PORTABLE.bat`
2. Wait 10 seconds
3. Start again: `START_PORTABLE.bat`

### **"Permission denied" (Mac/Linux)**
```bash
chmod +x START_PORTABLE.sh STOP_PORTABLE.sh
```

---

## 📊 MANUAL STARTUP (Advanced)

If scripts don't work, start manually:

### **Windows:**
```cmd
REM Terminal 1 - MongoDB
cd portable_mongodb
mongod --dbpath=data

REM Terminal 2 - Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python server.py

REM Terminal 3 - Frontend
cd frontend
yarn install
yarn start
```

### **Mac/Linux:**
```bash
# Terminal 1 - MongoDB
cd portable_mongodb
./mongod --dbpath=data

# Terminal 2 - Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python server.py

# Terminal 3 - Frontend
cd frontend
yarn install
yarn start
```

---

## 🔄 UPDATING

1. Stop application
2. Backup `portable_mongodb/data/` folder
3. Delete old files (except `portable_mongodb/data/`)
4. Extract new ZIP
5. Copy back `portable_mongodb/data/` folder
6. Start application

---

## ✅ VERIFICATION

After installation:

- [ ] Python 3.11+ installed
- [ ] Node.js 18+ installed
- [ ] Yarn installed
- [ ] Application starts without errors
- [ ] Can access http://localhost:3000
- [ ] Can login successfully

---

## 🆘 GETTING HELP

**Email:** exams@tecsrilanka.com.lk  
**Developer:** TEC Sri Lanka Worldwide (Pvt.) Ltd

---

## ⚠️ IMPORTANT NOTES

1. **Don't close terminal windows** while application is running
2. **Always use STOP scripts** before closing
3. **Backup data regularly** (portable_mongodb/data/)
4. **Keep prerequisites up to date**

---

**Installation Complete!** ✅

Your portable version is ready for use without Docker!
