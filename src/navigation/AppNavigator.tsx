import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from '../components/Dashboard';
import DailyTracker from '../components/DailyTracker';
import MedicineManager from '../components/MedicineManager';
import HistoryReports from '../components/HistoryReports';
import CaregiverNotifications from '../components/CaregiverNotifications';
import ProfileManager from '../components/ProfileManager';
import Settings from '../components/Settings';
import { AuthScreen } from '../components/AuthScreen';
import {
  Home,
  Calendar,
  Pill,
  BarChart3,
  Users,
  User,
  Settings as SettingsIcon,
  LogIn,
} from 'lucide-react-native';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { state } = useApp();
  const { settings } = state;
  const { user, loading, isAuthenticated } = useAuth();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [hasSeenPrompt, setHasSeenPrompt] = useState(false);

  // Show auth prompt after 2 seconds if not authenticated and haven't seen it
  useEffect(() => {
    if (!loading && !isAuthenticated && !hasSeenPrompt) {
      const timer = setTimeout(() => {
        setShowAuthPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loading, isAuthenticated, hasSeenPrompt]);

  const handleDismissPrompt = () => {
    setShowAuthPrompt(false);
    setHasSeenPrompt(true);
  };

  const handleGoToAuth = () => {
    setShowAuthPrompt(false);
    setHasSeenPrompt(true);
    // The AuthScreen will be shown in Settings tab
  };

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <View style={[styles.loadingContainer, settings.darkMode && styles.darkBackground]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={[styles.loadingText, settings.darkMode && styles.darkText]}>
          Loading...
        </Text>
      </View>
    );
  }

  const getTabBarIcon = (routeName: string, focused: boolean, color: string, size: number) => {
    switch (routeName) {
      case 'Dashboard':
        return <Home size={size} />;
      case 'Track':
        return <Calendar size={size} />;
      case 'Medicines':
        return <Pill size={size} />;
      case 'History':
        return <BarChart3 size={size} />;
      case 'Caregivers':
        return <Users size={size} />;
      case 'Profile':
        return <User size={size} />;
      case 'Settings':
        return <SettingsIcon size={size} />;
      default:
        return <Home size={size} />;
    }
  };

  return (
    <NavigationContainer>
      {/* Auth Prompt Modal */}
      {showAuthPrompt && !isAuthenticated && (
        <View style={styles.authPromptOverlay}>
          <View style={[styles.authPromptCard, settings.darkMode && styles.darkCard]}>
            <LogIn size={48} />
            <Text style={[styles.authPromptTitle, settings.darkMode && styles.darkText]}>
              Sign In for Cloud Sync
            </Text>
            <Text style={[styles.authPromptMessage, settings.darkMode && styles.darkText]}>
              Create an account to backup your data and sync across devices
            </Text>
            <View style={styles.authPromptButtons}>
              <TouchableOpacity
                style={styles.authPromptButton}
                onPress={handleGoToAuth}
              >
                <Text style={styles.authPromptButtonText}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.authPromptDismiss}
                onPress={handleDismissPrompt}
              >
                <Text style={styles.authPromptDismissText}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) =>
            getTabBarIcon(route.name, focused, color, size),
          tabBarActiveTintColor: '#3B82F6',
          tabBarInactiveTintColor: '#6B7280',
          tabBarStyle: [
            styles.tabBar,
            settings.darkMode && styles.darkTabBar,
          ],
          tabBarLabelStyle: styles.tabBarLabel,
          headerStyle: [
            styles.header,
            settings.darkMode && styles.darkHeader,
          ],
          headerTintColor: settings.darkMode ? '#F9FAFB' : '#111827',
          headerTitleStyle: styles.headerTitle,
          tabBarActiveBackgroundColor: settings.darkMode ? '#374151' : '#EBF8FF',
          tabBarInactiveBackgroundColor: settings.darkMode ? '#1F2937' : '#FFFFFF',
        })}
      >
        <Tab.Screen
          name="Dashboard"
          component={Dashboard}
          options={{
            title: 'Medicine Tracker',
            headerRight: () => (
              <View style={styles.headerRight}>
                <Text style={[styles.headerSubtitle, settings.darkMode && styles.darkText]}>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Track"
          component={DailyTracker}
          options={{
            title: 'Daily Tracker',
          }}
        />
        <Tab.Screen
          name="Medicines"
          component={MedicineManager}
          options={{
            title: 'My Medicines',
          }}
        />
        <Tab.Screen
          name="History"
          component={HistoryReports}
          options={{
            title: 'History & Reports',
          }}
        />
        <Tab.Screen
          name="Caregivers"
          component={CaregiverNotifications}
          options={{
            title: 'Caregivers',
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileManager}
          options={{
            title: 'My Profile',
          }}
        />
        <Tab.Screen
          name="Settings"
          component={isAuthenticated ? Settings : AuthScreen}
          options={{
            title: isAuthenticated ? 'Settings' : 'Sign In',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E5E7EB',
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 5,
    paddingTop: 5,
  },
  darkTabBar: {
    backgroundColor: '#1F2937',
    borderTopColor: '#374151',
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkHeader: {
    backgroundColor: '#1F2937',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    marginRight: 16,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  darkText: {
    color: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  darkBackground: {
    backgroundColor: '#111827',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  authPromptOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    paddingHorizontal: 20,
  },
  authPromptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  darkCard: {
    backgroundColor: '#1F2937',
  },
  authPromptIcon: {
    marginBottom: 16,
  },
  authPromptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  authPromptMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  authPromptButtons: {
    width: '100%',
  },
  authPromptButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  authPromptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  authPromptDismiss: {
    padding: 12,
    alignItems: 'center',
  },
  authPromptDismissText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
});
