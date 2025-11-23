// Email and SMS Service Configuration
// Copy this file and create 'config.ts' with your actual credentials

export const EmailConfig = {
  // EmailJS Configuration (FREE - Get from https://www.emailjs.com/)
  serviceId: process.env.EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID',
  templateId: process.env.EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID',
  publicKey: process.env.EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY',
};

export const TwilioConfig = {
  // Twilio Configuration (PAID - Trial available at https://www.twilio.com/)
  // Note: For React Native, you need a backend server to use Twilio securely
  accountSid: process.env.TWILIO_ACCOUNT_SID || 'YOUR_ACCOUNT_SID',
  authToken: process.env.TWILIO_AUTH_TOKEN || 'YOUR_AUTH_TOKEN',
  phoneNumber: process.env.TWILIO_PHONE_NUMBER || 'YOUR_PHONE_NUMBER',
  // Backend API endpoint if you set up a server
  backendApiUrl: process.env.TWILIO_BACKEND_API || 'https://your-backend.com/api/sms',
};

export const ExpoConfig = {
  // Expo Push Notifications (FREE - Already configured)
  projectId: process.env.EXPO_PROJECT_ID || 'your-expo-project-id',
};

// Email-to-SMS Gateway (FREE alternative to Twilio)
// Format: phonenumber@gateway
export const EmailToSMSGateways = {
  'AT&T': 'txt.att.net',
  'Verizon': 'vtext.com',
  'T-Mobile': 'tmomail.net',
  'Sprint': 'messaging.sprinttpcs.com',
  'Boost Mobile': 'sms.myboostmobile.com',
  'Cricket': 'sms.cricketwireless.net',
  'Metro PCS': 'mymetropcs.com',
  'US Cellular': 'email.uscc.net',
  'Virgin Mobile': 'vmobl.com',
};

/**
 * Get email-to-SMS address for a phone number
 * Example: getEmailToSMS('1234567890', 'Verizon') => '1234567890@vtext.com'
 */
export function getEmailToSMS(phoneNumber: string, carrier: keyof typeof EmailToSMSGateways): string {
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  return `${cleanNumber}@${EmailToSMSGateways[carrier]}`;
}
