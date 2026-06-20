# Lumin Fitness WhatsApp Chatbot - Deployment Guide

Your WhatsApp bot is ready to deploy! Here's how to get it live in ~15 minutes.

## Option 1: Deploy to Railway (Recommended - Easiest)

### Step 1: Create Railway Account
1. Go to **railway.app**
2. Sign up with GitHub (fastest)
3. Create new project

### Step 2: Connect Your Code
1. Create a GitHub repo with your bot files:
   - `lumin_whatsapp_bot.js`
   - `package.json`
   - `.env` (with your Twilio credentials)
2. In Railway: Connect your GitHub repo
3. Railway will auto-detect Node.js and deploy

### Step 3: Add Environment Variables to Railway
In Railway dashboard → Variables:
```
TWILIO_ACCOUNT_SID=ACae8d376877c94fa49908ba216040l7fa
TWILIO_AUTH_TOKEN=6b7lf43ea04265661ab17f6fd3a2754b
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155555555
PORT=3000
```

### Step 4: Get Your Deployment URL
- Railway will give you a public URL (e.g., `https://lumin-bot-prod.railway.app`)
- Copy this URL

---

## Step 5: Connect Twilio Webhook to Your Bot

### In Twilio Console:
1. Go to **Messaging → Try it out → Send a WhatsApp message**
2. Scroll down to "Incoming messages"
3. Set **Webhook URL** to: `https://your-railway-url.railway.app/whatsapp`
4. Make sure it's set to **POST**
5. Save

### Test It:
1. Send a WhatsApp message to your Twilio sandbox number
2. Your bot should reply!

---

## Option 2: Deploy to Render (Also Easy)

1. Go to **render.com**
2. Create new Web Service
3. Connect GitHub repo
4. Set Start Command: `npm start`
5. Add environment variables (same as above)
6. Deploy
7. Use the Render URL for your Twilio webhook

---

## Option 3: Deploy to Replit (Fastest for Testing)

1. Go to **replit.com**
2. Create new Node.js project
3. Upload files (or paste code)
4. Install dependencies: `npm install`
5. Run project
6. Replit gives you a public URL
7. Use that for Twilio webhook

---

## What the Bot Currently Does

✅ **Greeting** - Welcomes users with menu options
✅ **Classes Info** - Lists boxing & strength classes, schedules, pricing
✅ **Personal Training** - Describes 1-on-1 coaching options
✅ **Hours & Location** - Provides gym info
✅ **Booking Link** - Directs to luminfit.ca/classes
✅ **Lead Capture** - Collects name & email from inquiries
✅ **Fallback** - Handles unknown messages gracefully

---

## Next Steps to Customize

### 1. Update Bot Responses
Edit the `responses` object in `lumin_whatsapp_bot.js` with:
- Real class schedules
- Your actual phone number
- Real personal training rates
- Trainer names & bios

### 2. Connect Google Sheets for Lead Storage
Replace the `logLeadToSheets()` function with actual Google Sheets API:
```javascript
// Add Google Sheets integration to auto-log all inquiries
const { google } = require('googleapis');
// ... set up service account
```

### 3. Add Trainer Notifications
When someone requests a trainer, send notification to your trainers:
```javascript
// Send SMS/WhatsApp alert to trainer group
await client.messages.create({
  from: TWILIO_WHATSAPP_NUMBER,
  to: 'whatsapp:+1TRAINER_NUMBER',
  body: `New inquiry from ${name}: ${message}`
});
```

### 4. Add MindBody Integration
Pull real class schedules and availability from MindBody API:
```javascript
// Fetch real data instead of hardcoded schedules
const mindBodyClasses = await getMindBodyClasses();
```

### 5. Add More Conversational Flow
Current bot is rule-based. Can upgrade to AI-powered:
```javascript
// Use Claude API or OpenAI for smarter responses
const aiResponse = await callClaudeAPI(userMessage);
```

---

## Troubleshooting

**Bot not responding?**
- Check Railway/Render logs for errors
- Verify webhook URL in Twilio is correct (POST method)
- Make sure .env variables are set

**Messages not being logged?**
- Google Sheets integration not yet connected (set up after launch)
- Check browser console for errors

**Twilio charges appearing?**
- You're on Pay-As-You-Go tier now (good sign - means it's working!)
- Monitor message volume to keep costs low

---

## Current Costs

- **Twilio**: ~$0.01-0.05 per message (depends on country)
- **Railway/Render**: ~$7/month (free tier available)
- **Total**: ~$20-50/month for typical gym volume

---

## Need Help?

- Twilio docs: https://www.twilio.com/docs/whatsapp
- Railway docs: https://docs.railway.app
- Update the bot responses and test before going live to real members!
