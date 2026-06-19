import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { getFirestoreDB, isFirebaseConfigured } from '../config';
import { Feedback } from '../types';

const COLLECTION_NAME = 'feedback';

// Local storage key for spam prevention (rate limiting)
const LAST_SUBMISSION_KEY = 'kcet_last_feedback_timestamp';
const SUBMISSION_COOLDOWN_MS = 60000; // 1 minute cooldown

// Mock fallbacks
let mockFeedbackList: Feedback[] = [
  {
    id: 'mock-fb-1',
    rank: 310,
    category: 'GM',
    round: 'R1',
    rating: 5,
    comment: "Amazing tool! The predicted cutoffs for RV College of Engineering CSE match exactly what KEA announced. Saved me a lot of stress.",
    email: 'aditya@example.com',
    timestamp: new Date(Date.now() - 3600000),
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    pageUrl: '/planner',
    isProcessed: false
  },
  {
    id: 'mock-fb-2',
    rank: 4500,
    category: '2AG',
    round: 'R2',
    rating: 4,
    comment: "Predictor is very accurate for general merit. For category 2A, the R2 predicted cutoff was off by a small margin, but still in the realistic range.",
    email: 'bhaskar@example.com',
    timestamp: new Date(Date.now() - 7200000),
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
    pageUrl: '/planner',
    isProcessed: true
  },
  {
    id: 'mock-fb-3',
    rank: 1250,
    category: 'GM',
    round: 'R2',
    rating: 5,
    comment: "This seat blocking AI feature is a lifesaver. Helped me make the decision to slide to Round 2 and successfully upgrade from BMS to MSRIT. Highly recommended!",
    email: 'chandra@example.com',
    timestamp: new Date(Date.now() - 14400000),
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    pageUrl: '/planner',
    isProcessed: false
  },
  {
    id: 'mock-fb-4',
    rank: 28000,
    category: '3BG',
    round: 'R1',
    rating: 3,
    comment: "Good UI but would love option to import Excel logs for past years directly. Cutoffs for low-demand courses are slightly inaccurate.",
    timestamp: new Date(Date.now() - 86400000),
    userAgent: 'Mozilla/5.0 (Linux; Android 10)',
    pageUrl: '/',
    isProcessed: false
  }
];

export const feedbackService = {
  // Submit feedback (with rate limiting / spam prevention)
  submitFeedback: async (data: Omit<Feedback, 'id' | 'timestamp' | 'userAgent' | 'pageUrl'>): Promise<string> => {
    // 1. Rate limiting check (client-side backup)
    if (typeof window !== 'undefined') {
      const lastSub = localStorage.getItem(LAST_SUBMISSION_KEY);
      if (lastSub) {
        const timePassed = Date.now() - parseInt(lastSub, 10);
        if (timePassed < SUBMISSION_COOLDOWN_MS) {
          const secondsLeft = Math.ceil((SUBMISSION_COOLDOWN_MS - timePassed) / 1000);
          throw new Error(`Please wait ${secondsLeft} seconds before submitting feedback again.`);
        }
      }
    }

    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
    const pageUrl = typeof window !== 'undefined' ? window.location.pathname : '/';

    if (!isFirebaseConfigured()) {
      console.warn('Firebase not configured. Simulated submission.');
      const newFeedback: Feedback = {
        id: `mock-fb-${Date.now()}`,
        ...data,
        timestamp: new Date(),
        userAgent,
        pageUrl,
        isProcessed: false
      };
      mockFeedbackList.unshift(newFeedback);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LAST_SUBMISSION_KEY, String(Date.now()));
      }
      return newFeedback.id!;
    }

    try {
      const db = getFirestoreDB();
      const feedbackData: Omit<Feedback, 'id'> = {
        ...data,
        timestamp: serverTimestamp(),
        userAgent,
        pageUrl,
        isProcessed: false
      };
      const docRef = await addDoc(collection(db, COLLECTION_NAME), feedbackData);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(LAST_SUBMISSION_KEY, String(Date.now()));
      }
      
      return docRef.id;
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      throw new Error(error.message || 'Failed to submit feedback');
    }
  },

  // Get all feedback (admin)
  getAllFeedback: async (limitCount?: number): Promise<Feedback[]> => {
    if (!isFirebaseConfigured()) {
      return limitCount ? mockFeedbackList.slice(0, limitCount) : [...mockFeedbackList];
    }
    try {
      const db = getFirestoreDB();
      let q = query(collection(db, COLLECTION_NAME), orderBy('timestamp', 'desc'));
      if (limitCount) {
        q = query(collection(db, COLLECTION_NAME), orderBy('timestamp', 'desc'), limit(limitCount));
      }
      const querySnapshot = await getDocs(q);
      const feedback: Feedback[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        feedback.push({
          id: docSnap.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as Feedback);
      });
      return feedback;
    } catch (error) {
      console.error('Error getting feedback:', error);
      return limitCount ? mockFeedbackList.slice(0, limitCount) : [...mockFeedbackList];
    }
  },

  // Get feedback stats
  getStats: async (): Promise<{
    total: number;
    averageRating: number;
    ratings: { 1: number; 2: number; 3: number; 4: number; 5: number }
  }> => {
    const list = await feedbackService.getAllFeedback();
    const total = list.length;
    
    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    let countWithRating = 0;

    list.forEach(item => {
      const r = Math.round(item.rating) as 1 | 2 | 3 | 4 | 5;
      if (r >= 1 && r <= 5) {
        ratingBreakdown[r] += 1;
        sum += r;
        countWithRating += 1;
      }
    });

    const averageRating = countWithRating > 0 ? parseFloat((sum / countWithRating).toFixed(2)) : 0;

    return {
      total,
      averageRating,
      ratings: ratingBreakdown
    };
  },

  // Delete feedback (admin)
  deleteFeedback: async (id: string): Promise<void> => {
    if (!isFirebaseConfigured()) {
      mockFeedbackList = mockFeedbackList.filter(item => item.id !== id);
      return;
    }
    try {
      const db = getFirestoreDB();
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error: any) {
      console.error('Error deleting feedback:', error);
      throw new Error(error.message || 'Failed to delete feedback');
    }
  },

  // Get feedback by rank range
  getByRankRange: async (min: number, max: number): Promise<Feedback[]> => {
    if (!isFirebaseConfigured()) {
      return mockFeedbackList.filter(f => f.rank >= min && f.rank <= max);
    }
    try {
      const db = getFirestoreDB();
      const q = query(
        collection(db, COLLECTION_NAME),
        where('rank', '>=', min),
        where('rank', '<=', max)
      );
      const querySnapshot = await getDocs(q);
      const feedback: Feedback[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        feedback.push({
          id: docSnap.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as Feedback);
      });
      return feedback;
    } catch (error) {
      console.error('Error filtering by rank:', error);
      return mockFeedbackList.filter(f => f.rank >= min && f.rank <= max);
    }
  }
};
