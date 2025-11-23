import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppProvider } from './src/contexts/AppContext';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/components/SplashScreen';
import OnboardingScreen from './src/components/OnboardingScreen';
import { EmailConfig } from './src/config/services.config';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check EmailJS configuration
      if (EmailConfig.publicKey && !EmailConfig.publicKey.includes('YOUR_PUBLIC_KEY')) {
        console.log('✅ EmailJS configured successfully');
      } else {
        console.warn('⚠️ EmailJS not configured. Update src/config/services.config.ts');
      }

      // Check onboarding status
      const onboardingComplete = await AsyncStorage.getItem('onboarding_complete');
      setShowOnboarding(!onboardingComplete);
    } catch (error) {
      console.error('Error initializing app:', error);
      setShowOnboarding(true);
    }
  };

  const handleSplashFinish = () => {
    setIsLoading(false);
  };

  const handleOnboardingComplete = async (mode: 'local' | 'cloud') => {
    setShowOnboarding(false);
  };

  if (isLoading) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <AuthProvider>
      <AppProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </AppProvider>
    </AuthProvider>
  );
}
