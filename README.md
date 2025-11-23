# MedicineTracker Mobile - Setup Instructions

## 📋 Prerequisites

Before running this project, you need to install:

### 1. Node.js (Required)
- **Version:** 18.x or higher
- **Download:** https://nodejs.org/
- **Check installation:** `node --version`

### 2. npm (Comes with Node.js)
- **Version:** 9.x or higher
- **Check installation:** `npm --version`

### 3. Expo Go App (For Testing on Phone)
- **Android:** Install from Google Play Store
- **iOS:** Install from Apple App Store
- **Search for:** "Expo Go"

---

## 🚀 Quick Start (3 Steps)

### Step 1: Clone/Download the Project
```bash
# If using git
git clone <repository-url>

# Or download and extract the ZIP file
```

### Step 2: Navigate to Project Directory
```bash
cd MedicineTracker-Mobile
```

### Step 3: Install Dependencies & Run
```bash
# Install all required packages
npm install

# Start the development server
npm start
```

**That's it!** The Expo server will start and show a QR code.

---

## 📦 Dependencies (Automatically Installed)

All dependencies are listed in `package.json` and will be installed automatically with `npm install`.

### Core Dependencies:
- **expo** (~54.0.25) - React Native framework
- **react** (19.1.0) - UI library
- **react-native** (0.81.5) - Mobile platform

### Navigation:
- **@react-navigation/native** (^7.1.21)
- **@react-navigation/bottom-tabs** (^7.8.6)
- **@react-navigation/stack** (^7.6.5)
- **react-native-screens** (^4.16.0)
- **react-native-safe-area-context** (^5.6.2)

### Storage & Database:
- **@react-native-async-storage/async-storage** (^2.2.0)
- **expo-sqlite** (^16.0.9)

### Notifications:
- **expo-notifications** (^0.32.13)
- **@emailjs/browser** (^4.4.1)

### Device Features:
- **expo-constants** (^18.0.10)
- **expo-device** (^8.0.9)
- **expo-image-picker** (^17.0.8)
- **expo-sharing** (^14.0.7)

### UI & Charts:
- **lucide-react-native** (^0.554.0) - Icons
- **react-native-chart-kit** (^6.12.0) - Charts
- **react-native-share** (^12.2.1)

### Forms:
- **react-hook-form** (^7.66.1)

### Dev Dependencies:
- **@types/react** (~19.1.0)
- **typescript** (~5.9.2)

---

## 🖥️ Running the App

### Option 1: On Your Phone (Recommended)

1. **Install Expo Go** from Play Store/App Store

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Scan the QR code** with:
   - **Android:** Expo Go app
   - **iOS:** Camera app (opens in Expo Go)

4. App loads on your phone! 📱

### Option 2: Android Emulator

1. **Install Android Studio** with emulator

2. **Start emulator**, then:
   ```bash
   npm run android
   ```

### Option 3: Web Browser

```bash
npm run web
```
Opens in browser (limited mobile features)

---

## 🔧 Troubleshooting

### "npm: command not found"
**Solution:** Install Node.js from https://nodejs.org/

### "Expo Go not connecting"
**Solutions:**
- Ensure phone and computer on same WiFi
- Disable VPN if active
- Try restarting Expo server (`Ctrl+C`, then `npm start`)

### "Port 8081 already in use"
**Solution:** Kill the process:
```bash
# Windows
npx kill-port 8081

# Mac/Linux
lsof -ti:8081 | xargs kill
```

### "Module not found" errors
**Solution:** Reinstall dependencies:
```bash
rm -rf node_modules
npm install
```

### App crashes on startup
**Solutions:**
1. Clear Expo cache:
   ```bash
   npm start -- --clear
   ```
2. Delete Expo Go app data (phone settings)
3. Restart Expo Go app

---

## 📱 Features Available

✅ **Medicine Management** - Add/edit/delete medicines
✅ **Daily Tracker** - Track doses (taken/skipped/missed)
✅ **History & Reports** - View adherence charts
✅ **Caregiver Notifications** - SMS via email-to-SMS gateway
✅ **Profile Management** - Patient information
✅ **Settings** - Dark mode, notifications
✅ **Offline Support** - Works without internet

