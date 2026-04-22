import type { Metadata } from 'next'
import { Fraunces, DM_Sans } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AvailabilityBanner from '@/components/AvailabilityBanner'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

const BASE_URL = 'https://swim-with-shirel-production.up.railway.app'

export const metadata: Metadata = {
  title: 'Swim with Shirel – Swimming Lessons in Côte Saint-Luc',
  description:
    'Private and semi-private swimming lessons in Côte Saint-Luc for children of all levels.',
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: 'Swim with Shirel',
    description:
      'Private and semi-private swimming lessons in Côte Saint-Luc for children of all levels.',
    url: BASE_URL,
    siteName: 'Swim with Shirel',
    images: [
      {
        url: '/pool-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'Private pool in Côte Saint-Luc – Swim with Shirel',
      },
    ],
    locale: 'en_CA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Swim with Shirel',
    description:
      'Private and semi-private swimming lessons in Côte Saint-Luc for children of all levels.',
    images: ['/pool-bg.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${dmSans.variable} flex flex-col min-h-screen`}>
        <AvailabilityBanner />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
