import { Timestamp } from 'firebase/firestore';

export interface PDFDocument {
  id?: string;
  year: number;
  fileName: string;
  fileSize: number;
  downloadUrl: string;
  description: string;
  uploadedAt: any; // Date, Timestamp, or string
  downloadCount: number;
  isActive: boolean;
}

export interface Feedback {
  id?: string;
  rank: number;
  category: string;
  round?: string;
  rating: number; // 1-5
  comment: string;
  email?: string;
  timestamp: any; // Date, Timestamp, or string
  userAgent: string;
  pageUrl: string;
  isProcessed: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
  createdAt: any;
}
