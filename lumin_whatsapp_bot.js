const express = require('express');
const twilio = require('twilio');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.urlencoded({ extended: false }));

// Twilio config
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+1415555555'; // Replace with sandbox number

// Google Sheets config (optional - can use Airtable API instead)
const GOOGLE_SHEETS_API = process.env.GOOGLE_SHEETS_API;

// In-memory storage for conversation state (can be upgraded to database)
const conversationState = {};

// Bot responses
const responses = {
  greeting: `Welcome to Lumin Fitness! 🏋️‍♂️\n\nWhat can I help you with?\n1. *Classes info* - Learn about our boxing & strength classes\n2. *Personal training* - 1-on-1 coaching options\n3. *Hours & location* - When we're open\n4. *Book a class* - Get the link\n5. *Talk to a trainer* - I'll connect you\n\nReply with the number or text your question!`,
  
  classesInfo: `*Our Classes:*\n\n🥊 *Boxing* - High-intensity cardio & technique\n• Mon-Fri: 6am, 12pm, 5pm, 7pm\n• Sat-Sun: 9am, 11am\n• Drop-in: $25 | Monthly: $199\n\n💪 *Strength* - Functional training & weightlifting\n• Mon-Fri: 6:30am, 6:30pm\n• Sat: 10am\n• Drop-in: $25 | Monthly: $199\n\nWant to book a trial? Reply *BOOK* or visit luminfit.ca`,
  
  trainingInfo: `*Personal Training at Lumin:*\n\n1-on-1 coaching tailored to your goals:\n• Strength & conditioning\n• Boxing technique & fitness\n• Nutrition guidance\n• Sport-specific training\n\n📍 Available:\n• Weekday mornings (6-9am)\n• Lunch hours (12-1pm)\n• Evenings (5-8pm)\n• Weekend sessions\n\n💬 Reply *TRAINER* to chat with a coach about your goals, or visit luminfit.ca for rates.`,
  
  hoursLocation: `*Lumin Fitness*\n\n📍 1346 St. Clair Ave W, Toronto\n(West end, near Bathurst)\n\n⏰ *Hours:*\nMonday-Friday: 6am - 8pm\nSaturday: 9am - 2pm\nSunday: Closed\n\n💬 Questions? Reply anytime or call us at (416) 555-0123`,
  
  bookLink: `Ready to get started? 🎉\n\nBook your first class here: *luminfit.ca/classes*\n\nOr if you're interested in personal training, reply *TRAINER* and I'll connect you with a coach!`,
  
  trainerWaitMsg: `Got it! A trainer will message you shortly to discuss your goals and find the perfect fit. 💪\n\nIn the meantime, you can also visit luminfit.ca/trainers to see our team.`,
  
  fallback: `I didn't quite understand that. 😊\n\nYou can ask me about:\n• Classes & schedules\n• Personal training\n• Hours & location\n• How to book\n• Or just ask anything!`
};

// Middleware to store phone number in conversation state
app.use((req, res, next) => {
  if (req.body.From) {
    const phoneNumber = req.body.From.replace('whatsapp:', '');
    if (!conversationState[phoneNumber]) {
      conversationState[phoneNumber] = {
        stage: 'greeting',
        name: null,
        email: null,
        inquiry: null,
        createdAt: new Date()
      };
    }
  }
  next();
});

// Main webhook endpoint
app.post('/whatsapp', async (req, res) => {
  const incomingMessage = req.body.Body?.toLowerCase().trim();
  const phoneNumber = req.body.From.replace('whatsapp:', '');
  const userState = conversationState[phoneNumber];

  let responseText = '';

  try {
    // Parse user input
    if (!incomingMessage) {
      responseText = responses.greeting;
    } else if (['1', 'classes', 'class info', 'boxing', 'strength'].includes(incomingMessage)) {
      responseText = responses.classesInfo;
      userState.inquiry = 'classes';
    } else if (['2', 'personal training', 'personal', 'training', 'pt', 'coach'].includes(incomingMessage)) {
      responseText = responses.trainingInfo;
      userState.inquiry = 'personal_training';
    } else if (['3', 'hours', 'location', 'address', 'when', 'open'].includes(incomingMessage)) {
      responseText = responses.hoursLocation;
      userState.inquiry = 'location_hours';
    } else if (['4', 'book', 'booking', 'class booking', 'reserve'].includes(incomingMessage)) {
      responseText = responses.bookLink;
      userState.inquiry = 'booking';
    } else if (['5', 'trainer', 'talk to trainer', 'connect', 'coach'].includes(incomingMessage)) {
      responseText = responses.trainerWaitMsg;
      userState.inquiry = 'trainer_inquiry';
      // TODO: Send notification to trainers
      await logLeadToSheets(phoneNumber, userState.inquiry, incomingMessage);
    } else if (incomingMessage.length > 10) {
      // Capture as general inquiry/lead
      responseText = `Thanks for your message! 📝\n\nCan you share your name and email so we can get back to you?\n\nFormat: *Name | email@example.com*`;
      userState.inquiry = 'general_inquiry';
      userState.message = incomingMessage;
    } else {
      responseText = responses.fallback;
    }

    // Check if user is providing contact info (name | email)
    if (incomingMessage?.includes('|') && userState.stage !== 'contact_captured') {
      const [name, email] = incomingMessage.split('|').map(s => s.trim());
      if (name && email && email.includes('@')) {
        userState.name = name;
        userState.email = email;
        userState.stage = 'contact_captured';
        
        // Log to sheets
        await logLeadToSheets(phoneNumber, userState.inquiry, userState.message, name, email);
        
        responseText = `Perfect, ${name}! ✅\n\nWe've got your info. A team member will reach out within 24 hours to answer your questions.\n\nIn the meantime, check out luminfit.ca or reply anytime! 💪`;
      }
    }

    // Send response
    await client.messages.create({
      from: TWILIO_WHATSAPP_NUMBER,
      to: req.body.From,
      body: responseText
    });

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error handling message:', error);
    res.status(500).send('Error processing message');
  }
});

// Function to log leads to Google Sheets (placeholder - integrate with your sheet)
async function logLeadToSheets(phone, inquiryType, message, name = null, email = null) {
  try {
    // TODO: Replace with your Google Sheets API call or Airtable integration
    console.log(`Logging lead: ${phone} | ${inquiryType} | ${name || 'anonymous'} | ${email || 'no email'}`);
    
    // Example Google Sheets integration (requires service account):
    // const { google } = require('googleapis');
    // const sheets = google.sheets('v4');
    // ... append row to sheet
  } catch (error) {
    console.error('Error logging to sheets:', error);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Lumin Fitness WhatsApp bot is running' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Lumin Fitness WhatsApp bot running on port ${PORT}`);
});
