import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import { BarChart, PieChart, LineChart } from 'react-native-chart-kit';
import { Calendar, Download, Share2, TrendingUp } from 'lucide-react-native';
import { ExportService } from '../services/export';

type DateRange = 'day' | 'week' | 'month' | 'quarter' | 'custom';

export default function HistoryReports() {
  const { state } = useApp();
  const { medicines, intakes, settings } = state;
  
  const [dateRange, setDateRange] = useState<DateRange>('week');
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());

  const screenWidth = Dimensions.get('window').width;

  // Calculate date range
  const getDateRange = (): { start: Date; end: Date } => {
    const now = new Date();
    switch (dateRange) {
      case 'day':
        return { start: new Date(now.setHours(0,0,0,0)), end: new Date() };
      case 'week':
        return { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end: new Date() };
      case 'month':
        return { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() };
      case 'quarter':
        return { start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), end: new Date() };
      case 'custom':
        return { start: startDate, end: endDate };
      default:
        return { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end: new Date() };
    }
  };

  const { start, end } = getDateRange();

  // Filter intakes by date range
  const filteredIntakes = useMemo(() => {
    return intakes.filter(intake => {
      const intakeDate = new Date(intake.date);
      return intakeDate >= start && intakeDate <= end;
    });
  }, [intakes, start, end]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalScheduled = filteredIntakes.length;
    const totalTaken = filteredIntakes.filter(i => i.status === 'taken').length;
    const totalSkipped = filteredIntakes.filter(i => i.status === 'skipped').length;
    const totalMissed = filteredIntakes.filter(i => i.status === 'missed').length;
    const adherenceRate = totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 0;

    return {
      totalScheduled,
      totalTaken,
      totalSkipped,
      totalMissed,
      adherenceRate,
    };
  }, [filteredIntakes]);

  // Adherence by medicine
  const adherenceByMedicine = useMemo(() => {
    const medicineStats = medicines.map(medicine => {
      const medicineIntakes = filteredIntakes.filter(i => i.medicineId === medicine.id);
      const taken = medicineIntakes.filter(i => i.status === 'taken').length;
      const total = medicineIntakes.length;
      const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;

      return {
        name: medicine.name,
        adherence,
        taken,
        total,
      };
    }).filter(m => m.total > 0);

    return medicineStats;
  }, [medicines, filteredIntakes]);

  // Daily adherence data
  const dailyAdherence = useMemo(() => {
    const days = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    const data = [];
    
    for (let i = 0; i <= days; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      const dayIntakes = filteredIntakes.filter(intake => intake.date === dateString);
      const taken = dayIntakes.filter(i => i.status === 'taken').length;
      const total = dayIntakes.length;
      const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;

      data.push({
        date: dateString,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        adherence,
      });
    }

    return data;
  }, [start, end, filteredIntakes]);

  // Chart data
  const lineChartData = {
    labels: dailyAdherence.slice(-7).map(d => d.label),
    datasets: [{
      data: dailyAdherence.slice(-7).map(d => d.adherence),
      color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
      strokeWidth: 2,
    }],
  };

  const barChartData = {
    labels: adherenceByMedicine.slice(0, 5).map(m => m.name.substring(0, 8)),
    datasets: [{
      data: adherenceByMedicine.slice(0, 5).map(m => m.adherence),
    }],
  };

  const pieChartData = [
    {
      name: 'Taken',
      population: stats.totalTaken,
      color: '#10B981',
      legendFontColor: settings.darkMode ? '#F9FAFB' : '#111827',
    },
    {
      name: 'Skipped',
      population: stats.totalSkipped,
      color: '#F59E0B',
      legendFontColor: settings.darkMode ? '#F9FAFB' : '#111827',
    },
    {
      name: 'Missed',
      population: stats.totalMissed,
      color: '#EF4444',
      legendFontColor: settings.darkMode ? '#F9FAFB' : '#111827',
    },
  ].filter(item => item.population > 0);

  const chartConfig = {
    backgroundColor: settings.darkMode ? '#1F2937' : '#FFF',
    backgroundGradientFrom: settings.darkMode ? '#1F2937' : '#FFF',
    backgroundGradientTo: settings.darkMode ? '#1F2937' : '#FFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => settings.darkMode ? `rgba(249, 250, 251, ${opacity})` : `rgba(17, 23, 41, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#3B82F6',
    },
  };

  const handleExportCSV = async () => {
    const startDateStr = start.toISOString().split('T')[0];
    const endDateStr = end.toISOString().split('T')[0];
    await ExportService.exportAsCSV(medicines, intakes, startDateStr, endDateStr);
  };

  const handleExportPDF = async () => {
    const startDateStr = start.toISOString().split('T')[0];
    const endDateStr = end.toISOString().split('T')[0];
    await ExportService.exportAsPDF(medicines, intakes, state.profile, startDateStr, endDateStr);
  };

  const handleShareReport = async () => {
    const startDateStr = start.toISOString().split('T')[0];
    const endDateStr = end.toISOString().split('T')[0];
    await ExportService.shareReport(medicines, intakes, state.profile, startDateStr, endDateStr, 'csv');
  };

  return (
    <ScrollView style={[styles.container, settings.darkMode && styles.darkContainer]}>
      {/* Date Range Selector */}
      <View style={[styles.section, settings.darkMode && styles.darkCard]}>
        <Text style={[styles.sectionTitle, settings.darkMode && styles.darkText]}>
          Date Range
        </Text>
        <View style={styles.rangeButtons}>
          {(['day', 'week', 'month', 'quarter'] as DateRange[]).map(range => (
            <TouchableOpacity
              key={range}
              style={[
                styles.rangeButton,
                dateRange === range && styles.rangeButtonActive,
              ]}
              onPress={() => setDateRange(range)}
            >
              <Text
                style={[
                  styles.rangeButtonText,
                  dateRange === range && styles.rangeButtonTextActive,
                ]}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.dateRangeText, settings.darkMode && styles.darkSubtext]}>
          {start.toLocaleDateString()} - {end.toLocaleDateString()}
        </Text>
      </View>

      {/* Summary Stats */}
      <View style={[styles.section, settings.darkMode && styles.darkCard]}>
        <Text style={[styles.sectionTitle, settings.darkMode && styles.darkText]}>
          Summary Statistics
        </Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#3B82F6' }]}>
              {stats.totalScheduled}
            </Text>
            <Text style={[styles.statLabel, settings.darkMode && styles.darkSubtext]}>
              Total Scheduled
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              {stats.totalTaken}
            </Text>
            <Text style={[styles.statLabel, settings.darkMode && styles.darkSubtext]}>
              Taken
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>
              {stats.totalSkipped}
            </Text>
            <Text style={[styles.statLabel, settings.darkMode && styles.darkSubtext]}>
              Skipped
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>
              {stats.totalMissed}
            </Text>
            <Text style={[styles.statLabel, settings.darkMode && styles.darkSubtext]}>
              Missed
            </Text>
          </View>
        </View>
        <View style={styles.adherenceContainer}>
          <TrendingUp size={32} />
          <View>
            <Text style={[styles.adherenceValue, { color: stats.adherenceRate >= 80 ? '#10B981' : '#F59E0B' }]}>
              {stats.adherenceRate}%
            </Text>
            <Text style={[styles.adherenceLabel, settings.darkMode && styles.darkSubtext]}>
              Overall Adherence
            </Text>
          </View>
        </View>
      </View>

      {/* Daily Adherence Chart */}
      {dailyAdherence.length > 0 && (
        <View style={[styles.section, settings.darkMode && styles.darkCard]}>
          <Text style={[styles.sectionTitle, settings.darkMode && styles.darkText]}>
            Daily Adherence Trend
          </Text>
          <LineChart
            data={lineChartData}
            width={screenWidth - 48}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            fromZero
            segments={4}
          />
        </View>
      )}

      {/* Adherence by Medicine */}
      {adherenceByMedicine.length > 0 && (
        <View style={[styles.section, settings.darkMode && styles.darkCard]}>
          <Text style={[styles.sectionTitle, settings.darkMode && styles.darkText]}>
            Adherence by Medicine
          </Text>
          <BarChart
            data={barChartData}
            width={screenWidth - 48}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
            fromZero
            segments={4}
            yAxisLabel="%"
            yAxisSuffix="%"
          />
          <View style={styles.medicineList}>
            {adherenceByMedicine.map((item, index) => (
              <View key={index} style={styles.medicineItem}>
                <Text style={[styles.medicineName, settings.darkMode && styles.darkText]}>
                  {item.name}
                </Text>
                <Text style={[styles.medicineStats, settings.darkMode && styles.darkSubtext]}>
                  {item.taken}/{item.total} ({item.adherence}%)
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Status Distribution */}
      {pieChartData.length > 0 && (
        <View style={[styles.section, settings.darkMode && styles.darkCard]}>
          <Text style={[styles.sectionTitle, settings.darkMode && styles.darkText]}>
            Status Distribution
          </Text>
          <PieChart
            data={pieChartData}
            width={screenWidth - 48}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            style={styles.chart}
          />
        </View>
      )}

      {/* Export Options */}
      <View style={[styles.section, settings.darkMode && styles.darkCard]}>
        <Text style={[styles.sectionTitle, settings.darkMode && styles.darkText]}>
          Export & Share
        </Text>
        <TouchableOpacity style={styles.exportButton} onPress={handleExportCSV}>
          <Download size={20} />
          <Text style={styles.exportButtonText}>Export as CSV</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exportButton} onPress={handleExportPDF}>
          <Download size={20} />
          <Text style={styles.exportButtonText}>Export as PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exportButton} onPress={handleShareReport}>
          <Share2 size={20} />
          <Text style={styles.exportButtonText}>Share Report</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  darkContainer: {
    backgroundColor: '#111827',
  },
  section: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  darkCard: {
    backgroundColor: '#1F2937',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  darkText: {
    color: '#F9FAFB',
  },
  darkSubtext: {
    color: '#9CA3AF',
  },
  rangeButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  rangeButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  rangeButtonActive: {
    backgroundColor: '#3B82F6',
  },
  rangeButtonText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 14,
  },
  rangeButtonTextActive: {
    color: '#FFF',
  },
  dateRangeText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  adherenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    gap: 16,
  },
  adherenceValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  adherenceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  medicineList: {
    marginTop: 16,
    gap: 12,
  },
  medicineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  medicineName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  medicineStats: {
    fontSize: 14,
    color: '#6B7280',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
    marginBottom: 12,
    gap: 12,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
});
