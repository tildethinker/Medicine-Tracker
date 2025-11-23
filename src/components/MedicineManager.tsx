import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import { Medicine } from '../types';
import {
  Plus,
  Pill,
  Clock,
  Calendar,
  FileText,
  Camera,
  Save,
  X,
  Edit,
  Trash2,
} from 'lucide-react-native';

export default function MedicineManager() {
  const { state, addMedicine, updateMedicine, deleteMedicine } = useApp();
  const { medicines, settings } = state;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    times: [''],
    instructions: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  const frequencies = [
    { label: 'Daily', value: 'daily' },
    { label: 'Twice Daily', value: 'twice_daily' },
    { label: 'Three Times Daily', value: 'three_times_daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'As Needed', value: 'as_needed' },
  ];

  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      frequency: 'daily',
      times: [''],
      instructions: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    });
    setEditingMedicine(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalVisible(true);
  };

  const openEditModal = (medicine: Medicine) => {
    setFormData({
      name: medicine.name,
      dosage: medicine.dosage,
      frequency: medicine.frequency,
      times: [...medicine.times],
      instructions: medicine.instructions,
      startDate: medicine.startDate,
      endDate: medicine.endDate || '',
    });
    setEditingMedicine(medicine);
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter medicine name');
      return;
    }

    if (!formData.dosage.trim()) {
      Alert.alert('Error', 'Please enter dosage');
      return;
    }

    const validTimes = formData.times.filter(time => time.trim());
    if (validTimes.length === 0) {
      Alert.alert('Error', 'Please add at least one time');
      return;
    }

    try {
      const medicineData = {
        name: formData.name.trim(),
        dosage: formData.dosage.trim(),
        frequency: formData.frequency,
        times: validTimes,
        instructions: formData.instructions.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
      };

      if (editingMedicine) {
        await updateMedicine(editingMedicine.id, medicineData);
        Alert.alert('Success', 'Medicine updated successfully');
      } else {
        await addMedicine(medicineData);
        Alert.alert('Success', 'Medicine added successfully');
      }

      setIsModalVisible(false);
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to save medicine');
    }
  };

  const handleDelete = (medicine: Medicine) => {
    Alert.alert(
      'Delete Medicine',
      `Are you sure you want to delete ${medicine.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMedicine(medicine.id);
              Alert.alert('Success', 'Medicine deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete medicine');
            }
          },
        },
      ]
    );
  };

  const addTimeSlot = () => {
    setFormData(prev => ({
      ...prev,
      times: [...prev.times, ''],
    }));
  };

  const updateTimeSlot = (index: number, time: string) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.map((t, i) => i === index ? time : t),
    }));
  };

  const removeTimeSlot = (index: number) => {
    if (formData.times.length > 1) {
      setFormData(prev => ({
        ...prev,
        times: prev.times.filter((_, i) => i !== index),
      }));
    }
  };

  const renderMedicineCard = ({ item }: { item: Medicine }) => (
    <View style={[styles.medicineCard, settings.darkMode && styles.darkCard]}>
      <View style={styles.medicineHeader}>
        <View style={styles.medicineInfo}>
          <Text style={[styles.medicineName, settings.darkMode && styles.darkText]}>
            {item.name}
          </Text>
          <Text style={[styles.dosageText, settings.darkMode && styles.darkText]}>
            {item.dosage}
          </Text>
        </View>
        <View style={styles.medicineActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openEditModal(item)}
          >
            <Edit size={20} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item)}
          >
            <Trash2 size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.medicineDetails}>
        <View style={styles.detailRow}>
          <Clock size={16} color="#6B7280" />
          <Text style={[styles.detailText, settings.darkMode && styles.darkText]}>
            {item.times.join(', ')}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Calendar size={16} color="#6B7280" />
          <Text style={[styles.detailText, settings.darkMode && styles.darkText]}>
            Started: {new Date(item.startDate).toLocaleDateString()}
            {item.endDate && ` - Ends: ${new Date(item.endDate).toLocaleDateString()}`}
          </Text>
        </View>

        {item.instructions && (
          <View style={styles.detailRow}>
            <FileText size={16} color="#6B7280" />
            <Text style={[styles.detailText, settings.darkMode && styles.darkText]}>
              {item.instructions}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, settings.darkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={[styles.title, settings.darkMode && styles.darkText]}>
          Medicine Manager
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={openAddModal}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Medicine</Text>
        </TouchableOpacity>
      </View>

      {medicines.length === 0 ? (
        <View style={styles.emptyState}>
          <Pill size={64} color="#9CA3AF" />
          <Text style={[styles.emptyTitle, settings.darkMode && styles.darkText]}>
            No medicines added yet
          </Text>
          <Text style={[styles.emptyText, settings.darkMode && styles.darkText]}>
            Add your first medicine to start tracking
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={openAddModal}
          >
            <Text style={styles.emptyButtonText}>Add Medicine</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={medicines}
          renderItem={renderMedicineCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <ScrollView style={[styles.modalContainer, settings.darkMode && styles.darkContainer]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, settings.darkMode && styles.darkText]}>
              {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
            </Text>
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={[styles.label, settings.darkMode && styles.darkText]}>
                Medicine Name *
              </Text>
              <TextInput
                style={[styles.input, settings.darkMode && styles.darkInput]}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="e.g., Aspirin"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, settings.darkMode && styles.darkText]}>
                Dosage *
              </Text>
              <TextInput
                style={[styles.input, settings.darkMode && styles.darkInput]}
                value={formData.dosage}
                onChangeText={(text) => setFormData(prev => ({ ...prev, dosage: text }))}
                placeholder="e.g., 100mg"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, settings.darkMode && styles.darkText]}>
                Frequency
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.frequencyContainer}>
                {frequencies.map((freq) => (
                  <TouchableOpacity
                    key={freq.value}
                    style={[
                      styles.frequencyButton,
                      formData.frequency === freq.value && styles.frequencyButtonActive,
                      settings.darkMode && styles.darkFrequencyButton,
                      formData.frequency === freq.value && settings.darkMode && styles.darkFrequencyButtonActive,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, frequency: freq.value }))}
                  >
                    <Text style={[
                      styles.frequencyButtonText,
                      formData.frequency === freq.value && styles.frequencyButtonTextActive,
                      settings.darkMode && styles.darkFrequencyButtonText,
                      formData.frequency === freq.value && settings.darkMode && styles.darkFrequencyButtonTextActive,
                    ]}>
                      {freq.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.field}>
              <View style={styles.timeHeader}>
                <Text style={[styles.label, settings.darkMode && styles.darkText]}>
                  Time Slots *
                </Text>
                <TouchableOpacity
                  style={styles.addTimeButton}
                  onPress={addTimeSlot}
                >
                  <Plus size={16} color="#3B82F6" />
                  <Text style={styles.addTimeText}>Add Time</Text>
                </TouchableOpacity>
              </View>
              {formData.times.map((time, index) => (
                <View key={index} style={styles.timeSlot}>
                  <TextInput
                    style={[styles.timeInput, settings.darkMode && styles.darkInput]}
                    value={time}
                    onChangeText={(text) => updateTimeSlot(index, text)}
                    placeholder="HH:MM"
                    placeholderTextColor="#9CA3AF"
                  />
                  {formData.times.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeTimeButton}
                      onPress={() => removeTimeSlot(index)}
                    >
                      <X size={16} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, settings.darkMode && styles.darkText]}>
                Instructions
              </Text>
              <TextInput
                style={[styles.textArea, settings.darkMode && styles.darkInput]}
                value={formData.instructions}
                onChangeText={(text) => setFormData(prev => ({ ...prev, instructions: text }))}
                placeholder="Special instructions (optional)"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.dateFields}>
              <View style={styles.dateField}>
                <Text style={[styles.label, settings.darkMode && styles.darkText]}>
                  Start Date
                </Text>
                <TextInput
                  style={[styles.input, settings.darkMode && styles.darkInput]}
                  value={formData.startDate}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, startDate: text }))}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.dateField}>
                <Text style={[styles.label, settings.darkMode && styles.darkText]}>
                  End Date (Optional)
                </Text>
                <TextInput
                  style={[styles.input, settings.darkMode && styles.darkInput]}
                  value={formData.endDate}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, endDate: text }))}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelModalButton]}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.cancelModalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveModalButton]}
              onPress={handleSave}
            >
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.saveModalButtonText}>Save Medicine</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  darkContainer: {
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  medicineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: '#1F2937',
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  dosageText: {
    fontSize: 16,
    color: '#6B7280',
  },
  medicineActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  medicineDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  form: {
    padding: 16,
    gap: 16,
  },
  field: {
    marginBottom: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  darkInput: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
    color: '#F9FAFB',
  },
  frequencyContainer: {
    marginBottom: 8,
  },
  frequencyButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  frequencyButtonActive: {
    backgroundColor: '#3B82F6',
  },
  darkFrequencyButton: {
    backgroundColor: '#374151',
  },
  darkFrequencyButtonActive: {
    backgroundColor: '#3B82F6',
  },
  frequencyButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: 'bold',
  },
  frequencyButtonTextActive: {
    color: '#FFFFFF',
  },
  darkFrequencyButtonText: {
    color: '#F9FAFB',
  },
  darkFrequencyButtonTextActive: {
    color: '#FFFFFF',
  },
  timeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addTimeText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  removeTimeButton: {
    padding: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    height: 80,
    textAlignVertical: 'top',
  },
  dateFields: {
    flexDirection: 'row',
    gap: 12,
  },
  dateField: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 32,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelModalButton: {
    backgroundColor: '#F3F4F6',
  },
  saveModalButton: {
    backgroundColor: '#10B981',
  },
  cancelModalButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  darkText: {
    color: '#F9FAFB',
  },
});
