import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Portfolio Dashboard',
  description:
    'Professional portfolio showcasing PM Toolkits, n8n Projects, and Knowledge Base resources.',
  keywords: [
    'portfolio',
    'dashboard',
    'project management',
    'n8n',
    'knowledge base',
  ],
  authors: [{ name: 'Portfolio' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://portfolio.example.com',
    siteName: 'Portfolio Dashboard',
    images: [
      {
        url: 'https://portfolio.example.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Portfolio Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portfolio Dashboard',
    description: 'Professional portfolio showcasing PM Toolkits and Projects.',
    images: ['https://portfolio.example.com/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
    googleBot: 'index, follow',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Website',
              name: 'Portfolio Dashboard',
              description:
                'Professional portfolio showcasing PM Toolkits, n8n Projects, and Knowledge Base resources.',
              url: 'https://portfolio.example.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://portfolio.example.com/search?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
