# Installation Requirements

## System Requirements

- **Operating System:** Windows 10/11, macOS 10.15+, or Linux
- **RAM:** Minimum 4GB (8GB recommended)
- **Storage:** 2GB free space
- **Network:** Internet connection for initial setup

---

## Required Software

### 1. Node.js & npm
**Version:** Node.js 18.x or higher

**Installation:**

**Windows:**
1. Download installer from: https://nodejs.org/
2. Download the "LTS" version (recommended)
3. Run installer, follow prompts
4. Restart command prompt

**Mac:**
```bash
# Using Homebrew
brew install node

# Or download from: https://nodejs.org/
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Verify Installation:**
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
```

---

## Project Dependencies

All project dependencies are automatically installed with `npm install`. No manual installation needed!

### Core Package List:

```json
{
  "dependencies": {
    "@emailjs/browser": "^4.4.1",
    "@react-native-async-storage/async-storage": "^2.2.0",
    "@react-navigation/bottom-tabs": "^7.8.6",
    "@react-navigation/native": "^7.1.21",
    "@react-navigation/stack": "^7.6.5",
    "expo": "~54.0.25",
    "expo-constants": "^18.0.10",
    "expo-device": "^8.0.9",
    "expo-image-picker": "^17.0.8",
    "expo-notifications": "^0.32.13",
    "expo-sharing": "^14.0.7",
    "expo-sqlite": "^16.0.9",
    "expo-status-bar": "~3.0.8",
    "lucide-react-native": "^0.554.0",
    "react": "19.1.0",
    "react-hook-form": "^7.66.1",
    "react-native": "0.81.5",
    "react-native-chart-kit": "^6.12.0",
    "react-native-safe-area-context": "^5.6.2",
    "react-native-screens": "^4.16.0",
    "react-native-share": "^12.2.1"
  },
  "devDependencies": {
    "@types/react": "~19.1.0",
    "typescript": "~5.9.2"
  }
}
```

---

## Installation Steps

### Step 1: Install Node.js
Download and install from https://nodejs.org/ (LTS version)

### Step 2: Verify Installation
```bash
node --version
npm --version
```

### Step 3: Navigate to Project
```bash
cd path/to/MedicineTracker-Mobile
```

### Step 4: Install All Dependencies
```bash
npm install
```

This single command installs ALL 23 packages automatically! ✅

**Installation time:** 2-3 minutes (depends on internet speed)

---

## Mobile Testing Options

### Option 1: Expo Go (Easiest - No Additional Setup)

**For Android:**
- Install "Expo Go" from Google Play Store
- Free, no account needed

**For iOS:**
- Install "Expo Go" from Apple App Store
- Free, no account needed

### Option 2: Android Emulator (Optional)

**Requirements:**
- Android Studio (3GB download)
- 8GB RAM recommended
- Virtual device setup

**Installation:**
1. Download Android Studio: https://developer.android.com/studio
2. Install Android Studio
3. Open Android Studio → Tools → AVD Manager
4. Create virtual device

### Option 3: iOS Simulator (Mac Only)

**Requirements:**
- macOS computer
- Xcode (free from App Store)
- 10GB+ free space

**Installation:**
1. Install Xcode from Mac App Store
2. Open Xcode once to complete setup
3. Simulator available via Expo

---

## Optional Dependencies (Not Required)

### For Firebase Cloud Functions (Optional):
```bash
npm install -g firebase-tools
```

### For Git Version Control (Optional):
Download from: https://git-scm.com/

---

## Verification Checklist

After running `npm install`, verify everything is ready:

```bash
# Check Node.js
node --version
# Expected: v18.x.x or higher ✅

# Check npm
npm --version
# Expected: 9.x.x or higher ✅

# Check installed packages
npm list --depth=0
# Expected: List of 23 packages ✅

# Start the app
npm start
# Expected: Expo server starts, QR code appears ✅
```

---

## Troubleshooting Installation

### "npm install" fails

**Solution 1 - Clear cache:**
```bash
npm cache clean --force
npm install
```

**Solution 2 - Delete lock file:**
```bash
rm package-lock.json
npm install
```

**Solution 3 - Use different registry:**
```bash
npm config set registry https://registry.npmjs.org/
npm install
```

### "EACCES" permission errors (Mac/Linux)

**Solution:**
```bash
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### Slow installation

**Solution - Use faster mirror:**
```bash
npm config set registry https://registry.npm.taobao.org
npm install
```

Then reset:
```bash
npm config set registry https://registry.npmjs.org/
```

---

## Network Requirements

### Firewall Ports:
- Port **8081** - Expo development server
- Port **19000-19006** - Expo services

### Internet Required For:
- Initial `npm install` (downloads packages)
- First app load (downloads Expo SDK)

### Offline After Setup:
- ✅ App works completely offline once installed
- ✅ All data stored locally (SQLite)
- ✅ No internet required for normal use

---

## Storage Requirements

### During Installation:
- **node_modules:** ~400MB
- **Expo cache:** ~100MB
- **Total:** ~500MB

### After Installation:
- **App size:** ~50MB on phone (via Expo Go)
- **User data:** Varies (typically <10MB)

---

## Platform-Specific Notes

### Windows:
- ✅ Works perfectly
- ✅ PowerShell or CMD
- ✅ No additional tools needed

### macOS:
- ✅ Works perfectly
- ✅ Can test on iOS simulator
- ⚠️ May need Xcode Command Line Tools:
  ```bash
  xcode-select --install
  ```

### Linux:
- ✅ Works perfectly
- ⚠️ May need additional libraries:
  ```bash
  sudo apt-get install watchman
  ```

---

## Quick Reference Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Clear cache and start
npm start -- --clear

# Check for updates
npm outdated

# Update all packages
npm update

# Reinstall everything
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ You're Ready When...

- [ ] Node.js v18+ installed
- [ ] npm working correctly
- [ ] `npm install` completed successfully
- [ ] No error messages in terminal
- [ ] `npm start` launches Expo server
- [ ] QR code appears in terminal
- [ ] Expo Go app installed on phone

**Total setup time: 5-10 minutes** ⚡

---

## 🎉 That's It!

No Python, no Ruby, no Java, no complex build tools!

**Just Node.js + npm + npm install = Ready to go!** 🚀
