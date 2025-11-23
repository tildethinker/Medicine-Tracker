import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  StyleSheet,
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import {
  Settings as SettingsIcon,
  Moon,
  Bell,
  Clock,
  Download,
  Upload,
  Trash2,
  Info,
} from 'lucide-react-native';

export default function Settings() {
  const { state, updateSettings, exportData, importData } = useApp();
  const { settings } = state;

  const handleExport = async () => {
    try {
      const data = await exportData();
      Alert.alert(
        'Export Successful',
        'Data exported successfully. You can now share or backup this data.',
        [
          {
            text: 'Share',
            onPress: () => {
              // In a real app, you'd use Share API here
              Alert.alert('Share', 'Sharing functionality would be implemented here');
            },
          },
          { text: 'OK' },
        ]
      );
      console.log('Exported data:', data);
    } catch (error) {
      Alert.alert('Export Failed', 'Failed to export data');
    }
  };

  const handleImport = () => {
    Alert.alert(
      'Import Data',
      'This will replace all current data. Make sure you have a backup. Import functionality would typically use file picker or paste from clipboard.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          onPress: () => {
            // In a real app, you'd use DocumentPicker or Clipboard API here
            Alert.alert('Import', 'Import functionality would be implemented here');
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all medicines, intake history, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: () => {
            // In a real app, you'd implement data clearing here
            Alert.alert('Clear Data', 'Data clearing functionality would be implemented here');
          },
        },
      ]
    );
  };

  const toggleDarkMode = () => {
    updateSettings({ darkMode: !settings.darkMode });
  };

  const toggleNotifications = () => {
    updateSettings({ notifications: { ...settings.notifications, enabled: !settings.notifications.enabled } });
  };

  const toggleSound = () => {
    updateSettings({ notifications: { ...settings.notifications, soundEnabled: !settings.notifications.soundEnabled } });
  };

  return (
    <ScrollView style={[styles.container, settings.darkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={[styles.title, settings.darkMode && styles.darkText]}>
          Settings
        </Text>
      </View>

      <View style={styles.content}>
        {/* Appearance */}
        <View style={[styles.section, settings.darkMode && styles.darkCard]}>
          <View style={styles.sectionHeader}>
            <Moon size={24} color="#8B5CF6" />
            <Text style={[styles.sectionTitle, settings.darkMode && styles.darkText]}>
              Appearance
            </Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, settings.darkMode && styles.darkText]}>
                Dark Mode
              </Text>
              <Text style={[styles.settingDescription, settings.darkMode && styles.darkText]}>
                Switch between light and dark themes
              </Text>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
              thumbColor={settings.darkMode ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Notifications */}
        <View style={[styles.section, settings.darkMode && styles.darkCard]}>
          <View style={styles.sectionHeader}>
            <Bell size={24} color="#F59E0B" />
            <Text style={[styles.sectionTitle, settings.darkMode && styles.darkText]}>
              Notifications
            </Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, settings.darkMode && styles.darkText]}>
                Enable Notifications
              </Text>
              <Text style={[styles.settingDescription, settings.darkMode && styles.darkText]}>
                Receive reminders for medicine intake
              </Text>
            </View>
            <Switch
              value={settings.notifications.enabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
              thumbColor={settings.notifications.enabled ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>

          {settings.notifications.enabled && (
            <>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, settings.darkMode && styles.darkText]}>
                    Sound
                  </Text>
                  <Text style={[styles.settingDescription, settings.darkMode && styles.darkText]}>
                    Play sound with notifications
                  </Text>
                </View>
                <Switch
                  value={settings.notifications.soundEnabled}
                  onValueChange={toggleSound}
                  trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                  thumbColor={settings.notifications.soundEnabled ? '#FFFFFF' : '#F3F4F6'}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, settings.darkMode && styles.darkText]}>
                    Lead Time
                  </Text>
                  <Text style={[styles.settingDescription, settings.darkMode && styles.darkText]}>
                    Minutes before scheduled time to notify
                  </Text>
                </View>
                <Text style={[styles.settingValue, settings.darkMode && styles.darkText]}>
                  {settings.notifications.leadTime} min
                </Text>
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, settings.darkMode && styles.darkText]}>
                    Snooze Time
                  </Text>
                  <Text style={[styles.settingDescription, settings.darkMode && styles.darkText]}>
                    Minutes to snooze reminders
                  </Text>
                </View>
                <Text style={[styles.settingValue, settings.darkMode && styles.darkText]}>
                  {settings.notifications.snoozeTime} min
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Time Format */}
        <View style={[styles.section, settings.darkMode && styles.darkCard]}>
          <View style={styles.sectionHeader}>
            <Clock size={24} color="#10B981" />
            <Text style={[styles.sectionTitle, settings.darkMode && styles.darkText]}>
              Time Format
            </Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, settings.darkMode && styles.darkText]}>
                12/24 Hour Format
              </Text>
              <Text style={[styles.settingDescription, settings.darkMode && styles.darkText]}>
                Choose your preferred time display
              </Text>
            </View>
            <TouchableOpacity
              style={styles.timeFormatButton}
              onPress={() => updateSettings({ timeFormat: settings.timeFormat === '12h' ? '24h' : '12h' })}
            >
              <Text style={styles.timeFormatText}>
                {settings.timeFormat === '12h' ? '12 Hour' : '24 Hour'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Data Management */}
        <View style={[styles.section, settings.darkMode && styles.darkCard]}>
          <View style={styles.sectionHeader}>
            <Download size={24} color="#3B82F6" />
            <Text style={[styles.sectionTitle, settings.darkMode && styles.darkText]}>
              Data Management
            </Text>
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleExport}
          >
            <Download size={20} color="#3B82F6" />
            <View style={styles.actionInfo}>
              <Text style={[styles.actionTitle, settings.darkMode && styles.darkText]}>
                Export Data
              </Text>
              <Text style={[styles.actionDescription, settings.darkMode && styles.darkText]}>
                Backup your medicines and history
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleImport}
          >
            <Upload size={20} color="#10B981" />
            <View style={styles.actionInfo}>
              <Text style={[styles.actionTitle, settings.darkMode && styles.darkText]}>
                Import Data
              </Text>
              <Text style={[styles.actionDescription, settings.darkMode && styles.darkText]}>
                Restore from backup
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleClearData}
          >
            <Trash2 size={20} color="#EF4444" />
            <View style={styles.actionInfo}>
              <Text style={[styles.dangerTitle, settings.darkMode && styles.darkText]}>
                Clear All Data
              </Text>
              <Text style={[styles.actionDescription, settings.darkMode && styles.darkText]}>
                Permanently delete everything
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={[styles.section, settings.darkMode && styles.darkCard]}>
          <View style={styles.sectionHeader}>
            <Info size={24} color="#6B7280" />
            <Text style={[styles.sectionTitle, settings.darkMode && styles.darkText]}>
              About
            </Text>
          </View>

          <View style={styles.aboutInfo}>
            <Text style={[styles.appName, settings.darkMode && styles.darkText]}>
              Medicine Tracker
            </Text>
            <Text style={[styles.version, settings.darkMode && styles.darkText]}>
              Version 1.0.0
            </Text>
            <Text style={[styles.description, settings.darkMode && styles.darkText]}>
              A comprehensive medicine tracking app to help you stay on top of your medication schedule.
            </Text>
          </View>
        </View>
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
    padding: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  timeFormatButton: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  timeFormatText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dangerButton: {
    borderBottomWidth: 0,
  },
  actionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  actionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  aboutInfo: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  version: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  darkText: {
    color: '#F9FAFB',
  },
});
