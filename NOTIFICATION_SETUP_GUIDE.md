# 🚀 Complete Setup Guide - Email & Push Notifications

## ✅ What's Already Configured

- ✅ **EmailJS Integration** - Ready to use once you add credentials
- ✅ **Expo Push Notifications** - Works automatically, no setup needed
- ✅ **Email-to-SMS Gateway** - Free alternative to Twilio (carrier-dependent)

---

## 📧 EmailJS Setup (5 Minutes - 100% FREE)

### Step 1: Create EmailJS Account
1. Go to **https://www.emailjs.com/**
2. Click **"Sign Up"** - completely free, no credit card
3. Verify your email

### Step 2: Connect Email Service
1. In dashboard → **"Email Services"** → **"Add New Service"**
2. Choose **Gmail** (recommended) or your preferred email provider
3. Click **"Connect Account"** and authorize
4. **Copy the Service ID** (looks like: `service_abc1234`)

### Step 3: Create Email Template
1. Go to **"Email Templates"** → **"Create New Template"**
2. Name it: `Medicine Alert Template`
3. Use this template:

```
Subject: 🏥 Medicine Alert - {{medicine_name}}

To: {{to_email}}

Hello,

This is an automated alert from MedicineTracker.

⚠️ ALERT TYPE: {{alert_type}}
💊 Medicine: {{medicine_name}} {{medicine_dosage}}
⏰ Scheduled Time: {{scheduled_time}}
📝 Message: {{message}}

Sent at: {{timestamp}}'

---
MedicineTracker App
```

4. Click **"Save"**
5. **Copy the Template ID** (looks like: `template_xyz5678`)

### Step 4: Get Public Key
1. Go to **"Account"** → **"General"**
2. Scroll to **"API Keys"**
3. **Copy your Public Key** (looks like: `YOUR_PUBLIC_KEY_HERE`)

### Step 5: Configure Your App

**Option A - Using PowerShell Script (Easiest):**
```powershell
cd C:\Users\HP\Downloads\Medicine-Tracker\MedicineTracker-Mobile
.\setup-emailjs.ps1
```
Then paste your credentials when prompted.

**Option B - Manual Configuration:**
1. Open: `src/config/services.config.ts`
2. Replace these lines:
```typescript
serviceId: 'service_xxxxxxx',    // Your Service ID
templateId: 'template_xxxxxxx',  // Your Template ID
publicKey: 'YOUR_PUBLIC_KEY',    // Your Public Key
```

### Step 6: Test Email Sending
1. Start app: `npm start`
2. Go to **Caregivers** tab
3. Add a caregiver with:
   - Name: Test Caregiver
   - Contact: **your-email@gmail.com**
   - Method: **Email**
4. Click **"Test"** button
5. Check your inbox (might be in spam first time)

---

## 🔔 Push Notifications (Already Working!)

### Testing Push Notifications
1. Start app: `npm start`
2. Grant notification permissions when prompted
3. Go to **Profile** → **Settings** → Enable notifications
4. Add a medicine with a time in the next 5 minutes
5. You'll receive a push notification!

### How It Works
- Automatically scheduled when you add medicines
- Lead time: 5 minutes before scheduled dose (configurable in settings)
- Works on physical devices only (not simulators)
- Completely free, unlimited notifications

---

## 📱 SMS Options

### Option 1: Email-to-SMS Gateway (FREE)
Perfect for US carriers, no cost:

1. When adding a caregiver, use format: `phonenumber@carrier.com`
2. Examples:
   - **Verizon**: `1234567890@vtext.com`
   - **AT&T**: `1234567890@txt.att.net`
   - **T-Mobile**: `1234567890@tmomail.net`
   - **Sprint**: `1234567890@messaging.sprinttpcs.com`

**Limitations:**
- Only works in USA
- Requires knowing carrier
- SMS might be delayed
- Character limit: 160 characters

### Option 2: Twilio (PAID - Not Recommended for Personal Use)
- Costs $0.0075 per SMS
- Requires credit card
- Needs backend server for security
- Better for commercial apps