---

## 🔐 No API Keys Needed!

This app runs completely locally with:
- **SQLite database** (on device)
- **Local notifications**
- **Email-to-SMS gateway** (no API key required)

**Optional (for automatic emails):**
- Firebase Cloud Functions (see `FIREBASE_SETUP_GUIDE.md`)

---

## 📁 Project Structure

```
MedicineTracker-Mobile/
├── app.json                 # Expo configuration
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── index.ts                # Entry point
├── App.tsx                 # Main app component
├── src/
│   ├── components/         # UI components
│   │   ├── Dashboard.tsx
│   │   ├── MedicineManager.tsx
│   │   ├── DailyTracker.tsx
│   │   ├── HistoryReports.tsx
│   │   ├── CaregiverNotifications.tsx
│   │   ├── ProfileManager.tsx
│   │   └── Settings.tsx
│   ├── contexts/           # State management
│   │   └── AppContext.tsx
│   ├── navigation/         # Navigation setup
│   │   └── AppNavigator.tsx
│   ├── services/           # Business logic
│   │   ├── database.ts     # SQLite operations
│   │   ├── notifications.ts # Alerts & SMS
│   │   ├── export.ts       # CSV/PDF export
│   │   └── firebase.ts     # Cloud (placeholder)
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   └── config/             # Configuration
│       └── services.config.ts
└── assets/                 # Images, fonts
```

---

## 🎓 For Your Friend

### Sharing the Project

**Option 1: Share the Folder**
1. Zip the entire `MedicineTracker-Mobile` folder
2. Send to your friend
3. They extract and run `npm install`

**Option 2: GitHub Repository**
```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin <repo-url>
git push -u origin master

# Your friend clones:
git clone <repo-url>
cd MedicineTracker-Mobile
npm install
npm start
```

### First Time Setup (For Your Friend)

```bash
# 1. Install Node.js (if not installed)
# Download from: https://nodejs.org/

# 2. Verify installation
node --version
npm --version

# 3. Navigate to project
cd path/to/MedicineTracker-Mobile

# 4. Install dependencies (one time)
npm install

# 5. Start the app
npm start

# 6. Scan QR code with Expo Go app on phone
```

---

## 📖 Additional Documentation

- **QUICK_START_SMS.md** - SMS notification setup
- **EASY_SMS_SETUP.md** - Carrier gateway guide
- **FIREBASE_SETUP_GUIDE.md** - Cloud features (optional)
- **EMAILJS_ISSUE_SOLUTIONS.md** - Email alternatives
- **START_HERE.md** - Complete feature overview

---

## 🆘 Need Help?

### Common Commands

```bash
# Start development server
npm start

# Clear cache and restart
npm start -- --clear

# Run on Android emulator
npm run android

# Run on iOS simulator (Mac only)
npm run ios

# Open in web browser
npm run web

# Check for outdated packages
npm outdated

# Update all packages
npm update
```

### Still Having Issues?

1. Make sure Node.js version is 18+ (`node --version`)
2. Try deleting `node_modules` and reinstalling:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
3. Ensure phone and computer on same network
4. Check firewall isn't blocking port 8081

---

## ✅ Success Checklist

Before sharing with your friend, verify:

- [ ] Project runs successfully (`npm start`)
- [ ] No errors in terminal
- [ ] Can open app on phone via QR code
- [ ] All 7 tabs visible (Dashboard, Medicine, Tracker, History, Caregivers, Profile, Settings)
- [ ] Can add a medicine
- [ ] Can track a dose
- [ ] All documentation files included

---

## 🎉 You're All Set!

Your friend can now:
1. Extract the project folder
2. Run `npm install`
3. Run `npm start`
4. Scan QR code with Expo Go
5. Start using MedicineTracker!

**Total setup time: 2-3 minutes** ⚡

---

## 📞 Support

For issues or questions:
- Check the documentation files in the project
- See `TROUBLESHOOTING.md` for common problems
- Review logs in terminal for error messages

**Happy tracking! 💊📱**
