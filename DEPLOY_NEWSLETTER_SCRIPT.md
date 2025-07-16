# 📧 Deploy Newsletter Script - Step by Step

## ✅ **Script Ready**: `newsletter_script_updated.gs`

This script has:
- ✅ Newsletter confirmation emails
- ✅ Welcome emails with discount codes  
- ✅ Updated email addresses (kmetija.marosa.novice@gmail.com)
- ✅ Professional sender names
- ✅ Proper error handling

---

## 📋 **DEPLOYMENT STEPS**

### **Step 1: Access Google Apps Script**
1. Go to: https://script.google.com
2. **Make sure you're logged in as**: `kmetija.marosa.novice@gmail.com`

### **Step 2: Create New Project**
1. Click: "New Project" (+ button)
2. Name: "Kmetija Marosa - Newsletter Emails"

### **Step 3: Copy the Script**
1. Delete the default code
2. Copy ALL content from `newsletter_script_updated.gs`
3. Paste into the script editor
4. Save (Ctrl+S)

### **Step 4: Deploy as Web App**
1. Click: "Deploy" button (top right)
2. Select: "New deployment"
3. Choose: "Web app" (gear icon)
4. Settings:
   - **Description**: "Newsletter and Welcome Email Service"
   - **Execute as**: "Me (kmetija.marosa.novice@gmail.com)"
   - **Who has access**: "Anyone"
5. Click: "Deploy"

### **Step 5: Authorize**
1. Click: "Authorize access"
2. Choose: `kmetija.marosa.novice@gmail.com`
3. Click: "Advanced" → "Go to ... (unsafe)"
4. Click: "Allow"

### **Step 6: Copy Web App URL**
1. **COPY THIS URL** (looks like):
   ```
   https://script.google.com/macros/s/ABC123DEF456.../exec
   ```
2. **SEND ME THIS URL** so I can update the website code

---

## 🔧 **What This Script Does**

✅ **Newsletter Confirmations**: Sent FROM `kmetija.marosa.novice@gmail.com`  
✅ **Welcome Emails**: With discount codes, sent FROM `kmetija.marosa.novice@gmail.com`  
✅ **Professional Names**: "Kmetija Maroša - E-novice"  
✅ **Proper Routing**: Only handles newsletter/welcome emails (not orders)  
✅ **Error Handling**: Comprehensive logging and error management  

---

## 📧 **Email Types Handled**

1. **Newsletter Confirmation** (`isConfirmation: true`)
   - Sent when user subscribes to newsletter
   - Contains confirmation link
   - Professional HTML formatting with logo

2. **Welcome Email** (`isWelcome: true`)
   - Sent after user confirms newsletter subscription
   - Contains 10% discount code
   - Professional HTML formatting with logo

---

## 🎯 **After Deployment**

Once you have the Web App URL:

1. **Tell me the URL**
2. **I'll update the website code** for newsletter services
3. **I'll deploy the changes**
4. **We'll test newsletter subscriptions and welcome emails**

---

## ✅ **Complete Email System**

After this deployment, you'll have:

📦 **Order Emails** → `kmetija.marosa.narocila@gmail.com`  
📧 **Newsletter Emails** → `kmetija.marosa.novice@gmail.com`  
🔧 **Backup/Dev** → `marc999933@gmail.com`  

**Professional, organized, and efficient!** 🚀

---

## ❓ **Need Help?**

If you get stuck at any step, just let me know which step and I'll help you through it!

**The newsletter script is ready to deploy - just follow these steps and send me the Web App URL when you're done.**
