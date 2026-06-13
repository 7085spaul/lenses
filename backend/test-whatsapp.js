const twilio = require('twilio');
require('dotenv').config();

async function testWhatsApp() {
  console.log('Testing WhatsApp configuration...');
  console.log('Account SID:', process.env.TWILIO_ACCOUNT_SID?.substring(0, 10) + '...');
  console.log('WhatsApp Number:', process.env.TWILIO_WHATSAPP_NUMBER);
  
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  
  // Test with your own phone number (replace with actual number)
  // For sandbox testing, you need to join the sandbox first
  const testPhone = '+1234567890'; // Replace with your actual phone number
  
  try {
    const message = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${testPhone}`,
      body: 'Test message from EyewearOMS! Your WhatsApp configuration is working.'
    });
    
    console.log('✅ WhatsApp message sent successfully!');
    console.log('Message SID:', message.sid);
  } catch (error) {
    console.error('❌ WhatsApp failed:', error.message);
    console.error('Full error:', error);
    
    if (error.message.includes('unsubscribed')) {
      console.log('\n⚠️  Note: For Twilio WhatsApp sandbox:');
      console.log('1. Send a WhatsApp message to the sandbox number from your phone');
      console.log('2. Follow the instructions to join the sandbox');
      console.log('3. Then try sending messages again');
    }
  }
}

testWhatsApp();
