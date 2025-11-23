import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { 
  Bell, 
  Calendar, 
  Users, 
  CheckCircle, 
  ChevronRight,
  Upload,
  User,
  Shield
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingScreenProps {
  onComplete: (mode: 'local' | 'cloud') => void;
}

interface Slide {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const slides: Slide[] = [
    {
      id: '1',
      title: 'Track Your Medications',
      description: 'Never miss a dose! Keep track of all your medicines with dosage times, instructions, and reminders.',
      icon: <Calendar size={80} color="#3B82F6" />,
      color: '#EBF8FF',
    },
    {
      id: '2',
      title: 'Smart Reminders',
      description: 'Get timely notifications for each medication. Customize reminder times and snooze options.',
      icon: <Bell size={80} color="#10B981" />,
      color: '#D1FAE5',
    },
    {
      id: '3',
      title: 'Caregiver Alerts',
      description: 'Keep your caregivers informed. Automatic alerts when you miss doses or adherence drops.',
      icon: <Users size={80} color="#F59E0B" />,
      color: '#FEF3C7',
    },
    {
      id: '4',
      title: 'Track Your Progress',
      description: 'View detailed reports, adherence statistics, and export your medication history anytime.',
      icon: <CheckCircle size={80} color="#8B5CF6" />,
      color: '#EDE9FE',
    },
  ];

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex });
      setCurrentIndex(nextIndex);
    }
  };

  const handleSkip = () => {
    showModeSelection();
  };

  const handleGetStarted = () => {
    showModeSelection();
  };

  const showModeSelection = () => {
    Alert.alert(
      'Choose Mode',
      'Select how you want to use the app:',
      [
        {
          text: 'Local Only',
          onPress: async () => {
            await AsyncStorage.setItem('onboarding_complete', 'true');
            await AsyncStorage.setItem('app_mode', 'local');
            onComplete('local');
          },
        },
        {
          text: 'Cloud Sync',
          onPress: () => {
            Alert.alert(
              'Cloud Sync',
              'Cloud sync with Firebase requires configuration. For now, starting in Local mode. You can enable cloud sync later in Settings.',
              [
                {
                  text: 'OK',
                  onPress: async () => {
                    await AsyncStorage.setItem('onboarding_complete', 'true');
                    await AsyncStorage.setItem('app_mode', 'local');
                    onComplete('local');
                  },
                },
              ]
            );
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const showImportOption = () => {
    Alert.alert(
      'Import Data',
      'Would you like to import existing medication data from a JSON file?',
      [
        {
          text: 'Import',
          onPress: () => {
            Alert.alert(
              'Import Feature',
              'JSON import functionality requires react-native-document-picker.\n\nTo implement:\nnpm install react-native-document-picker\n\nFor now, you can add medications manually.',
              [{ text: 'OK', onPress: showModeSelection }]
            );
          },
        },
        {
          text: 'Skip',
          onPress: showModeSelection,
        },
      ]
    );
  };

  const requestPermissions = async () => {
    // Note: Actual permission requests should be done with expo-permissions
    Alert.alert(
      'Permissions Required',
      'This app needs the following permissions:\n\n• Notifications - To remind you about medications\n• Storage - To save your data locally\n• Camera (optional) - To attach medicine images',
      [
        {
          text: 'Grant Permissions',
          onPress: showImportOption,
        },
        {
          text: 'Later',
          onPress: showImportOption,
        },
      ]
    );
  };

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={styles.slide}>
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        {item.icon}
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {slides.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentIndex && styles.activeDot,
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={event => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />

      {renderDots()}

      <View style={styles.footer}>
        {currentIndex < slides.length - 1 ? (
          <>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
              <Text style={styles.nextText}>Next</Text>
              <ChevronRight size={20} color="#FFF" />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={requestPermissions} style={styles.getStartedButton}>
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#3B82F6',
    width: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  skipButton: {
    padding: 16,
  },
  skipText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  nextText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  getStartedButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  getStartedText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '700',
  },
});
