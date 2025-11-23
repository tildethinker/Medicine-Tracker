import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import { UserProfile } from '../types';
import {
  User,
  Phone,
  Mail,
  Heart,
  Save,
  Edit,
  Stethoscope,
} from 'lucide-react-native';

export default function ProfileManager() {
  const { state, updateProfile } = useApp();
  const { profile, settings } = state;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({
    name: profile?.name || '',
    age: profile?.age || 0,
    healthCondition: profile?.healthCondition || '',
    emergencyContact: profile?.emergencyContact || '',
    caregiverEmail: profile?.caregiverEmail || '',
    doctorName: profile?.doctorName || '',
    doctorPhone: profile?.doctorPhone || '',
  });

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (formData.age <= 0 || formData.age > 150) {
      Alert.alert('Error', 'Please enter a valid age');
      return;
    }

    try {
      await updateProfile(formData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile?.name || '',
      age: profile?.age || 0,
      healthCondition: profile?.healthCondition || '',
      emergencyContact: profile?.emergencyContact || '',
      caregiverEmail: profile?.caregiverEmail || '',
      doctorName: profile?.doctorName || '',
      doctorPhone: profile?.doctorPhone || '',
    });
    setIsEditing(false);
  };

  return (
    <ScrollView style={[styles.container, settings.darkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={[styles.title, settings.darkMode && styles.darkText]}>
          My Profile
        </Text>
        {!isEditing ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Edit size={20} color="#3B82F6" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.editActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSave}
            >
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {/* Personal Information */}
        <View style={[styles.section, settings.darkMode && styles.darkCard]}>
          <View style={styles.sectionHeader}>
            <User size={24} color="#3B82F6" />
            <Text style={[styles.sectionTitle, settings.darkMode && styles.darkText]}>
              Personal Information
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, settings.darkMode && styles.darkText]}>
              Full Name *
            </Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, settings.darkMode && styles.darkInput]}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
              />
            ) : (
              <Text style={[styles.value, settings.darkMode && styles.darkText]}>
                {profile?.name || 'Not set'}
              </Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, settings.darkMode && styles.darkText]}>
              Age *
            </Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, settings.darkMode && styles.darkInput]}
                value={formData.age.toString()}
                onChangeText={(text) => {
                  const age = parseInt(text) || 0;
                  setFormData(prev => ({ ...prev, age }));
                }}
                placeholder="Enter your age"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            ) : (
              <Text style={[styles.value, settings.darkMode && styles.darkText]}>
                {profile?.age ? `${profile.age} years old` : 'Not set'}
              </Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, settings.darkMode && styles.darkText]}>
              Health Condition
            </Text>
            {isEditing ? (
              <TextInput
                style={[styles.textArea, settings.darkMode && styles.darkInput]}
                value={formData.healthCondition}
                onChangeText={(text) => setFormData(prev => ({ ...prev, healthCondition: text }))}
                placeholder="Describe your health condition (optional)"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            ) : (
              <Text style={[styles.value, settings.darkMode && styles.darkText]}>
                {profile?.healthCondition || 'Not set'}
              </Text>
            )}
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={[styles.section, settings.darkMode && styles.darkCard]}>
          <View style={styles.sectionHeader}>
            <Phone size={24} color="#EF4444" />
            <Text style={[styles.sectionTitle, settings.darkMode && styles.darkText]}>
              Emergency Contact
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, settings.darkMode && styles.darkText]}>
              Emergency Contact Name & Phone
            </Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, settings.darkMode && styles.darkInput]}
                value={formData.emergencyContact}
                onChangeText={(text) => setFormData(prev => ({ ...prev, emergencyContact: text }))}
                placeholder="e.g., John Doe - (555) 123-4567"
                placeholderTextColor="#9CA3AF"
              />
            ) : (
              <Text style={[styles.value, settings.darkMode && styles.darkText]}>
                {profile?.emergencyContact || 'Not set'}
              </Text>
            )}
          </View>
        </View>

        {/* Caregiver Information */}
        <View style={[styles.section, settings.darkMode && styles.darkCard]}>
          <View style={styles.sectionHeader}>
            <Heart size={24} color="#10B981" />
            <Text style={[styles.sectionTitle, settings.darkMode && styles.darkText]}>
              Caregiver Information
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, settings.darkMode && styles.darkText]}>
              Caregiver Email
            </Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, settings.darkMode && styles.darkInput]}
                value={formData.caregiverEmail}
                onChangeText={(text) => setFormData(prev => ({ ...prev, caregiverEmail: text }))}
                placeholder="caregiver@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={[styles.value, settings.darkMode && styles.darkText]}>
                {profile?.caregiverEmail || 'Not set'}
              </Text>
            )}
          </View>
        </View>

        {/* Doctor Information */}
        <View style={[styles.section, settings.darkMode && styles.darkCard]}>
          <View style={styles.sectionHeader}>
            <Stethoscope size={24} color="#8B5CF6" />
            <Text style={[styles.sectionTitle, settings.darkMode && styles.darkText]}>
              Doctor Information
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, settings.darkMode && styles.darkText]}>
              Doctor's Name
            </Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, settings.darkMode && styles.darkInput]}
                value={formData.doctorName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, doctorName: text }))}
                placeholder="Dr. Smith"
                placeholderTextColor="#9CA3AF"
              />
            ) : (
              <Text style={[styles.value, settings.darkMode && styles.darkText]}>
                {profile?.doctorName || 'Not set'}
              </Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, settings.darkMode && styles.darkText]}>
              Doctor's Phone
            </Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, settings.darkMode && styles.darkInput]}
                value={formData.doctorPhone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, doctorPhone: text }))}
                placeholder="(555) 123-4567"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={[styles.value, settings.darkMode && styles.darkText]}>
                {profile?.doctorPhone || 'Not set'}
              </Text>
            )}
          </View>
        </View>

        {!profile?.name && !isEditing && (
          <View style={[styles.setupPrompt, settings.darkMode && styles.darkCard]}>
            <User size={48} color="#9CA3AF" />
            <Text style={[styles.promptTitle, settings.darkMode && styles.darkText]}>
              Complete Your Profile
            </Text>
            <Text style={[styles.promptText, settings.darkMode && styles.darkText]}>
              Set up your personal information to get the most out of the medicine tracker
            </Text>
            <TouchableOpacity
              style={styles.setupButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.setupButtonText}>Set Up Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
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
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: '#10B981',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: '#1F2937',
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
    marginLeft: 12,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: '#6B7280',
    paddingVertical: 8,
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
  setupPrompt: {
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
  promptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  promptText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  setupButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  setupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  darkText: {
    color: '#F9FAFB',
  },
});
