import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  Switch,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import { Caregiver, CaregiverRule } from '../types';
import { 
  UserPlus, 
  Mail, 
  Phone, 
  Bell, 
  Trash2, 
  Edit, 
  AlertTriangle,
  CheckCircle,
  Send
} from 'lucide-react-native';
import { NotificationService } from '../services/notifications';
import { EmailToSMSGateways, getEmailToSMS } from '../config/services.config';

export default function CaregiverNotifications() {
  const { state, updateProfile, addCaregiverRule, updateCaregiverRule, deleteCaregiverRule } = useApp();
  const { profile, caregiverRules, medicines, settings } = state;

  const [caregiverModalVisible, setCaregiverModalVisible] = useState(false);
  const [ruleModalVisible, setRuleModalVisible] = useState(false);
  const [editingCaregiver, setEditingCaregiver] = useState<Caregiver | null>(null);
  const [editingRule, setEditingRule] = useState<CaregiverRule | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Caregiver form state
  const [caregiverName, setCaregiverName] = useState('');
  const [caregiverContact, setCaregiverContact] = useState('');
  const [caregiverMethod, setCaregiverMethod] = useState<'email' | 'sms' | 'push'>('email');
  const [caregiverCarrier, setCaregiverCarrier] = useState<keyof typeof EmailToSMSGateways>('Verizon');

  // Rule form state
  const [ruleMedicineId, setRuleMedicineId] = useState<string>('');
  const [ruleTrigger, setRuleTrigger] = useState<'missed_dose' | 'low_adherence' | 'critical_missed'>('missed_dose');
  const [ruleThreshold, setRuleThreshold] = useState('30');
  const [ruleEnabled, setRuleEnabled] = useState(true);

  const caregivers = profile?.caregivers || [];

  const openAddCaregiver = () => {
    setEditingCaregiver(null);
    setCaregiverName('');
    setCaregiverContact('');
    setCaregiverMethod('email');
    setCaregiverCarrier('Verizon');
    setCaregiverModalVisible(true);
  };

  const openEditCaregiver = (caregiver: Caregiver) => {
    setEditingCaregiver(caregiver);
    setCaregiverName(caregiver.name);
    
    // Parse contact for SMS method
    if (caregiver.method === 'sms' && caregiver.contact.includes('@')) {
      const [phone, gateway] = caregiver.contact.split('@');
      setCaregiverContact(phone);
      // Find carrier from gateway
      const carrier = Object.entries(EmailToSMSGateways).find(([_, gw]) => gw === gateway)?.[0] as keyof typeof EmailToSMSGateways;
      setCaregiverCarrier(carrier || 'Verizon');
    } else {
      setCaregiverContact(caregiver.contact);
      setCaregiverCarrier('Verizon');
    }
    
    setCaregiverMethod(caregiver.method);
    setCaregiverModalVisible(true);
  };

  const saveCaregiver = async () => {
    if (!caregiverName.trim() || !caregiverContact.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Format contact based on method
    let finalContact = caregiverContact.trim();
    
    if (caregiverMethod === 'sms') {
      // Clean phone number (remove non-digits)
      const cleanPhone = caregiverContact.replace(/\D/g, '');
      
      if (cleanPhone.length !== 10) {
        Alert.alert('Error', 'Please enter a valid 10-digit phone number');
        return;
      }
      
      // Format with carrier gateway
      finalContact = getEmailToSMS(cleanPhone, caregiverCarrier);
    }

    const newCaregiver: Caregiver = {
      id: editingCaregiver?.id || Date.now().toString(),
      name: caregiverName.trim(),
      contact: finalContact,
      method: caregiverMethod,
    };

    const updatedCaregivers = editingCaregiver
      ? caregivers.map(c => c.id === editingCaregiver.id ? newCaregiver : c)
      : [...caregivers, newCaregiver];

    await updateProfile({ caregivers: updatedCaregivers });
    setCaregiverModalVisible(false);
  };

  const deleteCaregiver = (id: string) => {
    Alert.alert(
      'Delete Caregiver',
      'Are you sure you want to remove this caregiver?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedCaregivers = caregivers.filter(c => c.id !== id);
            await updateProfile({ caregivers: updatedCaregivers });
          },
        },
      ]
    );
  };

  const openAddRule = () => {
    setEditingRule(null);
    setRuleMedicineId('');
    setRuleTrigger('missed_dose');
    setRuleThreshold('30');
    setRuleEnabled(true);
    setRuleModalVisible(true);
  };

  const openEditRule = (rule: CaregiverRule) => {
    setEditingRule(rule);
    setRuleMedicineId(rule.medicineId || '');
    setRuleTrigger(rule.trigger);
    setRuleThreshold(rule.threshold.toString());
    setRuleEnabled(rule.enabled);
    setRuleModalVisible(true);
  };

  const saveRule = async () => {
    const threshold = parseInt(ruleThreshold);
    if (isNaN(threshold) || threshold < 0) {
      Alert.alert('Error', 'Please enter a valid threshold');
      return;
    }

    if (editingRule) {
      await updateCaregiverRule(editingRule.id, {
        medicineId: ruleMedicineId || undefined,
        trigger: ruleTrigger,
        threshold,
        enabled: ruleEnabled,
      });
    } else {
      await addCaregiverRule({
        medicineId: ruleMedicineId || undefined,
        trigger: ruleTrigger,
        threshold,
        enabled: ruleEnabled,
      });
    }

    setRuleModalVisible(false);
  };

  const handleDeleteRule = (id: string) => {
    Alert.alert(
      'Delete Rule',
      'Are you sure you want to delete this notification rule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCaregiverRule(id),
        },
      ]
    );
  };

  const handleTestNotification = async () => {
    console.log('🧪 Test notification button pressed!');
    console.log('📋 Number of caregivers:', caregivers.length);
    
    if (caregivers.length === 0) {
      Alert.alert('No Caregivers', 'Please add at least one caregiver first.');
      return;
    }

    setIsSendingTest(true);
    
    try {
      // Send test notifications to all caregivers
      for (const caregiver of caregivers) {
        console.log(`📤 Sending to ${caregiver.name} (${caregiver.method}): ${caregiver.contact}`);
        
        const testMessage = `Test notification from MedicineTracker app. Your alerts are working correctly!`;
        
        if (caregiver.method === 'email') {
          await NotificationService.sendEmailAlert(
            caregiver.contact,
            '🧪 Test Alert - MedicineTracker',
            testMessage
          );
        } else if (caregiver.method === 'sms') {
          await NotificationService.sendSMSAlert(caregiver.contact, testMessage);
        } else if (caregiver.method === 'push') {
          await NotificationService.sendPushAlert(caregiver.name, testMessage);
        }
      }
      
      Alert.alert(
        '✅ Test Sent!',
        `Test notifications sent to ${caregivers.length} caregiver(s). Check your inbox/messages!`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert(
        '❌ Test Failed',
        `Failed to send test: ${error.message}\n\nPlease check your configuration in src/config/services.config.ts`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsSendingTest(false);
    }
  };

  const getTriggerLabel = (trigger: CaregiverRule['trigger']) => {
    switch (trigger) {
      case 'missed_dose':
        return 'Missed Dose';
      case 'low_adherence':
        return 'Low Adherence';
      case 'critical_missed':
        return 'Critical Missed';
    }
  };

  const getMedicineName = (medicineId?: string) => {
    if (!medicineId) return 'All Medicines';
    const medicine = medicines.find(m => m.id === medicineId);
    return medicine?.name || 'Unknown Medicine';
  };

  return (
    <ScrollView style={[styles.container, settings.darkMode && styles.darkContainer]}>
      {/* Header Info */}
      <View style={[styles.infoCard, settings.darkMode && styles.darkCard]}>
        <Bell size={24} color="#3B82F6" />
        <Text style={[styles.infoText, settings.darkMode && styles.darkText]}>
          Configure caregivers to receive notifications when you miss medications or adherence drops below threshold.
        </Text>
      </View>

      {/* Caregivers Section */}
      <View style={[styles.section, settings.darkMode && styles.darkCard]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, settings.darkMode && styles.darkText]}>
            Caregivers ({caregivers.length})
          </Text>
          <TouchableOpacity style={styles.addButton} onPress={openAddCaregiver}>
            <UserPlus size={20} color="#3B82F6" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {caregivers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, settings.darkMode && styles.darkSubtext]}>
              No caregivers added yet. Add a caregiver to enable notifications.
            </Text>
          </View>
        ) : (
          caregivers.map(caregiver => (
            <View key={caregiver.id} style={[styles.caregiverCard, settings.darkMode && styles.darkCardInner]}>
              <View style={styles.caregiverInfo}>
                <Text style={[styles.caregiverName, settings.darkMode && styles.darkText]}>
                  {caregiver.name}
                </Text>
                <View style={styles.contactRow}>
                  {caregiver.method === 'email' ? (
                    <Mail size={16} color="#6B7280" />
                  ) : caregiver.method === 'sms' ? (
                    <Phone size={16} color="#6B7280" />
                  ) : (
                    <Bell size={16} color="#6B7280" />
                  )}
                  <Text style={[styles.contactText, settings.darkMode && styles.darkSubtext]}>
                    {caregiver.contact}
                  </Text>
                </View>
                <View style={styles.methodBadge}>
                  <Text style={styles.methodBadgeText}>
                    {caregiver.method.toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={styles.caregiverActions}>
                <TouchableOpacity onPress={() => openEditCaregiver(caregiver)}>
                  <Edit size={20} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteCaregiver(caregiver.id)}>
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Notification Rules Section */}
      <View style={[styles.section, settings.darkMode && styles.darkCard]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, settings.darkMode && styles.darkText]}>
            Notification Rules ({caregiverRules.length})
          </Text>
          <TouchableOpacity style={styles.addButton} onPress={openAddRule}>
            <AlertTriangle size={20} color="#3B82F6" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {caregiverRules.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, settings.darkMode && styles.darkSubtext]}>
              No notification rules configured. Add rules to automate caregiver alerts.
            </Text>
          </View>
        ) : (
          caregiverRules.map(rule => (
            <View key={rule.id} style={[styles.ruleCard, settings.darkMode && styles.darkCardInner]}>
              <View style={styles.ruleInfo}>
                <View style={styles.ruleHeader}>
                  <Text style={[styles.ruleTitle, settings.darkMode && styles.darkText]}>
                    {getTriggerLabel(rule.trigger)}
                  </Text>
                  <View style={[styles.statusBadge, rule.enabled ? styles.enabledBadge : styles.disabledBadge]}>
                    <Text style={styles.statusText}>
                      {rule.enabled ? 'Enabled' : 'Disabled'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.ruleDetail, settings.darkMode && styles.darkSubtext]}>
                  Medicine: {getMedicineName(rule.medicineId)}
                </Text>
                <Text style={[styles.ruleDetail, settings.darkMode && styles.darkSubtext]}>
                  Threshold: {rule.threshold} {rule.trigger === 'low_adherence' ? '%' : 'minutes'}
                </Text>
              </View>
              <View style={styles.ruleActions}>
                <TouchableOpacity onPress={() => openEditRule(rule)}>
                  <Edit size={20} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteRule(rule.id)}>
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Test Notifications Button */}
      {caregivers.length > 0 && (
        <TouchableOpacity 
          style={[styles.testButton, isSendingTest && styles.testButtonDisabled]} 
          onPress={handleTestNotification}
          disabled={isSendingTest}
        >
          {isSendingTest ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.testButtonText}>Sending...</Text>
            </>
          ) : (
            <>
              <Send size={20} color="#FFFFFF" />
              <Text style={styles.testButtonText}>Test Notifications</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Integration Info */}
      <View style={[styles.integrationInfo, settings.darkMode && styles.darkCard]}>
        <Text style={[styles.integrationTitle, settings.darkMode && styles.darkText]}>
          Integration Setup Required:
        </Text>
        <Text style={[styles.integrationText, settings.darkMode && styles.darkSubtext]}>
          • Email: Configure EmailJS or Firebase Cloud Functions
        </Text>
        <Text style={[styles.integrationText, settings.darkMode && styles.darkSubtext]}>
          • SMS: Configure Twilio credentials
        </Text>
        <Text style={[styles.integrationText, settings.darkMode && styles.darkSubtext]}>
          • Push: Enable push notifications in app settings
        </Text>
      </View>

      {/* Caregiver Modal */}
      <Modal
        visible={caregiverModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCaregiverModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, settings.darkMode && styles.darkCard]}>
            <Text style={[styles.modalTitle, settings.darkMode && styles.darkText]}>
              {editingCaregiver ? 'Edit Caregiver' : 'Add Caregiver'}
            </Text>

            <Text style={[styles.label, settings.darkMode && styles.darkSubtext]}>Name</Text>
            <TextInput
              style={[styles.input, settings.darkMode && styles.darkInput]}
              placeholder="Caregiver name"
              placeholderTextColor={settings.darkMode ? '#9CA3AF' : '#6B7280'}
              value={caregiverName}
              onChangeText={setCaregiverName}
            />

            <Text style={[styles.label, settings.darkMode && styles.darkSubtext]}>
              {caregiverMethod === 'sms' ? 'Phone Number' : caregiverMethod === 'email' ? 'Email Address' : 'User ID'}
            </Text>
            <TextInput
              style={[styles.input, settings.darkMode && styles.darkInput]}
              placeholder={
                caregiverMethod === 'sms' 
                  ? '1234567890' 
                  : caregiverMethod === 'email' 
                  ? 'email@example.com' 
                  : 'User ID or device token'
              }
              placeholderTextColor={settings.darkMode ? '#9CA3AF' : '#6B7280'}
              value={caregiverContact}
              onChangeText={setCaregiverContact}
              keyboardType={caregiverMethod === 'sms' ? 'phone-pad' : 'default'}
              maxLength={caregiverMethod === 'sms' ? 10 : undefined}
            />
            
            {/* Show Carrier Selector for SMS */}
            {caregiverMethod === 'sms' && (
              <>
                <Text style={[styles.label, settings.darkMode && styles.darkSubtext, { marginTop: 12 }]}>Carrier</Text>
                <View style={styles.carrierGrid}>
                  {(Object.keys(EmailToSMSGateways) as Array<keyof typeof EmailToSMSGateways>).map(carrier => (
                    <TouchableOpacity
                      key={carrier}
                      style={[
                        styles.carrierButton,
                        caregiverCarrier === carrier && styles.carrierButtonActive,
                        settings.darkMode && styles.darkInput,
                      ]}
                      onPress={() => setCaregiverCarrier(carrier)}
                    >
                      <Text
                        style={[
                          styles.carrierButtonText,
                          caregiverCarrier === carrier && styles.carrierButtonTextActive,
                          settings.darkMode && caregiverCarrier !== carrier && styles.darkSubtext,
                        ]}
                      >
                        {carrier}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={[styles.helperText, settings.darkMode && styles.darkSubtext]}>
                  💡 Enter 10-digit phone number. We'll format it automatically!
                </Text>
              </>
            )}

            <Text style={[styles.label, settings.darkMode && styles.darkSubtext]}>Method</Text>
            <View style={styles.methodButtons}>
              {(['email', 'sms', 'push'] as const).map(method => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.methodButton,
                    caregiverMethod === method && styles.methodButtonActive,
                  ]}
                  onPress={() => setCaregiverMethod(method)}
                >
                  <Text
                    style={[
                      styles.methodButtonText,
                      caregiverMethod === method && styles.methodButtonTextActive,
                    ]}
                  >
                    {method.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCaregiverModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveCaregiver}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rule Modal */}
      <Modal
        visible={ruleModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRuleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, settings.darkMode && styles.darkCard]}>
            <Text style={[styles.modalTitle, settings.darkMode && styles.darkText]}>
              {editingRule ? 'Edit Rule' : 'Add Notification Rule'}
            </Text>

            <Text style={[styles.label, settings.darkMode && styles.darkSubtext]}>Trigger Type</Text>
            <View style={styles.methodButtons}>
              {(['missed_dose', 'low_adherence', 'critical_missed'] as const).map(trigger => (
                <TouchableOpacity
                  key={trigger}
                  style={[
                    styles.triggerButton,
                    ruleTrigger === trigger && styles.methodButtonActive,
                  ]}
                  onPress={() => setRuleTrigger(trigger)}
                >
                  <Text
                    style={[
                      styles.triggerButtonText,
                      ruleTrigger === trigger && styles.methodButtonTextActive,
                    ]}
                  >
                    {getTriggerLabel(trigger)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, settings.darkMode && styles.darkSubtext]}>
              Medicine (optional - leave empty for all)
            </Text>
            <View style={[styles.picker, settings.darkMode && styles.darkInput]}>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => {
                  Alert.alert(
                    'Select Medicine',
                    'Choose a specific medicine or leave as "All Medicines"',
                    [
                      { text: 'All Medicines', onPress: () => setRuleMedicineId('') },
                      ...medicines.map(med => ({
                        text: med.name,
                        onPress: () => setRuleMedicineId(med.id),
                      })),
                      { text: 'Cancel', style: 'cancel' },
                    ]
                  );
                }}
              >
                <Text style={[styles.pickerText, settings.darkMode && styles.darkText]}>
                  {getMedicineName(ruleMedicineId)}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, settings.darkMode && styles.darkSubtext]}>
              Threshold ({ruleTrigger === 'low_adherence' ? 'percentage' : 'minutes'})
            </Text>
            <TextInput
              style={[styles.input, settings.darkMode && styles.darkInput]}
              placeholder="30"
              placeholderTextColor={settings.darkMode ? '#9CA3AF' : '#6B7280'}
              value={ruleThreshold}
              onChangeText={setRuleThreshold}
              keyboardType="numeric"
            />

            <View style={styles.switchRow}>
              <Text style={[styles.label, settings.darkMode && styles.darkSubtext]}>Enabled</Text>
              <Switch
                value={ruleEnabled}
                onValueChange={setRuleEnabled}
                trackColor={{ false: '#D1D5DB', true: '#60A5FA' }}
                thumbColor={ruleEnabled ? '#3B82F6' : '#F3F4F6'}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setRuleModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveRule}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EBF8FF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  darkCard: {
    backgroundColor: '#1F2937',
  },
  darkCardInner: {
    backgroundColor: '#374151',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  darkText: {
    color: '#F9FAFB',
  },
  darkSubtext: {
    color: '#9CA3AF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
  },
  addButtonText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  caregiverCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 12,
  },
  caregiverInfo: {
    flex: 1,
  },
  caregiverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
  },
  methodBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  methodBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
  },
  caregiverActions: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  ruleCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 12,
  },
  ruleInfo: {
    flex: 1,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ruleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  enabledBadge: {
    backgroundColor: '#D1FAE5',
  },
  disabledBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  ruleDetail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  ruleActions: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#3B82F6',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  testButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.7,
  },
  testButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  integrationInfo: {
    backgroundColor: '#FEF3C7',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  integrationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  integrationText: {
    fontSize: 13,
    color: '#78350F',
    marginBottom: 4,
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
  },
  darkInput: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
    color: '#F9FAFB',
  },
  methodButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  methodButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  methodButtonActive: {
    backgroundColor: '#3B82F6',
  },
  methodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  methodButtonTextActive: {
    color: '#FFF',
  },
  triggerButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  triggerButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
  },
  pickerButton: {
    padding: 12,
  },
  pickerText: {
    fontSize: 14,
    color: '#111827',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6B7280',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  carrierGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  carrierButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: '30%',
    alignItems: 'center',
  },
  carrierButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  carrierButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  carrierButtonTextActive: {
    color: '#FFF',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
