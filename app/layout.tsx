import type {Metadata} from 'next';
import { Inter, Lora } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Senior Fitness & Activity Tracker',
  description: 'An accessible, easy-to-use physical activity scheduler and tracker following CDC guidelines for older adults.',
  manifest: '/manifest.json',
  icons: {
    icon: 'https://www.un.org/sites/un2.un.org/files/2020/06/sdg3-en.png',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased text-[#2D2D2D] bg-[#FDFCF8] min-h-screen">
        {children}
      </body>
    </html>
  );
}
