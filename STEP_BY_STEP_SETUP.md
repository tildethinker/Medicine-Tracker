# 📱 MedicineTracker - Complete Setup Guide

## ✅ PHASE 1: Email-to-SMS Gateway (5 minutes - Works NOW!)

### What You'll Get:
- FREE SMS notifications to caregivers
- No API setup required
- Works immediately

### Step 1: Find Your Caregiver's Carrier

Ask your caregiver: **"What mobile carrier do you use?"**

Common carriers and their gateways:
```
Verizon      → 5551234567@vtext.com
AT&T         → 5551234567@txt.att.net
T-Mobile     → 5551234567@tmomail.net
Sprint       → 5551234567@messaging.sprinttpcs.com
Boost Mobile → 5551234567@sms.myboostmobile.com
Cricket      → 5551234567@sms.cricketwireless.net
Metro PCS    → 5551234567@mymetropcs.com
```

### Step 2: Add Caregiver in App

1. **Run your app:**
   ```powershell
   npm start
   ```

2. **In the app:**
   - Tap **"Caregivers"** tab at bottom
   - Tap **"+ Add Caregiver"** button
   - Fill in:
     - **Name:** Mom
     - **Method:** SMS
     - **Contact:** `5551234567@vtext.com` (replace with actual phone + gateway)
   - Tap **"Add Caregiver"**

3. **Test it:**
   - Tap the caregiver you just added
   - Tap **"Test Notification"** button
   - **Check their phone** - should receive SMS in 30-60 seconds!

### ✅ That's it! Email-to-SMS is working!

**Tip:** Add multiple caregivers with different carriers to test.

---

## 🔥 PHASE 2: Firebase Setup (30 minutes)

Firebase gives you:
- ✅ Cloud database sync across devices
- ✅ User authentication (login/signup)
- ✅ Professional email sending via Cloud Functions
- ✅ FREE tier (generous limits)

### Step 1: Install Firebase Packages

**In terminal, run:**
```powershell
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-firebase/functions
```

Wait for installation to complete...

### Step 2: Create Firebase Project

1. **Go to:** https://console.firebase.google.com/

2. **Click:** "Add project" (or "Create a project")

3. **Enter project name:** `MedicineTracker` (or any name you like)

4. **Click:** Continue

5. **Google Analytics:** Choose "Enable" (recommended) or "Not right now"

6. **Click:** Create project

7. **Wait** for project creation (takes 30-60 seconds)

8. **Click:** Continue

### Step 3: Add Android App to Firebase

1. **In Firebase Console**, click ⚙️ (Settings) → Project settings

2. **Click** the **Android icon** (robot) under "Your apps"

3. **Fill in:**
   - **Android package name:** `com.medicinetracker.mobile` (IMPORTANT: must match!)
   - **App nickname:** MedicineTracker Mobile
   - **Debug signing certificate SHA-1:** Leave blank for now

4. **Click:** Register app

5. **Download `google-services.json`**
   - Save it to your computer
   - Remember where you saved it!

6. **Click:** Next → Next → Continue to console

### Step 4: Add iOS App to Firebase (if building for iOS)

1. **In Firebase Console**, click ⚙️ → Project settings

2. **Click** the **iOS icon** (Apple) under "Your apps"

3. **Fill in:**
   - **iOS bundle ID:** `com.medicinetracker.mobile`
   - **App nickname:** MedicineTracker iOS

4. **Click:** Register app

5. **Download `GoogleService-Info.plist`**
   - Save it to your computer

6. **Click:** Next → Next → Continue to console

### Step 5: Enable Firebase Services

#### A. Enable Authentication:

1. **In Firebase Console**, click **"Authentication"** in left menu

2. **Click:** "Get started"

3. **Click:** "Sign-in method" tab

4. **Click** "Email/Password"

5. **Enable** the first toggle (Email/Password)

6. **Click:** Save

#### B. Enable Firestore Database:

1. **Click** "Firestore Database" in left menu

2. **Click:** "Create database"

3. **Choose:** "Start in test mode" (we'll secure it later)

4. **Click:** Next

5. **Choose location:** `us-central` (or closest to you)

6. **Click:** Enable

7. **Wait** for database creation...

#### C. Enable Cloud Functions:

1. **Click** "Functions" in left menu

2. **Click:** "Get started"

3. **Note:** You'll need to upgrade to "Blaze" (pay-as-you-go) plan
   - Still FREE for small usage (125K function calls/month)
   - Requires credit card for verification
   - **You won't be charged unless you exceed free limits**

4. **If you want to skip this for now**, that's OK! You can still use email-to-SMS gateway.

### Step 6: Place Firebase Config Files

**Now we need to put those downloaded files in your project:**

#### For Android:

1. **Create directories** if they don't exist:
   ```powershell
   mkdir android\app -Force
   ```

2. **Copy** `google-services.json` you downloaded:
   - **From:** Your Downloads folder
   - **To:** `C:\Users\HP\Downloads\Medicine-Tracker\MedicineTracker-Mobile\android\app\google-services.json`

#### For iOS (if applicable):

1. **Create directory:**
   ```powershell
   mkdir ios -Force
   ```

2. **Copy** `GoogleService-Info.plist`:
   - **From:** Your Downloads folder
   - **To:** `C:\Users\HP\Downloads\Medicine-Tracker\MedicineTracker-Mobile\ios\GoogleService-Info.plist`

### Step 7: Update app.json

I'll update your `app.json` with Firebase configuration in the next step.

---

## 📧 PHASE 3: Firebase Cloud Functions for Email (20 minutes)

This sets up a serverless function to send professional emails.

### Step 1: Install Firebase CLI

**In terminal:**
```powershell
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```powershell
firebase login
```

This opens a browser - sign in with your Google account.

### Step 3: Initialize Firebase Functions

**In your project directory:**
```powershell
cd C:\Users\HP\Downloads\Medicine-Tracker\MedicineTracker-Mobile
firebase init functions
```

**Answer the prompts:**
- Use existing project? → **Yes**
- Select project → Choose **MedicineTracker**
- Language? → **JavaScript**
- Use ESLint? → **No** (or Yes, up to you)
- Install dependencies? → **Yes**

### Step 4: Create Email Sending Function

I'll create the function code for you in the next step.

### Step 5: Deploy Functions

```powershell
cd functions
firebase deploy --only functions
```

Wait for deployment... (takes 1-2 minutes)

---

## 🎯 What Happens Next

After completing these steps, you'll have:

✅ **Email-to-SMS** - Working NOW (no backend needed)
✅ **Firebase Auth** - Users can sign up/login
✅ **Cloud Database** - Medicine data syncs across devices
✅ **Cloud Functions** - Professional emails via your own backend

---

## 💡 Quick Decision Guide

**Just want SMS notifications?**
→ Only do PHASE 1 (5 minutes)

**Want cloud sync + auth?**
→ Do PHASE 1 + PHASE 2 (35 minutes)

**Want professional emails too?**
→ Do all 3 phases (55 minutes total)

---

## 🚀 Ready to Start?

Tell me which phase you want to begin with, or say "start all" to do everything!

**I'm here to help every step of the way.** 🙂
