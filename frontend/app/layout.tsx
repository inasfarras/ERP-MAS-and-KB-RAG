import './globals.css';
import { Inter } from 'next/font/google';
import Navigation from '@/components/Navigation';
import Container from '@/components/Container';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ERP-MAS: Modular ERP with AI Integration',
  description: 'An open-source, modular ERP system designed for flexibility and scalability, integrated with advanced AI capabilities like Multi-Agent Systems and Knowledge Graph-based RAG.',
  keywords: [
    'ERP',
    'Enterprise Resource Planning',
    'AI',
    'Artificial Intelligence',
    'Multi-Agent System',
    'MAS',
    'Knowledge Graph',
    'RAG',
    'Retrieval Augmented Generation',
    'Open Source',
    'Modular ERP',
    'Business Software',
    'Finance',
    'HR',
    'Sales',
    'Inventory',
    'Projects',
    'Analytics',
  ],
  openGraph: {
    title: 'ERP-MAS: Modular ERP with AI Integration',
    description: 'An open-source, modular ERP system designed for flexibility and scalability, integrated with advanced AI capabilities like Multi-Agent Systems and Knowledge Graph-based RAG.',
    url: 'https://your-erpmass-website.com', // Replace with your actual deployment URL
    siteName: 'ERP-MAS',
    images: [
      {
        url: 'https://your-erpmass-website.com/og-image.jpg', // Replace with a relevant image for social sharing
        width: 1200,
        height: 630,
        alt: 'ERP-MAS: Modular ERP with AI Integration',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ERP-MAS: Modular ERP with AI Integration',
    description: 'An open-source, modular ERP system designed for flexibility and scalability, integrated with advanced AI capabilities like Multi-Agent Systems and Knowledge Graph-based RAG.',
    creator: '@your_twitter_handle', // Replace with your Twitter handle
    images: ['https://your-erpmass-website.com/twitter-image.jpg'], // Replace with a relevant image for Twitter
  },
  // You can add more metadata here, e.g., icons, manifest, etc.
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navigation />
          <main className="py-8">
            <Container>{children}</Container>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