**If you still want Twilio:**
1. Sign up at https://www.twilio.com/try-twilio
2. Get $15 trial credit
3. Buy a phone number (~$1/month)
4. Set up a backend API server (Node.js/Express)
5. Update `TwilioConfig` in `services.config.ts`

---

## 🎯 Recommended Setup for Personal Use

### FREE Setup (What I Recommend):
✅ **EmailJS** - For caregiver email alerts (200/month free)
✅ **Expo Push** - For your own app notifications (unlimited)
✅ **Email-to-SMS** - Optional, if caregiver has compatible carrier

### Steps:
1. Configure EmailJS (5 minutes)
2. Add caregivers with email addresses
3. Create notification rules:
   - Missed Dose → Alert after 30 min
   - Low Adherence → Alert when < 80%
   - Critical Missed → Immediate alert
4. Test everything!

---

## 🧪 Testing Your Setup

### Test 1: Email Alerts
```
1. Add caregiver with YOUR email
2. Method: Email
3. Click "Test" button
4. Check inbox (may be in spam)
```

### Test 2: Push Notifications
```
1. Add medicine with time in 2 minutes
2. Wait for notification
3. Should appear even if app closed
```

### Test 3: Missed Dose Detection
```
1. Add medicine with time in the past
2. Don't mark it as taken
3. Wait 5 minutes
4. Caregiver should receive email
```

---

## 🔧 Troubleshooting

### Email Not Sending?
- ✅ Check EmailJS dashboard for errors
- ✅ Verify Service ID, Template ID, Public Key are correct
- ✅ Check spam/junk folder
- ✅ Ensure Gmail allows "Less secure apps" if using Gmail
- ✅ Look at app console logs for error messages

### Push Notifications Not Working?
- ✅ Must use physical device (not simulator)
- ✅ Grant notification permissions
- ✅ Enable notifications in Profile → Settings
- ✅ Check Expo Go app is latest version
- ✅ iOS: Check "Allow Notifications" in device settings

### SMS Not Delivering?
- ✅ Verify phone@carrier.com format is correct
- ✅ Check carrier supports email-to-SMS
- ✅ Some carriers block these messages
- ✅ Consider using email method instead

---

## 📊 Service Comparison

| Service | Cost | Limit | Setup Time | Reliability |
|---------|------|-------|------------|-------------|
| **EmailJS** | FREE | 200/month | 5 min | ⭐⭐⭐⭐⭐ |
| **Expo Push** | FREE | Unlimited | 0 min | ⭐⭐⭐⭐⭐ |
| **Email-to-SMS** | FREE | Unlimited | 2 min | ⭐⭐⭐ |
| **Twilio SMS** | $0.0075/msg | Pay-as-go | 30 min | ⭐⭐⭐⭐⭐ |

---

## 🎓 Best Practices

1. **Use Email for Caregivers** - Most reliable and free
2. **Enable Push for Yourself** - Instant notifications
3. **Test Before Relying** - Send test notifications first
4. **Check Spam Folders** - First emails might go there
5. **Backup Contact Methods** - Add phone number in caregiver notes

---

## 📞 Support & Resources

- **EmailJS Docs**: https://www.emailjs.com/docs/
- **Expo Push Docs**: https://docs.expo.dev/push-notifications/
- **Email-to-SMS List**: See `EMAIL_SMS_SETUP.md`
- **App Issues**: Check console logs in Expo

---

## ✅ Quick Start Checklist

- [ ] Create EmailJS account
- [ ] Get Service ID, Template ID, Public Key
- [ ] Run `setup-emailjs.ps1` OR edit `services.config.ts`
- [ ] Add caregiver with your email
- [ ] Click "Test" button to verify
- [ ] Add medicines with notification times
- [ ] Test push notifications on device
- [ ] (Optional) Set up email-to-SMS for caregivers

---

## 🎉 You're All Set!

Once EmailJS is configured, your app will automatically:
- ✅ Send email alerts when doses are missed
- ✅ Send push notifications before scheduled doses
- ✅ Check for missed doses every 5 minutes
- ✅ Alert caregivers based on configured rules

**No additional code changes needed!**
