import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { colorVariables } from '@/lib/colors';
import { PortfolioViews } from '@/components/PortfolioViews';
import '@fontsource-variable/inter';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './globals.css';
import './motion.css';
import './background.css';
import './hero-human.css';
import './splash.css';
import './work.css';
import './views.css';

export const metadata: Metadata = {
  title: 'Adeel — AI Automation Developer & Systems Builder',
  description:
    'AI-powered automations, applications and connected business systems. Less repetitive work. More time for what matters.',
  robots: { index: false, follow: false }, // Enable after replacing pending content and adding the production domain.
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" style={colorVariables as CSSProperties}>
      <body>
        <PortfolioViews>{children}</PortfolioViews>
      </body>
    </html>
  );
}
