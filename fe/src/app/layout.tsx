import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'DataStreamNFT - Revolutionary Data Monetization Platform',
  description: 'Transform your data into queryable NFTs that generate continuous revenue through AI model usage.',
  keywords: 'NFT, data monetization, blockchain, AI, micropayments, Lazchain, IPFS',
  authors: [{ name: 'DataStreamNFT Team' }],
  openGraph: {
    type: 'website',
    url: 'https://datastreamnft.com/',
    title: 'DataStreamNFT - Revolutionary Data Monetization Platform',
    description: 'Transform your data into queryable NFTs that generate continuous revenue through AI model usage.',
    images: ['https://datastreamnft.com/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DataStreamNFT - Revolutionary Data Monetization Platform',
    description: 'Transform your data into queryable NFTs that generate continuous revenue through AI model usage.',
    images: ['https://datastreamnft.com/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  // Suppress browser extension errors
                  window.addEventListener('error', function(e) {
                    if (
                      e.message && (
                        e.message.includes('Cannot destructure property') ||
                        e.message.includes('register') ||
                        e.message.includes('chrome-extension://') ||
                        e.message.includes('Failed to fetch') ||
                        e.message.includes('Unchecked runtime.lastError')
                      )
                    ) {
                      e.preventDefault();
                      console.warn('Suppressed browser extension error:', e.message);
                      return false;
                    }
                  });
                  
                  // Suppress unhandled promise rejections from extensions
                  window.addEventListener('unhandledrejection', function(e) {
                    if (
                      e.reason && e.reason.message && (
                        e.reason.message.includes('Cannot destructure property') ||
                        e.reason.message.includes('register') ||
                        e.reason.message.includes('chrome-extension://') ||
                        e.reason.message.includes('Failed to fetch')
                      )
                    ) {
                      e.preventDefault();
                      console.warn('Suppressed browser extension promise rejection:', e.reason);
                      return false;
                    }
                  });
                `,
              }}
            />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}