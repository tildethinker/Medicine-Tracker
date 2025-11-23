# 🔥 Firebase Setup - Complete Guide

## 📋 What You'll Build

After this setup, your app will have:
- ✅ **User Authentication** - Sign up, login, password reset
- ✅ **Cloud Database** - Medicine data synced across devices
- ✅ **Cloud Functions** - Send professional emails from server
- ✅ **Offline Support** - Works without internet, syncs when online

**Time required:** 40-50 minutes
**Cost:** FREE (Firebase free tier is generous)

---

## 🚀 STEP 1: Install Firebase Packages (5 minutes)

### A. Stop Your Current App

In the terminal where Expo is running:
- Press `Ctrl + C` to stop the server

### B. Install Firebase React Native Packages

Run these commands one by one:

```powershell
cd C:\Users\HP\Downloads\Medicine-Tracker\MedicineTracker-Mobile

npm install @react-native-firebase/app

npm install @react-native-firebase/auth

npm install @react-native-firebase/firestore

npm install @react-native-firebase/functions
```

**Wait for each to complete** (takes 2-3 minutes total)

### C. Verify Installation

Check your `package.json`:
```powershell
cat package.json
```

You should see these new entries:
```json
"@react-native-firebase/app": "^xx.x.x",
"@react-native-firebase/auth": "^xx.x.x",
"@react-native-firebase/firestore": "^xx.x.x",
"@react-native-firebase/functions": "^xx.x.x"
```

✅ **Checkpoint:** Packages installed successfully

---

## 🔥 STEP 2: Create Firebase Project (10 minutes)

### A. Go to Firebase Console

Open your browser and go to:
👉 **https://console.firebase.google.com/**

### B. Create New Project

1. Click **"Add project"** or **"Create a project"**

2. **Project name:** `MedicineTracker`
   - Or any name you prefer
   - This is just for your reference

3. Click **"Continue"**

4. **Google Analytics:**
   - Choose **"Enable Google Analytics for this project"** (recommended)
   - Or choose **"Not right now"** if you prefer

5. Click **"Continue"**

6. **Analytics account:**
   - Select **"Default Account for Firebase"**
   - Or create new account

7. Click **"Create project"**

8. **Wait** 30-60 seconds for project creation

9. Click **"Continue"** when done

✅ **Checkpoint:** Firebase project created

---

## 📱 STEP 3: Register Android App (10 minutes)

### A. Add Android App

1. In Firebase Console, click the **⚙️ gear icon** (Settings) → **"Project settings"**

2. Scroll down to **"Your apps"** section

3. Click the **Android icon** (robot symbol)

### B. Fill in App Details

**Android package name:** 
```
com.medicinetracker.mobile
```
⚠️ **IMPORTANT:** Must match exactly! This is your app's unique identifier.

**App nickname (optional):**
```
MedicineTracker Mobile
```

**Debug signing certificate SHA-1 (optional):**
- Leave blank for now
- We'll add this later if needed for Google Sign-In

### C. Click "Register app"

### D. Download Configuration File

1. Click **"Download google-services.json"**

2. Save the file - **remember where you saved it!**
   - Suggestion: Save to Desktop or Downloads folder
   - File name: `google-services.json`

3. **Click "Next"**

