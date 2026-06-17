import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KCET Option Entry Planner Pro v2.0 | AI-Powered KCET Counseling',
  description: 'Get personalized KCET college recommendations powered by 6 years of historical allotment data and AI predictions. 100% free. No registration required.',
  keywords: ['KCET', 'Karnataka', 'Engineering', 'Counseling', 'Option Entry', 'College Predictor', 'KEA', 'CET'],
  authors: [{ name: 'KCET Planner' }],
  robots: 'index, follow',
  openGraph: {
    title: 'KCET Option Entry Planner Pro v2.0',
    description: 'AI-powered KCET counseling assistant. 6 years of data, 90%+ accuracy, completely free.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#4f46e5',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
