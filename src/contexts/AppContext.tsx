import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Medicine, MedicineIntake, UserProfile, AppSettings, CaregiverRule } from '../types';
import { DatabaseService } from '../services/database';
import { NotificationService } from '../services/notifications';

interface AppState {
  medicines: Medicine[];
  intakes: MedicineIntake[];
  profile: UserProfile | null;
  settings: AppSettings;
  caregiverRules: CaregiverRule[];
  isLoading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MEDICINES'; payload: Medicine[] }
  | { type: 'ADD_MEDICINE'; payload: Medicine }
  | { type: 'UPDATE_MEDICINE'; payload: { id: string; updates: Partial<Medicine> } }
  | { type: 'DELETE_MEDICINE'; payload: string }
  | { type: 'SET_INTAKES'; payload: MedicineIntake[] }
  | { type: 'ADD_INTAKE'; payload: MedicineIntake }
  | { type: 'UPDATE_INTAKE_STATUS'; payload: { medicineId: string; date: string; time: string; status: 'taken' | 'skipped' } }
  | { type: 'SET_PROFILE'; payload: UserProfile | null }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'SET_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_CAREGIVER_RULES'; payload: CaregiverRule[] }
  | { type: 'ADD_CAREGIVER_RULE'; payload: CaregiverRule }
  | { type: 'UPDATE_CAREGIVER_RULE'; payload: { id: string; updates: Partial<CaregiverRule> } }
  | { type: 'DELETE_CAREGIVER_RULE'; payload: string };

