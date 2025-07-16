# 📧 Gmail Accounts Setup Guide for Kmetija Maroša

## 🎯 **NEW EMAIL ORGANIZATION**

### **Current Setup (marc999933@gmail.com):**
- ❌ Handles ALL emails (orders, newsletters, registrations)
- ❌ Not professional looking
- ❌ Hard to organize different types of emails

### **NEW SETUP (Professional Organization):**

1. **kmetija.marosa.narocila@gmail.com** 
   - 📦 **ORDER CONFIRMATIONS** (customer emails)
   - 📦 **ORDER NOTIFICATIONS** (admin notifications)
   - 🎯 **Purpose**: All order-related communication

2. **kmetija.marosa.novice@gmail.com**
   - 📧 **NEWSLETTER CONFIRMATIONS** 
   - 📧 **WELCOME EMAILS** (with discount codes)
   - 🎯 **Purpose**: All newsletter and marketing emails

3. **marc999933@gmail.com** (keep as backup)
   - 🔧 **DEVELOPMENT/TESTING** only

---

## 🛠️ **STEP-BY-STEP SETUP**

### **Step 1: Create Gmail Accounts**
✅ **kmetija.marosa.narocila@gmail.com** - DONE
✅ **kmetija.marosa.novice@gmail.com** - DONE

### **Step 2: Enable 2-Factor Authentication**
For BOTH new accounts:
1. Go to Google Account Settings
2. Security → 2-Step Verification
3. Enable 2FA with phone number

### **Step 3: Generate App Passwords**
For BOTH new accounts:
1. Google Account → Security → App passwords
2. Generate password for "Mail"
3. **SAVE THESE PASSWORDS** - you'll need them for Google Apps Script

### **Step 4: Deploy Google Apps Scripts**

#### **For kmetija.marosa.narocila@gmail.com (ORDERS):**
Deploy: **`email_service_combined.gs`** (MAIN SCRIPT)
- Handles order confirmations to customers
- Handles order notifications to admin
- Has logo and professional HTML formatting

#### **For kmetija.marosa.novice@gmail.com (NEWSLETTERS):**
Deploy: **`email_service_updated.gs`** (NEWSLETTER SCRIPT)  
- Handles newsletter confirmations
- Handles welcome emails with discount codes
- Lighter script focused on newsletter functionality

---

## 📋 **DEPLOYMENT INSTRUCTIONS**

### **A) Deploy Order Email Script (kmetija.marosa.narocila@gmail.com)**

1. **Login to Google Apps Script**: https://script.google.com
2. **Switch to kmetija.marosa.narocila@gmail.com account**
3. **Create New Project**: "Kmetija Marosa - Order Emails"
4. **Copy content from**: `email_service_combined.gs`
5. **Save and Deploy as Web App**:
   - Execute as: Me
   - Who has access: Anyone
6. **Copy the Web App URL**
7. **Update in your website code**: Replace the current Google Apps Script URL

### **B) Deploy Newsletter Script (kmetija.marosa.novice@gmail.com)**

1. **Switch to kmetija.marosa.novice@gmail.com account**
2. **Create New Project**: "Kmetija Marosa - Newsletter Emails"  
3. **Copy content from**: `email_service_updated.gs`
4. **Save and Deploy as Web App**
5. **Copy the Web App URL**
6. **Update newsletter service**: Replace newsletter Google Apps Script URL

---

## 🔧 **WEBSITE CODE UPDATES NEEDED**

### **Update Email Service URLs:**

1. **Order Emails** (`src/utils/emailService.ts`):
   ```typescript
   const GOOGLE_APPS_SCRIPT_URL = 'NEW_NAROCILA_SCRIPT_URL_HERE';
   ```

2. **Newsletter Emails** (`src/utils/newsletterService.ts`):
   ```typescript
   const GOOGLE_APPS_SCRIPT_URL = 'NEW_NOVICE_SCRIPT_URL_HERE';
   ```

3. **Registration Emails** (`src/utils/registrationEmailService.ts`):
   ```typescript
   const GOOGLE_APPS_SCRIPT_URL = 'NEW_NOVICE_SCRIPT_URL_HERE';
   ```

---

## ✅ **BENEFITS OF NEW SETUP**

🎯 **Professional Organization**:
- Order emails clearly separated from marketing
- Easy to track different types of communications
- Professional email addresses

📊 **Better Management**:
- Separate inboxes for different purposes
- Easier to monitor order vs newsletter performance
- Clear responsibility separation

🔒 **Security & Reliability**:
- Dedicated accounts for specific functions
- Backup system in place
- Better access control

---

## 🚀 **TESTING CHECKLIST**

After setup, test:
- [ ] Guest checkout order confirmation (customer email)
- [ ] Order notification to admin
- [ ] Newsletter subscription confirmation
- [ ] Welcome email with discount code
- [ ] Registration confirmation email
- [ ] Logo displays correctly in all emails
- [ ] All emails use correct "FROM" addresses

---

## 📞 **NEXT STEPS**

1. **Set up the Gmail accounts** (enable 2FA, generate app passwords)
2. **Deploy the Google Apps Scripts** to respective accounts
3. **Update website code** with new script URLs
4. **Test all email functionality**
5. **Monitor for any issues**

**Need help with any step? Let me know!**
