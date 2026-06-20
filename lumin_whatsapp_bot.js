const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

// In-memory conversation state
const conversationState = {};

// Bot responses
const responses = {
  greeting: `Hi! Welcome to Lumin Fitness 🏋️‍♂️\n\nWhat can I help you with?\n\n1️⃣ Class info & schedules\n2️⃣ Personal training\n3️⃣ Hours & location\n4️⃣ Book a class\n5️⃣ Speak to a trainer\n\nJust reply with a number or ask me anything!`,
  
  classesInfo: `*Lumin Fitness Classes* 💪\n\n🥊 *Boxing*\nHigh-intensity cardio & technique\n• Mon-Fri: 6am, 12pm, 5pm, 7pm\n• Sat-Sun: 9am, 11am\n• Drop-in $25 | Monthly $199\n\n🏋️ *Strength*\nFunctional training & weightlifting\n• Mon-Fri: 6:30am, 6:30pm\n• Sat: 10am\n• Drop-in $25 | Monthly $199\n\nReply *BOOK* to reserve a spot or visit luminfit.ca`,
  
  trainingInfo: `*Personal Training at Lumin* 🎯\n\n1-on-1 coaching tailored to your goals:\n• Strength & conditioning\n• Boxing technique & fitness\n• Nutrition guidance\n• Sport-specific training\n\n⏰ Available mornings, lunch & evenings\n\nReply *TRAINER* to connect with a coach, or visit luminfit.ca for rates!`,
  
  hoursLocation: `*Lumin Fitness* 📍\n\n1346 St. Clair Ave W, Toronto\n(West end, near Bathurst)\n\n⏰ *Hours:*\nMon-Fri: 6am - 8pm\nSat: 9am - 2pm\nSun: Closed\n\n📱 WhatsApp us anytime!`,
  
  bookLink: `Let's get you booked! 🎉\n\nVisit *luminfit.ca* to book your first class.\n\nFirst time? Use code FIRSTCLASS for a free trial!\n\nQuestions? Reply *TRAINER* to chat with a coach.`,
  
  trainerWaitMsg: `Perfect! A Lumin trainer will reach out to you shortly 💪\n\nIn the meantime, check out our team at luminfit.ca/trainers\n\nWhat are your main fitness goals? (Optional - helps us match you with the right trainer!)`,
  
  captureContact: `Thanks for your message! 😊\n\nCan you share your name and email so we can follow up?\n\nReply in this format:\n*Name | email@example.com*`,
  
  fallback: `Thanks for reaching out to Lumin Fitness! 💪\n\nHere's what I can help with:\n\n1️⃣ Class info & schedules\n2️⃣ Personal training\n3️⃣ Hours & location\n4️⃣ Book a class\n5️⃣ Speak to a trainer\n\nJust reply with a number!`
};

function sendTwiMLResponse(res, message) {
  res.set('Content-Type', 'text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Message>
</Response>`);
}

app.post('/whatsapp', async (req, res) => {
  try {
    const incomingMsg = (req.body.Body || '').toLowerCase().trim();
    const from = req.body.From || '';
    
    console.log(`Message from ${from}: ${incomingMsg}`);
    
    if (!conversationState[from]) {
      conversationState[from] = { stage: 'new', inquiry: null };
    }
    const state = conversationState[from];
    
    let responseText = '';

    // Check for contact info format: "Name | email"
    if (incomingMsg.includes('|')) {
      const parts = incomingMsg.split('|').map(s => s.trim());
      if (parts.length >= 2 && parts[1].includes('@')) {
        const name = parts[0];
        const email = parts[1];
        state.stage = 'contact_captured';
        console.log(`Lead captured: ${name} | ${email} | ${from}`);
        responseText = `Got it ${name}! ✅\n\nWe'll be in touch at ${email} within 24 hours.\n\nIn the meantime, visit luminfit.ca or reply with any questions!`;
        return sendTwiMLResponse(res, responseText);
      }
    }

    // Main menu routing
    if (['hi', 'hello', 'hey', 'start', 'help', ''].includes(incomingMsg)) {
      responseText = responses.greeting;
    } else if (['1', 'classes', 'class', 'boxing', 'strength', 'schedule'].includes(incomingMsg)) {
      responseText = responses.classesInfo;
      state.inquiry = 'classes';
    } else if (['2', 'personal training', 'training', 'pt', 'coach', 'coaching'].includes(incomingMsg)) {
      responseText = responses.trainingInfo;
      state.inquiry = 'personal_training';
    } else if (['3', 'hours', 'location', 'address', 'where', 'open'].includes(incomingMsg)) {
      responseText = responses.hoursLocation;
      state.inquiry = 'location';
    } else if (['4', 'book', 'booking', 'reserve', 'sign up', 'signup'].includes(incomingMsg)) {
      responseText = responses.bookLink;
      state.inquiry = 'booking';
    } else if (['5', 'trainer', 'speak to trainer', 'talk to trainer', 'connect'].includes(incomingMsg)) {
      responseText = responses.trainerWaitMsg;
      state.inquiry = 'trainer';
    } else if (incomingMsg.length > 5) {
      // Capture as general inquiry
      state.inquiry = 'general';
      state.message = incomingMsg;
      responseText = responses.captureContact;
    } else {
      responseText = responses.fallback;
    }

    console.log(`Responding to ${from}: ${responseText.substring(0, 50)}...`);
    sendTwiMLResponse(res, responseText);

  } catch (err) {
    console.error('Error:', err.message);
    sendTwiMLResponse(res, 'Sorry, something went wrong. Please try again!');
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Lumin Fitness WhatsApp bot is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Lumin Fitness WhatsApp bot running on port ${PORT}`);
});
