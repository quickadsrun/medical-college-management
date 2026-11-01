import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Harmain College of Health Sciences (Kahuta) - Campus Management ERP',
  description: 'Harmain College of Health Sciences Kahuta - Fee-first medical college management and LMS',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HCHS ERP',
  },
  formatDetection: {
    telephone: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#020617',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="h-full min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-slate-950 font-sans overscroll-y-none" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
