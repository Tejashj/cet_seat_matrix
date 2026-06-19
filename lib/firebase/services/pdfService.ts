import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  getDoc,
  deleteDoc,
  updateDoc,
  increment,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { getFirestoreDB, getFirebaseStorage, isFirebaseConfigured } from '../config';
import { PDFDocument } from '../types';

const COLLECTION_NAME = 'pdfs';

// Mock/fallback PDFs for when Firebase is not configured or in local development
const mockPDFs: PDFDocument[] = [
  {
    id: 'mock-2025',
    year: 2025,
    fileName: 'kcet_allotment_2025.pdf',
    fileSize: 4200000,
    downloadUrl: '#',
    description: 'Official KKEA Round 2 Allotment Cutoff Ranks for 2025 engineering admissions.',
    uploadedAt: new Date('2025-10-15'),
    downloadCount: 1420,
    isActive: true
  },
  {
    id: 'mock-2024',
    year: 2024,
    fileName: 'kcet_allotment_2024.pdf',
    fileSize: 3800000,
    downloadUrl: '#',
    description: 'Full seat allotment list with cutoff ranks for all categories (GM, 2A, SC/ST, etc.) in 2024.',
    uploadedAt: new Date('2024-09-20'),
    downloadCount: 3105,
    isActive: true
  },
  {
    id: 'mock-2023',
    year: 2023,
    fileName: 'kcet_allotment_2023.pdf',
    fileSize: 3500000,
    downloadUrl: '#',
    description: 'Round 1 and Round 2 cutoff ranks and engineering seat matrix for 2023.',
    uploadedAt: new Date('2023-09-10'),
    downloadCount: 2890,
    isActive: true
  }
];

export const pdfService = {
  // Get all PDFs
  getAllPDFs: async (): Promise<PDFDocument[]> => {
    if (!isFirebaseConfigured()) {
      return [...mockPDFs].sort((a, b) => b.year - a.year);
    }
    try {
      const db = getFirestoreDB();
      const q = query(collection(db, COLLECTION_NAME), orderBy('year', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const pdfs: PDFDocument[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        pdfs.push({
          id: docSnap.id,
          ...data,
          uploadedAt: data.uploadedAt?.toDate() || new Date(),
        } as PDFDocument);
      });
      return pdfs;
    } catch (error) {
      console.error('Error fetching PDFs from Firebase:', error);
      return [...mockPDFs].sort((a, b) => b.year - a.year);
    }
  },

  // Get PDF by year
  getPDFByYear: async (year: number): Promise<PDFDocument | null> => {
    if (!isFirebaseConfigured()) {
      const found = mockPDFs.find(p => p.year === year);
      return found || null;
    }
    try {
      const db = getFirestoreDB();
      const docRef = doc(db, COLLECTION_NAME, String(year));
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          uploadedAt: data.uploadedAt?.toDate() || new Date(),
        } as PDFDocument;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching PDF for year ${year}:`, error);
      return mockPDFs.find(p => p.year === year) || null;
    }
  },

  // Upload PDF (admin)
  uploadPDF: async (file: File, year: number, description: string): Promise<string> => {
    if (!isFirebaseConfigured()) {
      console.warn('Firebase not configured. Simulated successful upload.');
      return '#';
    }
    try {
      const storageInstance = getFirebaseStorage();
      const db = getFirestoreDB();

      // 1. Upload file to Storage
      const storageRef = ref(storageInstance, `pdfs/${year}/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      // 2. Save metadata to Firestore
      const pdfData: Omit<PDFDocument, 'id'> = {
        year,
        fileName: file.name,
        fileSize: file.size,
        downloadUrl,
        description,
        uploadedAt: new Date(),
        downloadCount: 0,
        isActive: true,
      };

      const docRef = doc(db, COLLECTION_NAME, String(year));
      await setDoc(docRef, pdfData);

      return downloadUrl;
    } catch (error: any) {
      console.error('Error uploading PDF:', error);
      throw new Error(error.message || 'Failed to upload PDF');
    }
  },

  // Delete PDF (admin)
  deletePDF: async (year: number): Promise<void> => {
    if (!isFirebaseConfigured()) {
      console.warn('Firebase not configured. Simulated successful deletion.');
      return;
    }
    try {
      const db = getFirestoreDB();
      const docRef = doc(db, COLLECTION_NAME, String(year));
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as PDFDocument;
        // Try to delete from Storage if it exists
        try {
          const storageInstance = getFirebaseStorage();
          const storageRef = ref(storageInstance, `pdfs/${year}/${data.fileName}`);
          await deleteObject(storageRef);
        } catch (storageErr) {
          console.warn('Could not delete from storage, proceeding to delete metadata:', storageErr);
        }

        // Delete metadata document
        await deleteDoc(docRef);
      }
    } catch (error: any) {
      console.error('Error deleting PDF:', error);
      throw new Error(error.message || 'Failed to delete PDF');
    }
  },

  // Increment download count
  incrementDownload: async (year: number): Promise<void> => {
    if (!isFirebaseConfigured()) {
      const idx = mockPDFs.findIndex(p => p.year === year);
      if (idx !== -1) {
        mockPDFs[idx].downloadCount += 1;
      }
      return;
    }
    try {
      const db = getFirestoreDB();
      const docRef = doc(db, COLLECTION_NAME, String(year));
      await updateDoc(docRef, {
        downloadCount: increment(1)
      });
    } catch (error) {
      console.error(`Error incrementing download for ${year}:`, error);
    }
  },

  // Get download stats
  getStats: async (): Promise<{ total: number; downloads: number }> => {
    const list = await pdfService.getAllPDFs();
    const total = list.length;
    const downloads = list.reduce((sum, item) => sum + item.downloadCount, 0);
    return { total, downloads };
  }
};
