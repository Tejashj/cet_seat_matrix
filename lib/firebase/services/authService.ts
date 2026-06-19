import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '../config';

// Simple in-memory storage for mock user state when Firebase is not configured
let mockUser: User | null = null;
const mockAuthListeners: Array<(user: User | null) => void> = [];

export const authService = {
  // Sign in admin
  login: async (email: string, password: string): Promise<User | { email: string; uid: string }> => {
    if (!isFirebaseConfigured()) {
      console.warn('Firebase not configured. Simulated Admin Authentication.');
      if (email === 'admin@kcetplanner.com' && password === 'admin123') {
        const mockUserData = {
          email,
          uid: 'mock-admin-uid',
          emailVerified: true,
          isAnonymous: false,
          metadata: {},
          providerData: [],
          refreshToken: '',
          tenantId: null,
          delete: async () => {},
          getIdToken: async () => 'mock-token',
          getIdTokenResult: async () => ({ token: 'mock-token', claims: {}, authTime: '', expirationTime: 0, signInProvider: '', signInSecondFactor: null }),
          reload: async () => {},
          toJSON: () => ({}),
          displayName: 'Administrator',
          phoneNumber: null,
          photoURL: null,
        } as unknown as User;
        
        mockUser = mockUserData;
        mockAuthListeners.forEach(listener => listener(mockUser));
        return mockUserData;
      } else {
        throw new Error('Invalid email or password. Use: admin@kcetplanner.com / admin123');
      }
    }

    try {
      const auth = getFirebaseAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      console.error('Error logging in:', error);
      throw new Error(error.message || 'Failed to authenticate');
    }
  },

  // Sign out
  logout: async (): Promise<void> => {
    if (!isFirebaseConfigured()) {
      mockUser = null;
      mockAuthListeners.forEach(listener => listener(null));
      return;
    }
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
    } catch (error: any) {
      console.error('Error logging out:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  },

  // Subscribe to authentication state changes
  onAuthStateChanged: (callback: (user: User | null) => void): (() => void) => {
    if (!isFirebaseConfigured()) {
      mockAuthListeners.push(callback);
      // Trigger immediately with current state
      callback(mockUser);
      return () => {
        const idx = mockAuthListeners.indexOf(callback);
        if (idx !== -1) mockAuthListeners.splice(idx, 1);
      };
    }

    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, callback);
  },

  // Get current user synchronously
  getCurrentUser: (): User | null => {
    if (!isFirebaseConfigured()) {
      return mockUser;
    }
    const auth = getFirebaseAuth();
    return auth.currentUser;
  }
};
