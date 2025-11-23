import React, { useMemo, useEffect } from 'react';
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
import { CheckCircle, XCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import { NotificationService } from '../services/notifications';

const screenWidth = Dimensions.get('window').width;

export default function Dashboard() {
  const { state, updateIntakeStatus } = useApp();
  const { medicines, intakes, profile, settings, caregiverRules } = state;

  // Check for missed doses every 5 minutes
  useEffect(() => {
    const checkMissedDosesInterval = setInterval(async () => {
      if (profile?.caregivers && profile.caregivers.length > 0 && caregiverRules.length > 0) {
        await NotificationService.checkMissedDoses(
          medicines,
          intakes,
          profile.caregivers,
          caregiverRules
        );
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Check immediately on mount
    (async () => {
      if (profile?.caregivers && profile.caregivers.length > 0 && caregiverRules.length > 0) {
        await NotificationService.checkMissedDoses(
          medicines,
          intakes,
          profile.caregivers,
          caregiverRules
        );
      }
    })();

    return () => clearInterval(checkMissedDosesInterval);
  }, [medicines, intakes, profile?.caregivers, caregiverRules]);


  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // Calculate today's medicine schedule
  const todaysSchedule = medicines.flatMap(medicine =>
    medicine.times.map(time => ({
      medicine,
      time,
      intake: intakes.find(intake =>
        intake.medicineId === medicine.id &&
        intake.date === today &&
        intake.time === time
      )
    }))
  ).sort((a, b) => a.time.localeCompare(b.time));

  // Calculate stats
  const totalToday = todaysSchedule.length;
  const takenToday = todaysSchedule.filter(item => item.intake?.status === 'taken').length;
  const skippedToday = todaysSchedule.filter(item => item.intake?.status === 'skipped').length;
  const missedToday = todaysSchedule.filter(item => {
    if (item.intake) return item.intake.status === 'missed';
    return item.time < currentTime;
  }).length;

  const upcomingMedicines = todaysSchedule.filter(item =>
    !item.intake && item.time >= currentTime
  ).slice(0, 3);

  const adherenceRate = totalToday > 0 ? Math.round((takenToday / totalToday) * 100) : 0;

  // Calculate 7-day adherence data
  const weeklyAdherence = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const daySchedule = medicines.flatMap(medicine =>
        medicine.times.map(time => ({
          medicineId: medicine.id,
          time,
        }))
      );
      
      const dayIntakes = intakes.filter(intake => intake.date === dateString);
      const taken = dayIntakes.filter(i => i.status === 'taken').length;
      const total = daySchedule.length;
      const adherence = total > 0 ? (taken / total) * 100 : 0;

      data.push({
        date: dateString,
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        adherence: Math.round(adherence),
      });
    }
    return data;
  }, [medicines, intakes]);

  const chartData = {
    labels: weeklyAdherence.map(d => d.label),
    datasets: [{
      data: weeklyAdherence.map(d => d.adherence),
      color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
      strokeWidth: 2,
    }],
  };

  const chartConfig = {
    backgroundColor: settings.darkMode ? '#1F2937' : '#FFF',
    backgroundGradientFrom: settings.darkMode ? '#1F2937' : '#FFF',
    backgroundGradientTo: settings.darkMode ? '#1F2937' : '#FFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => settings.darkMode ? `rgba(249, 250, 251, ${opacity})` : `rgba(17, 23, 41, ${opacity})`,
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#3B82F6',
    },
  };

  const handleIntakeAction = (medicineId: string, time: string, status: 'taken' | 'skipped') => {
    Alert.alert(
      'Confirm Action',
      `Mark ${status === 'taken' ? 'taken' : 'skipped'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => updateIntakeStatus(medicineId, today, time, status),
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, settings.darkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={[styles.title, settings.darkMode && styles.darkText]}>
          Today's Medicine Dashboard
        </Text>
        <Text style={[styles.subtitle, settings.darkMode && styles.darkText]}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Text>
        {profile?.name && (
          <View style={[styles.patientCard, settings.darkMode && styles.darkCard]}>
            <Text style={[styles.patientText, settings.darkMode && styles.darkText]}>
              <Text style={styles.boldText}>Patient:</Text> {profile.name} ({profile.age} years old)
            </Text>
            {profile.healthCondition && (
              <Text style={[styles.conditionText, settings.darkMode && styles.darkText]}>
                <Text style={styles.boldText}>Condition:</Text> {profile.healthCondition}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Weekly Adherence Chart */}
      <View style={[styles.chartCard, settings.darkMode && styles.darkCard]}>
        <View style={styles.chartHeader}>
          <TrendingUp size={20} color="#3B82F6" />
          <Text style={[styles.chartTitle, settings.darkMode && styles.darkText]}>
            7-Day Adherence Trend
          </Text>
        </View>
        <LineChart
          data={chartData}
          width={screenWidth - 48}
          height={180}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={false}
          withOuterLines={false}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          fromZero
          segments={4}
          yAxisSuffix="%"
        />
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.takenCard]}>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Taken Today</Text>
            <Text style={styles.statValue}>{takenToday}</Text>
          </View>
          <CheckCircle size={32} color="#10B981" />
        </View>

        <View style={[styles.statCard, styles.skippedCard]}>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Skipped Today</Text>
            <Text style={styles.statValue}>{skippedToday}</Text>
          </View>
          <XCircle size={32} color="#F59E0B" />
        </View>

        <View style={[styles.statCard, styles.missedCard]}>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Missed Today</Text>
            <Text style={styles.statValue}>{missedToday}</Text>
          </View>
          <AlertTriangle size={32} color="#EF4444" />
        </View>

        <View style={[styles.statCard, styles.adherenceCard]}>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Adherence Rate</Text>
            <Text style={styles.statValue}>{adherenceRate}%</Text>
          </View>
          <TrendingUp size={32} color="#3B82F6" />
        </View>
      </View>

      <View style={styles.contentGrid}>
        {/* Upcoming Medicines */}
        <View style={[styles.sectionCard, settings.darkMode && styles.darkCard]}>
          <View style={styles.sectionHeader}>
            <Clock size={24} color="#3B82F6" />
            <Text style={[styles.sectionTitle, settings.darkMode && styles.darkText]}>
              Next Medicine Reminder
            </Text>
          </View>

          {upcomingMedicines.length === 0 ? (
            <View style={styles.emptyState}>
              <CheckCircle size={48} color="#10B981" />
              <Text style={[styles.emptyTitle, settings.darkMode && styles.darkText]}>
                All medicines taken for now!
              </Text>
              <Text style={[styles.emptySubtitle, settings.darkMode && styles.darkText]}>
                Great job staying on track
              </Text>
            </View>
          ) : (
            <View style={styles.upcomingList}>
              {upcomingMedicines.map((item) => (
                <View key={`${item.medicine.id}-${item.time}`}
                      style={[styles.upcomingItem, settings.darkMode && styles.darkItem]}>
                  <View style={styles.upcomingContent}>
                    <View style={styles.upcomingHeader}>
                      <View style={styles.timeIndicator} />
                      <View>
                        <Text style={[styles.medicineName, settings.darkMode && styles.darkText]}>
                          {item.medicine.name}
                        </Text>
                        <Text style={[styles.dosageText, settings.darkMode && styles.darkText]}>
                          {item.medicine.dosage}
                        </Text>
                        {item.medicine.instructions && (
                          <Text style={[styles.instructionText, settings.darkMode && styles.darkText]}>
                            {item.medicine.instructions}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>{item.time}</Text>
                    <Text style={[styles.timeLabel, settings.darkMode && styles.darkText]}>
                      {item.time === currentTime ? 'Now!' : 'Coming up'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Today's Schedule */}
        <View style={[styles.sectionCard, settings.darkMode && styles.darkCard]}>
          <View style={styles.sectionHeader}>
            <CheckCircle size={24} color="#10B981" />
            <Text style={[styles.sectionTitle, settings.darkMode && styles.darkText]}>
              Today's Progress Tracker
            </Text>
          </View>

          <ScrollView style={styles.scheduleList} showsVerticalScrollIndicator={false}>
            {todaysSchedule.map((item) => {
              const status = item.intake?.status || (item.time < currentTime ? 'missed' : 'pending');
              const statusConfig = {
                taken: { color: '#10B981', icon: CheckCircle, bg: '#D1FAE5', border: '#A7F3D0' },
                skipped: { color: '#F59E0B', icon: XCircle, bg: '#FEF3C7', border: '#FDE68A' },
                missed: { color: '#EF4444', icon: AlertTriangle, bg: '#FEE2E2', border: '#FECACA' },
                pending: { color: '#3B82F6', icon: Clock, bg: '#DBEAFE', border: '#BFDBFE' }
              }[status];

              const StatusIcon = statusConfig.icon;

              return (
                <View key={`${item.medicine.id}-${item.time}`}
                     style={[styles.scheduleItem, { backgroundColor: statusConfig.bg, borderColor: statusConfig.border }]}>
                  <View style={styles.scheduleContent}>
                    <StatusIcon size={20} color={statusConfig.color} />
                    <View>
                      <Text style={[styles.scheduleMedicine, settings.darkMode && styles.darkText]}>
                        {item.medicine.name}
                      </Text>
                      <Text style={[styles.scheduleDosage, settings.darkMode && styles.darkText]}>
                        {item.medicine.dosage}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.scheduleRight}>
                    <Text style={[styles.scheduleTime, settings.darkMode && styles.darkText]}>{item.time}</Text>
                    {status === 'pending' && (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.takeButton]}
                          onPress={() => handleIntakeAction(item.medicine.id, item.time, 'taken')}
                        >
                          <Text style={styles.actionButtonText}>Take</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.skipButton]}
                          onPress={() => handleIntakeAction(item.medicine.id, item.time, 'skipped')}
                        >
                          <Text style={styles.actionButtonText}>Skip</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {totalToday === 0 && (
        <View style={[styles.emptyCard, settings.darkMode && styles.darkCard]}>
          <Clock size={48} color="#9CA3AF" />
          <Text style={[styles.emptyCardTitle, settings.darkMode && styles.darkText]}>
            No medicines scheduled for today
          </Text>
          <Text style={[styles.emptyCardSubtitle, settings.darkMode && styles.darkText]}>
            Add your medicines to start tracking your daily intake
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  darkContainer: {
    backgroundColor: '#111827',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  patientCard: {
    backgroundColor: '#EBF8FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  darkCard: {
    backgroundColor: '#1F2937',
  },
  patientText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  conditionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  boldText: {
    fontWeight: 'bold',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  takenCard: {
    borderLeftColor: '#10B981',
    borderLeftWidth: 4,
  },
  skippedCard: {
    borderLeftColor: '#F59E0B',
    borderLeftWidth: 4,
  },
  missedCard: {
    borderLeftColor: '#EF4444',
    borderLeftWidth: 4,
  },
  adherenceCard: {
    borderLeftColor: '#3B82F6',
    borderLeftWidth: 4,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  contentGrid: {
    gap: 16,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  upcomingList: {
    gap: 12,
  },
  upcomingItem: {
    backgroundColor: '#EBF8FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  darkItem: {
    backgroundColor: '#1E3A8A',
    borderColor: '#3B82F6',
  },
  upcomingContent: {
    flex: 1,
  },
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timeIndicator: {
    width: 8,
    height: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  dosageText: {
    fontSize: 14,
    color: '#6B7280',
  },
  instructionText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  timeLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  scheduleList: {
    maxHeight: 300,
  },
  scheduleItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scheduleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  scheduleMedicine: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  scheduleDosage: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  scheduleRight: {
    alignItems: 'flex-end',
  },
  scheduleTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  takeButton: {
    backgroundColor: '#10B981',
  },
  skipButton: {
    backgroundColor: '#F59E0B',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyCardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  darkText: {
    color: '#F9FAFB',
  },
});
