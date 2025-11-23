export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  instructions: string;
  startDate: string;
  endDate?: string;
  imageUri?: string;
}

export interface MedicineIntake {
  id: string;
  medicineId: string;
  date: string;
  time: string;
  status: 'taken' | 'skipped' | 'missed';
  timestamp: string;
  note?: string;
}

export interface UserProfile {
  name: string;
  age: number;
  healthCondition: string;
  emergencyContact: string;
  caregiverEmail: string;
  doctorName: string;
  doctorPhone: string;
  caregivers?: Caregiver[];
}

export interface Caregiver {
  id: string;
  name: string;
  contact: string; // email, phone, or email-to-sms gateway (e.g., 1234567890@vtext.com)
  method: 'email' | 'sms' | 'push';
  carrier?: 'AT&T' | 'Verizon' | 'T-Mobile' | 'Sprint' | 'Boost Mobile' | 'Cricket' | 'Metro PCS' | 'US Cellular' | 'Virgin Mobile'; // For email-to-SMS
}

export interface CaregiverRule {
  id: string;
  medicineId?: string;
  trigger: 'missed_dose' | 'low_adherence' | 'critical_missed';
  threshold: number;
  enabled: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  leadTime: number; // minutes before scheduled time
  snoozeTime: number; // minutes
  soundEnabled: boolean;
}

export interface AppSettings {
  darkMode: boolean;
  notifications: NotificationSettings;
  localOnly: boolean;
  locale: string;
  timeFormat: '12h' | '24h';
}
