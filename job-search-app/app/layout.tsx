import type { Metadata } from 'next';
import { JobProvider } from '@/context/JobContext';
import Navigation from '@/components/Navigation';
import './globals.css';

export const metadata: Metadata = {
  title: 'Job Search Hub',
  description: 'Automated job search and application tracker',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[var(--background)] text-[var(--foreground)] antialiased">
        <JobProvider>
          <Navigation />
          <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </JobProvider>
      </body>
    </html>
  );
}
