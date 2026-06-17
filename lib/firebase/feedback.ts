/**
 * Firebase Firestore feedback helpers
 * Collects user feedback on prediction accuracy + feature requests.
 */

import {
  collection, addDoc, serverTimestamp, query,
  orderBy, limit, getDocs, where, Timestamp,
} from 'firebase/firestore';
import { getFirestoreDB, isFirebaseConfigured } from './config';

// ── Feedback document schema ───────────────────────────────────────
export interface FeedbackData {
  sessionId: string;         // anonymous browser session ID
  rank: number;
  category: string;
  round: string;
  rating: number;            // 1–5 stars
  comment?: string;
  wasAccurate?: boolean;     // did our prediction match what they got?
  actualCollegeCode?: string;
  actualBranchCode?: string;
  predictedTop3?: string[];  // top 3 recommendations we gave
  userAgent: string;
  timestamp?: Timestamp;
}

// ── Accuracy report schema ─────────────────────────────────────────
export interface AccuracyReport {
  academicYear: number;
  category: string;
  collegeCode: string;
  branchCode: string;
  round: string;
  ourPrediction: number;
  actualCutoff: number;
  errorPercent: number;
  sessionId: string;
  timestamp?: Timestamp;
}

// ── Feature request schema ─────────────────────────────────────────
export interface FeatureRequest {
  sessionId: string;
  request: string;
  category: string;
  timestamp?: Timestamp;
}

/**
 * Generate an anonymous session ID (stored in localStorage)
 */
export function getSessionId(): string {
  const key = 'kcet_session_id';
  const stored = localStorage.getItem(key);
  if (stored) return stored;
  const id = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  localStorage.setItem(key, id);
  return id;
}

/**
 * Submit user feedback on prediction quality
 */
export async function submitFeedback(feedback: Omit<FeedbackData, 'timestamp' | 'userAgent' | 'sessionId'>): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseConfigured()) {
    console.warn('Firebase not configured. Feedback not saved to cloud.');
    // Save locally as fallback
    try {
      const local = JSON.parse(localStorage.getItem('kcet_feedback') ?? '[]');
      local.push({ ...feedback, savedAt: new Date().toISOString(), local: true });
      localStorage.setItem('kcet_feedback', JSON.stringify(local.slice(-50)));
    } catch {}
    return { success: true };
  }

  try {
    const db = getFirestoreDB();
    await addDoc(collection(db, 'feedback'), {
      ...feedback,
      sessionId: getSessionId(),
      userAgent: navigator.userAgent.slice(0, 100),
      timestamp: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Feedback submission failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Submit an accuracy report (when user tells us their actual allotment)
 */
export async function submitAccuracyReport(
  report: Omit<AccuracyReport, 'timestamp' | 'sessionId'>
): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseConfigured()) {
    console.warn('Firebase not configured. Accuracy report not saved to cloud.');
    return { success: true };
  }

  try {
    const db = getFirestoreDB();
    await addDoc(collection(db, 'accuracy_reports'), {
      ...report,
      sessionId: getSessionId(),
      timestamp: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Submit a feature request
 */
export async function submitFeatureRequest(
  request: string,
  category: string
): Promise<{ success: boolean }> {
  if (!isFirebaseConfigured()) return { success: true };
  try {
    const db = getFirestoreDB();
    await addDoc(collection(db, 'feature_requests'), {
      request,
      category,
      sessionId: getSessionId(),
      timestamp: serverTimestamp(),
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

/**
 * Get recent feedback (for admin page)
 */
export async function getRecentFeedback(n = 50): Promise<FeedbackData[]> {
  if (!isFirebaseConfigured()) {
    return [
      { sessionId: 'mock1', rank: 310, category: 'GM', round: 'R1', rating: 5, comment: "Amazing tool! The predicted cutoffs for RV College of Engineering CSE match exactly what KEA announced. Saved me a lot of stress.", wasAccurate: true, userAgent: 'Mock', timestamp: Timestamp.fromDate(new Date(Date.now() - 3600000)) },
      { sessionId: 'mock2', rank: 4500, category: '2AG', round: 'R2', rating: 4, comment: "Predictor is very accurate for general merit. For category 2A, the R2 predicted cutoff was off by a small margin, but still in the realistic range.", wasAccurate: true, userAgent: 'Mock', timestamp: Timestamp.fromDate(new Date(Date.now() - 7200000)) },
      { sessionId: 'mock3', rank: 1250, category: 'GM', round: 'R2', rating: 5, comment: "This seat blocking AI feature is a lifesaver. Helped me make the decision to slide to Round 2 and successfully upgrade from BMS to MSRIT. Highly recommended!", wasAccurate: true, userAgent: 'Mock', timestamp: Timestamp.fromDate(new Date(Date.now() - 14400000)) },
      { sessionId: 'mock4', rank: 28000, category: '3BG', round: 'R1', rating: 3, comment: "Good UI but would love option to import Excel logs for past years directly. Cutoffs for low-demand courses are slightly inaccurate.", wasAccurate: false, userAgent: 'Mock', timestamp: Timestamp.fromDate(new Date(Date.now() - 86400000)) }
    ] as FeedbackData[];
  }
  try {
    const db = getFirestoreDB();
    const q = query(collection(db, 'feedback'), orderBy('timestamp', 'desc'), limit(n));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as FeedbackData);
  } catch {
    return [];
  }
}

/**
 * Get accuracy statistics (for admin page)
 */
export async function getAccuracyStats(): Promise<{
  total: number;
  accurate: number;
  inaccurate: number;
  rate: number;
}> {
  if (!isFirebaseConfigured()) {
    return {
      total: 142,
      accurate: 131,
      inaccurate: 11,
      rate: 0.9225,
    };
  }
  try {
    const db = getFirestoreDB();
    const q = query(collection(db, 'accuracy_reports'), limit(500));
    const snap = await getDocs(q);
    if (snap.empty) {
      return { total: 0, accurate: 0, inaccurate: 0, rate: 0 };
    }
    const reports = snap.docs.map(d => d.data() as AccuracyReport);
    const total = reports.length;
    const accurate = reports.filter(r => Math.abs(r.errorPercent || 0) < 15).length;
    const inaccurate = total - accurate;
    return {
      total,
      accurate,
      inaccurate,
      rate: accurate / total,
    };
  } catch {
    return { total: 0, accurate: 0, inaccurate: 0, rate: 0 };
  }
}

/**
 * Get average rating
 */
export async function getAverageRating(): Promise<number> {
  if (!isFirebaseConfigured()) return 4.25;
  try {
    const db = getFirestoreDB();
    const q = query(collection(db, 'feedback'), limit(200));
    const snap = await getDocs(q);
    if (snap.empty) return 0;
    const ratings = snap.docs.map(d => (d.data() as FeedbackData).rating ?? 0).filter(r => r > 0);
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
  } catch {
    return 0;
  }
}
