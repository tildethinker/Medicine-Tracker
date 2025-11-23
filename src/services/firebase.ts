import { Alert } from 'react-native';
import { Medicine, MedicineIntake, UserProfile, AppSettings } from '../types';

// Define Caregiver type locally if not in main types
interface Caregiver {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  relationship?: string;
}

// Dynamic Firebase imports to avoid build-time errors
let auth: any = null;
let firestore: any = null;

const loadFirebase = async () => {
  try {
    const authModule = await import('@react-native-firebase/auth');
    const firestoreModule = await import('@react-native-firebase/firestore');
    auth = authModule.default;
    firestore = firestoreModule.default;
    return true;
  } catch (e) {
    console.warn('Firebase modules not available');
    return false;
  }
};

/**
 * Firebase integration service
 * Provides authentication, Firestore sync, and real-time updates
 * Note: Requires native build (not available in Expo Go)
 */

export class FirebaseService {
  private static initialized = false;
  private static firebaseLoaded = false;

  /**
   * Check if Firebase is available
   * In development builds with expo-dev-client, Firebase is always available
   */
  static isAvailable(): boolean {
    return this.firebaseLoaded && auth !== null && firestore !== null;
  }

  /**
   * Initialize Firebase
   */
  static async init(): Promise<void> {
    try {
      // Try to load Firebase modules
      this.firebaseLoaded = await loadFirebase();
      
      if (!this.firebaseLoaded) {
        console.log('Firebase not available - app will work in local-only mode');
        return;
      }

      // Firebase is automatically initialized by the @react-native-firebase/app plugin
      this.initialized = true;
      console.log('Firebase service initialized successfully');
      
      // Log current auth state
      const user = auth().currentUser;
      if (user) {
        console.log('Already signed in as:', user.email);
      }
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      // Don't throw - allow app to continue in local mode
    }
  }