const initialState: AppState = {
  medicines: [],
  intakes: [],
  profile: null,
  settings: {
    darkMode: false,
    notifications: {
      enabled: true,
      leadTime: 5,
      snoozeTime: 15,
      soundEnabled: true,
    },
    localOnly: true,
    locale: 'en-US',
    timeFormat: '12h',
  },
  caregiverRules: [],
  isLoading: true,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_MEDICINES':
      return { ...state, medicines: action.payload };
    case 'ADD_MEDICINE':
      return { ...state, medicines: [...state.medicines, action.payload] };
    case 'UPDATE_MEDICINE':
      return {
        ...state,
        medicines: state.medicines.map(med =>
          med.id === action.payload.id ? { ...med, ...action.payload.updates } : med
        ),
      };
    case 'DELETE_MEDICINE':
      return {
        ...state,
        medicines: state.medicines.filter(med => med.id !== action.payload),
        intakes: state.intakes.filter(intake => intake.medicineId !== action.payload),
      };
    case 'SET_INTAKES':
      return { ...state, intakes: action.payload };
    case 'ADD_INTAKE':
      return { ...state, intakes: [...state.intakes, action.payload] };
    case 'UPDATE_INTAKE_STATUS':
      const { medicineId, date, time, status } = action.payload;
      const existingIntakeIndex = state.intakes.findIndex(
        intake => intake.medicineId === medicineId && intake.date === date && intake.time === time
      );

      if (existingIntakeIndex >= 0) {
        const updatedIntakes = [...state.intakes];
        updatedIntakes[existingIntakeIndex] = {
          ...updatedIntakes[existingIntakeIndex],
          status,
          timestamp: new Date().toISOString(),
        };
        return { ...state, intakes: updatedIntakes };
      } else {
        const newIntake: MedicineIntake = {
          id: Date.now().toString(),
          medicineId,
          date,
          time,
          status,
          timestamp: new Date().toISOString(),
        };
        return { ...state, intakes: [...state.intakes, newIntake] };
      }
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: state.profile ? { ...state.profile, ...action.payload } : null,
      };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'SET_CAREGIVER_RULES':
      return { ...state, caregiverRules: action.payload };
    case 'ADD_CAREGIVER_RULE':
      return { ...state, caregiverRules: [...state.caregiverRules, action.payload] };
    case 'UPDATE_CAREGIVER_RULE':
      return {
        ...state,
        caregiverRules: state.caregiverRules.map(rule =>
          rule.id === action.payload.id ? { ...rule, ...action.payload.updates } : rule
        ),
      };
    case 'DELETE_CAREGIVER_RULE':
      return {
        ...state,
        caregiverRules: state.caregiverRules.filter(rule => rule.id !== action.payload),
      };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Action creators
  addMedicine: (medicine: Omit<Medicine, 'id'>) => Promise<void>;
  updateMedicine: (id: string, updates: Partial<Medicine>) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;
  updateIntakeStatus: (medicineId: string, date: string, time: string, status: 'taken' | 'skipped') => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  addCaregiverRule: (rule: Omit<CaregiverRule, 'id'>) => Promise<void>;
  updateCaregiverRule: (id: string, updates: Partial<CaregiverRule>) => Promise<void>;
  deleteCaregiverRule: (id: string) => Promise<void>;
  exportData: () => Promise<string>;
  importData: (jsonData: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        // Initialize database
        await DatabaseService.init();

        // Load data
        const [medicines, intakes, profile, caregiverRules] = await Promise.all([
          DatabaseService.getMedicines(),
          DatabaseService.getIntakes(),
          DatabaseService.getProfile(),
          DatabaseService.getCaregiverRules(),
        ]);

        dispatch({ type: 'SET_MEDICINES', payload: medicines });
        dispatch({ type: 'SET_INTAKES', payload: intakes });
        dispatch({ type: 'SET_PROFILE', payload: profile });
        dispatch({ type: 'SET_CAREGIVER_RULES', payload: caregiverRules });

        // Initialize notifications
        await NotificationService.init();
        if (state.settings.notifications.enabled && medicines.length > 0) {
          await NotificationService.scheduleAllReminders(medicines, state.settings.notifications);
        }

        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        console.error('Error initializing app:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize app' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeApp();
  }, []);

  // Reschedule notifications when medicines change
  useEffect(() => {
    if (state.medicines.length > 0 && state.settings.notifications.enabled) {
      NotificationService.scheduleAllReminders(state.medicines, state.settings.notifications);
    }
  }, [state.medicines, state.settings.notifications]);

  // Action creators
  const addMedicine = async (medicine: Omit<Medicine, 'id'>) => {
    const newMedicine: Medicine = {
      ...medicine,
      id: Date.now().toString(),
    };

    try {
      await DatabaseService.saveMedicine(newMedicine);
      dispatch({ type: 'ADD_MEDICINE', payload: newMedicine });

      // Schedule notifications for new medicine
      if (state.settings.notifications.enabled) {
        await NotificationService.scheduleAllReminders([...state.medicines, newMedicine], state.settings.notifications);
      }
    } catch (error) {
      console.error('Error adding medicine:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add medicine' });
    }
  };

  const updateMedicine = async (id: string, updates: Partial<Medicine>) => {
    try {
      const updatedMedicine = { ...state.medicines.find(m => m.id === id)!, ...updates };
      await DatabaseService.saveMedicine(updatedMedicine);
      dispatch({ type: 'UPDATE_MEDICINE', payload: { id, updates } });

      // Reschedule notifications
      if (state.settings.notifications.enabled) {
        const updatedMedicines = state.medicines.map(m => m.id === id ? updatedMedicine : m);
        await NotificationService.scheduleAllReminders(updatedMedicines, state.settings.notifications);
      }
    } catch (error) {
      console.error('Error updating medicine:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update medicine' });
    }
  };

  const deleteMedicine = async (id: string) => {
    try {
      await DatabaseService.deleteMedicine(id);
      dispatch({ type: 'DELETE_MEDICINE', payload: id });

      // Reschedule notifications
      if (state.settings.notifications.enabled) {
        const remainingMedicines = state.medicines.filter(m => m.id !== id);
        await NotificationService.scheduleAllReminders(remainingMedicines, state.settings.notifications);
      }
    } catch (error) {
      console.error('Error deleting medicine:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete medicine' });
    }
  };

  const updateIntakeStatus = async (medicineId: string, date: string, time: string, status: 'taken' | 'skipped') => {
    try {
      dispatch({ type: 'UPDATE_INTAKE_STATUS', payload: { medicineId, date, time, status } });

      // Save to database
      const intake = state.intakes.find(
        i => i.medicineId === medicineId && i.date === date && i.time === time
      ) || {
        id: Date.now().toString(),
        medicineId,
        date,
        time,
        status,
        timestamp: new Date().toISOString(),
      };

      const updatedIntake = { ...intake, status, timestamp: new Date().toISOString() };
      await DatabaseService.saveIntake(updatedIntake);
    } catch (error) {
      console.error('Error updating intake status:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update intake status' });
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const updatedProfile = state.profile ? { ...state.profile, ...updates } : updates as UserProfile;
      await DatabaseService.saveProfile(updatedProfile);
      dispatch({ type: 'UPDATE_PROFILE', payload: updates });
    } catch (error) {
      console.error('Error updating profile:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update profile' });
    }
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    try {
      dispatch({ type: 'SET_SETTINGS', payload: updates });

      // Handle notification settings changes
      if (updates.notifications) {
        if (updates.notifications.enabled) {
          await NotificationService.scheduleAllReminders(state.medicines, updates.notifications);
        } else {
          await NotificationService.cancelAllNotifications();
        }
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update settings' });
    }
  };

  const addCaregiverRule = async (rule: Omit<CaregiverRule, 'id'>) => {
    const newRule: CaregiverRule = {
      ...rule,
      id: Date.now().toString(),
    };

    try {
      await DatabaseService.saveCaregiverRule(newRule);
      dispatch({ type: 'ADD_CAREGIVER_RULE', payload: newRule });
    } catch (error) {
      console.error('Error adding caregiver rule:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add caregiver rule' });
    }
  };

  const updateCaregiverRule = async (id: string, updates: Partial<CaregiverRule>) => {
    try {
      const updatedRule = { ...state.caregiverRules.find(r => r.id === id)!, ...updates };
      await DatabaseService.saveCaregiverRule(updatedRule);
      dispatch({ type: 'UPDATE_CAREGIVER_RULE', payload: { id, updates } });
    } catch (error) {
      console.error('Error updating caregiver rule:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update caregiver rule' });
    }
  };

  const deleteCaregiverRule = async (id: string) => {
    try {
      // Note: DatabaseService doesn't have deleteCaregiverRule, we'd need to add it
      dispatch({ type: 'DELETE_CAREGIVER_RULE', payload: id });
    } catch (error) {
      console.error('Error deleting caregiver rule:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete caregiver rule' });
    }
  };

  const exportData = async (): Promise<string> => {
    try {
      return await DatabaseService.exportData();
    } catch (error) {
      console.error('Error exporting data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to export data' });
      throw error;
    }
  };

  const importData = async (jsonData: string) => {
    try {
      await DatabaseService.importData(jsonData);

      // Reload data
      const [medicines, intakes, profile, caregiverRules] = await Promise.all([
        DatabaseService.getMedicines(),
        DatabaseService.getIntakes(),
        DatabaseService.getProfile(),
        DatabaseService.getCaregiverRules(),
      ]);

      dispatch({ type: 'SET_MEDICINES', payload: medicines });
      dispatch({ type: 'SET_INTAKES', payload: intakes });
      dispatch({ type: 'SET_PROFILE', payload: profile });
      dispatch({ type: 'SET_CAREGIVER_RULES', payload: caregiverRules });
    } catch (error) {
      console.error('Error importing data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to import data' });
      throw error;
    }
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    updateIntakeStatus,
    updateProfile,
    updateSettings,
    addCaregiverRule,
    updateCaregiverRule,
    deleteCaregiverRule,
    exportData,
    importData,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
