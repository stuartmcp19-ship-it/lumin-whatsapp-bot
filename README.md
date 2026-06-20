# Lumin Fitness WhatsApp Chatbot 🏋️‍♂️

A fully functional WhatsApp bot for your gym that handles **lead capture, class inquiries, personal training info, and trainer routing**.

## What It Does

When someone messages your Lumin Fitness WhatsApp number, they get:

1. **Smart Menu** - Options to learn about classes, training, hours, or book
2. **Class Info** - Boxing & strength schedules with pricing
3. **Personal Training Details** - 1-on-1 coaching info
4. **Hours & Location** - Auto-responds with gym details
5. **Lead Capture** - Collects name & email for follow-up
6. **Trainer Routing** - Directs inquiries to your team

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
Create `.env` file with your Twilio credentials:
```
TWILIO_ACCOUNT_SID=ACae8d376877c94fa49908ba216040l7fa
TWILIO_AUTH_TOKEN=6b7lf43ea04265661ab17f6fd3a2754b
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155555555
PORT=3000
```

### 3. Test Locally
```bash
npm start
```

### 4. Deploy to Railway/Render
See **DEPLOYMENT.md** for step-by-step instructions.

### 5. Connect Twilio Webhook
Point your Twilio sandbox to: `https://your-deployed-url/whatsapp`

---

## Current Features

- ✅ Natural language message parsing
- ✅ Multi-option menu system
- ✅ Class & pricing information
- ✅ Personal training info
- ✅ Gym hours & location
- ✅ Lead capture (name + email)
- ✅ Trainer inquiry routing
- ✅ Fallback responses for unknown messages
- ✅ Conversation state tracking

---

## Customization

### Update Bot Responses
Edit the `responses` object in `lumin_whatsapp_bot.js`:
```javascript
const responses = {
  greeting: 'Your custom greeting...',
  classesInfo: 'Your class details...',
  trainingInfo: 'Your training info...',
  // ... etc
};
```

### Add Google Sheets Integration
Currently logs to console. To auto-log leads to Google Sheets:
1. Create Google Service Account
2. Share a Google Sheet with the service account email
3. Update `logLeadToSheets()` function with sheet API

### Send Trainer Notifications
When someone requests a trainer, send alert to your team:
```javascript
// Add to trainer inquiry handler
await client.messages.create({
  from: TWILIO_WHATSAPP_NUMBER,
  to: 'whatsapp:+1YOUR_TRAINER_NUMBER',
  body: `New lead: ${name} interested in ${inquiry_type}`
});
```

### Connect MindBody API
Replace hardcoded schedules with live data:
```javascript
// Fetch real classes from MindBody
const mbClasses = await mindBodyAPI.getClasses();
```

### Add AI-Powered Responses
Upgrade from rule-based to AI-powered (Claude/GPT):
```javascript
// Use Claude API for smarter, more natural conversations
const response = await callClaudeAPI(userMessage);
```

---

## File Structure

```
.
├── lumin_whatsapp_bot.js    # Main bot logic
├── package.json             # Dependencies
├── .env.example            # Environment template
├── DEPLOYMENT.md           # Deploy instructions
└── README.md              # This file
```

---

## Testing Locally

### Option 1: With Twilio Sandbox
1. Open Twilio Console → WhatsApp → Sandbox
2. Scan QR code with phone
3. Send message to activate sandbox
4. Your bot will respond

### Option 2: With ngrok (for webhook testing)
```bash
npm install -g ngrok
ngrok http 3000
# Use ngrok URL for Twilio webhook
```

---

## Deployment Options

1. **Railway** (Recommended) - Easiest, ~$7/month
2. **Render** - Also easy, free tier available
3. **Replit** - Fastest for testing
4. **Heroku** - Classic but now requires paid tier

See DEPLOYMENT.md for detailed steps.

---

## Monitoring & Logs

- **Railway**: Dashboard shows all logs + analytics
- **Render**: Logs tab shows all messages
- **Local**: Check console for errors and message logs

---

## Cost Breakdown

- **Twilio WhatsApp**: ~$0.01-0.05 per message
- **Hosting**: $0-7/month depending on platform
- **Google Sheets (optional)**: Free
- **Total**: ~$20-50/month for typical gym volume (100-200 messages/day)

---

## Next Steps

1. ✅ Deploy the bot
2. ✅ Test with your team
3. ✅ Customize responses with real info
4. ✅ Set up Google Sheets for lead tracking
5. ✅ Add trainer notifications
6. ✅ Connect MindBody API (optional)
7. ✅ Go live to members!

---

## Questions?

- Check DEPLOYMENT.md for setup issues
- Twilio docs: https://www.twilio.com/docs/whatsapp
- Railway docs: https://docs.railway.app

---

Made for Lumin Fitness 💪
