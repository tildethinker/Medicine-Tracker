import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { useApp } from '../contexts/AppContext';
import Dashboard from '../components/Dashboard';
import DailyTracker from '../components/DailyTracker';
import MedicineManager from '../components/MedicineManager';
import HistoryReports from '../components/HistoryReports';
import CaregiverNotifications from '../components/CaregiverNotifications';
import ProfileManager from '../components/ProfileManager';
import Settings from '../components/Settings';
import {
  Home,
  Calendar,
  Pill,
  BarChart3,
  Users,
  User,
  Settings as SettingsIcon,
} from 'lucide-react-native';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { state } = useApp();
  const { settings } = state;

  const getTabBarIcon = (routeName: string, focused: boolean, color: string, size: number) => {
    const iconColor = focused ? '#3B82F6' : '#6B7280';

    switch (routeName) {
      case 'Dashboard':
        return <Home size={size} color={iconColor} />;
      case 'Track':
        return <Calendar size={size} color={iconColor} />;
      case 'Medicines':
        return <Pill size={size} color={iconColor} />;
      case 'History':
        return <BarChart3 size={size} color={iconColor} />;
      case 'Caregivers':
        return <Users size={size} color={iconColor} />;
      case 'Profile':
        return <User size={size} color={iconColor} />;
      case 'Settings':
        return <SettingsIcon size={size} color={iconColor} />;
      default:
        return <Home size={size} color={iconColor} />;
    }
  };

  return (
    <NavigationContainer>
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
          component={Settings}
          options={{
            title: 'Settings',
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
});
