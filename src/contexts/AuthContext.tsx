import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { FirebaseService } from '../services/firebase';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        console.log('User authenticated:', user.email);
      } else {
        console.log('User not authenticated');
      }
    });

    // Initialize Firebase
    FirebaseService.init().catch(error => {
      console.error('Failed to initialize Firebase:', error);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await FirebaseService.signInWithEmail(email, password);
      Alert.alert('Success', 'Welcome back!');
    } catch (error: any) {
      console.error('Sign in error:', error);
      // Error alert already shown by FirebaseService
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      await FirebaseService.signUpWithEmail(email, password);
      Alert.alert(
        'Account Created',
        'Please check your email to verify your account.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Sign up error:', error);
      // Error alert already shown by FirebaseService
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await FirebaseService.signOut();
      Alert.alert('Signed Out', 'You have been signed out successfully.');
    } catch (error: any) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