  /**
   * Sign in with email and password
   */
  static async signInWithEmail(email: string, password: string): Promise<any> {
    if (!this.isAvailable()) {
      Alert.alert(
        'Firebase Not Available',
        'Firebase authentication requires a development build. Currently running in Expo Go with local storage only.',
        [{ text: 'OK' }]
      );
      return null;
    }

    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      console.log('User signed in successfully:', userCredential.user.email);
      return userCredential.user;
    } catch (error: any) {
      console.error('Error signing in:', error);
      
      // User-friendly error messages
      let errorMessage = 'Failed to sign in. Please try again.';
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      Alert.alert('Sign In Error', errorMessage);
      throw error;
    }
  }

  /**
   * Sign up with email and password
   */
  static async signUpWithEmail(email: string, password: string): Promise<any> {
    if (!this.isAvailable()) {
      Alert.alert(
        'Firebase Not Available',
        'Firebase authentication requires a development build. Currently running in Expo Go with local storage only.',
        [{ text: 'OK' }]
      );
      return null;
    }

    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      console.log('User signed up successfully:', userCredential.user.email);
      
      // Send email verification
      await userCredential.user.sendEmailVerification();
      console.log('Verification email sent');
      
      return userCredential.user;
    } catch (error: any) {
      console.error('Error signing up:', error);
      
      // User-friendly error messages
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password authentication is not enabled.';
      }
      
      Alert.alert('Sign Up Error', errorMessage);
      throw error;
    }
  }

  /**
   * Sign out
   */
  static async signOut(): Promise<void> {
    if (!this.isAvailable()) {
      console.log('Firebase not available - skipping sign out');
      return;
    }

    try {
      await auth().signOut();
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Sign Out Error', 'Failed to sign out. Please try again.');
      throw error;
    }
  }

  /**
   * Get current user
   */
  static getCurrentUser(): any {
    if (!this.isAvailable()) {
      return null;
    }
    return auth().currentUser;
  }

  /**
   * Sync medicines to Firestore
   */
  static async syncMedicines(userId: string, medicines: Medicine[]): Promise<void> {
    if (!this.isAvailable()) {
      console.log('Firebase not available - skipping medicine sync');
      return;
    }

    try {
      const batch = firestore().batch();
      const collectionRef = firestore().collection('medicines');
      
      medicines.forEach(medicine => {
        const docRef = collectionRef.doc(medicine.id);
        batch.set(docRef, {
          ...medicine,
          userId,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      });
      
      await batch.commit();
      console.log(`Synced ${medicines.length} medicines to Firestore`);
    } catch (error) {
      console.error('Error syncing medicines:', error);
      throw error;
    }
  }

  /**
   * Sync intakes to Firestore
   */
  static async syncIntakes(userId: string, intakes: MedicineIntake[]): Promise<void> {
    if (!this.isAvailable()) {
      console.log('Firebase not available - skipping intake sync');
      return;
    }

    try {
      const batch = firestore().batch();
      const collectionRef = firestore().collection('medicineHistory');
      
      intakes.forEach(intake => {
        const docRef = collectionRef.doc(intake.id);
        batch.set(docRef, {
          ...intake,
          userId,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      });
      
      await batch.commit();
      console.log(`Synced ${intakes.length} intakes to Firestore`);
    } catch (error) {
      console.error('Error syncing intakes:', error);
      throw error;
    }
  }

  /**
   * Fetch medicines from Firestore
   */
  static async fetchMedicines(userId: string): Promise<Medicine[]> {
    if (!this.isAvailable()) {
      console.log('Firebase not available - returning empty medicines array');
      return [];
    }

    try {
      const snapshot = await firestore()
        .collection('medicines')
        .where('userId', '==', userId)
        .get();
      
      const medicines = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      })) as Medicine[];
      
      console.log(`Fetched ${medicines.length} medicines from Firestore`);
      return medicines;
    } catch (error) {
      console.error('Error fetching medicines:', error);
      throw error;
    }
  }

  /**
   * Fetch intakes from Firestore
   */
  static async fetchIntakes(userId: string, startDate?: string, endDate?: string): Promise<MedicineIntake[]> {
    try {
      let query = firestore()
        .collection('medicineHistory')
        .where('userId', '==', userId);
      
      if (startDate) {
        query = query.where('date', '>=', startDate);
      }
      if (endDate) {
        query = query.where('date', '<=', endDate);
      }
      
      const snapshot = await query.get();
      
      const intakes = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      })) as MedicineIntake[];
      
      console.log(`Fetched ${intakes.length} intakes from Firestore`);
      return intakes;
    } catch (error) {
      console.error('Error fetching intakes:', error);
      throw error;
    }
  }

  /**
   * Sync profile to Firestore
   */
  static async syncProfile(userId: string, profile: UserProfile): Promise<void> {
    if (!this.isAvailable()) {
      console.log('Firebase not available - skipping profile sync');
      return;
    }

    try {
      await firestore()
        .collection('profiles')
        .doc(userId)
        .set({
          ...profile,
          userId,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

      console.log('Profile synced to Firestore');
    } catch (error) {
      console.error('Error syncing profile:', error);
      throw error;
    }
  }

  /**
   * Fetch profile from Firestore
   */
  static async fetchProfile(userId: string): Promise<UserProfile | null> {
    if (!this.isAvailable()) {
      console.log('Firebase not available - returning null profile');
      return null;
    }

    try {
      const doc = await firestore()
        .collection('profiles')
        .doc(userId)
        .get();
      
      if (doc.exists()) {
        console.log('Profile fetched from Firestore');
        return doc.data() as UserProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  /**
   * Sync caregivers to Firestore
   */
  static async syncCaregivers(userId: string, caregivers: Caregiver[]): Promise<void> {
    if (!this.isAvailable()) {
      console.log('Firebase not available - skipping caregiver sync');
      return;
    }

    try {
      const batch = firestore().batch();
      const collectionRef = firestore().collection('caregivers');
      
      caregivers.forEach(caregiver => {
        const docRef = collectionRef.doc(caregiver.id);
        batch.set(docRef, {
          ...caregiver,
          userId,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      });
      
      await batch.commit();
      console.log(`Synced ${caregivers.length} caregivers to Firestore`);
    } catch (error) {
      console.error('Error syncing caregivers:', error);
      throw error;
    }
  }

  /**
   * Fetch caregivers from Firestore
   */
  static async fetchCaregivers(userId: string): Promise<Caregiver[]> {
    if (!this.isAvailable()) {
      console.log('Firebase not available - returning empty caregivers array');
      return [];
    }

    try {
      const snapshot = await firestore()
        .collection('caregivers')
        .where('userId', '==', userId)
        .get();
      
      const caregivers = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      console.log(`Fetched ${caregivers.length} caregivers from Firestore`);
      return caregivers;
    } catch (error) {
      console.error('Error fetching caregivers:', error);
      throw error;
    }
  }

  /**
   * Setup real-time sync listeners
   */
  static setupRealtimeSync(
    userId: string,
    onMedicinesUpdate: (medicines: Medicine[]) => void,
    onIntakesUpdate: (intakes: MedicineIntake[]) => void
  ): () => void {
    if (!this.isAvailable()) {
      console.log('Firebase not available - real-time sync disabled');
      return () => {}; // Return empty unsubscribe function
    }

    // Listen to medicines collection
    const unsubscribeMedicines = firestore()
      .collection('medicines')
      .where('userId', '==', userId)
      .onSnapshot(
        (snapshot: any) => {
          const medicines = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
          })) as Medicine[];
          console.log(`Real-time update: ${medicines.length} medicines`);
          onMedicinesUpdate(medicines);
        },
        (error: any) => {
          console.error('Error in medicines real-time listener:', error);
        }
      );
    
    // Listen to medicineHistory collection
    const unsubscribeIntakes = firestore()
      .collection('medicineHistory')
      .where('userId', '==', userId)
      .onSnapshot(
        (snapshot: any) => {
          const intakes = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
          })) as MedicineIntake[];
          console.log(`Real-time update: ${intakes.length} intakes`);
          onIntakesUpdate(intakes);
        },
        (error: any) => {
          console.error('Error in intakes real-time listener:', error);
        }
      );
    
    console.log('Real-time sync listeners established');
    
    // Return cleanup function
    return () => {
      unsubscribeMedicines();
      unsubscribeIntakes();
      console.log('Real-time sync listeners cleaned up');
    };
  }

  /**
   * Delete a medicine from Firestore
   */
  static async deleteMedicine(medicineId: string): Promise<void> {
    try {
      await firestore()
        .collection('medicines')
        .doc(medicineId)
        .delete();
      
      console.log('Medicine deleted from Firestore');
    } catch (error) {
      console.error('Error deleting medicine:', error);
      throw error;
    }
  }

  /**
   * Delete an intake from Firestore
   */
  static async deleteIntake(intakeId: string): Promise<void> {
    try {
      await firestore()
        .collection('medicineHistory')
        .doc(intakeId)
        .delete();
      
      console.log('Intake deleted from Firestore');
    } catch (error) {
      console.error('Error deleting intake:', error);
      throw error;
    }
  }
}
