
import type {Metadata} from 'next';
import { Noto_Sans_Bengali, PT_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AcademicYearProvider } from '@/context/AcademicYearContext';
import { SchoolInfoProvider } from '@/context/SchoolInfoContext';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthProvider } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const iconUrlWithVersion = 'https://storage.googleapis.com/project-spark-348216.appspot.com/2024-07-31T17:15:53.682Z/user_uploads/e6900f68-7c87-4b71-af36-a19f6f69a844/school-logo.png?v=15';

export const metadata: Metadata = {
  title: 'My School',
  description: 'A central hub for school management.',
  manifest: '/manifest.webmanifest?v=15',
  icons: {
    icon: iconUrlWithVersion,
    shortcut: iconUrlWithVersion,
    apple: iconUrlWithVersion,
  }
};

const noto_sans_bengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  weight: ['400', '700'],
  variable: '--font-noto-sans-bengali',
});

const pt_sans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body className={cn("font-body antialiased", noto_sans_bengali.variable, pt_sans.variable)}>
        <FirebaseClientProvider>
          <AuthProvider>
            <SchoolInfoProvider>
              <AcademicYearProvider>
                {children}
              </AcademicYearProvider>
            </SchoolInfoProvider>
          </AuthProvider>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
