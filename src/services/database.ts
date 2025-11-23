import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medicine, MedicineIntake, UserProfile, CaregiverRule } from '../types';

const db = SQLite.openDatabaseSync('medicine_tracker.db');

export class DatabaseService {
  static async init() {
    try {
      // Create medicines table
      await db.runAsync(
        `CREATE TABLE IF NOT EXISTS medicines (
          id TEXT PRIMARY KEY,
          name TEXT,
          dosage TEXT,
          frequency TEXT,
          times TEXT,
          instructions TEXT,
          startDate TEXT,
          endDate TEXT,
          imageUri TEXT
        )`
      );

      // Create intakes table
      await db.runAsync(
        `CREATE TABLE IF NOT EXISTS intakes (
          id TEXT PRIMARY KEY,
          medicineId TEXT,
          date TEXT,
          time TEXT,
          status TEXT,
          timestamp TEXT,
          note TEXT,
          FOREIGN KEY (medicineId) REFERENCES medicines (id)
        )`
      );

      // Create profile table
      await db.runAsync(
        `CREATE TABLE IF NOT EXISTS profile (
          id TEXT PRIMARY KEY,
          data TEXT
        )`
      );

      // Create caregiver rules table
      await db.runAsync(
        `CREATE TABLE IF NOT EXISTS caregiver_rules (
          id TEXT PRIMARY KEY,
          medicineId TEXT,
          trigger TEXT,
          threshold INTEGER,
          enabled INTEGER
        )`
      );
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  // Medicine operations
  static async getMedicines(): Promise<Medicine[]> {
    try {
      const result = await db.getAllAsync('SELECT * FROM medicines');
      return result.map((row: any) => ({
        ...row,
        times: JSON.parse(row.times || '[]')
      })) as Medicine[];
    } catch (error) {
      console.error('Error getting medicines:', error);
      throw error;
    }
  }

  static async saveMedicine(medicine: Medicine): Promise<void> {
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO medicines (id, name, dosage, frequency, times, instructions, startDate, endDate, imageUri)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          medicine.id,
          medicine.name,
          medicine.dosage,
          medicine.frequency,
          JSON.stringify(medicine.times),
          medicine.instructions,
          medicine.startDate,
          medicine.endDate || null,
          medicine.imageUri || null
        ]
      );
    } catch (error) {
      console.error('Error saving medicine:', error);
      throw error;
    }
  }

  static async deleteMedicine(id: string): Promise<void> {
    try {
      await db.runAsync('DELETE FROM medicines WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error deleting medicine:', error);
      throw error;
    }
  }

  // Intake operations
  static async getIntakes(): Promise<MedicineIntake[]> {
    try {
      const result = await db.getAllAsync('SELECT * FROM intakes');
      return result as MedicineIntake[];
    } catch (error) {
      console.error('Error getting intakes:', error);
      throw error;
    }
  }

  static async saveIntake(intake: MedicineIntake): Promise<void> {
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO intakes (id, medicineId, date, time, status, timestamp, note)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          intake.id,
          intake.medicineId,
          intake.date,
          intake.time,
          intake.status,
          intake.timestamp,
          intake.note || null
        ]
      );
    } catch (error) {
      console.error('Error saving intake:', error);
      throw error;
    }
  }

  // Profile operations
  static async getProfile(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem('user_profile');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  }

  static async saveProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem('user_profile', JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  }

  // Caregiver rules operations
  static async getCaregiverRules(): Promise<CaregiverRule[]> {
    try {
      const result = await db.getAllAsync('SELECT * FROM caregiver_rules');
      return result.map((row: any) => ({
        id: row.id,
        medicineId: row.medicineId,
        trigger: row.trigger,
        threshold: row.threshold,
        enabled: Boolean(row.enabled)
      })) as CaregiverRule[];
    } catch (error) {
      console.error('Error getting caregiver rules:', error);
      throw error;
    }
  }

  static async saveCaregiverRule(rule: CaregiverRule): Promise<void> {
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO caregiver_rules (id, medicineId, trigger, threshold, enabled)
         VALUES (?, ?, ?, ?, ?)`,
        [
          rule.id,
          rule.medicineId || null,
          rule.trigger,
          rule.threshold,
          rule.enabled ? 1 : 0
        ]
      );
    } catch (error) {
      console.error('Error saving caregiver rule:', error);
      throw error;
    }
  }

  // Backup and restore
  static async exportData(): Promise<string> {
    const [medicines, intakes, profile, rules] = await Promise.all([
      this.getMedicines(),
      this.getIntakes(),
      this.getProfile(),
      this.getCaregiverRules()
    ]);

    return JSON.stringify({
      medicines,
      intakes,
      profile,
      caregiverRules: rules,
      exportDate: new Date().toISOString()
    });
  }

  static async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);

    // Clear existing data
    try {
      await db.runAsync('DELETE FROM medicines');
      await db.runAsync('DELETE FROM intakes');
      await db.runAsync('DELETE FROM caregiver_rules');
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }

    // Import medicines
    for (const medicine of data.medicines || []) {
      await this.saveMedicine(medicine);
    }

    // Import intakes
    for (const intake of data.intakes || []) {
      await this.saveIntake(intake);
    }

    // Import profile
    if (data.profile) {
      await this.saveProfile(data.profile);
    }

    // Import caregiver rules
    for (const rule of data.caregiverRules || []) {
      await this.saveCaregiverRule(rule);
    }
  }
}
