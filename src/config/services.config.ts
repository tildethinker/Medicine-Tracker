// IMPORTANT: Replace these values with your actual credentials
// Get EmailJS credentials from https://www.emailjs.com/

export const EmailConfig = {
  serviceId: 'service_isu0tke',  // Replace with your EmailJS Service ID
  templateId: 'template_a5znxn8', // Replace with your EmailJS Template ID
  publicKey: '86AVkX3H9xZzWMYTn',   // Replace with your EmailJS Public Key
};

export const TwilioConfig = {
  accountSid: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  authToken: 'your_auth_token_here',
  phoneNumber: '+1234567890',
  backendApiUrl: 'https://your-backend.com/api/sms',
};

export const ExpoConfig = {
  projectId: 'your-expo-project-id',
};

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

export function getEmailToSMS(phoneNumber: string, carrier: keyof typeof EmailToSMSGateways): string {
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  return `${cleanNumber}@${EmailToSMSGateways[carrier]}`;
}
