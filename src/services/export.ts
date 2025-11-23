import { Medicine, MedicineIntake, UserProfile } from '../types';
import { Alert } from 'react-native';

/**
 * Export service for generating CSV and PDF reports
 * Note: Requires react-native-share and react-native-fs packages
 * Install with: npm install react-native-share react-native-fs
 */

export class ExportService {
  /**
   * Generate CSV content from intakes data
   */
  static generateCSV(
    medicines: Medicine[],
    intakes: MedicineIntake[],
    startDate: string,
    endDate: string
  ): string {
    const headers = ['Date', 'Time', 'Medicine', 'Dosage', 'Status', 'Timestamp', 'Note'];
    const rows = [headers.join(',')];

    // Filter intakes by date range
    const filteredIntakes = intakes.filter(intake => {
      return intake.date >= startDate && intake.date <= endDate;
    });

    // Sort by date and time
    filteredIntakes.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });

    // Generate rows
    filteredIntakes.forEach(intake => {
      const medicine = medicines.find(m => m.id === intake.medicineId);
      if (!medicine) return;

      const row = [
        intake.date,
        intake.time,
        `"${medicine.name}"`,
        `"${medicine.dosage}"`,
        intake.status,
        new Date(intake.timestamp).toLocaleString(),
        intake.note ? `"${intake.note.replace(/"/g, '""')}"` : '',
      ];
      rows.push(row.join(','));
    });

    return rows.join('\n');
  }

  /**
   * Generate summary statistics for PDF
   */
  static generateSummary(
    medicines: Medicine[],
    intakes: MedicineIntake[],
    profile: UserProfile | null,
    startDate: string,
    endDate: string
  ) {
    const filteredIntakes = intakes.filter(intake => {
      return intake.date >= startDate && intake.date <= endDate;
    });

    const totalScheduled = filteredIntakes.length;
    const totalTaken = filteredIntakes.filter(i => i.status === 'taken').length;
    const totalSkipped = filteredIntakes.filter(i => i.status === 'skipped').length;
    const totalMissed = filteredIntakes.filter(i => i.status === 'missed').length;
    const adherenceRate = totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 0;

    // Adherence by medicine
    const medicineStats = medicines.map(medicine => {
      const medicineIntakes = filteredIntakes.filter(i => i.medicineId === medicine.id);
      const taken = medicineIntakes.filter(i => i.status === 'taken').length;
      const total = medicineIntakes.length;
      const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;

      return {
        name: medicine.name,
        dosage: medicine.dosage,
        total,
        taken,
        skipped: medicineIntakes.filter(i => i.status === 'skipped').length,
        missed: medicineIntakes.filter(i => i.status === 'missed').length,
        adherence,
      };
    }).filter(m => m.total > 0);

    return {
      reportDate: new Date().toISOString(),
      dateRange: { start: startDate, end: endDate },
      patient: profile ? {
        name: profile.name,
        age: profile.age,
        healthCondition: profile.healthCondition,
      } : null,
      summary: {
        totalScheduled,
        totalTaken,
        totalSkipped,
        totalMissed,
        adherenceRate,
      },
      medicineStats,
    };
  }

  /**
   * Export data as CSV
   * Note: This is a placeholder. Actual implementation requires react-native-share
   */
  static async exportAsCSV(
    medicines: Medicine[],
    intakes: MedicineIntake[],
    startDate: string,
    endDate: string
  ): Promise<void> {
    try {
      const csvContent = this.generateCSV(medicines, intakes, startDate, endDate);
      
      // Placeholder - Actual implementation:
      // const RNFS = require('react-native-fs');
      // const Share = require('react-native-share');
      // 
      // const filePath = `${RNFS.DocumentDirectoryPath}/medicine_tracker_${Date.now()}.csv`;
      // await RNFS.writeFile(filePath, csvContent, 'utf8');
      // 
      // await Share.open({
      //   url: `file://${filePath}`,
      //   type: 'text/csv',
      //   title: 'Export Medicine Tracker Data',
      // });

      Alert.alert(
        'Export CSV',
        'CSV export requires react-native-share and react-native-fs packages.\n\nInstall with:\nnpm install react-native-share react-native-fs\n\nThen uncomment the implementation in src/services/export.ts',
        [{ text: 'OK' }]
      );

      // For now, log the CSV content
      console.log('CSV Content:', csvContent);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert('Error', 'Failed to export CSV file');
    }
  }

  /**
   * Export data as PDF
   * Note: This is a placeholder. Actual implementation requires additional packages
   */
  static async exportAsPDF(
    medicines: Medicine[],
    intakes: MedicineIntake[],
    profile: UserProfile | null,
    startDate: string,
    endDate: string
  ): Promise<void> {
    try {
      const summary = this.generateSummary(medicines, intakes, profile, startDate, endDate);

      // Placeholder - Actual implementation would use a PDF library
      Alert.alert(
        'Export PDF',
        'PDF export requires additional packages:\n\n• react-native-pdf-lib\n• react-native-share\n\nFor now, the summary data is logged to console.',
        [{ text: 'OK' }]
      );

      console.log('PDF Summary:', JSON.stringify(summary, null, 2));
    } catch (error) {
      console.error('Error exporting PDF:', error);
      Alert.alert('Error', 'Failed to export PDF file');
    }
  }

  /**
   * Share report with caregivers
   */
  static async shareReport(
    medicines: Medicine[],
    intakes: MedicineIntake[],
    profile: UserProfile | null,
    startDate: string,
    endDate: string,
    format: 'csv' | 'pdf' = 'csv'
  ): Promise<void> {
    if (format === 'csv') {
      await this.exportAsCSV(medicines, intakes, startDate, endDate);
    } else {
      await this.exportAsPDF(medicines, intakes, profile, startDate, endDate);
    }
  }
}
