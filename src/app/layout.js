import { IBM_Plex_Sans, Nunito } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Providers } from '../components/Providers';
import { PageLayout } from '../components/Navigation';
import { AuthDataManager } from '../components/AuthDataManager';
import GlobalMusicPlayer from '../components/GlobalMusicPlayer';

const ibmPlexSans = IBM_Plex_Sans({ 
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans',
});
const nunito = Nunito({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900', '1000'],
  style: ['normal', 'italic'],
  variable: '--font-nunito',
});

export const metadata = {
  title: 'PandoAI - Your AI Mental Wellness Companion',
  description: 'A compassionate AI-powered wellness platform supporting your mental health journey with personalized guidance, mood tracking, and mindfulness exercises.',
  keywords: 'mental health, wellness, AI companion, mood tracking, mindfulness, anxiety support',
  authors: [{ name: 'PandoAI Team' }],
  openGraph: {
    title: 'PandoAI - Your AI Mental Wellness Companion',
    description: 'Supporting your mental health journey with AI-powered guidance and personalized wellness tools.',
    type: 'website',
    locale: 'en_US',
  },
  robots: 'index, follow',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className={`${ibmPlexSans.variable} ${nunito.variable}`}>
        <body className={`${nunito.className} ${ibmPlexSans.variable} ${nunito.variable} antialiased`}>
          <Providers>
            <AuthDataManager />
            <PageLayout>
              {children}
            </PageLayout>
            <GlobalMusicPlayer />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
