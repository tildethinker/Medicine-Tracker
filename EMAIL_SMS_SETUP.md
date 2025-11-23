# Email & SMS Service Setup Guide

## 📧 EmailJS Setup (100% FREE - 200 emails/month)

### Step 1: Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click **"Sign Up"** (free account)
3. Verify your email address

### Step 2: Add Email Service
1. In EmailJS dashboard, go to **"Email Services"**
2. Click **"Add New Service"**
3. Choose your email provider:
   - **Gmail** (recommended for personal use)
   - **Outlook/Hotmail**
   - **Yahoo Mail**
   - Or any SMTP service
4. Click **"Connect Account"** and follow OAuth flow
5. Copy the **Service ID** (e.g., `service_abc123`)

### Step 3: Create Email Template
1. Go to **"Email Templates"**
2. Click **"Create New Template"**
3. Set up template with these variables:
   ```
   Subject: Medicine Alert - {{patient_name}}
   
   To: {{to_email}}
   
   Body:
   Hello {{caregiver_name}},
   
   This is an alert regarding {{patient_name}}'s medication.
   
   {{alert_message}}
   
   Medicine: {{medicine_name}}
   Scheduled Time: {{scheduled_time}}
   Alert Type: {{alert_type}}
   
   Please check on them at your earliest convenience.
   
   Sent from MedicineTracker App
   ```
4. Click **"Save"**
5. Copy the **Template ID** (e.g., `template_xyz789`)

### Step 4: Get Public Key
1. Go to **"Account"** → **"General"**
2. Copy your **Public Key** (e.g., `YOUR_PUBLIC_KEY`)

### Step 5: Configure App
Open PowerShell and run:
```powershell
cd C:\Users\HP\Downloads\Medicine-Tracker\MedicineTracker-Mobile

# Create .env file
@"
EMAILJS_SERVICE_ID=service_abc123
EMAILJS_TEMPLATE_ID=template_xyz789
EMAILJS_PUBLIC_KEY=YOUR_PUBLIC_KEY
"@ | Out-File -FilePath .env -Encoding utf8
```

### Step 6: Install Package
```powershell
npm install @emailjs/browser
```

---

## 📱 SMS Options (Twilio is NOT Free)

### ⚠️ Important: Twilio Pricing
- **NOT a free service**
- Offers **$15 trial credit** for new accounts
- SMS costs: **$0.0075 - $0.0079 per message** (US)
- Requires credit card for trial
- After trial, you must add funds

### Alternative FREE SMS Options:
1. **Use Email-to-SMS** (Free but carrier-dependent):
   - AT&T: `number@txt.att.net`
   - Verizon: `number@vtext.com`
   - T-Mobile: `number@tmomail.net`
   - Sprint: `number@messaging.sprinttpcs.com`

2. **Use WhatsApp Business API** (Free but complex setup)

3. **Use Telegram Bot API** (Completely free)

---

## 🔔 Twilio Setup (If you want to proceed with trial)

### Step 1: Create Twilio Account
1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up (requires phone verification)
3. Verify your email and phone number
4. You'll get **$15 trial credit**

### Step 2: Get Twilio Phone Number
1. In Twilio Console, go to **"Phone Numbers"** → **"Manage"** → **"Buy a number"**
2. Search for a number with **SMS capabilities**
3. Purchase the number (uses trial credit, ~$1/month)

### Step 3: Get Credentials
1. Go to Twilio Console Dashboard
2. Copy:
   - **Account SID** (e.g., `ACxxxxxxxxxxxxx`)
   - **Auth Token** (click to reveal)
   - **Phone Number** (e.g., `+1234567890`)

### Step 4: Add to .env
```powershell
# Add to existing .env file
@"
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
"@ | Add-Content -Path .env
```

### Step 5: Install Package
```powershell
npm install twilio
```

**Note:** Twilio requires a backend server for secure API calls. For React Native, you'll need to:
- Create a backend API (Node.js/Express) to send SMS
- Or use Firebase Cloud Functions (also requires payment)

---

## 🔔 Expo Push Notifications (100% FREE)

### Step 1: Get Expo Project ID
Already configured! Your app automatically gets push notification support through Expo.

### Step 2: Test Push Notifications
```powershell
npm start
```
Then use the Expo Go app - notifications work automatically!

### Step 3: Send Test Push from Dashboard
1. Get push token from your device (printed in console)
2. Go to [https://expo.dev/notifications](https://expo.dev/notifications)
3. Enter the token and send test notification

---

## 🎯 Recommended FREE Setup

For a completely free solution, I recommend:

### ✅ Use EmailJS for Caregiver Alerts
- 200 free emails/month
- No credit card required
- Easy integration
- Reliable delivery

### ✅ Use Expo Push Notifications
- Unlimited free push notifications
- Already integrated in your app
- Works on both iOS and Android

### ❌ Skip SMS (Twilio)
- Unless you want to use trial credits
- Or implement email-to-SMS gateway
- Or use free alternatives like Telegram

---

## 🚀 Quick Implementation

After setting up EmailJS, the app will automatically:
1. Send email alerts to caregivers when doses are missed
2. Send push notifications to the app user
3. Display alerts in the app

No code changes needed - just configure the `.env` file!

---

## 📊 Service Comparison

| Service | Cost | Messages/Month | Setup Difficulty |
|---------|------|----------------|------------------|
| **EmailJS** | FREE | 200 emails | Easy ⭐⭐⭐ |
| **Expo Push** | FREE | Unlimited | Very Easy ⭐⭐⭐⭐⭐ |
| **Twilio SMS** | $0.0075/SMS | Pay as you go | Medium ⭐⭐ |
| **Email-to-SMS** | FREE | Unlimited | Easy ⭐⭐⭐ |
| **Telegram Bot** | FREE | Unlimited | Medium ⭐⭐ |

---

## 🔧 Troubleshooting

### EmailJS not sending?
- Check spam folder
- Verify Service ID and Template ID
- Ensure Gmail allows "Less secure app access" (if using Gmail)

### Push notifications not working?
- Must use physical device (not simulator)
- Grant notification permissions
- Check Expo Go app is up to date

### Twilio errors?
- Trial accounts can only send to verified numbers
- Requires backend API for security
- Check account has sufficient balance

---

## 📞 Support

For issues with:
- **EmailJS**: [EmailJS Documentation](https://www.emailjs.com/docs/)
- **Twilio**: [Twilio Support](https://support.twilio.com/)
- **Expo Push**: [Expo Notifications Docs](https://docs.expo.dev/push-notifications/overview/)
