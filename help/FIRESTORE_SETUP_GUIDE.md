# Firestore Database Setup Guide

## Current Status
✅ Firebase Project Created: medicine-tracker-e59b2
✅ Authentication Enabled: Email/Password with test user added
🔄 **NEXT STEP**: Create Firestore Database

---

## Authentication - You're Done! ✓

Since you've already:
- ✅ Enabled Email/Password authentication
- ✅ Added a test user
- ✅ Configured email template (optional)

**You don't need to do anything else in the Authentication section!** That page is complete.

---

## Step-by-Step: Create Firestore Database

### Step 1: Navigate to Firestore
1. In your Firebase Console (https://console.firebase.google.com)
2. Click on your project: **medicine-tracker-e59b2**
3. In the left sidebar, find and click **"Firestore Database"** (it might also say "Cloud Firestore")
4. Click the **"Create database"** button

### Step 2: Choose Security Rules
You'll see two options:

**Option 1: Production mode** (Locked down - SECURE but harder to test)
```
Rules: Requires authentication for read/write
Best for: Live apps with real users
```

**Option 2: Test mode** (Open access - EASY to test but less secure)
```
Rules: Anyone can read/write for 30 days
Best for: Development and testing
```

**RECOMMENDED FOR NOW: Choose "Test mode"**
- This lets you test your app immediately without authentication issues
- You can tighten security rules later before launch
- Firebase will remind you to update rules after 30 days

### Step 3: Choose Location
Select the Firestore location (you cannot change this later!):

**Recommended Locations by Region:**
- **India**: `asia-south1` (Mumbai) - BEST for you!
- **US**: `us-central1` (Iowa)
- **Europe**: `europe-west1` (Belgium)

**Important**: Choose the location closest to where your users will be for best performance.

### Step 4: Click "Enable"
- Firebase will create your database (takes 30-60 seconds)
- You'll see a message "Creating Cloud Firestore database..."
- Wait for it to complete

### Step 5: Verify Database Created
You should now see:
- Empty database with message "No documents yet"
- A "Start collection" button
- Rules and Indexes tabs at the top

---

## What Collections Will Your App Use?

Your MedicineTracker app will automatically create these collections:

### 1. **medicines** (Main medicine data)
```
medicines/
  └── {medicineId}/
      ├── name: "Aspirin"
      ├── dosage: "100mg"
      ├── frequency: "Twice daily"
      ├── times: ["09:00", "21:00"]
      ├── startDate: "2025-11-20"
      ├── endDate: "2025-12-20"
      ├── userId: "user123"
      └── createdAt: timestamp
```

### 2. **profiles** (User profile data)
```
profiles/
  └── {userId}/
      ├── name: "John Doe"
      ├── age: 65
      ├── gender: "male"
      ├── conditions: ["diabetes", "hypertension"]
      ├── allergies: ["penicillin"]
      └── updatedAt: timestamp
```

### 3. **medicineHistory** (Tracking records)
```
medicineHistory/
  └── {historyId}/
      ├── medicineId: "med123"
      ├── medicineName: "Aspirin"
      ├── status: "taken" | "missed" | "skipped"
      ├── scheduledTime: "09:00"
      ├── actualTime: "09:15"
      ├── date: "2025-11-23"
      ├── userId: "user123"
      └── timestamp: timestamp
```

### 4. **caregivers** (Caregiver notifications)
```
caregivers/
  └── {caregiverId}/
      ├── name: "Jane Doe"
      ├── relationship: "Daughter"
      ├── email: "jane@example.com"
      ├── phone: "9686178343"
      ├── smsGateway: "9686178343@vtext.com"
      ├── notifyOnMissed: true
      ├── userId: "user123"
      └── createdAt: timestamp
```

**Note**: You don't need to manually create these collections. The app will create them automatically when you first save data!

---

## What's Next After Firestore?

Once you click "Enable" and see your empty database:

### Next Immediate Steps:
1. ✅ **Firestore Database Created** (you'll complete this now)
2. 📱 **Register Android App** (add your app to Firebase)
3. 📥 **Download google-services.json** (configuration file)
4. 💻 **Configure App Code** (connect your app to Firebase)
5. ⚡ **Test Firebase Features** (auth, sync, notifications)

---

## After You Complete This Step

**Come back and tell me**: "Firestore database created"

Then I'll guide you through:
- Registering your Android app in Firebase
- Downloading the google-services.json file
- Placing it in the correct folder
- Updating your app code to use Firebase

---

## Troubleshooting

### "Can't find Firestore Database option"
- Make sure you're looking in the left sidebar under "Build" section
- It might be called "Cloud Firestore" or "Firestore Database"
- Try scrolling down in the sidebar

### "Location dropdown is empty"
- Refresh the Firebase Console page
- Make sure you're on a stable internet connection
- Try a different browser (Chrome recommended)

### "Error creating database"
- Wait a few minutes and try again
- Check your Firebase project billing (should be free Spark plan)
- Try logging out and back into Firebase Console

---

## Quick Reference

**Current Project**: medicine-tracker-e59b2
**Authentication**: ✅ Email/Password enabled
**Database**: 🔄 Creating now (Test mode, asia-south1)
**Android App**: ⏳ Coming next
**Package Name**: com.medicinetracker.mobile

---

Ready to create your database? Follow Steps 1-5 above! 🚀
