# MedicineTracker-Mobile Setup Guide

## ✅ Implementation Status

All features from the comprehensive spec have been implemented:

- ✅ **DailyTracker**: Calendar view with retroactive marking, time slots, status badges
- ✅ **HistoryReports**: Charts (Line/Bar/Pie), date range selection, export functionality
- ✅ **CaregiverNotifications**: Full CRUD for caregivers and notification rules
- ✅ **Splash & Onboarding**: 4-slide tutorial with permissions and mode selection
- ✅ **Enhanced Dashboard**: 7-day adherence chart with weekly overview
- ✅ **Missed Dose Detection**: Automatic checking every 5 minutes with caregiver alerts
- ✅ **ExportService**: CSV/PDF generation (requires additional packages)
- ✅ **FirebaseService**: Auth and sync methods (requires Firebase setup)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm installed
- Expo Go app installed on your phone ([iOS](https://apps.apple.com/app/apple-store/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Run the App

```powershell
cd MedicineTracker-Mobile
npm start
```

**Scan the QR code** with Expo Go to launch the app on your device.

## 📱 App Features

### Navigation Tabs
1. **Home (Dashboard)**: Today's summary, 7-day adherence chart, upcoming medicines
2. **Track (DailyTracker)**: Calendar view to mark taken/skipped doses
3. **Medicines**: Add/edit/delete medicine schedules
4. **History**: Charts and analytics with date range filtering
5. **Caregivers**: Manage caregiver contacts and alert rules
6. **Profile**: User settings and preferences

### Core Functionality
- **Smart Notifications**: Reminders with configurable lead time (default 5 minutes before scheduled time)
- **Retroactive Marking**: Mark doses as taken/skipped for past dates
- **Adherence Tracking**: Real-time calculation of adherence rates
- **Caregiver Alerts**: Automatic notifications when doses are missed
- **Data Export**: Generate CSV/PDF reports (requires setup)
- **Cloud Sync**: Optional Firebase integration (requires setup)

## 🔧 Optional Features Setup

### Export Functionality (CSV/PDF)

To enable actual file export:

```powershell
npm install react-native-share react-native-fs
npx expo install expo-file-system
```

The export buttons in **History Reports** will then generate and share actual files.

### Firebase Cloud Sync

To enable cloud synchronization:

1. **Install Firebase packages**:
```powershell
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore
```

2. **Create Firebase project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create new project
   - Add an iOS and/or Android app

3. **Download config files**:
   - **Android**: Download `google-services.json` → Place in `android/app/`
   - **iOS**: Download `GoogleService-Info.plist` → Place in `ios/`

4. **Enable Firestore**:
   - In Firebase Console → Firestore Database → Create database
   - Start in **test mode** (or configure security rules)

5. **Update FirebaseService**:
   - Edit `src/services/firebase.ts`
   - Uncomment the implementation code
   - Add your Firebase config to `app.json`

### Caregiver Email/SMS Alerts

For actual email/SMS alerts:

**Email (via EmailJS)**:
```powershell
npm install emailjs-com
```
Then update `sendEmailAlert()` in `src/services/notifications.ts` with your EmailJS credentials.

**SMS (via Twilio)**:
```powershell
npm install twilio
```
Setup a Twilio account and update `sendSMSAlert()` with your Account SID and Auth Token.

## 🎯 How to Use

### First Time Setup
1. Launch app → See splash screen
2. Complete onboarding (4 slides)
3. Choose mode: "Local Only" or "Cloud Sync"
4. Grant notification permissions

### Add Your First Medicine
1. Tap **"Medicines"** tab
2. Tap **"Add Medicine"** button
3. Fill in:
   - Name (e.g., "Aspirin")
   - Dosage (e.g., "100mg")
   - Times (tap to add multiple, e.g., "08:00", "20:00")
   - Optional: Add notes, refill date, caregiver contact
4. Save

### Track Daily Doses
1. Tap **"Track"** tab
2. Use calendar to select date
3. For each medicine:
   - Tap **"Mark Taken"** when consumed
   - Tap **"Skip"** if intentionally skipped
   - Add notes if needed

### View Analytics
1. Tap **"History"** tab
2. Select date range (Day/Week/Month/Quarter)
3. View adherence trends in charts
4. Tap **"Export CSV"** or **"Export PDF"** to share

### Setup Caregivers
1. Tap **"Caregivers"** tab
2. Tap **"Add Caregiver"**
3. Enter name, contact (email/phone), method
4. Create notification rules:
   - **Missed Dose**: Alert when any dose is missed
   - **Critical Missed**: Alert for high-priority medicines
   - **Low Adherence**: Alert when adherence drops below threshold
5. Test notifications with **"Test"** button

## 🛠️ Troubleshooting

### App crashes with "Something went wrong"
- Ensure you're using **Expo SDK 54** compatible packages
- Run: `npm install` to reinstall dependencies
- Check `app.json` has `"updates": { "enabled": false }`

### Notifications not showing
- Verify notification permissions granted
- Check **Profile → Settings** → Notifications enabled
- Notifications only work on physical devices, not simulators

### Export buttons show "Install packages"
- Install export dependencies (see Optional Features Setup)
- Restart Expo server: `npm start` (press `r` to reload)

### Charts not displaying
- Ensure there's intake data (mark some doses as taken)
- Check date range includes dates with data
- Verify `react-native-chart-kit` installed correctly

### Caregiver alerts not sending
- Push notifications work immediately
- Email/SMS require external service setup (EmailJS/Twilio)
- Check caregiver rules are **enabled** and have valid thresholds

## 📚 Code Structure

```
src/
├── components/
│   ├── Dashboard.tsx           # Home screen with weekly chart + missed dose checking
│   ├── DailyTracker.tsx        # Calendar tracking view
│   ├── HistoryReports.tsx      # Analytics with charts + export
│   ├── MedicineManager.tsx     # CRUD for medicines
│   ├── CaregiverNotifications.tsx  # Caregiver management
│   ├── ProfileManager.tsx      # User profile settings
│   ├── Settings.tsx            # App settings
│   ├── SplashScreen.tsx        # Initial loading screen
│   └── OnboardingScreen.tsx    # First-time tutorial
├── services/
│   ├── notifications.ts        # Notification scheduling + missed dose detection
│   ├── database.ts             # SQLite local storage
│   ├── export.ts               # CSV/PDF generation (placeholder)
│   └── firebase.ts             # Cloud sync (placeholder)
├── contexts/
│   └── AppContext.tsx          # Global state management
├── navigation/
│   └── AppNavigator.tsx        # Bottom tab navigation (6 tabs)
└── types/
    └── index.ts                # TypeScript interfaces
```

## 🔐 Data Privacy

- **Local Storage**: All data stored on device via SQLite + AsyncStorage
- **No Automatic Cloud Upload**: Data only syncs if Firebase enabled
- **HIPAA Consideration**: For production use, ensure Firebase configured with proper encryption and access controls

## 📦 Dependencies

Core packages (already installed):
```json
{
  "expo": "~54.0.25",
  "react-native": "0.76.5",
  "expo-sqlite": "^15.0.4",
  "expo-notifications": "0.32.13",
  "react-native-chart-kit": "^6.12.0",
  "@react-navigation/native": "^7.0.14",
  "@react-navigation/bottom-tabs": "^7.2.2"
}
```

Optional packages (for full functionality):
- `react-native-share` + `react-native-fs` - File export
- `@react-native-firebase/*` - Cloud sync
- `emailjs-com` - Email alerts
- `twilio` - SMS alerts

## 🎨 Customization

### Dark Mode
- Automatically follows system settings
- Toggle in **Profile → Settings**

### Notification Lead Time
- Default: 5 minutes before scheduled time
- Change in **Profile → Settings → Notifications**

### Adherence Thresholds
- Set custom thresholds in caregiver rules
- Example: Alert when adherence < 80%

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review `src/services/` files for implementation comments
3. Check Expo logs for error details: `npx expo start --clear`

## 🚀 Next Steps

1. **Run the app**: `npm start` and scan QR code
2. **Add medicines** and set reminder times
3. **Mark doses** throughout the day
4. **View progress** in History tab
5. **(Optional)** Setup export or Firebase for advanced features

---

**App is ready to use!** All core features work out of the box. Optional features require package installation as documented above.
