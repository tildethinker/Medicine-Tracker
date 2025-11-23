# Firebase Email Template Configuration

## ✅ Fill in these values:

### **Sender name:**
```
MedicineTracker
```

### **From:**
```
MedicineTracker
```
(The domain `@medicine-tracker-e59b2.firebaseapp.com` will be auto-added)

### **Reply to:** (Optional - can leave blank)
```
noreply@medicine-tracker-e59b2.firebaseapp.com
```
OR just leave it empty

### **Subject:**
```
Verify your email for MedicineTracker
```
(Keep the default or use this)

### **Message:** (Keep the default HTML as is)
The existing template is perfect:
```html
<p>Hello %DISPLAY_NAME%,</p>
<p>Follow this link to verify your email address.</p>
<p><a href="%LINK%">%LINK%</a></p>
<p>If you didn't ask to verify this address, you can ignore this email.</p>
<p>Thanks,</p>
<p>Your MedicineTracker team</p>
```

### **Action URL:** (Keep as is)
```
https://medicine-tracker-e59b2.firebaseapp.com/__/auth/action
```

---

## 📝 Summary - Copy These Values:

| Field | Value |
|-------|-------|
| **Sender name** | `MedicineTracker` |
| **From** | `MedicineTracker` |
| **Reply to** | Leave blank or `noreply@medicine-tracker-e59b2.firebaseapp.com` |
| **Subject** | `Verify your email for MedicineTracker` |
| **Message** | Keep default (already perfect) |
| **Action URL** | Keep default (already correct) |

---

## ✅ After Filling:

1. **Click "Save"** button (usually at top or bottom)
2. You're done with Authentication setup!
3. Come back and tell me: **"Auth setup complete"**

---

## 💡 Note:

This email template is ONLY for user email verification (when someone signs up with email/password). For medicine notifications via email-to-SMS, we'll use Cloud Functions separately (that's coming in the next steps).

**Just fill in the values above and click Save!** ✅
