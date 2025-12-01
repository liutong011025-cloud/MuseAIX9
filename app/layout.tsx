import type { Metadata } from 'next'
import { Geist, Geist_Mono, Comic_Neue, Patrick_Hand } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import HeaderWrapper from '@/components/header-wrapper'
import './globals.css'

const geist = Geist({ subsets: ["latin"], variable: '--font-geist' });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: '--font-geist-mono' });
const comicNeue = Comic_Neue({ 
  weight: ['300', '400', '700'],
  subsets: ["latin"],
  variable: '--font-comic-neue'
});
const patrickHand = Patrick_Hand({ 
  weight: ['400'],
  subsets: ["latin"],
  variable: '--font-patrick-hand'
});

export const metadata: Metadata = {
  title: 'MuseAIWrite',
  description: 'Create magical stories with AI assistance',
  generator: 'MuseAI',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${comicNeue.variable} ${patrickHand.variable} ${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <HeaderWrapper />
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
