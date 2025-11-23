import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import { CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Edit } from 'lucide-react-native';

export default function DailyTracker() {
  const { state, updateIntakeStatus } = useApp();
  const { medicines, intakes, settings } = state;
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [selectedIntake, setSelectedIntake] = useState<{medicineId: string; time: string} | null>(null);
  const [note, setNote] = useState('');

  const dateString = selectedDate.toISOString().split('T')[0];
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const isToday = dateString === now.toISOString().split('T')[0];
  const isPast = selectedDate < new Date(now.toDateString());

  // Get schedule for selected date
  const daySchedule = useMemo(() => {
    const schedule = medicines.flatMap(medicine => {
      // Check if medicine is active on this date
      const startDate = new Date(medicine.startDate);
      const endDate = medicine.endDate ? new Date(medicine.endDate) : null;
      
      if (selectedDate < startDate || (endDate && selectedDate > endDate)) {
        return [];
      }

      return medicine.times.map(time => {
        const intake = intakes.find(i =>
          i.medicineId === medicine.id &&
          i.date === dateString &&
          i.time === time
        );

        // Determine status for items without intake record
        let status = intake?.status;
        if (!intake && isPast) {
          status = time < currentTime || !isToday ? 'missed' : undefined;
        } else if (!intake && isToday && time < currentTime) {
          status = 'missed';
        }

        return {
          medicine,
          time,
          intake,
          status,
          isMissed: status === 'missed',
          isPending: !intake && (!isToday || time >= currentTime),
        };
      });
    }).sort((a, b) => a.time.localeCompare(b.time));

    return schedule;
  }, [medicines, intakes, dateString, isToday, isPast, currentTime]);

  // Group by time slots
  const groupedSchedule = useMemo(() => {
    const groups: { [key: string]: typeof daySchedule } = {
      morning: [],
      afternoon: [],
      evening: [],
      night: [],
    };

    daySchedule.forEach(item => {
      const hour = parseInt(item.time.split(':')[0]);
      if (hour >= 5 && hour < 12) groups.morning.push(item);
      else if (hour >= 12 && hour < 17) groups.afternoon.push(item);
      else if (hour >= 17 && hour < 21) groups.evening.push(item);
      else groups.night.push(item);
    });

    return groups;
  }, [daySchedule]);

  const handleMarkStatus = (medicineId: string, time: string, status: 'taken' | 'skipped') => {
    Alert.alert(
      'Confirm Action',
      `Mark as ${status}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            updateIntakeStatus(medicineId, dateString, time, status);
          },
        },
      ]
    );
  };

  const handleAddNote = (medicineId: string, time: string) => {
    setSelectedIntake({ medicineId, time });
    const existingIntake = intakes.find(i =>
      i.medicineId === medicineId && i.date === dateString && i.time === time
    );
    setNote(existingIntake?.note || '');
    setNoteModalVisible(true);
  };

  const saveNote = () => {
    if (selectedIntake) {
      // Note: You'll need to add a method in AppContext to update intake notes
      Alert.alert('Info', 'Note functionality requires context method update');
    }
    setNoteModalVisible(false);
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const renderMedicineItem = (item: typeof daySchedule[0]) => {
    const statusColor = item.intake?.status === 'taken' ? '#10B981' 
      : item.intake?.status === 'skipped' ? '#F59E0B'
      : item.isMissed ? '#EF4444'
      : '#6B7280';

    return (
      <View
        key={`${item.medicine.id}-${item.time}`}
        style={[
          styles.medicineCard,
          settings.darkMode && styles.darkCard,
          item.isMissed && styles.missedCard,
        ]}
      >
        <View style={styles.medicineHeader}>
          <View style={styles.medicineInfo}>
            <Text style={[styles.medicineName, settings.darkMode && styles.darkText]}>
              {item.medicine.name}
            </Text>
            <Text style={[styles.dosage, settings.darkMode && styles.darkSubtext]}>
              {item.medicine.dosage}
            </Text>
            {item.medicine.instructions && (
              <Text style={[styles.instructions, settings.darkMode && styles.darkSubtext]}>
                📝 {item.medicine.instructions}
              </Text>
            )}
          </View>
          <View style={styles.timeContainer}>
            <Clock size={20} color={statusColor} />
            <Text style={[styles.time, { color: statusColor }]}>{item.time}</Text>
          </View>
        </View>

        {item.intake?.note && (
          <View style={styles.noteContainer}>
            <Text style={[styles.noteText, settings.darkMode && styles.darkSubtext]}>
              Note: {item.intake.note}
            </Text>
          </View>
        )}

        {item.intake ? (
          <View style={styles.statusBadge}>
            {item.intake.status === 'taken' ? (
              <>
                <CheckCircle size={20} color="#10B981" />
                <Text style={styles.statusText}>Taken</Text>
              </>
            ) : item.intake.status === 'skipped' ? (
              <>
                <XCircle size={20} color="#F59E0B" />
                <Text style={styles.statusText}>Skipped</Text>
              </>
            ) : (
              <>
                <XCircle size={20} color="#EF4444" />
                <Text style={styles.statusText}>Missed</Text>
              </>
            )}
            <Text style={[styles.timestamp, settings.darkMode && styles.darkSubtext]}>
              at {new Date(item.intake.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        ) : (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.takenButton]}
              onPress={() => handleMarkStatus(item.medicine.id, item.time, 'taken')}
            >
              <CheckCircle size={20} color="#FFF" />
              <Text style={styles.buttonText}>Taken</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.skipButton]}
              onPress={() => handleMarkStatus(item.medicine.id, item.time, 'skipped')}
            >
              <XCircle size={20} color="#FFF" />
              <Text style={styles.buttonText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.noteButton]}
              onPress={() => handleAddNote(item.medicine.id, item.time)}
            >
              <Edit size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderTimeSlot = (title: string, items: typeof daySchedule) => {
    if (items.length === 0) return null;

    return (
      <View style={styles.timeSlot}>
        <Text style={[styles.slotTitle, settings.darkMode && styles.darkText]}>
          {title} ({items.length})
        </Text>
        {items.map(renderMedicineItem)}
      </View>
    );
  };

  const stats = useMemo(() => {
    const total = daySchedule.length;
    const taken = daySchedule.filter(i => i.intake?.status === 'taken').length;
    const skipped = daySchedule.filter(i => i.intake?.status === 'skipped').length;
    const missed = daySchedule.filter(i => i.isMissed).length;
    return { total, taken, skipped, missed };
  }, [daySchedule]);

  return (
    <View style={[styles.container, settings.darkMode && styles.darkContainer]}>
      {/* Date Navigation */}
      <View style={[styles.dateNav, settings.darkMode && styles.darkCard]}>
        <TouchableOpacity onPress={() => changeDate(-1)} style={styles.navButton}>
          <ChevronLeft size={24} color={settings.darkMode ? '#FFF' : '#000'} />
        </TouchableOpacity>
        <View style={styles.dateDisplay}>
          <Text style={[styles.dateText, settings.darkMode && styles.darkText]}>
            {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </Text>
          {isToday && <Text style={styles.todayBadge}>Today</Text>}
        </View>
        <TouchableOpacity onPress={() => changeDate(1)} style={styles.navButton}>
          <ChevronRight size={24} color={settings.darkMode ? '#FFF' : '#000'} />
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <View style={[styles.statsRow, settings.darkMode && styles.darkCard]}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={[styles.statLabel, settings.darkMode && styles.darkSubtext]}>Total</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>{stats.taken}</Text>
          <Text style={[styles.statLabel, settings.darkMode && styles.darkSubtext]}>Taken</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>{stats.skipped}</Text>
          <Text style={[styles.statLabel, settings.darkMode && styles.darkSubtext]}>Skipped</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>{stats.missed}</Text>
          <Text style={[styles.statLabel, settings.darkMode && styles.darkSubtext]}>Missed</Text>
        </View>
      </View>

      {/* Schedule List */}
      <ScrollView style={styles.scrollView}>
        {daySchedule.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, settings.darkMode && styles.darkText]}>
              No medicines scheduled for this day
            </Text>
          </View>
        ) : (
          <>
            {renderTimeSlot('🌅 Morning', groupedSchedule.morning)}
            {renderTimeSlot('☀️ Afternoon', groupedSchedule.afternoon)}
            {renderTimeSlot('🌆 Evening', groupedSchedule.evening)}
            {renderTimeSlot('🌙 Night', groupedSchedule.night)}
          </>
        )}
      </ScrollView>

      {/* Note Modal */}
      <Modal
        visible={noteModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNoteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, settings.darkMode && styles.darkCard]}>
            <Text style={[styles.modalTitle, settings.darkMode && styles.darkText]}>
              Add Note
            </Text>
            <TextInput
              style={[styles.noteInput, settings.darkMode && styles.darkInput]}
              placeholder="e.g., Side effects, symptoms..."
              placeholderTextColor={settings.darkMode ? '#9CA3AF' : '#6B7280'}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setNoteModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveNote}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  darkCard: {
    backgroundColor: '#1F2937',
    borderBottomColor: '#374151',
  },
  navButton: {
    padding: 8,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  darkText: {
    color: '#F9FAFB',
  },
  todayBadge: {
    backgroundColor: '#3B82F6',
    color: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  darkSubtext: {
    color: '#9CA3AF',
  },
  scrollView: {
    flex: 1,
  },
  timeSlot: {
    padding: 16,
  },
  slotTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  medicineCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  missedCard: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  dosage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  instructions: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  timeContainer: {
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 14,
    fontWeight: '600',
  },
  noteContainer: {
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  noteText: {
    fontSize: 12,
    color: '#92400E',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 'auto',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  takenButton: {
    backgroundColor: '#10B981',
  },
  skipButton: {
    backgroundColor: '#F59E0B',
  },
  noteButton: {
    backgroundColor: '#E0E7FF',
    flex: 0,
    paddingHorizontal: 12,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  darkInput: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
    color: '#F9FAFB',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6B7280',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
});