4. **Skip** the gradle configuration (we'll handle this differently)
   - Just keep clicking **"Next"** → **"Next"** → **"Continue to console"**

✅ **Checkpoint:** Android app registered, config file downloaded

---

## 🍎 STEP 4: Register iOS App (Optional - 8 minutes)

**Skip this step if you only need Android.**

### A. Add iOS App

1. In Firebase Console, click **⚙️ → Project settings**

2. In "Your apps" section, click the **iOS icon** (Apple symbol)

### B. Fill in App Details

**iOS bundle ID:**
```
com.medicinetracker.mobile
```

**App nickname:**
```
MedicineTracker iOS
```

**App Store ID:** Leave blank

### C. Register and Download

1. Click **"Register app"**

2. Click **"Download GoogleService-Info.plist"**

3. Save the file

4. Click **"Next"** → **"Next"** → **"Continue to console"**

✅ **Checkpoint:** iOS app registered (if applicable)

---

## 🔐 STEP 5: Enable Authentication (5 minutes)

### A. Open Authentication

1. In Firebase Console left sidebar, click **"Build"** (if collapsed)

2. Click **"Authentication"**

3. Click **"Get started"** button

### B. Enable Email/Password Sign-In

1. Click the **"Sign-in method"** tab at the top

2. You'll see a list of providers. Click **"Email/Password"**

3. In the popup:
   - **Enable** the first toggle: "Email/Password"
   - Leave "Email link" toggle OFF
   - Click **"Save"**

4. You should now see "Email/Password" with status **"Enabled"**

✅ **Checkpoint:** Email/Password authentication enabled

---

## 💾 STEP 6: Enable Firestore Database (5 minutes)

### A. Create Database

1. In Firebase Console left sidebar, click **"Firestore Database"**

2. Click **"Create database"** button

### B. Configure Security Rules

1. **Select mode:** Choose **"Start in test mode"**
   - This allows read/write for 30 days
   - ⚠️ Warning appears - that's OK, click "Next"
   - We'll add proper security rules later

2. Click **"Next"**

### C. Choose Location

1. **Cloud Firestore location:**
   - Choose closest to your location:
     - `us-central` - USA Central
     - `us-east1` - USA East
     - `europe-west1` - Belgium
     - `asia-southeast1` - Singapore

2. Click **"Enable"**

3. **Wait** 1-2 minutes for database to be created

4. You'll see an empty database with Collections list

✅ **Checkpoint:** Firestore database created

---

## ⚡ STEP 7: Enable Cloud Functions (5 minutes)

### A. Upgrade to Blaze Plan

⚠️ **Important Note:**
- Cloud Functions require the "Blaze" (pay-as-you-go) plan
- Still FREE for small usage (2M function invocations/month)
- **Requires credit card** for verification
- You won't be charged unless you exceed free limits

**If you don't want to add a credit card now**, that's OK! Skip this step and use email-to-SMS gateway instead.

### B. Upgrade Plan (if you want Cloud Functions)

1. In Firebase Console, click **"Upgrade"** button (bottom left, or top banner)

2. Select **"Blaze Plan"** (Pay as you go)

3. Click **"Continue"**

4. **Add billing information:**
   - Enter credit card details
   - Set up budget alerts (recommended): $5-10/month

5. Click **"Purchase"**

### C. Enable Functions

1. In left sidebar, click **"Functions"**

2. Click **"Get started"**

3. Click **"Continue"** (may need to confirm region)

✅ **Checkpoint:** Cloud Functions enabled (or skipped)

---

## 📂 STEP 8: Add Config Files to Project (5 minutes)

Now we need to place those downloaded files into your project.

### A. Create Android Directory Structure

**In PowerShell:**
```powershell
cd C:\Users\HP\Downloads\Medicine-Tracker\MedicineTracker-Mobile

# Create android directory structure
mkdir -p android/app
```

### B. Copy google-services.json

**Option 1 - PowerShell Command:**
```powershell
# Replace C:\Users\HP\Downloads with actual path where you saved the file
Copy-Item "C:\Users\HP\Downloads\google-services.json" -Destination "android\app\google-services.json"
```

**Option 2 - Manual Copy:**
1. Open File Explorer
2. Find `google-services.json` in your Downloads
3. Copy it
4. Navigate to: `C:\Users\HP\Downloads\Medicine-Tracker\MedicineTracker-Mobile\android\app\`
5. Paste it there

### C. Copy GoogleService-Info.plist (iOS only)

If you registered iOS app:

```powershell
# Create ios directory
mkdir ios

# Copy plist file (update source path)
Copy-Item "C:\Users\HP\Downloads\GoogleService-Info.plist" -Destination "ios\GoogleService-Info.plist"
```

### D. Verify Files Are in Place

```powershell
# Check files exist
Test-Path android\app\google-services.json
Test-Path ios\GoogleService-Info.plist
```

Should return `True` for each file present.

✅ **Checkpoint:** Config files in correct locations

---

## ⚙️ STEP 9: Configure app.json (Ready - I'll do this next)

I need to update your `app.json` with Firebase configuration.

### What Gets Added:
- Firebase plugin configuration
- Google Services integration
- Bundle identifiers

**I'll handle this in the next step automatically.**

---

## 🔧 STEP 10: Update Firebase Service Implementation (Ready - I'll do this next)

Currently `src/services/firebase.ts` has placeholder code. I'll implement:
- ✅ Real Firebase initialization
- ✅ User authentication (signup, login, logout)
- ✅ Firestore database operations
- ✅ Cloud Functions integration
- ✅ Error handling

**I'll handle this automatically.**

---

## 📧 STEP 11: Firebase Cloud Functions for Email (Optional)

If you enabled Cloud Functions and want professional emails:

### A. Install Firebase CLI

```powershell
npm install -g firebase-tools
```

### B. Login to Firebase

```powershell
firebase login
```

Browser opens - sign in with your Google account.

### C. Initialize Functions

```powershell
cd C:\Users\HP\Downloads\Medicine-Tracker\MedicineTracker-Mobile

firebase init functions
```

**Answer prompts:**
- Use existing project? → **Yes**
- Select: **MedicineTracker** (your project)
- Language? → **JavaScript**
- ESLint? → **No** (or Yes, your choice)
- Install dependencies? → **Yes**

### D. Create Email Function

I'll create the function code for you automatically.

### E. Deploy Functions

```powershell
cd functions
firebase deploy --only functions
```

Wait 1-2 minutes for deployment.

✅ **Checkpoint:** Cloud Functions deployed

---

## ✅ Completion Checklist

Before saying "Firebase is ready", verify:

- [ ] Firebase packages installed in package.json
- [ ] Firebase project created in console
- [ ] Android app registered (with package name)
- [ ] `google-services.json` downloaded and placed in `android/app/`
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore database created (test mode)
- [ ] Cloud Functions enabled (optional - requires Blaze plan)
- [ ] Config files in correct directories

---

## 🎯 What Happens Next

After I update the code (next steps):

1. **Firebase will initialize** when app starts
2. **Users can sign up/login** with email/password
3. **Medicine data saves to cloud** automatically
4. **Syncs across devices** when user logs in
5. **Emails send from Cloud Functions** (if enabled)

---

## 🚀 Ready to Continue?

**Tell me when you've completed:**
1. Installed Firebase packages
2. Created Firebase project
3. Downloaded config files
4. Placed files in android/app/ directory

Then I'll:
1. Update app.json with Firebase config
2. Implement real Firebase service code
3. Create Cloud Functions for email
4. Test everything works!

**Or tell me which step you're on if you need help!** 🙂
