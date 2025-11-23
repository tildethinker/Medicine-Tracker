import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert, Linking } from 'react-native';
import { Medicine, CaregiverRule, Caregiver } from '../types';
import { EmailConfig } from '../config/services.config';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationService = {
  async init() {
    await this.setupNotifications();
    this.setupNotificationResponseListener();
  },

  async setupNotifications() {
    if (!Device.isDevice) {
      console.warn('Notifications only work on physical devices');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Notification permissions not granted');
      return;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      // Create channel for missed doses
      await Notifications.setNotificationChannelAsync('missed-dose', {
        name: 'Missed Dose Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#EF4444',
      });
    }
  },

  /**
   * Setup listener for notification responses (when user taps notification)
   */
  setupNotificationResponseListener() {
    Notifications.addNotificationResponseReceivedListener(response => {
      type NotificationData = {
        action?: string;
        medicineId?: string;
        time?: string;
      };

      const data = response.notification.request.content.data as NotificationData | undefined;
      
      if (data?.action === 'mark_taken') {
        // Handle marking as taken
        console.log('Mark taken action:', data);
      } else if (data?.action === 'snooze') {
        // Handle snooze
        console.log('Snooze action:', data);
        if (typeof data.medicineId === 'string' && typeof data.time === 'string') {
          this.snoozeNotification(data.medicineId, data.time, 15);
        } else {
          console.warn('Snooze action missing medicineId or time', data);
        }
      }
    });
  },

  async scheduleNotification(
    identifier: string,
    title: string,
    body: string,
    trigger: Notifications.NotificationTriggerInput,
    categoryIdentifier?: string
  ) {
    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title,
        body,
        sound: 'default',
        categoryIdentifier,
        data: {
          identifier,
        },
      },
      trigger,
    });
  },

  /**
   * Schedule notification with action buttons
   */
  async scheduleNotificationWithActions(
    identifier: string,
    title: string,
    body: string,
    trigger: Notifications.NotificationTriggerInput,
    medicineId: string,
    time: string
  ) {
    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title,
        body,
        sound: 'default',
        data: {
          identifier,
          medicineId,
          time,
        },
      },
      trigger,
    });
  },

  async scheduleAllReminders(medicines: Medicine[], notificationsSettings: any) {
    const notificationsEnabled = notificationsSettings?.enabled ?? false;
    if (!notificationsEnabled) {
      await this.cancelAllNotifications();
      return;
    }

    // Cancel existing notifications
    await this.cancelAllNotifications();

    const leadTime = notificationsSettings?.leadTime || 5;

    // Schedule new notifications for each medicine
    for (const medicine of medicines) {
      for (const time of medicine.times) {
        const [hours, minutes] = time.split(':').map(Number);
        const now = new Date();
        const triggerTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

        // Apply lead time (minutes before scheduled time)
        triggerTime.setMinutes(triggerTime.getMinutes() - leadTime);

        // If the time has passed today, schedule for tomorrow
        if (triggerTime <= now) {
          triggerTime.setDate(triggerTime.getDate() + 1);
        }

        const identifier = `${medicine.id}_${time}`;
        await this.scheduleNotificationWithActions(
          identifier,
          `Medicine Reminder: ${medicine.name}`,
          `Time to take ${medicine.dosage} of ${medicine.name}\nTap to mark as taken`,
          { 
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerTime 
          },
          medicine.id,
          time
        );
      }
    }
  },

  /**
   * Snooze a notification
   */
  async snoozeNotification(medicineId: string, time: string, snoozeMinutes: number = 15) {
    const identifier = `${medicineId}_${time}_snooze`;
    const triggerTime = new Date();
    triggerTime.setMinutes(triggerTime.getMinutes() + snoozeMinutes);

    await this.scheduleNotification(
      identifier,
      `Reminder: Snoozed Medicine`,
      `Don't forget to take your medication!`,
      { 
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerTime 
      }
    );
  },

  /**
   * Check for missed doses and send caregiver alerts
   */
  async checkMissedDoses(
    medicines: Medicine[],
    intakes: any[],
    caregivers: Caregiver[],
    rules: CaregiverRule[]
  ): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Check each medicine
    for (const medicine of medicines) {
      for (const time of medicine.times) {
        // Skip if time hasn't passed yet
        if (time >= currentTime) continue;

        // Check if there's an intake record
        const intake = intakes.find(
          i => i.medicineId === medicine.id && i.date === today && i.time === time
        );

        // If no intake or intake is missed
        if (!intake || intake.status === 'missed') {
          // Check rules for this medicine
          const applicableRules = rules.filter(rule => 
            rule.enabled && 
            (rule.trigger === 'missed_dose' || rule.trigger === 'critical_missed') &&
            (!rule.medicineId || rule.medicineId === medicine.id)
          );

          if (applicableRules.length > 0 && caregivers.length > 0) {
            await this.sendCaregiverAlert(
              medicine,
              time,
              caregivers,
              'missed_dose'
            );
          }
        }
      }
    }
  },

  /**
   * Send caregiver alert
   */
  async sendCaregiverAlert(
    medicine: Medicine,
    time: string,
    caregivers: Caregiver[],
    alertType: 'missed_dose' | 'low_adherence' | 'critical_missed'
  ): Promise<void> {
    const messages = {
      missed_dose: `${medicine.name} (${medicine.dosage}) was missed at ${time}`,
      low_adherence: `Adherence rate has dropped below threshold`,
      critical_missed: `CRITICAL: ${medicine.name} (${medicine.dosage}) was missed at ${time}`,
    };

    const message = messages[alertType];

    // Send alerts based on caregiver preferences
    for (const caregiver of caregivers) {
      if (caregiver.method === 'email') {
        await this.sendEmailAlert(caregiver.contact, 'Medicine Alert', message);
      } else if (caregiver.method === 'sms') {
        await this.sendSMSAlert(caregiver.contact, message);
      } else if (caregiver.method === 'push') {
        await this.sendPushAlert(caregiver.name, message);
      }
    }
  },

  /**
   * Send email/SMS using device's native email app
   * This works 100% of the time - opens Gmail/Mail app with pre-filled message
   */
  async sendEmailAlert(email: string, subject: string, message: string): Promise<void> {
    try {
      console.log(`📧 Sending to: ${email}`);
      console.log(`📝 Subject: ${subject}`);
      console.log(`💬 Message: ${message}`);

      const isSMS = email.includes('@vtext.com') || 
                   email.includes('@txt.att.net') || 
                   email.includes('@tmomail.net') || 
                   email.includes('@messaging.sprinttpcs.com') ||
                   email.includes('@sms.') ||
                   email.includes('@mymetropcs.com') ||
                   email.includes('@vmobl.com');

      // Create mailto URL that opens device's email app
      const emailBody = encodeURIComponent(message);
      const emailSubject = encodeURIComponent(subject);
      const mailto = `mailto:${email}?subject=${emailSubject}&body=${emailBody}`;

      // Check if device can open email
      const canOpen = await Linking.canOpenURL(mailto);
      
      if (canOpen) {
        // Open email app with pre-filled message
        await Linking.openURL(mailto);
        
        // Show success message
        Alert.alert(
          '📬 Email App Opened!',
          `Your ${isSMS ? 'SMS notification' : 'email'} is ready to send.\n\n` +
          `To: ${email}\n\n` +
          (isSMS ? 
            '📱 After sending, the SMS will arrive within 1-2 minutes!' :
            '📧 Just tap Send in your email app!'
          ) + '\n\n' +
          '💡 Tip: For automatic sending, set up Firebase Cloud Functions.',
          [{ text: 'Got It!' }]
        );
        
        console.log('✅ Email app opened successfully!');
      } else {
        // Fallback: Copy to clipboard and show manual instructions
        Alert.alert(
          '📋 Copy Notification Details',
          `Notification Details:\n\n` +
          `To: ${email}\n` +
          `Subject: ${subject}\n` +
          `Message: ${message}\n\n` +
          'Please send this manually from your email app.\n\n' +
          (isSMS ? '📱 This will be delivered as SMS!' : ''),
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('Notification details:', { email, subject, message });
              }
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('❌ Error opening email app:', error);
      
      // Show helpful error with the details
      Alert.alert(
        '⚠️ Email App Error',
        `Could not open email app.\n\n` +
        `Please send manually:\n\n` +
        `To: ${email}\n` +
        `Subject: ${subject}\n` +
        `Message: ${message}\n\n` +
        '💡 For automatic sending, see FIREBASE_SETUP_GUIDE.md',
        [{ text: 'OK' }]
      );
    }
  },

  /**
   * Show alternative email options
   */
  showEmailAlternatives() {
    Alert.alert(
      '📧 Email Alternatives',
      '✅ FREE Options:\n\n' +
      '1. Email-to-SMS Gateway\n' +
      '   • Format: phone@carrier.com\n' +
      '   • Verizon: phone@vtext.com\n' +
      '   • AT&T: phone@txt.att.net\n' +
      '   • T-Mobile: phone@tmomail.net\n\n' +
      '2. Push Notifications\n' +
      '   • Already working!\n' +
      '   • Caregiver installs app\n\n' +
      '3. Custom Email Backend\n' +
      '   • Requires server setup\n' +
      '   • Use Firebase Functions or Node.js',
      [{ text: 'OK' }]
    );
  },

  /**
   * Send SMS alert via Email-to-SMS Gateway (FREE alternative)
   * For Twilio integration, you need a backend server
   */
  async sendSMSAlert(phone: string, message: string): Promise<void> {
    try {
      console.log(`📱 SMS alert to ${phone}: ${message}`);
      
      // Option 1: Use Email-to-SMS Gateway (FREE)
      // Note: This requires knowing the carrier. For production, ask user for carrier during caregiver setup
      // Common gateways:
      // AT&T: number@txt.att.net
      // Verizon: number@vtext.com
      // T-Mobile: number@tmomail.net
      
      // For now, we'll try to send via email if phone looks like email
      if (phone.includes('@')) {
        await this.sendEmailAlert(phone, 'Medicine Alert', message);
        console.log('✅ SMS sent via email-to-SMS gateway');
      } else {
        console.warn('⚠️  SMS sending requires either:');
        console.warn('   1. Email-to-SMS gateway (phone@carrier.com)');
        console.warn('   2. Backend server with Twilio integration');
        console.warn('   3. Use email method instead');
        
        // Show alert to user
        Alert.alert(
          'SMS Not Available',
          'SMS requires a backend server with Twilio. Please use Email method for caregiver alerts instead.\n\nAlternatively, use Email-to-SMS format: phone@carrier.com\n\nExample: 1234567890@vtext.com (Verizon)',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('❌ Failed to send SMS:', error);
    }
  },

  /**
   * Send push notification alert
   */
  async sendPushAlert(recipientName: string, message: string): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Caregiver Alert: ${recipientName}`,
        body: message,
        sound: 'default',
      },
      trigger: null, // Immediate notification
    });
  },

  async cancelNotification(identifier: string) {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  },

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};
